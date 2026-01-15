// Activity types and interfaces for Strava Bulk Edit

export type SportType = 'Ride' | 'Run' | 'Swim' | 'Walk' | 'Hike' | 'VirtualRide' | 'VirtualRun';

export type RideType = 'Race' | 'Workout' | 'Commute' | 'Gravel' | 'MountainBike' | 'Road';

export type PrivacyLevel = 'everyone' | 'followers_only' | 'only_me';

export interface Activity {
  id: number | string;
  sport_type: SportType | string;
  name: string;
  // API 返回的字段名
  start_time: string; // ISO 时间字符串，如 "2025-11-01T01:00:00+0000"
  start_date?: string; // 格式化日期，如 "Sat, 11/1/2025"
  start_date_local_raw?: number; // 本地时间戳（秒）
  distance?: string; // 格式化距离字符串（带单位）
  distance_raw: number; // 原始距离（米）
  moving_time?: string; // 格式化时间字符串
  moving_time_raw: number; // 原始移动时间（秒）
  elapsed_time?: string; // 格式化时间字符串
  elapsed_time_raw: number; // 原始总时间（秒）
  elevation_gain?: string; // 格式化爬升
  elevation_gain_raw?: number; // 原始爬升（米）
  visibility: PrivacyLevel | string; // 隐私级别
  bike_id?: string | null; // 自行车ID
  athlete_gear_id?: string | null; // 装备ID
  workout_type?: number; // 训练类型
  ride_type?: RideType | string; // 骑行类型
  selected_tag_type?: number | string; // API返回的骑行类型标签
  trainer?: boolean; // 是否室内训练
  commute?: boolean | null; // 是否通勤
}

export interface Gear {
  id: string;
  name: string;
  brand: string;
  model?: string;
  sport_type: 'Ride' | 'Run';
  distance: number; // total distance in km
  retired: boolean;
}

export interface Bike extends Gear {
  sport_type: 'Ride';
  frame_type?: string;
}

export interface Shoe extends Gear {
  sport_type: 'Run';
}

// Type alias for gear items (simplified)
export type GearItem = Pick<Gear, 'id' | 'name' | 'distance' | 'retired'>;

// Bulk Edit Scenario Types
export type ScenarioType = 
  | 'privacy'
  | 'shoes'
  | 'bikes'
  | 'ride_type';

export interface ScenarioConfig {
  id: ScenarioType;
  icon: string;
  title: string;
  description: string;
  sportTypes: SportType[];
}

export interface DateRange {
  id: string;
  start: string | null;
  end: string | null;
}

export interface FilterConfig {
  sportTypes: SportType[];
  dateRanges: DateRange[];
  distanceRange: [number, number];
  rideTypes?: RideType[];
}

export interface UpdateConfig {
  gearId?: string;
  privacy?: PrivacyLevel;
  rideType?: RideType;
}

export interface BulkEditTask {
  id: string;
  scenario: ScenarioType;
  filters: FilterConfig;
  updates: UpdateConfig;
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed';
  progress: {
    total: number;
    processed: number;
    success: number;
    failed: number;
  };
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  failedActivities?: { id: string; name: string; error: string }[];
}

// ==================== 规则引擎类型 ====================

/**
 * 条件类型枚举
 */
export type ConditionType = 
  | 'sportType' 
  | 'dateRange' 
  | 'distanceRange' 
  | 'rideType';

/**
 * ConditionConfig (条件配置) 类型
 * 单个筛选条件，如运动类型、时间范围、距离范围等
 */
export interface ConditionConfig {
  /** 条件类型 */
  type: ConditionType;
  
  /** 条件是否启用 */
  enabled: boolean;
  
  /** 条件值（根据类型不同而不同） */
  value: any;
}

/**
 * RuleConfig (规则配置) 类型
 * 由多个条件组成的规则
 */
export interface RuleConfig {
  /** 条件列表 */
  conditions: ConditionConfig[];
}

/**
 * Condition (条件) 类型 - 已废弃，使用 ConditionConfig 代替
 * @deprecated Use ConditionConfig instead
 */
export interface Condition {
  /** 条件类型 */
  type: 'sport_type' | 'time_range' | 'distance_range' | 'ride_type';
  
  /** 条件是否启用 */
  enabled: boolean;
  
  /** 条件值（根据类型不同而不同） */
  value: any;
}

/**
 * Rule (规则) 类型
 * 由0个或多个 Conditions 组成，所有启用的条件必须同时满足
 */
export interface Rule {
  /** 规则ID */
  id: string;
  
  /** 场景类型 */
  scenario: ScenarioType;
  
  /** 条件列表 */
  conditions: Condition[];
  
  /** 创建时间 */
  createdAt: Date;
}

/**
 * 条件匹配函数类型
 */
export type ConditionMatcherFunction = (
  activity: Activity,
  conditionValue: any
) => boolean

/**
 * 规则执行结果
 */
export interface RuleMatchResult {
  /** 是否匹配 */
  matched: boolean;
  
  /** 匹配的条件数 */
  matchedConditions: number;
  
  /** 总条件数 */
  totalConditions: number;
  
  /** 未匹配的条件（用于调试） */
  failedConditions?: string[];
}

// ==================== API 响应类型 ====================

/**
 * Strava 训练活动列表 API 响应
 */
export interface TrainingActivitiesResponse {
  /** 活动列表 */
  models: any[];
  
  /** 当前页码 */
  page: number;
  
  /** 每页数量 */
  perPage: number;
  
  /** 总活动数 */
  total: number;
}

/**
 * 活动更新 API 响应
 */
export interface ActivityUpdateResponse {
  /** 更新是否成功 */
  success: boolean;
  
  /** 更新后的活动数据 */
  activity?: any;
  
  /** 错误信息 */
  error?: string;
}

// ==================== 验证结果类型 ====================

/**
 * 验证结果
 */
export interface ValidationResult {
  /** 是否有效 */
  valid: boolean;
  
  /** 错误信息列表 */
  errors: string[];
  
  /** 警告信息列表 */
  warnings?: string[];
}

/**
 * 页面状态验证结果
 */
export interface PageStateValidation {
  /** 是否在正确页面 */
  isCorrectPage: boolean;
  
  /** 是否在第一页 */
  isFirstPage: boolean;
  
  /** 排序是否正确 */
  isSortedByDate: boolean;
  
  /** 是否已登录 */
  isLoggedIn: boolean;
  
  /** 必要元素是否存在 */
  hasRequiredElements: boolean;
  
  /** 错误信息 */
  errors: string[];
}

// ==================== 错误类型 ====================

/**
 * 插件错误类型
 */
export class BulkEditError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'BulkEditError';
  }
}
