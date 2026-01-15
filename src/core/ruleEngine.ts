/**
 * 规则引擎
 * 负责根据用户定义的规则（Rule）筛选和匹配活动
 */

import type {
  Activity,
  ConditionConfig,
  RuleConfig,
  FilterConfig,
  ConditionType,
} from '~/types/activity';
import { isValidCondition, isValidRule } from '~/utils/validator';

/**
 * 评估单个条件是否匹配活动
 * @param condition 条件配置
 * @param activity 活动对象
 * @returns boolean 是否匹配
 */
export function evaluateCondition(condition: ConditionConfig, activity: Activity): boolean {
  // 如果条件未启用，视为通过
  if (!condition.enabled) {
    return true;
  }

  // 验证条件有效性
  if (!isValidCondition(condition)) {
    console.warn('[RuleEngine] Invalid condition, skipping:', condition);
    return false;
  }

  switch (condition.type) {
    case 'sportType':
      console.log('[RuleEngine] Evaluating sportType:', condition.value, 'Activity:', activity.sport_type);
      return evaluateSportType(condition.value, activity);

    case 'dateRange':
      console.log('[RuleEngine] Evaluating dateRange:', condition.value, 'Activity start_time:', activity.start_time);
      return evaluateDateRange(condition.value, activity);

    case 'distanceRange':
      console.log('[RuleEngine] Evaluating distanceRange:', condition.value, 'Activity distance_raw:', activity.distance_raw);
      return evaluateDistanceRange(condition.value, activity);

    case 'rideType':
      console.log('[RuleEngine] Evaluating rideType:', condition.value, 'Activity:', activity.ride_type);
      return evaluateRideType(condition.value, activity);

    default:
      console.warn('[RuleEngine] Unknown condition type:', condition.type);
      return false;
  }
}

/**
 * 评估运动类型条件
 * @param sportTypes 期望的运动类型数组
 * @param activity 活动对象
 * @returns boolean
 */
function evaluateSportType(sportTypes: string[], activity: Activity): boolean {
  return sportTypes.includes(activity.sport_type);
}

/**
 * 评估日期范围条件
 * @param dateRanges 日期范围数组（字符串格式）
 * @param activity 活动对象
 * @returns boolean
 */
function evaluateDateRange(
  dateRanges: Array<{ start: string; end: string }>,
  activity: Activity
): boolean {
  // 使用 start_time 字段
  if (!activity.start_time) {
    return false;
  }

  const activityTime = new Date(activity.start_time).getTime();

  // 只要满足任一范围即可（OR 逻辑）
  return dateRanges.some(range => {
    const startTime = new Date(range.start).getTime();
    const endTime = new Date(range.end).getTime();
    
    return activityTime >= startTime && activityTime <= endTime;
  });
}

/**
 * 评估距离范围条件
 * @param distanceRange { min: number, max: number } 距离（公里）
 * @param activity 活动对象
 * @returns boolean
 */
function evaluateDistanceRange(
  distanceRange: { min: number; max: number },
  activity: Activity
): boolean {
  // 使用 distance_raw 字段（米）
  if (activity.distance_raw === null || activity.distance_raw === undefined) {
    return false;
  }

  // 将米转换为公里
  const distanceInKm = activity.distance_raw / 1000;

  // 检查距离是否在范围内
  return distanceInKm >= distanceRange.min && distanceInKm <= distanceRange.max;
}

/**
 * 评估骑行类型条件
 * @param rideTypes 期望的骑行类型数组
 * @param activity 活动对象
 * @returns boolean
 */
function evaluateRideType(rideTypes: string[], activity: Activity): boolean {
  return rideTypes.includes(activity.ride_type);
}

/**
 * 评估规则是否匹配活动（所有启用的条件都必须满足）
 * @param rule 规则配置
 * @param activity 活动对象
 * @returns boolean
 */
export function evaluateRule(rule: RuleConfig, activity: Activity): boolean {
  // 验证规则有效性
  if (!isValidRule(rule)) {
    console.warn('[RuleEngine] Invalid rule, rejecting activity:', rule);
    return false;
  }

  // 如果没有条件，匹配所有活动
  if (!rule.conditions || rule.conditions.length === 0) {
    console.log('[RuleEngine] No conditions, matching all activities');
    return true;
  }

  // 所有启用的条件都必须满足（AND逻辑）
  const enabledConditions = rule.conditions.filter(c => c.enabled);

  // 如果没有启用的条件，匹配所有活动
  if (enabledConditions.length === 0) {
    console.log('[RuleEngine] No enabled conditions, matching all activities');
    return true;
  }

  // 评估每个启用的条件
  for (const condition of enabledConditions) {
    if (!evaluateCondition(condition, activity)) {
      console.log('[RuleEngine] Condition not matched:', JSON.stringify(condition), 'Activity:', activity);
      return false;
    }
  }

  return true;
}

/**
 * 检查活动是否匹配规则（便捷方法）
 * @param activity 活动对象
 * @param rule 规则配置
 * @returns boolean
 */
export function matchActivity(activity: Activity, rule: RuleConfig): boolean {
  return evaluateRule(rule, activity);
}

/**
 * 根据规则过滤活动列表
 * @param activities 活动列表
 * @param rule 规则配置
 * @returns Activity[] 匹配的活动列表
 */
export function filterActivities(activities: Activity[], rule: RuleConfig): Activity[] {
  if (!activities || activities.length === 0) {
    return [];
  }

  const matched = activities.filter(activity => evaluateRule(rule, activity));

  console.log(`[RuleEngine] Filtered ${matched.length}/${activities.length} activities`);
  return matched;
}

/**
 * 将 FilterConfig 编译为 RuleConfig
 * @param filterConfig 筛选配置
 * @returns RuleConfig
 */
export function compileRule(filterConfig: FilterConfig): RuleConfig {
  const conditions: ConditionConfig[] = [];

  // 运动类型条件
  if (filterConfig.sportTypes && filterConfig.sportTypes.length > 0) {
    conditions.push({
      type: 'sportType',
      enabled: true,
      value: filterConfig.sportTypes,
    });
  }

  // 日期范围条件 - 始终使用数组格式，支持多个范围（OR 逻辑）
  if (filterConfig.dateRanges && filterConfig.dateRanges.length > 0) {
    const validRanges = filterConfig.dateRanges
      .filter(dateRange => dateRange.start && dateRange.end)
      .map(dateRange => ({
        start: dateRange.start,
        end: dateRange.end,
      }));
    
    if (validRanges.length > 0) {
      conditions.push({
        type: 'dateRange',
        enabled: true,
        value: validRanges, // 始终使用数组
      });
    }
  }

  // 距离范围条件
  if (filterConfig.distanceRange && 
      filterConfig.distanceRange[0] !== undefined && 
      filterConfig.distanceRange[1] !== undefined) {
    conditions.push({
      type: 'distanceRange',
      enabled: true,
      value: {
        min: filterConfig.distanceRange[0],
        max: filterConfig.distanceRange[1],
      },
    });
  }

  // 骑行类型条件
  if (filterConfig.rideTypes && filterConfig.rideTypes.length > 0) {
    conditions.push({
      type: 'rideType',
      enabled: true,
      value: filterConfig.rideTypes,
    });
  }

  const rule: RuleConfig = { conditions };

  console.log('[RuleEngine] Compiled rule from filter config:', JSON.stringify(rule, null, 2));
  
  // 验证编译后的规则
  if (!isValidRule(rule)) {
    console.error('[RuleEngine] Compiled rule is INVALID!', rule);
    // 检查每个条件
    rule.conditions.forEach((condition, index) => {
      const valid = isValidCondition(condition);
      console.log(`[RuleEngine] Condition ${index} (${condition.type}):`, valid ? '✅ Valid' : '❌ Invalid', condition);
    });
  }
  
  return rule;
}

/**
 * 智能分页优化：检查是否应该停止分页
 * 如果当前页的所有活动都不在时间范围内（且都早于范围），则可以停止
 * @param activities 当前页的活动列表
 * @param rule 规则配置
 * @returns boolean 是否应该停止分页
 */
export function shouldStopPaging(activities: Activity[], rule: RuleConfig): boolean {
  // 只在有日期范围条件时才进行优化
  const dateCondition = rule.conditions.find(c => c.type === 'dateRange' && c.enabled);
  
  if (!dateCondition || !dateCondition.value) {
    return false;
  }

  // 获取最早的开始时间（日期范围数组，字符串格式）
  const earliestStartTime = Math.min(
    ...dateCondition.value.map(range => new Date(range.start).getTime())
  );

  // 检查当前页的所有活动是否都早于最早的开始时间
  const allBeforeRange = activities.every(activity => {
    if (!activity.start_time) return false;
    const activityTime = new Date(activity.start_time).getTime();
    return activityTime < earliestStartTime;
  });

  if (allBeforeRange && activities.length > 0) {
    console.log('[RuleEngine] All activities on page are before date range(s), stopping pagination');
    return true;
  }

  return false;
}

/**
 * 创建一个匹配所有活动的空规则
 * @returns RuleConfig
 */
export function createMatchAllRule(): RuleConfig {
  return {
    conditions: [],
  };
}

/**
 * 创建一个运动类型规则
 * @param sportType 运动类型
 * @returns RuleConfig
 */
export function createSportTypeRule(sportType: string): RuleConfig {
  return {
    conditions: [
      {
        type: 'sportType',
        enabled: true,
        value: sportType,
      },
    ],
  };
}

/**
 * 创建一个日期范围规则
 * @param start 开始时间
 * @param end 结束时间
 * @returns RuleConfig
 */
export function createDateRangeRule(start: number | string, end: number | string): RuleConfig {
  return {
    conditions: [
      {
        type: 'dateRange',
        enabled: true,
        value: { start, end },
      },
    ],
  };
}

/**
 * 合并多个规则（AND逻辑）
 * @param rules 规则数组
 * @returns RuleConfig
 */
export function mergeRules(...rules: RuleConfig[]): RuleConfig {
  const allConditions: ConditionConfig[] = [];

  rules.forEach(rule => {
    if (rule.conditions) {
      allConditions.push(...rule.conditions);
    }
  });

  return {
    conditions: allConditions,
  };
}

/**
 * 获取规则的摘要信息（用于日志和调试）
 * @param rule 规则配置
 * @returns string
 */
export function getRuleSummary(rule: RuleConfig): string {
  if (!rule.conditions || rule.conditions.length === 0) {
    return 'Match all activities (no conditions)';
  }

  const enabledConditions = rule.conditions.filter(c => c.enabled);
  
  if (enabledConditions.length === 0) {
    return 'Match all activities (no enabled conditions)';
  }

  const summaries = enabledConditions.map(c => {
    switch (c.type) {
      case 'sportType':
        return `Sport: ${c.value.join(', ')}`;
      case 'dateRange':
        // 日期范围数组
        const ranges = c.value.map(range => 
          `${new Date(range.start).toLocaleDateString()} - ${new Date(range.end).toLocaleDateString()}`
        );
        return ranges.length === 1 
          ? `Date: ${ranges[0]}` 
          : `Date: (${ranges.join(' OR ')})`;
      case 'distanceRange':
        return `Distance: ${c.value.min}-${c.value.max} km`;
      case 'rideType':
        return `Ride Type: ${c.value.join(', ')}`;
      default:
        return `${c.type}: ${JSON.stringify(c.value)}`;
    }
  });

  return summaries.join(' AND ');
}

