/**
 * 执行引擎
 * 负责批量更新活动的完整执行流程
 */

import type { Activity, RuleConfig, FilterConfig, UpdateConfig, ScenarioType } from '~/types/activity';
import type { BulkEditFields } from '~/types/strava';
import {
  preparePageForExecution,
  hasNextPage,
  goToNextPage,
  getCurrentPage,
  getActivityRowElements,
  extractActivityId,
  waitForPageLoad,
} from '~/core/pageManager';
import {
  initApiListener,
  startListening,
  stopListening,
  waitForNextResponse,
} from '~/core/apiListener';
import { evaluateRule, shouldStopPaging, compileRule } from '~/core/ruleEngine';
import {
  initTaskManager,
  createTask,
  startTask,
  pauseTask,
  resumeTask,
  completeTask,
  updateProgress,
  updateCurrentPage,
  incrementSuccessfulUpdates,
  recordFailedUpdate,
  incrementSkippedActivities,
  updateEstimatedTime,
  calculateEstimatedTime,
  getCurrentTask,
  canResumeTask,
  hasActiveTask,
} from '~/core/taskManager';
import { delay, CURRENT_DELAYS, getRetryDelay, smartDelay } from '~/config/delays';
import { SELECTORS } from '~/config/selectors';
import { findElement, findAllElements, clickElement, setInputValue } from '~/utils/domHelper';
import { checkIfNeedsUpdate } from '~/utils/activityComparer';

/**
 * 执行进度回调
 */
export interface ExecutionProgress {
  currentPage: number;
  totalPages: number;
  processedActivities: number;
  successfulUpdates: number;
  failedUpdates: number;
  skippedActivities: number;
  status: 'preparing' | 'executing' | 'paused' | 'completed' | 'error';
  estimatedTimeRemaining?: number;
  error?: string;
}

/**
 * 执行结果
 */
export interface ExecutionResult {
  success: boolean;
  totalProcessed: number;
  successfulUpdates: number;
  failedUpdates: number;
  skippedActivities: number;
  totalPages: number;
  failedDetails: Array<{ id: string; name: string; error: string }>;
  error?: string;
}

/**
 * 执行配置
 */
export interface ExecutionConfig {
  scenario: ScenarioType;
  filters: FilterConfig;
  updates: UpdateConfig;
  rule?: RuleConfig;
  onProgress?: (progress: ExecutionProgress) => void;
  maxRetries?: number;
  continueOnError?: boolean;
}

/**
 * 执行状态
 */
interface ExecutionState {
  isPaused: boolean;
  shouldStop: boolean;
  startTime: number;
  processedCount: number;
}

const executionState: ExecutionState = {
  isPaused: false,
  shouldStop: false,
  startTime: 0,
  processedCount: 0,
};

/**
 * 更新单个活动（DOM操作）
 * @param activityRow 活动行元素
 * @param updates 更新配置
 * @returns Promise<boolean>
 */
async function updateSingleActivity(
  activityRow: HTMLElement,
  updates: UpdateConfig
): Promise<boolean> {
  try {
    // 1. 点击快速编辑按钮
    const quickEditButton = findElement<HTMLButtonElement>(
      SELECTORS.ACTIVITY.QUICK_EDIT_BUTTON,
      activityRow
    );

    if (!quickEditButton) {
      throw new Error('Quick edit button not found');
    }

    await clickElement(quickEditButton, CURRENT_DELAYS.QUICK_EDIT_CLICK);

    // 2. 填充表单字段
    if (updates.gearId) {
      // 尝试自行车选择器
      const bikeSelect = findElement<HTMLSelectElement>(SELECTORS.EDIT.BIKE, activityRow);
      if (bikeSelect) {
        setInputValue(bikeSelect, updates.gearId);
    }

      // 尝试跑鞋选择器
      const shoesSelect = findElement<HTMLSelectElement>(SELECTORS.EDIT.SHOES, activityRow);
      if (shoesSelect) {
        setInputValue(shoesSelect, updates.gearId);
      }
    }

    if (updates.privacy) {
      const visibilitySelect = findElement<HTMLSelectElement>(
        SELECTORS.EDIT.VISIBILITY,
        activityRow
      );
      if (visibilitySelect) {
        setInputValue(visibilitySelect, updates.privacy);
      }
    }

    if (updates.rideType) {
      const workoutSelect = findElement<HTMLSelectElement>(
        SELECTORS.EDIT.RIDE_TYPE,
        activityRow
      );
      if (workoutSelect) {
        setInputValue(workoutSelect, updates.rideType);
      }
    }

    await delay(CURRENT_DELAYS.FORM_FILL);

    // 3. 提交表单
    const submitButton = findElement<HTMLButtonElement>(SELECTORS.EDIT.SUBMIT, activityRow);

    if (!submitButton) {
      throw new Error('Submit button not found');
    }

    await clickElement(submitButton, CURRENT_DELAYS.SUBMIT_SAVE);

    // 4. 等待保存完成（可能需要检查成功指示器）
    await smartDelay(500);

    return true;
  } catch (error) {
    console.error('[ExecuteEngine] Failed to update activity:', error);
    return false;
  }
}

/**
 * 处理单页的活动更新
 * @param activities 活动列表（来自API）
 * @param rule 规则配置
 * @param updates 更新配置
 * @param maxRetries 最大重试次数
 * @returns Promise<{ successful: number, failed: number, skipped: number, failedDetails: any[] }>
 */
async function processPageActivities(
  activities: Activity[],
  rule: RuleConfig,
  updates: UpdateConfig,
  maxRetries: number = 2
): Promise<{
  successful: number;
  failed: number;
  skipped: number;
  failedDetails: Array<{ id: string; name: string; error: string }>;
}> {
  let successful = 0;
  let failed = 0;
  let skipped = 0;
  const failedDetails: Array<{ id: string; name: string; error: string }> = [];

  // 获取当前页的活动行元素
  const activityRows = getActivityRowElements();

  console.log(`[ExecuteEngine] Processing ${activities.length} activities on current page`);

  // 遍历每个活动
  for (const activity of activities) {
    // 检查是否暂停
    if (executionState.isPaused) {
      console.log('[ExecuteEngine] Execution paused');
      break;
    }

    // 检查是否应该停止
    if (executionState.shouldStop) {
      console.log('[ExecuteEngine] Execution stopped');
      break;
    }

    // 应用规则筛选
    const matches = evaluateRule(rule, activity);

    if (!matches) {
      console.log(`[ExecuteEngine] Activity ${activity.id} does not match rule, skipping`);
      skipped++;
      await incrementSkippedActivities();
      continue;
    }

    // 检查是否需要更新（No Change检测）
    const comparisonResult = checkIfNeedsUpdate(activity, updates);
    
    if (!comparisonResult.needsUpdate) {
      console.log(
        `[ExecuteEngine] Activity ${activity.id} "${activity.name}" matches rule but no change needed, skipping`
      );
      skipped++;
      await incrementSkippedActivities();
      continue;
    }

    console.log(
      `[ExecuteEngine] Activity ${activity.id} "${activity.name}" needs update:`,
      comparisonResult.changes.map(c => `${c.field}: ${c.displayOld} → ${c.displayNew}`).join(', ')
    );

    // 找到对应的DOM元素
    const activityRow = Array.from(activityRows).find(row => {
      const rowId = extractActivityId(row);
      return rowId === activity.id;
    });

    if (!activityRow) {
      console.warn(`[ExecuteEngine] Cannot find DOM element for activity ${activity.id}`);
      failed++;
      failedDetails.push({
        id: String(activity.id),
        name: activity.name,
        error: 'DOM element not found',
      });
      await recordFailedUpdate(String(activity.id), activity.name, 'DOM element not found');
      continue;
    }

    // 尝试更新活动
    let retryCount = 0;
    let updateSuccess = false;

    while (retryCount <= maxRetries && !updateSuccess) {
      try {
        updateSuccess = await updateSingleActivity(activityRow, updates);

        if (updateSuccess) {
          successful++;
          await incrementSuccessfulUpdates();
          console.log(`[ExecuteEngine] Successfully updated activity ${activity.id}`);
        } else {
          retryCount++;
          if (retryCount <= maxRetries) {
            const retryDelay = getRetryDelay(retryCount);
            console.warn(
              `[ExecuteEngine] Update failed, retrying in ${retryDelay}ms (${retryCount}/${maxRetries})`
            );
            await delay(retryDelay);
          }
        }
      } catch (error) {
        retryCount++;
        console.error(
          `[ExecuteEngine] Error updating activity ${activity.id}:`,
          error
        );

        if (retryCount > maxRetries) {
          failed++;
          const errorMessage = (error as Error).message;
          failedDetails.push({
            id: String(activity.id),
            name: activity.name,
            error: errorMessage,
          });
          await recordFailedUpdate(String(activity.id), activity.name, errorMessage);
        } else {
          const retryDelay = getRetryDelay(retryCount);
          await delay(retryDelay);
        }
      }
    }

    // 增加处理计数
    executionState.processedCount++;
  }

  return { successful, failed, skipped, failedDetails };
}

/**
 * 执行批量更新
 * @param config 执行配置
 * @returns Promise<ExecutionResult>
 */
export async function runExecution(config: ExecutionConfig): Promise<ExecutionResult> {
  console.log('[ExecuteEngine] Starting execution', config);

  const { scenario, filters, updates, onProgress, maxRetries = 2, continueOnError = true } = config;
  const rule = config.rule || compileRule(filters);

  let totalProcessed = 0;
  let totalSuccessful = 0;
  let totalFailed = 0;
  let totalSkipped = 0;
  let totalPages = 0;
  const allFailedDetails: Array<{ id: string; name: string; error: string }> = [];
  let hasError = false;
  let errorMessage: string | undefined;

  // 重置执行状态
  executionState.isPaused = false;
  executionState.shouldStop = false;
  executionState.startTime = Date.now();
  executionState.processedCount = 0;

  try {
    // 1. 初始化任务管理器
    await initTaskManager();

    // 2. 创建或加载任务
    const existingTask = getCurrentTask();
    if (!existingTask || !canResumeTask()) {
      await createTask(scenario, filters, updates);
    }

    await startTask();

    // 4. 准备页面
    if (onProgress) {
      onProgress({
        currentPage: 0,
        totalPages: 0,
        processedActivities: 0,
        successfulUpdates: 0,
        failedUpdates: 0,
        skippedActivities: 0,
        status: 'preparing',
      });
    }

    console.log('[ExecuteEngine] Preparing page...');
    const prepResult = await preparePageForExecution();

    if (!prepResult.success) {
      throw new Error(`Page preparation failed: ${prepResult.errors.join(', ')}`);
    }

    // 5. 开始执行
    if (onProgress) {
      onProgress({
        currentPage: 1,
        totalPages: 0,
        processedActivities: 0,
        successfulUpdates: 0,
        failedUpdates: 0,
        skippedActivities: 0,
        status: 'executing',
      });
    }

    let shouldContinue = true;
    let consecutiveErrors = 0;

    while (shouldContinue) {
      // 检查是否暂停
      if (executionState.isPaused) {
        await pauseTask();
        console.log('[ExecuteEngine] Execution paused by user');
        break;
      }

      // 检查是否应该停止
      if (executionState.shouldStop) {
        console.log('[ExecuteEngine] Execution stopped by user');
        break;
      }

      const currentPage = getCurrentPage();
      totalPages = currentPage;
      await updateCurrentPage(currentPage);

      try {
        // 等待 API 响应获取活动数据
        const apiResponse = await waitForNextResponse();

        if (!apiResponse) {
          throw new Error('API response timeout');
        }

        const { activities } = apiResponse;
        console.log(`[ExecuteEngine] Processing page ${currentPage} with ${activities.length} activities`);

        // 处理当前页的活动
        const pageResult = await processPageActivities(activities, rule, updates, maxRetries);

        totalSuccessful += pageResult.successful;
        totalFailed += pageResult.failed;
        totalSkipped += pageResult.skipped;
        totalProcessed += activities.length;
        allFailedDetails.push(...pageResult.failedDetails);

        consecutiveErrors = 0; // 重置错误计数

        // 计算预计剩余时间
        const elapsedTime = Date.now() - executionState.startTime;
        const estimatedTime = calculateEstimatedTime(
          totalProcessed,
          totalProcessed + 100, // 暂估，可以优化
          elapsedTime
        );
        await updateEstimatedTime(estimatedTime);

        // 报告进度
        if (onProgress) {
          onProgress({
            currentPage,
            totalPages,
            processedActivities: totalProcessed,
            successfulUpdates: totalSuccessful,
            failedUpdates: totalFailed,
            skippedActivities: totalSkipped,
            status: 'executing',
            estimatedTimeRemaining: estimatedTime,
          });
        }

        // 检查是否应该停止分页（智能优化）
        if (shouldStopPaging(activities, rule)) {
          console.log('[ExecuteEngine] Smart paging optimization: stopping execution');
          shouldContinue = false;
          break;
        }

        // 检查是否有下一页
        if (!hasNextPage()) {
          console.log('[ExecuteEngine] No more pages, execution complete');
          shouldContinue = false;
          break;
        }

        // 翻页
        const pageSuccess = await goToNextPage();
        if (!pageSuccess) {
          console.warn('[ExecuteEngine] Failed to navigate to next page');
          shouldContinue = false;
          break;
        }

        // 等待页面加载
        await waitForPageLoad();
      } catch (error) {
        consecutiveErrors++;
        console.error(`[ExecuteEngine] Error processing page ${currentPage}:`, error);

        if (!continueOnError || consecutiveErrors >= 3) {
        hasError = true;
        errorMessage = `Execution failed: ${(error as Error).message}`;
        shouldContinue = false;
          break;
        }

        // 尝试恢复：跳过当前页，继续下一页
        if (hasNextPage()) {
          console.log('[ExecuteEngine] Attempting to skip to next page...');
          await goToNextPage();
          await waitForPageLoad();
        } else {
          shouldContinue = false;
        }
      }
    }

    // 6. 完成执行
    console.log(
      `[ExecuteEngine] Execution completed: ${totalSuccessful} successful, ${totalFailed} failed, ${totalSkipped} skipped`
    );

    stopListening();

    if (!executionState.isPaused) {
      await completeTask(hasError ? errorMessage : undefined);
    }

    // 最终进度报告
    if (onProgress) {
      onProgress({
        currentPage: totalPages,
        totalPages,
        processedActivities: totalProcessed,
        successfulUpdates: totalSuccessful,
        failedUpdates: totalFailed,
        skippedActivities: totalSkipped,
        status: executionState.isPaused ? 'paused' : hasError ? 'error' : 'completed',
        error: errorMessage,
      });
    }

    return {
      success: !hasError,
      totalProcessed,
      successfulUpdates: totalSuccessful,
      failedUpdates: totalFailed,
      skippedActivities: totalSkipped,
      totalPages,
      failedDetails: allFailedDetails,
      error: errorMessage,
    };
  } catch (error) {
    console.error('[ExecuteEngine] Execution failed:', error);

    stopListening();

    errorMessage = `Execution failed: ${(error as Error).message}`;

    await completeTask(errorMessage);

    // 报告错误
    if (onProgress) {
      onProgress({
        currentPage: totalPages,
        totalPages,
        processedActivities: totalProcessed,
        successfulUpdates: totalSuccessful,
        failedUpdates: totalFailed,
        skippedActivities: totalSkipped,
        status: 'error',
        error: errorMessage,
      });
    }

    return {
      success: false,
      totalProcessed,
      successfulUpdates: totalSuccessful,
      failedUpdates: totalFailed,
      skippedActivities: totalSkipped,
      totalPages,
      failedDetails: allFailedDetails,
      error: errorMessage,
    };
  }
}

/**
 * 暂停当前执行
 */
export function pauseExecution(): void {
  console.log('[ExecuteEngine] Pause requested');
  executionState.isPaused = true;
}

/**
 * 恢复执行
 * @param config 执行配置
 * @returns Promise<ExecutionResult>
 */
export async function resumeExecution(config: ExecutionConfig): Promise<ExecutionResult> {
  console.log('[ExecuteEngine] Resume requested');

  if (!canResumeTask()) {
    throw new Error('No paused task to resume');
  }

  executionState.isPaused = false;
  await resumeTask();

  return runExecution(config);
}

/**
 * 停止执行
 */
export function stopExecution(): void {
  console.log('[ExecuteEngine] Stop requested');
  executionState.shouldStop = true;
}

/**
 * 检查是否正在执行
 * @returns boolean
 */
export function isExecuting(): boolean {
  return hasActiveTask() && !executionState.isPaused;
}

/**
 * 检查是否已暂停
 * @returns boolean
 */
export function isPaused(): boolean {
  return executionState.isPaused;
}

