/**
 * Strava 批量编辑字段类型定义
 */
export interface BulkEditFields {
  rideType?: string
  bike?: string
  shoes?: string
  visibility?: string
}

/**
 * 隐私设置选项
 */
export enum VisibilityOption {
  EVERYONE = "everyone",
  FOLLOWERS_ONLY = "followers_only",
  ONLY_ME = "only_me"
}

/**
 * 更新状态
 */
export interface UpdateStatus {
  total: number
  current: number
  isUpdating: boolean
  error?: string
}

