/**
 * DOM 选择器配置文件
 * 集中管理所有 XPath Selector，方便 Strava 改版时统一修改
 * 
 * 注意：
 * - 使用 XPath（功能更强大，支持复杂查询）
 * - 每个选择器都有明确的注释说明
 * - 按业务功能组织，相关选择器集中在一起
 */

/**
 * 活动列表相关选择器
 * 用于获取和识别页面上的活动
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
   * 注意：使用相对路径 .// 以便在特定 activityRow 上下文中查找
   */
  QUICK_EDIT_BUTTON: ".//*[contains(@class, 'quick-edit')]",
  
  /**
   * 活动链接（包含活动ID）
   * 用于从 href 中提取活动ID
   */
  ACTIVITY_LINK: "a[href*=\"/activities/\"]",
  
  /**
   * 活动ID的 data 属性名
   */
  DATA_ACTIVITY_ID: "data-activity-id",
} as const

/**
 * 活动编辑相关选择器
 * 包含表单字段和提交按钮
 */
export const EDIT_SELECTORS = {
  /**
   * 骑行类型下拉框
   * 选项: Ride, Race, Workout
   * 注意：使用相对路径 .// 以便在特定 activityRow 上下文中查找
   * 实际字段名是 tag_type_ride 而不是 workout_type_ride
   */
  RIDE_TYPE: ".//select[@name='tag_type_ride']",
  
  /**
   * 自行车选择下拉框
   * 注意：使用相对路径 .// 以便在特定 activityRow 上下文中查找
   */
  BIKE: ".//select[@name='bike_id']",
  
  /**
   * 跑鞋选择下拉框
   * 也用于装备选择
   * 注意：使用相对路径 .// 以便在特定 activityRow 上下文中查找
   */
  SHOES: ".//select[@name='athlete_gear_id']",
  
  /**
   * 隐私设置下拉框
   * 选项: everyone, followers_only, only_me
   * 注意：使用相对路径 .// 以便在特定 activityRow 上下文中查找
   */
  VISIBILITY: ".//select[@name='visibility']",
  
  /**
   * 保存按钮（提交表单）
   * 注意：使用相对路径 .// 以便在特定 activityRow 上下文中查找
   */
  SUBMIT: ".//button[@type='submit']",
} as const

/**
 * 分页导航相关选择器
 * 包含所有翻页操作和状态检测
 */
export const PAGINATION_SELECTORS = {
  /**
   * 下一页按钮
   */
  NEXT_PAGE: "//button[contains(@class, 'next_page')]",
  
  /**
   * 上一页按钮
   */
  PREV_PAGE: "//button[contains(@class, 'previous_page')]",
  
  /**
   * 当前页码高亮元素
   * 用于检测翻页是否完成
   */
  PAGE_INDEX: "//*[contains(@class, 'pagination')]//span[contains(@class, 'pages')]",
  
  /**
   * Strava 每页默认显示的活动数量
   */
  ITEMS_PER_PAGE: 20,
} as const

/**
 * 排序控制相关选择器
 * 包含排序按钮和状态检测
 */
export const SORT_SELECTORS = {
  /**
   * 日期排序按钮
   */
  SORT_BY_DATE: "//div[@class='search-results-container']//th[contains(@class,'col-date')]",
  SORT_BUTTON: "//div[@class='search-results-container']//th[contains(@class,'col-date')]/button",
  
  /**
   * 排序状态 CSS 类名
   */
  SORT_CLASSES: {
    DESC: 'desc'
  }

} as const

/**
 * 页面定位相关选择器
 * 用于插件 UI 挂载和信息获取
 */
export const PAGE_SELECTORS = {
  /**
   * 筛选面板容器
   * 用于定位插件按钮的挂载位置
   */
  FILTER_PANEL: "//*[contains(@class, 'search')]//*[contains(@class, 'panel')] | //*[contains(@class, 'filters-panel')]",
  
  /**
   * 获取 Athlete ID 的链接
   * 从 href 中提取: /athletes/{athleteId}/training/log
   */
  ATHLETE_ID_LINK: "//*[@id='container-nav']//li[@data-log-category='training']//a | //nav//a[contains(@href, '/training/log')]",
} as const

/**
 * 所有选择器的统一导出
 */
export const SELECTORS = {
  ACTIVITY: ACTIVITY_SELECTORS,
  EDIT: EDIT_SELECTORS,
  PAGINATION: PAGINATION_SELECTORS,
  SORT: SORT_SELECTORS,
  PAGE: PAGE_SELECTORS,
} as const

