/**
 * 数据验证工具
 * 提供对各类数据的有效性验证
 */

import type {
  FilterConfig,
  UpdateConfig,
  Activity,
  ConditionConfig,
  RuleConfig,
} from '~/types/activity';

/**
 * 验证运动员ID格式
 * @param athleteId 运动员ID
 * @returns boolean
 */
export function isValidAthleteId(athleteId: string | null | undefined): boolean {
  if (!athleteId) return false;
  // Strava 运动员ID通常是数字字符串
  return /^\d+$/.test(athleteId);
}

/**
 * 验证活动ID格式
 * @param activityId 活动ID
 * @returns boolean
 */
export function isValidActivityId(activityId: string | number | null | undefined): boolean {
  if (!activityId) return false;
  // 支持数字或数字字符串
  if (typeof activityId === 'number') return activityId > 0;
  return /^\d+$/.test(activityId);
}

/**
 * 验证日期范围是否有效
 * @param startDate 开始日期（字符串）
 * @param endDate 结束日期（字符串）
 * @returns boolean
 */
export function isValidDateRange(
  startDate: string | null | undefined,
  endDate: string | null | undefined
): boolean {
  console.log('[Validator] isValidDateRange called:', { startDate, endDate });
  
  if (!startDate || !endDate) {
    console.log('[Validator] Missing date:', !startDate ? 'start' : 'end');
    return false;
  }
  
  if (typeof startDate !== 'string' || typeof endDate !== 'string') {
    console.log('[Validator] Wrong type:', { startType: typeof startDate, endType: typeof endDate });
    return false;
  }

  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();

  console.log('[Validator] Parsed times:', { start, end, startValid: !isNaN(start), endValid: !isNaN(end) });

  // 检查日期是否有效
  if (isNaN(start) || isNaN(end)) {
    console.log('[Validator] Invalid date:', isNaN(start) ? 'start' : 'end');
    return false;
  }

  // 开始日期必须早于或等于结束日期
  const valid = start <= end;
  console.log('[Validator] Date range valid:', valid, 'start <= end:', start <= end);
  return valid;
}

/**
 * 验证距离范围是否有效
 * @param minDistance 最小距离（公里）
 * @param maxDistance 最大距离（公里）
 * @returns boolean
 */
export function isValidDistanceRange(
  minDistance: number | null | undefined,
  maxDistance: number | null | undefined
): boolean {
  if (minDistance === null || minDistance === undefined) return false;
  if (maxDistance === null || maxDistance === undefined) return false;

  // 距离必须为非负数
  if (minDistance < 0 || maxDistance < 0) return false;

  // 最小距离必须小于或等于最大距离
  return minDistance <= maxDistance;
}

/**
 * 验证 Condition 配置是否有效
 * @param condition 条件配置
 * @returns boolean
 */
export function isValidCondition(condition: ConditionConfig): boolean {
  console.log('song start isValidCondition', condition);
  if (!condition || typeof condition !== 'object') return false;
  if (!condition.type) return false;

  // 如果条件未启用，则认为有效（会被跳过）
  if (!condition.enabled) return true;

  // 根据类型验证值
  switch (condition.type) {
    case 'sportType':
      // 必须是非空字符串数组
      return Array.isArray(condition.value) && 
             condition.value.length > 0 && 
             condition.value.every(v => typeof v === 'string' && v.length > 0);

    case 'dateRange':
      // 必须是日期范围对象数组
      console.log('[Validator] Validating dateRange condition:', condition.value);
      
      if (!Array.isArray(condition.value)) {
        console.log('[Validator] dateRange value is not an array');
        return false;
      }
      
      if (condition.value.length === 0) {
        console.log('[Validator] dateRange array is empty');
        return false;
      }
      
      const allValid = condition.value.every((range, index) => {
        console.log(`[Validator] Checking range ${index}:`, range);
        
        if (!range) {
          console.log(`[Validator] Range ${index} is falsy`);
          return false;
        }
        
        if (typeof range !== 'object') {
          console.log(`[Validator] Range ${index} is not an object, type:`, typeof range);
          return false;
        }
        
        const valid = isValidDateRange(range.start, range.end);
        console.log(`[Validator] Range ${index} validation result:`, valid);
        return valid;
      });
      
      console.log('[Validator] dateRange overall valid:', allValid);
      return allValid;

    case 'distanceRange':
      // 必须有 min 和 max，且是有效的距离范围
      if (!condition.value || typeof condition.value !== 'object') return false;
      return isValidDistanceRange(condition.value.min, condition.value.max);

    case 'rideType':
      // 必须是非空字符串数组
      return Array.isArray(condition.value) && 
             condition.value.length > 0 && 
             condition.value.every(v => typeof v === 'string' && v.length > 0);

    default:
      console.warn('[Validator] Unknown condition type:', condition.type);
      return false;
  }
}

/**
 * 验证 Rule 配置是否有效
 * @param rule 规则配置
 * @returns boolean
 */
export function isValidRule(rule: RuleConfig): boolean {
  if (!rule || typeof rule !== 'object') return false;
  if (!Array.isArray(rule.conditions)) return false;

  // 空规则（无条件）是有效的，表示匹配所有
  if (rule.conditions.length === 0) return true;

  // 验证每个条件
  return rule.conditions.every(condition => isValidCondition(condition));
}

/**
 * 验证筛选配置是否有效
 * @param filterConfig 筛选配置
 * @returns boolean
 */
export function isValidFilterConfig(filterConfig: FilterConfig | null | undefined): boolean {
  if (!filterConfig || typeof filterConfig !== 'object') return false;

  // 验证日期范围（如果提供）
  if (filterConfig.dateRanges && filterConfig.dateRanges.length > 0) {
    for (const dateRange of filterConfig.dateRanges) {
      if (dateRange.start && dateRange.end && !isValidDateRange(dateRange.start, dateRange.end)) {
      return false;
      }
    }
  }

  // 验证距离范围（如果提供）
  if (filterConfig.distanceRange) {
    const [min, max] = filterConfig.distanceRange;
    if (min !== undefined && max !== undefined && !isValidDistanceRange(min, max)) {
      return false;
    }
  }

  return true;
}

/**
 * 验证更新配置是否有效
 * @param updateConfig 更新配置
 * @returns boolean
 */
export function isValidUpdateConfig(updateConfig: UpdateConfig | null | undefined): boolean {
  if (!updateConfig || typeof updateConfig !== 'object') return false;

  // 至少需要有一个字段要更新
  const hasUpdate =
    updateConfig.gearId !== undefined ||
    updateConfig.privacy !== undefined ||
    updateConfig.rideType !== undefined;

  return hasUpdate;
}

/**
 * 验证活动对象是否有效
 * @param activity 活动对象
 * @returns boolean
 */
export function isValidActivity(activity: Activity | null | undefined): boolean {
  if (!activity || typeof activity !== 'object') return false;

  // 必须有ID和名称
  if (!activity.id || !activity.name) return false;

  // ID必须有效
  if (!isValidActivityId(activity.id)) return false;

  return true;
}

/**
 * 验证活动数组是否有效
 * @param activities 活动数组
 * @returns boolean
 */
export function isValidActivityArray(activities: Activity[] | null | undefined): boolean {
  if (!Array.isArray(activities)) return false;
  if (activities.length === 0) return true; // 空数组也是有效的

  // 验证每个活动
  return activities.every(activity => isValidActivity(activity));
}

/**
 * 验证CSRF Token是否有效
 * @param token CSRF Token
 * @returns boolean
 */
export function isValidCsrfToken(token: string | null | undefined): boolean {
  if (!token || typeof token !== 'string') return false;
  // CSRF Token通常是一个较长的字符串
  return token.length > 10;
}

/**
 * 验证页面是否在训练日志页面
 * @returns boolean
 */
export function isOnTrainingLogPage(): boolean {
  const path = window.location.pathname;
  return path.includes('/athlete/training') || path.includes('/training/log');
}

/**
 * 验证页面是否已加载完成
 * @returns boolean
 */
export function isPageLoaded(): boolean {
  return document.readyState === 'complete';
}


/**
 * 验证元素是否可见
 * @param element DOM元素
 * @returns boolean
 */
export function isElementVisible(element: HTMLElement | null): boolean {
  if (!element) return false;

  const style = window.getComputedStyle(element);
  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    style.opacity !== '0' &&
    element.offsetParent !== null
  );
}

/**
 * 验证元素是否可交互（可点击）
 * @param element DOM元素
 * @returns boolean
 */
export function isElementInteractive(element: HTMLElement | null): boolean {
  if (!element) return false;
  if (!isElementVisible(element)) return false;

  // 检查是否被禁用
  if (element.hasAttribute('disabled')) return false;
  if (element.getAttribute('aria-disabled') === 'true') return false;

  return true;
}

/**
 * 验证Strava API响应是否有效
 * @param response 响应对象
 * @returns boolean
 */
export function isValidApiResponse(response: any): boolean {
  if (!response || typeof response !== 'object') return false;

  // 检查是否有错误
  if (response.error || response.errors) return false;

  return true;
}

/**
 * 批量验证：检查执行前的所有必要条件
 * @param checks 需要检查的条件对象
 * @returns { valid: boolean; errors: string[] }
 */
export function validateExecutionPrerequisites(checks: {
  athleteId?: string | null;
  filterConfig?: FilterConfig | null;
  updateConfig?: UpdateConfig | null;
  rule?: RuleConfig | null;
  onTrainingLogPage?: boolean;
  pageLoaded?: boolean;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (checks.athleteId !== undefined && !isValidAthleteId(checks.athleteId)) {
    errors.push('Invalid athlete ID');
  }

  if (checks.filterConfig !== undefined && !isValidFilterConfig(checks.filterConfig)) {
    errors.push('Invalid filter configuration');
  }

  if (checks.updateConfig !== undefined && !isValidUpdateConfig(checks.updateConfig)) {
    errors.push('Invalid update configuration');
  }

  if (checks.rule !== undefined && !isValidRule(checks.rule)) {
    errors.push('Invalid rule configuration');
  }

  if (checks.onTrainingLogPage !== undefined && !checks.onTrainingLogPage) {
    errors.push('Not on training log page');
  }

  if (checks.pageLoaded !== undefined && !checks.pageLoaded) {
    errors.push('Page not loaded');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

