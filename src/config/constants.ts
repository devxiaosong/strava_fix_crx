/**
 * 常量配置文件
 * 集中管理所有常量，包括API端点、URL、存储键名等
 */

/**
 * API 端点配置
 */
export const API_ENDPOINTS = {
  /**
   * 训练活动列表 API
   * 用于获取用户的训练活动
   */
  TRAINING_ACTIVITIES: '/athlete/training_activities',
  
  /**
   * 活动更新 API
   * 用于更新单个活动的信息
   * @param activityId - 活动ID
   */
  ACTIVITY_UPDATE: (activityId: string | number) => 
    `/athlete/training_activities/${activityId}`,
  
  /**
   * 装备列表 API - 自行车
   */
  BIKES: (athleteId: string | number) => 
    `/athletes/${athleteId}/gear/bikes`,
  
  /**
   * 装备列表 API - 跑鞋
   */
  SHOES: (athleteId: string | number) => 
    `/athletes/${athleteId}/gear/shoes`,
} as const

/**
 * Strava URL 配置
 */
export const STRAVA_URLS = {
  /**
   * 训练日志页面
   * 插件只在此页面激活
   */
  TRAINING_LOG: '/training/log',
  
  /**
   * 训练活动页面（备选）
   */
  TRAINING_ACTIVITIES: '/training/activities',
  
  /**
   * 基础域名
   */
  BASE_URL: 'https://www.strava.com',
  
  /**
   * 运动员首页路径模式
   */
  ATHLETE_PATH: '/athletes/:athleteId',
} as const

/**
 * Chrome Storage 键名
 * 统一管理存储键，避免冲突
 */
export const STORAGE_KEYS = {
  /**
   * 任务状态键
   * 存储未完成的任务配置和进度
   */
  TASK_STATE: 'strava_bulk_edit_task_state',
  
  /**
   * 批量编辑任务数据键
   * 存储完整的任务数据
   */
  BULK_EDIT_TASK: 'strava_bulk_edit_task',
  
  /**
   * 任务时间戳键
   * 记录任务创建/更新时间，用于判断过期
   */
  TASK_TIMESTAMP: 'strava_bulk_edit_task_timestamp',
  
  /**
   * 运动员ID键
   * 存储当前登录运动员的ID
   */
  ATHLETE_ID: 'strava_bulk_edit_athlete_id',
  
  /**
   * 用户配置键
   * 存储用户的偏好设置
   */
  USER_PREFERENCES: 'strava_bulk_edit_preferences',
  
  /**
   * 缓存键前缀
   * 用于缓存API数据
   */
  CACHE_PREFIX: 'strava_bulk_edit_cache_',
} as const

/**
 * 时间相关常量
 */
export const TIME_CONSTANTS = {
  /**
   * 任务过期时间（毫秒）
   * 24小时后自动清理未完成的任务
   */
  TASK_EXPIRY_TIME: 24 * 60 * 60 * 1000, // 24 hours
  
  /**
   * 缓存过期时间（毫秒）
   * 1小时后缓存失效
   */
  CACHE_EXPIRY_TIME: 60 * 60 * 1000, // 1 hour
  
  /**
   * API超时时间（毫秒）
   */
  API_TIMEOUT: 10000, // 10 seconds
  
  /**
   * 页面加载等待时间（毫秒）
   */
  PAGE_LOAD_WAIT: 3000, // 3 seconds
} as const

/**
 * 重试相关常量
 */
export const RETRY_CONSTANTS = {
  /**
   * 最大重试次数
   */
  MAX_RETRIES: 3,
  
  /**
   * 重试基础延迟（毫秒）
   */
  RETRY_BASE_DELAY: 1000,
  
  /**
   * 重试延迟倍数（指数退避）
   */
  RETRY_MULTIPLIER: 2,
  
  /**
   * 连续失败阈值
   * 超过此数量连续失败将自动暂停
   */
  CONSECUTIVE_FAILURE_THRESHOLD: 5,
} as const

/**
 * 场景类型枚举
 */
export const SCENARIO_TYPES = {
  /**
   * 批量更新自行车
   */
  BIKES: 'bikes',
  
  /**
   * 批量更新跑鞋
   */
  SHOES: 'shoes',
  
  /**
   * 调整活动隐私设置
   */
  PRIVACY: 'privacy',
  
  /**
   * 标记骑行类型
   */
  RIDE_TYPE: 'ride_type',
} as const

/**
 * 场景类型的类型定义
 */
export type ScenarioType = typeof SCENARIO_TYPES[keyof typeof SCENARIO_TYPES]

/**
 * 运动类型枚举
 */
export const SPORT_TYPES = {
  RIDE: 'Ride',
  RUN: 'Run',
  SWIM: 'Swim',
  WALK: 'Walk',
  HIKE: 'Hike',
  VIRTUAL_RIDE: 'VirtualRide',
  VIRTUAL_RUN: 'VirtualRun',
} as const

/**
 * 隐私级别枚举
 */
export const PRIVACY_LEVELS = {
  /**
   * 所有人可见
   */
  EVERYONE: 'everyone',
  
  /**
   * 仅关注者可见
   */
  FOLLOWERS_ONLY: 'followers_only',
  
  /**
   * 仅自己可见
   */
  ONLY_ME: 'only_me',
} as const

/**
 * 骑行类型枚举
 */
export const RIDE_TYPES = {
  RIDE: 'Ride',
  RACE: 'Race',
  WORKOUT: 'Workout',
  LONG_RIDE: 'Long Ride',
  COMMUTE: 'Commute',
} as const

/**
 * 跑步类型枚举
 */
export const RUN_TYPES = {
  RUN: 'Run',
  RACE: 'Race',
  WORKOUT: 'Workout',
  LONG_RUN: 'Long Run',
} as const

/**
 * 任务状态枚举
 */
export const TASK_STATUS = {
  /**
   * 待处理
   */
  PENDING: 'pending',
  
  /**
   * 运行中
   */
  RUNNING: 'running',
  
  /**
   * 已暂停
   */
  PAUSED: 'paused',
  
  /**
   * 已完成
   */
  COMPLETED: 'completed',
  
  /**
   * 已失败
   */
  FAILED: 'failed',
  
  /**
   * 已取消
   */
  CANCELLED: 'cancelled',
} as const

/**
 * 错误代码
 */
export const ERROR_CODES = {
  /**
   * 页面状态错误
   */
  INVALID_PAGE_STATE: 'INVALID_PAGE_STATE',
  
  /**
   * 未登录
   */
  NOT_LOGGED_IN: 'NOT_LOGGED_IN',
  
  /**
   * 配置无效
   */
  INVALID_CONFIG: 'INVALID_CONFIG',
  
  /**
   * API错误
   */
  API_ERROR: 'API_ERROR',
  
  /**
   * 网络错误
   */
  NETWORK_ERROR: 'NETWORK_ERROR',
  
  /**
   * 超时
   */
  TIMEOUT: 'TIMEOUT',
  
  /**
   * DOM操作失败
   */
  DOM_ERROR: 'DOM_ERROR',
  
  /**
   * 选择器失效
   */
  SELECTOR_FAILED: 'SELECTOR_FAILED',
  
  /**
   * 任务已过期
   */
  TASK_EXPIRED: 'TASK_EXPIRED',
  
  /**
   * 装备不存在
   */
  GEAR_NOT_FOUND: 'GEAR_NOT_FOUND',
} as const

/**
 * 日志级别
 */
export const LOG_LEVELS = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
} as const

/**
 * 功能特性标志
 * 用于控制功能的开启/关闭
 */
export const FEATURE_FLAGS = {
  /**
   * 启用智能延迟（随机延迟）
   */
  ENABLE_SMART_DELAY: true,
  
  /**
   * 启用智能翻页优化
   * 当前页所有活动都早于最早时间时提前停止
   */
  ENABLE_EARLY_STOP: true,
  
  /**
   * 启用API监听器
   */
  ENABLE_API_LISTENER: true,
  
  /**
   * 启用断点续传
   */
  ENABLE_RESUME: true,
  
  /**
   * 开发模式
   * 启用详细日志和调试功能
   */
  DEV_MODE: process.env.NODE_ENV === 'development',
} as const

/**
 * 默认配置值
 */
export const DEFAULT_VALUES = {
  /**
   * 默认每页数量
   */
  PER_PAGE: 20,
  
  /**
   * 默认距离范围（公里）- 骑行
   */
  DEFAULT_RIDE_DISTANCE_RANGE: [0, 300] as [number, number],
  
  /**
   * 默认距离范围（公里）- 跑步
   */
  DEFAULT_RUN_DISTANCE_RANGE: [0, 40] as [number, number],
  
  /**
   * 默认时间范围（为空表示不限）
   */
  DEFAULT_TIME_RANGES: [] as [],
  
  /**
   * 默认排序方式
   */
  DEFAULT_SORT: 'date_desc',
} as const

/**
 * 分页配置
 */
export const PAGINATION = {
  /**
   * 每页活动数
   */
  PAGE_SIZE: 20,
  
  /**
   * 最大页数（防止无限循环）
   */
  MAX_PAGES: 500,
  
  /**
   * 第一页页码
   */
  FIRST_PAGE: 1,
} as const

/**
 * 验证规则
 */
export const VALIDATION_RULES = {
  /**
   * 活动ID最小长度
   */
  MIN_ACTIVITY_ID_LENGTH: 1,
  
  /**
   * 装备ID最小长度
   */
  MIN_GEAR_ID_LENGTH: 1,
  
  /**
   * 时间范围最大数量
   */
  MAX_TIME_RANGES: 10,
  
  /**
   * 距离最大值（公里）
   */
  MAX_DISTANCE: 1000,
  
  /**
   * 距离最小值（公里）
   */
  MIN_DISTANCE: 0,
} as const

/**
 * UI 相关常量
 */
export const UI_CONSTANTS = {
  /**
   * Modal 动画时长（毫秒）
   */
  MODAL_ANIMATION_DURATION: 300,
  
  /**
   * Toast 显示时长（毫秒）
   */
  TOAST_DURATION: 3000,
  
  /**
   * 进度条更新间隔（毫秒）
   */
  PROGRESS_UPDATE_INTERVAL: 100,
  
  /**
   * 批量更新按钮ID
   */
  BULK_EDIT_BUTTON_ID: 'strava-bulk-edit-btn',
  
  /**
   * 插件容器ID
   */
  PLUGIN_CONTAINER_ID: 'strava-bulk-edit-container',
} as const

/**
 * 正则表达式
 */
export const REGEX_PATTERNS = {
  /**
   * Athlete ID 提取正则
   * 从 /athletes/{athleteId}/training/log 中提取
   */
  ATHLETE_ID: /\/athletes\/(\d+)\//,
  
  /**
   * Activity ID 提取正则
   * 从 /activities/{activityId} 中提取
   */
  ACTIVITY_ID: /\/activities\/(\d+)/,
  
  /**
   * 日期格式验证正则 (YYYY-MM-DD)
   */
  DATE_FORMAT: /^\d{4}-\d{2}-\d{2}$/,
  
  /**
   * 时间戳验证正则（13位毫秒时间戳）
   */
  TIMESTAMP: /^\d{13}$/,
} as const

/**
 * 统一的常量导出
 * 包含所有配置常量，方便导入和使用
 */
export const CONSTANTS = {
  API_ENDPOINTS,
  STRAVA_URLS,
  STORAGE_KEYS,
  TIME_CONSTANTS,
  RETRY_CONSTANTS,
  SCENARIO_TYPES,
  SPORT_TYPES,
  PRIVACY_LEVELS,
  RIDE_TYPES,
  RUN_TYPES,
  TASK_STATUS,
  ERROR_CODES,
  LOG_LEVELS,
  FEATURE_FLAGS,
  DEFAULT_VALUES,
  PAGINATION,
  VALIDATION_RULES,
  UI_CONSTANTS,
  REGEX_PATTERNS,
  
  // 快捷访问常用配置
  TASK_EXPIRATION_HOURS: 24, // 从 TIME_CONSTANTS.TASK_EXPIRY_TIME 转换为小时
  MAX_RETRIES: RETRY_CONSTANTS.MAX_RETRIES,
  API_BASE_URL: STRAVA_URLS.BASE_URL,
  TRAINING_LOG_PATH: STRAVA_URLS.TRAINING_LOG,
} as const
