/**
 * DOM 选择器配置文件
 * 集中管理所有 XPath Selector，方便 Strava 改版时统一修改
 * 
 * 注意：
 * - 使用 XPath（功能更强大，支持复杂查询）
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
  ROW: "//*[contains(@class, 'training-activity-row')]",
  
  /**
   * 快速编辑按钮
   * 点击后展开活动的内联编辑表单
   */
  QUICK_EDIT_BUTTON: "//*[contains(@class, 'training-activity-row')]//*[contains(@class, 'quick-edit')]",
  
  /**
   * 活动列表容器
   * 用于检测页面是否已加载
   */
  CONTAINER: "//*[contains(@class, 'activities-list') or @id='training-activity-list']",
  
  /**
   * 活动名称
   */
  NAME: "//*[contains(@class, 'training-activity-row')]//*[contains(@class, 'activity-name')]",
  
  /**
   * 活动日期（时间戳）
   */
  DATE: "//*[contains(@class, 'training-activity-row')]//*[contains(@class, 'activity-date')]",
} as const

/**
 * 表单字段选择器
 */
export const FORM_SELECTORS = {
  /**
   * 骑行类型下拉框（在活动行上下文中）
   * 选项: Ride, Race, Workout
   */
  RIDE_TYPE: "//div[contains(@class, 'training-activity-row')]//select[@name='workout_type_ride']",
  
  /**
   * 跑步类型下拉框（在活动行上下文中）
   * 注意：Strava API 更新此字段可能不生效
   */
  RUN_TYPE: "//div[contains(@class, 'training-activity-row')]//select[@name='workout_type_run']",
  
  /**
   * 自行车选择下拉框（在活动行上下文中）
   */
  BIKE: "//div[contains(@class, 'training-activity-row')]//select[@name='bike_id']",
  
  /**
   * 跑鞋选择下拉框（在活动行上下文中）
   * 也用于装备选择
   */
  SHOES: "//div[contains(@class, 'training-activity-row')]//select[@name='athlete_gear_id']",
  
  /**
   * 隐私设置下拉框（在活动行上下文中）
   * 选项: everyone, followers_only, only_me
   */
  VISIBILITY: "//div[contains(@class, 'training-activity-row')]//select[@name='visibility']",
  
  /**
   * 通勤复选框
   */
  COMMUTE: "//input[@name='commute']",
  
  /**
   * 室内训练复选框
   */
  TRAINER: "//input[@name='trainer']",
  
  /**
   * 跑步机复选框
   */
  TREADMILL: "//input[@name='trainer']",
} as const

/**
 * 表单操作按钮选择器
 */
export const BUTTON_SELECTORS = {
  /**
   * 保存按钮（提交表单）
   */
  SUBMIT: "//*[contains(@class, 'training-activity-row')]//button[@type='submit']",
  
  /**
   * 取消按钮
   */
  CANCEL: "//*[contains(@class, 'training-activity-row')]//button[contains(@class, 'cancel') or contains(@class, 'cancel-button')]",
  
  /**
   * 下一页按钮
   */
  NEXT_PAGE: "//button[contains(@class, 'next_page')]",
  
  /**
   * 上一页按钮
   */
  PREV_PAGE: "//button[contains(@class, 'previous_page')]",
  
  /**
   * 第一页按钮（如果存在）
   */
  FIRST_PAGE: "//button[contains(@class, 'first_page')] | //*[contains(@class, 'pagination')]//*[contains(@class, 'first')]",
  
  /**
   * 最后一页按钮
   */
  LAST_PAGE: "//button[contains(@class, 'last_page')] | //*[contains(@class, 'pagination')]//*[contains(@class, 'last')]",
} as const

/**
 * 筛选面板选择器
 */
export const FILTER_SELECTORS = {
  /**
   * 筛选面板容器
   */
  PANEL: "//*[contains(@class, 'search')]//*[contains(@class, 'panel')] | //*[contains(@class, 'filters-panel')]",
  
  /**
   * 运动类型筛选
   */
  SPORT_TYPE: "//*[@id='sport_type']",
  
  /**
   * 骑行类型筛选（用于读取选项）
   */
  WORKOUT_TYPE_RIDE: "//*[@id='workout_type_ride']",
  
  /**
   * 跑步类型筛选（用于读取选项）
   */
  WORKOUT_TYPE_RUN: "//*[@id='workout_type_run']",
  
  /**
   * 自行车筛选（用于读取选项）
   */
  GEAR_BIKE: "//*[@id='gear_bike']",
  
  /**
   * 跑鞋筛选（用于读取选项）
   */
  GEAR_SHOE: "//*[@id='gear_shoe']",
} as const

/**
 * 导航和用户信息选择器
 */
export const NAV_SELECTORS = {
  /**
   * 获取 Athlete ID 的链接
   * 从 href 中提取: /athletes/{athleteId}/training/log
   */
  ATHLETE_ID_LINK: "//*[@id='container-nav']//li[@data-log-category='training']//a | //nav//a[contains(@href, '/training/log')]",
  
  /**
   * 导航容器
   */
  CONTAINER: "//*[@id='container-nav'] | //nav[contains(@class, 'main-nav')]",
  
  /**
   * 训练日志链接
   */
  TRAINING_LOG: "//a[contains(@href, '/training/log')]",
  
  /**
   * 用户头像/菜单（检测登录状态）
   */
  USER_MENU: "//*[contains(@class, 'user-menu') or contains(@class, 'athlete-avatar')]",
} as const

/**
 * 页面状态检测选择器
 */
export const STATE_SELECTORS = {
  /**
   * 当前页码高亮元素
   * 用于检测翻页是否完成
   */
  CURRENT_PAGE: "//*[contains(@class, 'pagination')]//*[contains(@class, 'active') or contains(@class, 'current')]",
  
  /**
   * 页码按钮容器
   */
  PAGINATION: "//*[contains(@class, 'pagination')]",
  
  /**
   * 加载中指示器
   */
  LOADING: "//*[contains(@class, 'loading-indicator') or contains(@class, 'spinner') or contains(@class, 'loading')]",
  
  /**
   * 空状态提示
   */
  EMPTY_STATE: "//*[contains(@class, 'empty-state') or contains(@class, 'no-activities')]",
  
  /**
   * 页面内容主容器
   */
  MAIN_CONTENT: "//*[@id='content'] | //main | //*[contains(@class, 'main-content')]",
} as const

/**
 * 排序控件选择器
 */
export const SORT_SELECTORS = {
  /**
   * 排序下拉框
   */
  SORT_SELECT: "//select[@name='sort'] | //*[contains(@class, 'sort-control')]//select",
  
  /**
   * 排序按钮组
   */
  SORT_BUTTONS: "//*[contains(@class, 'sort-buttons') or contains(@class, 'sorting-controls')]",
  
  /**
   * 日期排序按钮
   */
  SORT_BY_DATE: "//button[@data-sort='date'] | //*[contains(@class, 'sort-date')]",
  
  /**
   * 活动表头（可能包含排序控制）
   */
  TABLE_HEADER: "//*[contains(@class, 'activities-table')]//thead | //*[contains(@class, 'activity-list-header')]",
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

