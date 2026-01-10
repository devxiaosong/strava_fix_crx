/**
 * 延迟配置文件
 * 集中管理所有延迟参数，方便开发和生产环境调整
 */

/**
 * 生产环境延迟配置
 */
export const DELAYS = {
  // ==================== DOM操作延迟 ====================
  
  /**
   * 点击快速编辑按钮后等待编辑表单出现
   */
  QUICK_EDIT_CLICK: 500,
  
  /**
   * 填充表单字段后等待表单更新
   */
  FORM_FILL: 300,
  
  /**
   * 提交保存后等待请求完成
   */
  SUBMIT_SAVE: 1500,
  
  /**
   * 翻页后等待新页面加载完成
   */
  PAGE_LOAD: 2000,
  
  // ==================== 智能延迟 ====================
  
  /**
   * 随机延迟最小值（毫秒）
   * 用于模拟人工操作节奏，避免被检测为机器人
   */
  RANDOM_MIN: 100,
  
  /**
   * 随机延迟最大值（毫秒）
   */
  RANDOM_MAX: 1000,
  
  // ==================== API相关延迟 ====================
  
  /**
   * API响应超时时间
   * 如果超过此时间未收到响应，认为请求失败
   */
  API_TIMEOUT: 5000,
  
  /**
   * API监听器等待时间
   * 点击翻页后等待API响应的最大时间
   */
  API_LISTEN_TIMEOUT: 3000,
  
  // ==================== 重试延迟 ====================
  
  /**
   * 重试基础延迟（毫秒）
   * 第一次重试的延迟时间
   */
  RETRY_BASE: 1000,
  
  /**
   * 重试延迟倍数
   * 使用指数退避策略：1s → 2s → 4s
   */
  RETRY_MULTIPLIER: 2,
  
  /**
   * 最大重试次数
   */
  MAX_RETRIES: 3,
} as const

/**
 * 开发环境延迟配置
 * 缩短延迟以加快开发和测试速度
 */
export const DEV_DELAYS = {
  ...DELAYS,
  QUICK_EDIT_CLICK: 200,
  FORM_FILL: 100,
  SUBMIT_SAVE: 500,
  PAGE_LOAD: 1000,
  API_TIMEOUT: 3000,
  API_LISTEN_TIMEOUT: 2000,
  RETRY_BASE: 500,
} as const

/**
 * 根据环境变量自动选择配置
 */
export const CURRENT_DELAYS = process.env.NODE_ENV === 'development' 
  ? DEV_DELAYS 
  : DELAYS

/**
 * 延迟工具函数
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 智能延迟：基础延迟 + 随机延迟
 * 用于模拟人工操作节奏
 */
export const smartDelay = async (baseDelay: number): Promise<void> => {
  const randomDelay = Math.random() * (CURRENT_DELAYS.RANDOM_MAX - CURRENT_DELAYS.RANDOM_MIN) + CURRENT_DELAYS.RANDOM_MIN
  await delay(baseDelay + randomDelay)
}

/**
 * 计算重试延迟时间
 * 使用指数退避策略
 */
export const getRetryDelay = (retryCount: number): number => {
  return CURRENT_DELAYS.RETRY_BASE * Math.pow(CURRENT_DELAYS.RETRY_MULTIPLIER, retryCount)
}

