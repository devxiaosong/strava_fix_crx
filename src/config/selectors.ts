/**
 * DOM 选择器配置文件
 * 集中管理所有 CSS Selector，方便 Strava 改版时统一修改
 * 
 * 注意：
 * - 使用 CSS Selector 而非 XPath（更简洁、性能更好）
 * - 每个选择器都有明确的注释说明
 * - 可以为关键选择器提供备用方案（fallback）
 */

/**
 * 活动列表相关选择器
 */
export const ACTIVITY_SELECTORS = {
  /**
   * 活动行容器
   * 每个活动在训练日志页面的一行
   */
  ROW: '.training-activity-row',
  
  /**
   * 快速编辑按钮
   * 点击后展开活动的内联编辑表单
   */
  QUICK_EDIT_BUTTON: '.training-activity-row .quick-edit',
  
  /**
   * 活动列表容器
   * 用于检测页面是否已加载
   */
  CONTAINER: '.activities-list, #training-activity-list',
  
  /**
   * 活动名称
   */
  NAME: '.training-activity-row .activity-name',
  
  /**
   * 活动日期（时间戳）
   */
  DATE: '.training-activity-row .activity-date',
} as const

/**
 * 表单字段选择器
 */
export const FORM_SELECTORS = {
  /**
   * 骑行类型下拉框
   * 选项: Ride, Race, Workout
   */
  RIDE_TYPE: 'select[name="workout_type_ride"]',
  
  /**
   * 跑步类型下拉框
   * 注意：Strava API 更新此字段可能不生效
   */
  RUN_TYPE: 'select[name="workout_type_run"]',
  
  /**
   * 自行车选择下拉框
   */
  BIKE: 'select[name="bike_id"]',
  
  /**
   * 跑鞋选择下拉框
   * 也用于装备选择
   */
  SHOES: 'select[name="athlete_gear_id"]',
  
  /**
   * 隐私设置下拉框
   * 选项: everyone, followers_only, only_me
   */
  VISIBILITY: 'select[name="visibility"]',
  
  /**
   * 通勤复选框
   */
  COMMUTE: 'input[name="commute"]',
  
  /**
   * 室内训练复选框
   */
  TRAINER: 'input[name="trainer"]',
  
  /**
   * 跑步机复选框
   */
  TREADMILL: 'input[name="trainer"]',
} as const

/**
 * 表单操作按钮选择器
 */
export const BUTTON_SELECTORS = {
  /**
   * 保存按钮（提交表单）
   */
  SUBMIT: '.training-activity-row button[type="submit"]',
  
  /**
   * 取消按钮
   */
  CANCEL: '.training-activity-row button.cancel, .training-activity-row .cancel-button',
  
  /**
   * 下一页按钮
   */
  NEXT_PAGE: 'button.next_page',
  
  /**
   * 上一页按钮
   */
  PREV_PAGE: 'button.previous_page',
  
  /**
   * 第一页按钮（如果存在）
   */
  FIRST_PAGE: 'button.first_page, .pagination .first',
  
  /**
   * 最后一页按钮
   */
  LAST_PAGE: 'button.last_page, .pagination .last',
} as const

/**
 * 筛选面板选择器
 */
export const FILTER_SELECTORS = {
  /**
   * 筛选面板容器
   */
  PANEL: '.search .panel, .filters-panel',
  
  /**
   * 运动类型筛选
   */
  SPORT_TYPE: '#sport_type',
  
  /**
   * 骑行类型筛选（用于读取选项）
   */
  WORKOUT_TYPE_RIDE: '#workout_type_ride',
  
  /**
   * 跑步类型筛选（用于读取选项）
   */
  WORKOUT_TYPE_RUN: '#workout_type_run',
  
  /**
   * 自行车筛选（用于读取选项）
   */
  GEAR_BIKE: '#gear_bike',
  
  /**
   * 跑鞋筛选（用于读取选项）
   */
  GEAR_SHOE: '#gear_shoe',
} as const

/**
 * 导航和用户信息选择器
 */
export const NAV_SELECTORS = {
  /**
   * 获取 Athlete ID 的链接
   * 从 href 中提取: /athletes/{athleteId}/training/log
   */
  ATHLETE_ID_LINK: '#container-nav li[data-log-category="training"] a, nav a[href*="/training/log"]',
  
  /**
   * 导航容器
   */
  CONTAINER: '#container-nav, nav.main-nav',
  
  /**
   * 训练日志链接
   */
  TRAINING_LOG: 'a[href*="/training/log"]',
  
  /**
   * 用户头像/菜单（检测登录状态）
   */
  USER_MENU: '.user-menu, .athlete-avatar',
} as const

/**
 * 页面状态检测选择器
 */
export const STATE_SELECTORS = {
  /**
   * 当前页码高亮元素
   * 用于检测翻页是否完成
   */
  CURRENT_PAGE: '.pagination .active, .pagination .current',
  
  /**
   * 页码按钮容器
   */
  PAGINATION: '.pagination',
  
  /**
   * 加载中指示器
   */
  LOADING: '.loading-indicator, .spinner, [class*="loading"]',
  
  /**
   * 空状态提示
   */
  EMPTY_STATE: '.empty-state, .no-activities',
  
  /**
   * 页面内容主容器
   */
  MAIN_CONTENT: '#content, main, .main-content',
} as const

/**
 * 排序控件选择器
 */
export const SORT_SELECTORS = {
  /**
   * 排序下拉框
   */
  SORT_SELECT: 'select[name="sort"], .sort-control select',
  
  /**
   * 排序按钮组
   */
  SORT_BUTTONS: '.sort-buttons, .sorting-controls',
  
  /**
   * 日期排序按钮
   */
  SORT_BY_DATE: 'button[data-sort="date"], .sort-date',
  
  /**
   * 活动表头（可能包含排序控制）
   */
  TABLE_HEADER: '.activities-table thead, .activity-list-header',
} as const

/**
 * 所有选择器的统一导出
 */
export const SELECTORS = {
  ACTIVITY: ACTIVITY_SELECTORS,
  FORM: FORM_SELECTORS,
  BUTTON: BUTTON_SELECTORS,
  FILTER: FILTER_SELECTORS,
  NAV: NAV_SELECTORS,
  STATE: STATE_SELECTORS,
  SORT: SORT_SELECTORS,
} as const

/**
 * 备用选择器方案
 * 当主选择器失效时使用（降级策略）
 */
export const FALLBACK_SELECTORS = {
  /**
   * 快速编辑按钮的多个备选
   */
  QUICK_EDIT_BUTTON: [
    '.training-activity-row .quick-edit',
    '.training-activity-row button[data-action="quick-edit"]',
    '.training-activity-row .edit-button',
    '.activity-row .quick-edit',
  ],
  
  /**
   * 提交按钮的多个备选
   */
  SUBMIT_BUTTON: [
    '.training-activity-row button[type="submit"]',
    '.training-activity-row .save-button',
    '.training-activity-row button[data-action="save"]',
    '.activity-row button[type="submit"]',
  ],
  
  /**
   * 下一页按钮的多个备选
   */
  NEXT_PAGE: [
    'button.next_page',
    '.pagination .next',
    'button[aria-label="Next page"]',
    '.pagination a[rel="next"]',
  ],
  
  /**
   * 上一页按钮的多个备选
   */
  PREV_PAGE: [
    'button.previous_page',
    '.pagination .prev',
    'button[aria-label="Previous page"]',
    '.pagination a[rel="prev"]',
  ],
  
  /**
   * 当前页码的多个备选
   */
  CURRENT_PAGE: [
    '.pagination .active',
    '.pagination .current',
    '.pagination .selected',
    '.pagination [aria-current="page"]',
  ],
} as const

/**
 * 工具函数：尝试多个选择器，返回第一个匹配的元素
 * 
 * @param selectors - 选择器数组，按优先级排序
 * @returns 第一个匹配的元素，如果都不匹配则返回 null
 * 
 * @example
 * const button = querySelector(FALLBACK_SELECTORS.QUICK_EDIT_BUTTON)
 */
export const querySelector = (selectors: readonly string[]): Element | null => {
  for (const selector of selectors) {
    try {
      const element = document.querySelector(selector)
      if (element) {
        console.log(`[Selector] 匹配成功: ${selector}`)
        return element
      }
    } catch (error) {
      console.warn(`[Selector] 选择器无效: ${selector}`, error)
    }
  }
  console.warn(`[Selector] 所有选择器都不匹配:`, selectors)
  return null
}

/**
 * 工具函数：尝试多个选择器，返回所有匹配的元素
 * 
 * @param selectors - 选择器数组，按优先级排序
 * @returns 第一个有结果的选择器匹配的所有元素，如果都不匹配则返回空 NodeList
 * 
 * @example
 * const buttons = querySelectorAll(FALLBACK_SELECTORS.SUBMIT_BUTTON)
 */
export const querySelectorAll = (selectors: readonly string[]): NodeListOf<Element> | null => {
  for (const selector of selectors) {
    try {
      const elements = document.querySelectorAll(selector)
      if (elements.length > 0) {
        console.log(`[Selector] 匹配成功 (${elements.length}个): ${selector}`)
        return elements
      }
    } catch (error) {
      console.warn(`[Selector] 选择器无效: ${selector}`, error)
    }
  }
  console.warn(`[Selector] 所有选择器都不匹配:`, selectors)
  return null
}

/**
 * 验证选择器是否有效
 * 可以在开发时用于测试选择器
 * 
 * @param selector - 要验证的选择器
 * @returns 选择器是否有效且有匹配元素
 */
export const validateSelector = (selector: string): boolean => {
  try {
    const elements = document.querySelectorAll(selector)
    const isValid = elements.length > 0
    console.log(`[Selector验证] ${selector}: ${isValid ? '✅ 有效' : '❌ 无匹配'}`)
    return isValid
  } catch (error) {
    console.error(`[Selector验证] ${selector}: ❌ 语法错误`, error)
    return false
  }
}

/**
 * 批量验证选择器组
 * 用于开发和调试
 * 
 * @param selectorGroup - 选择器组对象
 * @returns 验证结果摘要
 */
export const validateSelectorGroup = (selectorGroup: Record<string, string>): {
  total: number
  valid: number
  invalid: string[]
} => {
  const results = {
    total: 0,
    valid: 0,
    invalid: [] as string[]
  }
  
  for (const [key, selector] of Object.entries(selectorGroup)) {
    results.total++
    if (validateSelector(selector)) {
      results.valid++
    } else {
      results.invalid.push(`${key}: ${selector}`)
    }
  }
  
  console.log(`[选择器组验证] ${results.valid}/${results.total} 有效`)
  if (results.invalid.length > 0) {
    console.warn('[无效选择器]:', results.invalid)
  }
  
  return results
}

