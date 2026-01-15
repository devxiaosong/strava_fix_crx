/**
 * 活动比较工具
 * 用于检测活动是否需要更新（当前值 vs 目标值）
 */

import type { Activity, UpdateConfig } from '~/types/activity';

/**
 * 单个字段的变更信息
 */
export interface FieldChange {
  field: 'gear' | 'privacy' | 'rideType';
  oldValue: string | null;
  newValue: string | null;
  displayOld: string;
  displayNew: string;
}

/**
 * 活动比较结果
 */
export interface ActivityComparisonResult {
  needsUpdate: boolean;
  changes: FieldChange[];
}

/**
 * 统一格式化装备ID（用于比较）
 * 将空字符串和undefined统一转为null
 * 
 * @param id 装备ID
 * @returns 格式化后的ID（string | null）
 */
function normalizeGearId(id: string | null | undefined): string | null {
  if (!id || id === '') {
    return null;
  }
  return String(id);
}

/**
 * 统一格式化隐私设置（用于比较）
 * 
 * @param visibility 隐私设置
 * @returns 格式化后的隐私设置
 */
function normalizeVisibility(visibility: string | undefined): string | null {
  if (!visibility) {
    return null;
  }
  return String(visibility);
}

/**
 * 统一格式化骑行类型（用于比较）
 * 
 * @param rideType 骑行类型
 * @returns 格式化后的骑行类型
 */
function normalizeRideType(rideType: string | number | null | undefined): string | null {
  if (rideType === null || rideType === undefined || rideType === '') {
    return null;
  }
  return String(rideType);
}

/**
 * 格式化显示值
 * 
 * @param value 原始值
 * @param type 字段类型
 * @returns 用于显示的文本
 */
function formatDisplayValue(value: string | null, type: 'gear' | 'privacy' | 'rideType'): string {
  if (value === null || value === '') {
    return 'None';
  }
  
  // 隐私设置的显示映射
  if (type === 'privacy') {
    const privacyMap: Record<string, string> = {
      'everyone': 'Everyone',
      'followers_only': 'Followers Only',
      'only_me': 'Only Me'
    };
    return privacyMap[value] || value;
  }
  
  return value;
}

/**
 * 检查活动是否需要更新
 * 比较当前值与目标值，判断是否有变化
 * 
 * @param activity 活动对象
 * @param updates 更新配置
 * @returns 比较结果
 */
export function checkIfNeedsUpdate(
  activity: Activity,
  updates: UpdateConfig
): ActivityComparisonResult {
  const changes: FieldChange[] = [];
  
  // 1. 检查装备（自行车/跑鞋）
  if (updates.gearId !== undefined) {
    // 获取当前装备ID（bike_id 或 athlete_gear_id）
    const currentGear = normalizeGearId(
      activity.bike_id || activity.athlete_gear_id
    );
    const targetGear = normalizeGearId(updates.gearId);
    
    // 严格比较（类型 + 值）
    if (currentGear !== targetGear) {
      changes.push({
        field: 'gear',
        oldValue: currentGear,
        newValue: targetGear,
        displayOld: formatDisplayValue(currentGear, 'gear'),
        displayNew: formatDisplayValue(targetGear, 'gear'),
      });
    }
  }
  
  // 2. 检查隐私设置
  if (updates.privacy !== undefined) {
    const currentPrivacy = normalizeVisibility(activity.visibility);
    const targetPrivacy = normalizeVisibility(updates.privacy);
    
    // 严格比较（类型 + 值）
    if (currentPrivacy !== targetPrivacy) {
      changes.push({
        field: 'privacy',
        oldValue: currentPrivacy,
        newValue: targetPrivacy,
        displayOld: formatDisplayValue(currentPrivacy, 'privacy'),
        displayNew: formatDisplayValue(targetPrivacy, 'privacy'),
      });
    }
  }
  
  // 3. 检查骑行类型
  if (updates.rideType !== undefined) {
    // 从多个可能的字段获取当前骑行类型
    const currentType = normalizeRideType(
      activity.ride_type || activity.workout_type || activity.selected_tag_type
    );
    const targetType = normalizeRideType(updates.rideType);
    
    // 严格比较（类型 + 值）
    if (currentType !== targetType) {
      changes.push({
        field: 'rideType',
        oldValue: currentType,
        newValue: targetType,
        displayOld: formatDisplayValue(currentType, 'rideType'),
        displayNew: formatDisplayValue(targetType, 'rideType'),
      });
    }
  }
  
  return {
    needsUpdate: changes.length > 0,
    changes,
  };
}

/**
 * 批量检查活动列表
 * 
 * @param activities 活动列表
 * @param updates 更新配置
 * @returns 每个活动的比较结果
 */
export function checkActivitiesBatch(
  activities: Activity[],
  updates: UpdateConfig
): Map<string | number, ActivityComparisonResult> {
  const results = new Map<string | number, ActivityComparisonResult>();
  
  activities.forEach(activity => {
    const result = checkIfNeedsUpdate(activity, updates);
    results.set(activity.id, result);
  });
  
  return results;
}

/**
 * 统计需要更新和无需更新的活动数量
 * 
 * @param activities 活动列表
 * @param updates 更新配置
 * @returns 统计结果
 */
export function countUpdateStatus(
  activities: Activity[],
  updates: UpdateConfig
): {
  needsUpdate: number;
  noChange: number;
  total: number;
} {
  let needsUpdate = 0;
  let noChange = 0;
  
  activities.forEach(activity => {
    const result = checkIfNeedsUpdate(activity, updates);
    if (result.needsUpdate) {
      needsUpdate++;
    } else {
      noChange++;
    }
  });
  
  return {
    needsUpdate,
    noChange,
    total: activities.length,
  };
}
