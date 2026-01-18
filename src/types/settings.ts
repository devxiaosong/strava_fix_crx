/**
 * 操作间隔设置类型
 */
export type IntervalSpeed = 'quick' | 'default' | 'slow';

/**
 * 间隔配置映射
 */
export const INTERVAL_CONFIG = {
  quick: 1500,
  default: 3000,
  slow: 4500,
} as const;

/**
 * 存储在Chrome Storage中的设置
 */
export interface ExtensionSettings {
  /**
   * 操作间隔速度
   */
  intervalSpeed: IntervalSpeed;
}

/**
 * 默认设置
 */
export const DEFAULT_SETTINGS: ExtensionSettings = {
  intervalSpeed: 'default',
};

/**
 * Storage Key
 */
export const STORAGE_KEY = 'extension_settings';
