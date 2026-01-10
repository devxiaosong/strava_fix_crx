/**
 * Chrome Storage 操作工具
 * 提供对任务数据、运动员信息等的持久化存储
 */

import { CONSTANTS } from '~/config/constants';
import type { TaskData } from '~/types/activity';

/**
 * 保存任务数据到 Chrome Storage
 * @param taskData 任务数据对象
 * @returns Promise<void>
 */
export async function saveTaskData(taskData: TaskData): Promise<void> {
  try {
    await chrome.storage.local.set({
      [CONSTANTS.STORAGE_KEYS.BULK_EDIT_TASK]: taskData,
    });
    console.log('[StorageHelper] Task data saved successfully', taskData);
  } catch (error) {
    console.error('[StorageHelper] Failed to save task data:', error);
    throw new Error('Failed to save task data');
  }
}

/**
 * 从 Chrome Storage 加载任务数据
 * @returns Promise<TaskData | null> 任务数据对象或null（如果不存在）
 */
export async function loadTaskData(): Promise<TaskData | null> {
  try {
    const result = await chrome.storage.local.get(CONSTANTS.STORAGE_KEYS.BULK_EDIT_TASK);
    const taskData = result[CONSTANTS.STORAGE_KEYS.BULK_EDIT_TASK] as TaskData | undefined;
    
    if (!taskData) {
      console.log('[StorageHelper] No task data found in storage');
      return null;
    }

    // 检查任务是否过期（超过24小时）
    const now = Date.now();
    const expirationTime = CONSTANTS.TASK_EXPIRATION_HOURS * 60 * 60 * 1000;
    
    if (taskData.createdAt && (now - taskData.createdAt) > expirationTime) {
      console.warn('[StorageHelper] Task data expired, clearing...');
      await clearTaskData();
      return null;
    }

    console.log('[StorageHelper] Task data loaded successfully', taskData);
    return taskData;
  } catch (error) {
    console.error('[StorageHelper] Failed to load task data:', error);
    return null;
  }
}

/**
 * 清除任务数据
 * @returns Promise<void>
 */
export async function clearTaskData(): Promise<void> {
  try {
    await chrome.storage.local.remove(CONSTANTS.STORAGE_KEYS.BULK_EDIT_TASK);
    console.log('[StorageHelper] Task data cleared');
  } catch (error) {
    console.error('[StorageHelper] Failed to clear task data:', error);
    throw new Error('Failed to clear task data');
  }
}

/**
 * 更新任务进度（部分更新）
 * @param progressUpdate 要更新的进度字段
 * @returns Promise<void>
 */
export async function updateTaskProgress(progressUpdate: Partial<TaskData['progress']>): Promise<void> {
  try {
    const taskData = await loadTaskData();
    if (!taskData) {
      throw new Error('No task data found to update');
    }

    taskData.progress = {
      ...taskData.progress,
      ...progressUpdate,
    };

    await saveTaskData(taskData);
    console.log('[StorageHelper] Task progress updated', progressUpdate);
  } catch (error) {
    console.error('[StorageHelper] Failed to update task progress:', error);
    throw new Error('Failed to update task progress');
  }
}

/**
 * 更新任务状态
 * @param status 新的任务状态
 * @param additionalData 其他需要更新的数据（如错误信息、完成时间等）
 * @returns Promise<void>
 */
export async function updateTaskStatus(
  status: TaskData['status'],
  additionalData?: Partial<TaskData>
): Promise<void> {
  try {
    const taskData = await loadTaskData();
    if (!taskData) {
      throw new Error('No task data found to update');
    }

    taskData.status = status;
    
    // 更新时间戳
    if (status === 'running' && !taskData.startedAt) {
      taskData.startedAt = Date.now();
    } else if (status === 'paused') {
      taskData.pausedAt = Date.now();
    } else if (status === 'completed' || status === 'failed') {
      taskData.completedAt = Date.now();
    }

    // 合并其他数据
    if (additionalData) {
      Object.assign(taskData, additionalData);
    }

    await saveTaskData(taskData);
    console.log('[StorageHelper] Task status updated to', status);
  } catch (error) {
    console.error('[StorageHelper] Failed to update task status:', error);
    throw new Error('Failed to update task status');
  }
}

/**
 * 保存运动员ID
 * @param athleteId 运动员ID
 * @returns Promise<void>
 */
export async function saveAthleteId(athleteId: string): Promise<void> {
  try {
    await chrome.storage.local.set({
      [CONSTANTS.STORAGE_KEYS.ATHLETE_ID]: athleteId,
    });
    console.log('[StorageHelper] Athlete ID saved:', athleteId);
  } catch (error) {
    console.error('[StorageHelper] Failed to save athlete ID:', error);
    throw new Error('Failed to save athlete ID');
  }
}

/**
 * 加载运动员ID
 * @returns Promise<string | null> 运动员ID或null
 */
export async function loadAthleteId(): Promise<string | null> {
  try {
    const result = await chrome.storage.local.get(CONSTANTS.STORAGE_KEYS.ATHLETE_ID);
    const athleteId = result[CONSTANTS.STORAGE_KEYS.ATHLETE_ID] as string | undefined;
    
    if (!athleteId) {
      console.log('[StorageHelper] No athlete ID found in storage');
      return null;
    }

    console.log('[StorageHelper] Athlete ID loaded:', athleteId);
    return athleteId;
  } catch (error) {
    console.error('[StorageHelper] Failed to load athlete ID:', error);
    return null;
  }
}

/**
 * 保存装备数据（自行车/跑鞋）到缓存
 * @param key 存储键（bikes 或 shoes）
 * @param data 装备数据
 * @returns Promise<void>
 */
export async function saveGearCache(key: string, data: any): Promise<void> {
  try {
    const storageKey = `${CONSTANTS.STORAGE_KEYS.BULK_EDIT_TASK}_gear_${key}`;
    await chrome.storage.local.set({
      [storageKey]: {
        data,
        timestamp: Date.now(),
      },
    });
    console.log('[StorageHelper] Gear cache saved:', key);
  } catch (error) {
    console.error('[StorageHelper] Failed to save gear cache:', error);
  }
}

/**
 * 加载装备数据缓存
 * @param key 存储键（bikes 或 shoes）
 * @param maxAge 最大缓存时间（毫秒），默认1小时
 * @returns Promise<any | null>
 */
export async function loadGearCache(key: string, maxAge: number = 60 * 60 * 1000): Promise<any | null> {
  try {
    const storageKey = `${CONSTANTS.STORAGE_KEYS.BULK_EDIT_TASK}_gear_${key}`;
    const result = await chrome.storage.local.get(storageKey);
    const cached = result[storageKey];

    if (!cached || !cached.data || !cached.timestamp) {
      console.log('[StorageHelper] No gear cache found:', key);
      return null;
    }

    // 检查是否过期
    const age = Date.now() - cached.timestamp;
    if (age > maxAge) {
      console.log('[StorageHelper] Gear cache expired:', key);
      return null;
    }

    console.log('[StorageHelper] Gear cache loaded:', key);
    return cached.data;
  } catch (error) {
    console.error('[StorageHelper] Failed to load gear cache:', error);
    return null;
  }
}

/**
 * 清除所有存储数据（用于测试或重置）
 * @returns Promise<void>
 */
export async function clearAllStorage(): Promise<void> {
  try {
    await chrome.storage.local.clear();
    console.log('[StorageHelper] All storage cleared');
  } catch (error) {
    console.error('[StorageHelper] Failed to clear storage:', error);
    throw new Error('Failed to clear storage');
  }
}

