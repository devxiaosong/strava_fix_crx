/**
 * 任务状态管理器
 * 负责批量编辑任务的创建、保存、恢复、状态更新等
 */

import type {
  TaskData,
  TaskStatus,
  ScenarioType,
  FilterConfig,
  UpdateConfig,
  RuleConfig,
  ExecutionProgressState,
} from '~/types/activity';
import {
  saveTaskData,
  loadTaskData,
  clearTaskData,
  updateTaskProgress,
  updateTaskStatus,
} from '~/utils/storageHelper';
import { isValidFilterConfig, isValidUpdateConfig, isValidRule } from '~/utils/validator';
import { compileRule } from '~/core/ruleEngine';

/**
 * 任务管理器状态
 */
interface TaskManagerState {
  currentTask: TaskData | null;
  isInitialized: boolean;
}

// 全局任务管理器状态
const managerState: TaskManagerState = {
  currentTask: null,
  isInitialized: false,
};

/**
 * 生成唯一的任务ID
 * @returns string
 */
function generateTaskId(): string {
  return `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * 创建初始的执行进度状态
 * @returns ExecutionProgressState
 */
function createInitialProgress(): ExecutionProgressState {
  return {
    currentPage: 1,
    totalPages: 0,
    processedActivities: 0,
    successfulUpdates: 0,
    failedUpdates: 0,
    skippedActivities: 0,
    failedActivityDetails: [],
    isPaused: false,
    estimatedRemainingTime: 0,
  };
}

/**
 * 创建新任务
 * @param scenario 场景类型
 * @param filters 筛选配置
 * @param updates 更新配置
 * @returns Promise<TaskData>
 */
export async function createTask(
  scenario: ScenarioType,
  filters: FilterConfig,
  updates: UpdateConfig
): Promise<TaskData> {
  console.log('[TaskManager] Creating new task', { scenario, filters, updates });

  // 验证配置
  if (!isValidFilterConfig(filters)) {
    throw new Error('Invalid filter configuration');
  }

  if (!isValidUpdateConfig(updates)) {
    throw new Error('Invalid update configuration');
  }

  // 编译规则
  const rule = compileRule(filters);

  if (!isValidRule(rule)) {
    throw new Error('Invalid compiled rule');
  }

  // 创建任务
  const task: TaskData = {
    id: generateTaskId(),
    scenario,
    filters,
    updates,
    rule,
    status: 'pending',
    progress: createInitialProgress(),
    createdAt: Date.now(),
  };

  // 保存到存储
  await saveTaskData(task);

  // 更新管理器状态
  managerState.currentTask = task;
  managerState.isInitialized = true;

  console.log('[TaskManager] Task created:', task.id);
  return task;
}

/**
 * 加载现有任务
 * @returns Promise<TaskData | null>
 */
export async function loadTask(): Promise<TaskData | null> {
  console.log('[TaskManager] Loading task from storage');

  const task = await loadTaskData();

  if (task) {
    managerState.currentTask = task;
    managerState.isInitialized = true;
    console.log('[TaskManager] Task loaded:', task.id);
  } else {
    console.log('[TaskManager] No task found in storage');
  }

  return task;
}

/**
 * 获取当前任务
 * @returns TaskData | null
 */
export function getCurrentTask(): TaskData | null {
  return managerState.currentTask;
}

/**
 * 开始执行任务
 * @returns Promise<void>
 */
export async function startTask(): Promise<void> {
  if (!managerState.currentTask) {
    throw new Error('No current task to start');
  }

  console.log('[TaskManager] Starting task:', managerState.currentTask.id);

  await updateTaskStatus('running', {
    startedAt: Date.now(),
  });

  // 更新本地状态
  if (managerState.currentTask) {
    managerState.currentTask.status = 'running';
    managerState.currentTask.startedAt = Date.now();
  }
}

/**
 * 暂停任务
 * @returns Promise<void>
 */
export async function pauseTask(): Promise<void> {
  if (!managerState.currentTask) {
    throw new Error('No current task to pause');
  }

  console.log('[TaskManager] Pausing task:', managerState.currentTask.id);

  await updateTaskStatus('paused', {
    pausedAt: Date.now(),
  });

  // 更新本地状态
  if (managerState.currentTask) {
    managerState.currentTask.status = 'paused';
    managerState.currentTask.pausedAt = Date.now();
    managerState.currentTask.progress.isPaused = true;
  }
}

/**
 * 恢复任务
 * @returns Promise<void>
 */
export async function resumeTask(): Promise<void> {
  if (!managerState.currentTask) {
    throw new Error('No current task to resume');
  }

  console.log('[TaskManager] Resuming task:', managerState.currentTask.id);

  await updateTaskStatus('running');

  // 更新本地状态
  if (managerState.currentTask) {
    managerState.currentTask.status = 'running';
    managerState.currentTask.progress.isPaused = false;
  }
}

/**
 * 完成任务
 * @param error 可选的错误信息（如果失败）
 * @returns Promise<void>
 */
export async function completeTask(error?: string): Promise<void> {
  if (!managerState.currentTask) {
    throw new Error('No current task to complete');
  }

  const status: TaskStatus = error ? 'failed' : 'completed';
  console.log('[TaskManager] Completing task:', managerState.currentTask.id, 'with status:', status);

  await updateTaskStatus(status, {
    completedAt: Date.now(),
    error,
  });

  // 更新本地状态
  if (managerState.currentTask) {
    managerState.currentTask.status = status;
    managerState.currentTask.completedAt = Date.now();
    if (error) {
      managerState.currentTask.error = error;
    }
  }
}

/**
 * 更新任务进度
 * @param progressUpdate 要更新的进度字段
 * @returns Promise<void>
 */
export async function updateProgress(progressUpdate: Partial<ExecutionProgressState>): Promise<void> {
  if (!managerState.currentTask) {
    throw new Error('No current task to update progress');
  }

  await updateTaskProgress(progressUpdate);

  // 更新本地状态
  if (managerState.currentTask) {
    managerState.currentTask.progress = {
      ...managerState.currentTask.progress,
      ...progressUpdate,
    };
  }

  console.log('[TaskManager] Progress updated:', progressUpdate);
}

/**
 * 增加已处理的活动数量
 * @param count 增加的数量（默认1）
 * @returns Promise<void>
 */
export async function incrementProcessedActivities(count: number = 1): Promise<void> {
  if (!managerState.currentTask) {
    return;
  }

  const newCount = managerState.currentTask.progress.processedActivities + count;
  await updateProgress({ processedActivities: newCount });
}

/**
 * 增加成功更新的数量
 * @param count 增加的数量（默认1）
 * @returns Promise<void>
 */
export async function incrementSuccessfulUpdates(count: number = 1): Promise<void> {
  if (!managerState.currentTask) {
    return;
  }

  const newCount = managerState.currentTask.progress.successfulUpdates + count;
  await updateProgress({ successfulUpdates: newCount });
}

/**
 * 增加失败更新的数量并记录错误详情
 * @param activityId 活动ID
 * @param activityName 活动名称
 * @param error 错误信息
 * @returns Promise<void>
 */
export async function recordFailedUpdate(
  activityId: string,
  activityName: string,
  error: string
): Promise<void> {
  if (!managerState.currentTask) {
    return;
  }

  const newCount = managerState.currentTask.progress.failedUpdates + 1;
  const failedDetails = [
    ...managerState.currentTask.progress.failedActivityDetails,
    { id: activityId, name: activityName, error },
  ];

  await updateProgress({
    failedUpdates: newCount,
    failedActivityDetails: failedDetails,
  });
}

/**
 * 增加跳过的活动数量
 * @param count 增加的数量（默认1）
 * @returns Promise<void>
 */
export async function incrementSkippedActivities(count: number = 1): Promise<void> {
  if (!managerState.currentTask) {
    return;
  }

  const newCount = managerState.currentTask.progress.skippedActivities + count;
  await updateProgress({ skippedActivities: newCount });
}

/**
 * 更新当前页码
 * @param page 页码
 * @returns Promise<void>
 */
export async function updateCurrentPage(page: number): Promise<void> {
  await updateProgress({ currentPage: page });
}

/**
 * 更新总页数
 * @param totalPages 总页数
 * @returns Promise<void>
 */
export async function updateTotalPages(totalPages: number): Promise<void> {
  await updateProgress({ totalPages });
}

/**
 * 更新预计剩余时间
 * @param seconds 秒数
 * @returns Promise<void>
 */
export async function updateEstimatedTime(seconds: number): Promise<void> {
  await updateProgress({ estimatedRemainingTime: seconds });
}

/**
 * 计算预计剩余时间
 * @param processedCount 已处理数量
 * @param totalCount 总数量
 * @param elapsedTime 已用时间（毫秒）
 * @returns number 预计剩余时间（秒）
 */
export function calculateEstimatedTime(
  processedCount: number,
  totalCount: number,
  elapsedTime: number
): number {
  if (processedCount === 0) {
    return 0;
  }

  const averageTimePerActivity = elapsedTime / processedCount;
  const remainingCount = totalCount - processedCount;
  const remainingTime = (averageTimePerActivity * remainingCount) / 1000; // 转换为秒

  return Math.ceil(remainingTime);
}

/**
 * 清除当前任务
 * @returns Promise<void>
 */
export async function clearCurrentTask(): Promise<void> {
  console.log('[TaskManager] Clearing current task');

  await clearTaskData();

  managerState.currentTask = null;
  managerState.isInitialized = false;
}

/**
 * 检查是否有正在进行的任务
 * @returns boolean
 */
export function hasActiveTask(): boolean {
  return managerState.currentTask !== null && 
         (managerState.currentTask.status === 'running' || 
          managerState.currentTask.status === 'paused');
}

/**
 * 检查任务是否可以恢复
 * @returns boolean
 */
export function canResumeTask(): boolean {
  return managerState.currentTask !== null && 
         managerState.currentTask.status === 'paused';
}

/**
 * 检查任务是否已完成
 * @returns boolean
 */
export function isTaskCompleted(): boolean {
  return managerState.currentTask !== null && 
         (managerState.currentTask.status === 'completed' || 
          managerState.currentTask.status === 'failed');
}

/**
 * 获取任务进度百分比
 * @returns number 0-100
 */
export function getTaskProgressPercentage(): number {
  if (!managerState.currentTask) {
    return 0;
  }

  const { processedActivities, successfulUpdates, failedUpdates, skippedActivities } = 
    managerState.currentTask.progress;

  // 这里需要知道总活动数，但在扫描阶段可能还不知道
  // 可以基于已处理的活动数和当前页码估算
  // 或者在扫描完成后再计算精确的百分比

  const totalProcessed = processedActivities;
  const totalModified = successfulUpdates + failedUpdates + skippedActivities;

  if (totalProcessed === 0) {
    return 0;
  }

  return Math.round((totalModified / totalProcessed) * 100);
}

/**
 * 获取任务摘要信息（用于UI显示）
 * @returns object | null
 */
export function getTaskSummary(): {
  id: string;
  status: TaskStatus;
  progress: ExecutionProgressState;
  startedAt?: number;
  pausedAt?: number;
  completedAt?: number;
  duration?: number;
} | null {
  if (!managerState.currentTask) {
    return null;
  }

  const task = managerState.currentTask;
  let duration: number | undefined;

  if (task.startedAt) {
    const endTime = task.completedAt || Date.now();
    duration = endTime - task.startedAt;
  }

  return {
    id: task.id,
    status: task.status,
    progress: task.progress,
    startedAt: task.startedAt,
    pausedAt: task.pausedAt,
    completedAt: task.completedAt,
    duration,
  };
}

/**
 * 初始化任务管理器
 * @returns Promise<void>
 */
export async function initTaskManager(): Promise<void> {
  if (managerState.isInitialized) {
    console.log('[TaskManager] Already initialized');
    return;
  }

  console.log('[TaskManager] Initializing task manager');

  // 尝试加载已有任务
  await loadTask();

  managerState.isInitialized = true;
  console.log('[TaskManager] Task manager initialized');
}

/**
 * 重置任务管理器（用于测试）
 */
export function resetTaskManager(): void {
  managerState.currentTask = null;
  managerState.isInitialized = false;
  console.log('[TaskManager] Task manager reset');
}

