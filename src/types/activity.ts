// Activity types and interfaces for Strava Bulk Edit

export type SportType = 'Ride' | 'Run' | 'Swim' | 'Walk' | 'Hike' | 'VirtualRide' | 'VirtualRun';

export type RideType = 'Race' | 'Workout' | 'Commute' | 'Gravel' | 'MountainBike' | 'Road';

export type PrivacyLevel = 'everyone' | 'followers_only' | 'only_me';

export interface Activity {
  id: string;
  sport_type: SportType;
  name: string;
  date: string;
  distance: number; // in km
  moving_time: number; // in seconds
  elapsed_time: number; // in seconds
  total_elevation_gain: number; // in meters
  privacy: PrivacyLevel;
  gear_id?: string;
  ride_type?: RideType;
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
  start: Date | null;
  end: Date | null;
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

// ==================== 任务状态类型 ====================

/**
 * 任务状态 (TaskState)
 * 保存到 Chrome Storage 的完整任务状态
 */
export interface TaskState {
  /** 任务ID */
  taskId: string;
  
  /** 场景类型 */
  scenario: ScenarioType;
  
  /** 筛选条件 */
  filters: FilterConfig;
  
  /** 更新值 */
  updates: UpdateConfig;
  
  /** 执行进度 */
  progress: TaskProgress;
  
  /** 任务状态 */
  status: TaskStatus;
  
  /** 创建时间戳 */
  createdAt: number;
  
  /** 更新时间戳 */
  updatedAt: number;
  
  /** 开始时间戳 */
  startedAt?: number;
  
  /** 完成时间戳 */
  completedAt?: number;
}

/**
 * 任务进度
 */
export interface TaskProgress {
  /** 当前页码 */
  currentPage: number;
  
  /** 总页数 */
  totalPages: number;
  
  /** 统计数据 */
  statistics: TaskStatistics;
  
  /** 失败活动列表 */
  failedActivities: FailedActivity[];
}

/**
 * 任务统计
 */
export interface TaskStatistics {
  /** 已处理活动数 */
  processed: number;
  
  /** 成功数 */
  success: number;
  
  /** 失败数 */
  failed: number;
  
  /** 跳过数 */
  skipped: number;
}

/**
 * 失败的活动信息
 */
export interface FailedActivity {
  /** 活动ID */
  id: string;
  
  /** 活动名称 */
  name: string;
  
  /** 活动日期 */
  date: string;
  
  /** 错误信息 */
  error: string;
  
  /** 重试次数 */
  retryCount: number;
  
  /** 失败时间戳 */
  failedAt: number;
}

/**
 * 任务状态枚举
 */
export type TaskStatus = 
  | 'pending'      // 待处理
  | 'running'      // 运行中
  | 'paused'       // 已暂停
  | 'completed'    // 已完成
  | 'failed'       // 已失败
  | 'cancelled'    // 已取消

// ==================== 执行状态类型 ====================

/**
 * 执行状态 (ExecutionState)
 * 执行引擎运行时的内部状态
 */
export interface ExecutionState {
  /** 是否正在执行 */
  isExecuting: boolean;
  
  /** 是否已暂停 */
  isPaused: boolean;
  
  /** 当前页码 */
  currentPage: number;
  
  /** 总页数 */
  totalPages: number;
  
  /** 已处理的活动数 */
  processedCount: number;
  
  /** 统计数据 */
  statistics: TaskStatistics;
  
  /** 失败活动列表 */
  failedActivities: FailedActivity[];
  
  /** 开始时间戳 */
  startTime: number;
  
  /** 暂停时间戳 */
  pausedAt?: number;
  
  /** 规则对象 */
  rule: Rule;
  
  /** 更新配置 */
  updateConfig: UpdateConfig;
}

/**
 * 执行配置
 */
export interface ExecutionConfig {
  /** 场景类型 */
  scenario: ScenarioType;
  
  /** 筛选条件 */
  filters: FilterConfig;
  
  /** 更新值 */
  updates: UpdateConfig;
  
  /** 是否跳过预览 */
  skipPreview?: boolean;
  
  /** 是否恢复任务 */
  isResume?: boolean;
  
  /** 恢复的任务状态 */
  resumeState?: TaskState;
}

// ==================== 进度数据类型 ====================

/**
 * 进度数据 (ProgressData)
 * 用于实时更新UI的进度信息
 */
export interface ProgressData {
  /** 当前页码 */
  currentPage: number;
  
  /** 总页数 */
  totalPages: number;
  
  /** 进度百分比 (0-100) */
  percentage: number;
  
  /** 已处理活动数 */
  processedCount: number;
  
  /** 成功数 */
  successCount: number;
  
  /** 失败数 */
  failedCount: number;
  
  /** 跳过数 */
  skippedCount: number;
  
  /** 预计剩余时间（秒） */
  estimatedRemainingTime?: number;
  
  /** 当前状态描述 */
  statusMessage: string;
}

/**
 * 预览进度数据
 */
export interface PreviewProgressData {
  /** 已扫描活动数 */
  scannedCount: number;
  
  /** 匹配活动数 */
  matchedCount: number;
  
  /** 当前页码 */
  currentPage: number;
  
  /** 总页数 */
  totalPages: number;
  
  /** 进度百分比 (0-100) */
  percentage: number;
  
  /** 状态消息 */
  statusMessage: string;
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

// ==================== 事件类型 ====================

/**
 * 执行事件类型
 */
export type ExecutionEventType =
  | 'start'           // 开始执行
  | 'progress'        // 进度更新
  | 'page_complete'   // 页面处理完成
  | 'pause'           // 暂停
  | 'resume'          // 恢复
  | 'complete'        // 完成
  | 'error'           // 错误
  | 'cancel'          // 取消

/**
 * 执行事件
 */
export interface ExecutionEvent {
  /** 事件类型 */
  type: ExecutionEventType;
  
  /** 事件数据 */
  data?: any;
  
  /** 事件时间戳 */
  timestamp: number;
}

/**
 * 执行回调函数类型
 */
export type ExecutionCallback = (event: ExecutionEvent) => void | Promise<void>

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
