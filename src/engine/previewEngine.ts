/**
 * 预览引擎
 * 负责扫描活动列表、应用规则筛选、并返回匹配的活动预览
 */

import type { Activity, RuleConfig, FilterConfig } from '~/types/activity';
import {
  preparePageForExecution,
  hasNextPage,
  goToNextPage,
  getCurrentPage,
  waitForPageLoad,
} from '~/core/pageManager';
import {
  hasCachedPage,
  getCachedPageData,
  waitForNextResponse,
  startListening,
  stopListening,
} from '~/core/apiListener';
import { evaluateRule, shouldStopPaging, compileRule } from '~/core/ruleEngine';
import { delay, getRetryDelay } from '~/config/delays';

/**
 * 预览进度回调
 */
export interface PreviewProgress {
  currentPage: number;
  scannedActivities: number;
  matchedActivities: number;
  estimatedTotal?: number;
  status: 'scanning' | 'completed' | 'error';
  error?: string;
}

/**
 * 预览结果
 */
export interface PreviewResult {
  success: boolean;
  matchedActivities: Activity[];
  totalScanned: number;
  totalMatched: number;
  totalPages: number;
  error?: string;
}

/**
 * 预览配置
 */
export interface PreviewConfig {
  filters: FilterConfig;
  rule?: RuleConfig; // 可选，如果不提供则从 filters 编译
  onProgress?: (progress: PreviewProgress) => void;
  maxRetries?: number;
  stopOnError?: boolean;
}

/**
 * 扫描单页活动并匹配规则
 * @param rule 规则配置
 * @param currentPage 当前页码
 * @param maxRetries 最大重试次数
 * @returns Promise<{ activities: Activity[], shouldStop: boolean }>
 */
async function scanPageActivities(
  rule: RuleConfig,
  currentPage: number,
  maxRetries: number = 3
): Promise<{ activities: Activity[]; shouldStop: boolean }> {
  // 优先从缓存获取数据
  const cachedData = getCachedPageData(currentPage);
  if (cachedData) {
    console.log(`[PreviewEngine] 使用缓存数据：第 ${currentPage} 页 (${cachedData.activities.length} 个活动)`);
    const shouldStop = shouldStopPaging(cachedData.activities, rule);
    return { activities: cachedData.activities, shouldStop };
  }

  // 缓存未命中，等待 API 响应
  console.log(`[PreviewEngine] 缓存未命中，等待 API 响应：第 ${currentPage} 页`);
  
  let retryCount = 0;
  let lastError: Error | null = null;

  while (retryCount < maxRetries) {
    try {
      console.log(`[PreviewEngine] Scanning page ${currentPage}, attempt ${retryCount + 1}`);

      // 等待 API 响应
      const apiResponse = await waitForNextResponse();

      if (!apiResponse) {
        throw new Error('API response timeout');
      }

      const { activities } = apiResponse;
      console.log(`[PreviewEngine] Received ${activities.length} activities from API`);

      // 检查是否应该停止分页（智能优化）
      const shouldStop = shouldStopPaging(activities, rule);

      return { activities, shouldStop };
    } catch (error) {
      lastError = error as Error;
      retryCount++;

      if (retryCount < maxRetries) {
        const retryDelay = getRetryDelay(retryCount);
        console.warn(
          `[PreviewEngine] Scan failed, retrying in ${retryDelay}ms...`,
          error
        );
        await delay(retryDelay);
      }
    }
  }

  throw new Error(
    `Failed to scan page after ${maxRetries} attempts: ${lastError?.message}`
  );
}

/**
 * 执行预览扫描
 * @param config 预览配置
 * @returns Promise<PreviewResult>
 */
export async function runPreview(config: PreviewConfig): Promise<PreviewResult> {
  console.log('[PreviewEngine] Starting preview scan', config);

  const { filters, onProgress, maxRetries = 3, stopOnError = false } = config;
  const rule = config.rule || compileRule(filters);

  const matchedActivities: Activity[] = [];
  let totalScanned = 0;
  let totalPages = 0;
  let hasError = false;
  let errorMessage: string | undefined;

  try {
    // 1. 准备页面（回到第一页 + 时间排序）
    console.log('[PreviewEngine] Preparing page...');
    const prepResult = await preparePageForExecution();

    if (!prepResult.success) {
      throw new Error(`Page preparation failed: ${prepResult.errors.join(', ')}`);
    }

    // 2. 开始扫描第一页
    console.log('[PreviewEngine] Starting page scan...');
    console.log('[PreviewEngine] API 监听器已在全局初始化，将优先使用缓存数据');
    
    let shouldContinue = true;
    let consecutiveErrors = 0;

    while (shouldContinue) {
      const currentPage = getCurrentPage();
      totalPages = currentPage;

      // 报告进度
      if (onProgress) {
        onProgress({
          currentPage,
          scannedActivities: totalScanned,
          matchedActivities: matchedActivities.length,
          status: 'scanning',
        });
      }

      try {
        // 扫描当前页（优先使用缓存）
        const { activities, shouldStop } = await scanPageActivities(rule, currentPage, maxRetries);

        // 过滤匹配的活动
        const matched = activities.filter(activity => evaluateRule(rule, activity));
        matchedActivities.push(...matched);

        totalScanned += activities.length;
        consecutiveErrors = 0; // 重置错误计数

        console.log(
          `[PreviewEngine] Page ${currentPage}: ${matched.length}/${activities.length} matched`
        );

        // 检查是否应该停止（智能优化）
        if (shouldStop) {
          console.log('[PreviewEngine] Smart paging optimization: stopping scan');
          shouldContinue = false;
          break;
        }

        // 检查是否有下一页
        if (!hasNextPage()) {
          console.log('[PreviewEngine] No more pages, scan complete');
          shouldContinue = false;
          break;
        }

        // 翻页
        const pageSuccess = await goToNextPage();
        if (!pageSuccess) {
          console.warn('[PreviewEngine] Failed to navigate to next page');
          shouldContinue = false;
          break;
        }

        // 等待页面加载
        await waitForPageLoad();
      } catch (error) {
        consecutiveErrors++;
        console.error(`[PreviewEngine] Error scanning page ${currentPage}:`, error);

        // 新增：如果是第一页失败，直接终止
        if (currentPage === 1) {
          console.error('[PreviewEngine] First page scan failed, aborting...');
          hasError = true;
          errorMessage = `Failed to scan first page: ${(error as Error).message}`;
          shouldContinue = false;
          break;
        }
          
        if (stopOnError || consecutiveErrors >= 3) {
        hasError = true;
        errorMessage = `Scan failed: ${(error as Error).message}`;
        shouldContinue = false;
          break;
        }

        // 尝试恢复：跳过当前页，继续下一页
        if (hasNextPage()) {
          console.log('[PreviewEngine] Attempting to skip to next page...');
          await goToNextPage();
          await waitForPageLoad();
        } else {
          shouldContinue = false;
        }
      }
    }

    // 3. 完成扫描
    console.log(
      `[PreviewEngine] Scan completed: ${matchedActivities.length}/${totalScanned} activities matched`
    );

    // 注意：监听器持续运行，无需停止
    
    // 最终进度报告
    if (onProgress) {
      onProgress({
        currentPage: totalPages,
        scannedActivities: totalScanned,
        matchedActivities: matchedActivities.length,
        status: hasError ? 'error' : 'completed',
        error: errorMessage,
      });
    }

    return {
      success: !hasError,
      matchedActivities,
      totalScanned,
      totalMatched: matchedActivities.length,
      totalPages,
      error: errorMessage,
    };
  } catch (error) {
    console.error('[PreviewEngine] Preview scan failed:', error);

    // 注意：监听器持续运行，无需停止
    
    errorMessage = `Preview failed: ${(error as Error).message}`;

    // 报告错误
    if (onProgress) {
      onProgress({
        currentPage: totalPages,
        scannedActivities: totalScanned,
        matchedActivities: matchedActivities.length,
        status: 'error',
        error: errorMessage,
      });
    }

    return {
      success: false,
      matchedActivities,
      totalScanned,
      totalMatched: matchedActivities.length,
      totalPages,
      error: errorMessage,
    };
  }
}
