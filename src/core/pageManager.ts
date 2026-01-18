/**
 * 页面状态管理器
 * 负责页面导航、状态检查、列表排序等操作
 */

import { SELECTORS } from '~/config/selectors';
import { CURRENT_DELAYS, delay } from '~/config/delays';
import {
  findElement,
  findAllElements,
  clickElement,
} from '~/utils/domHelper';
import {
  isPageLoaded,
  isOnTrainingLogPage,
  isElementInteractive,
} from '~/utils/validator';

/**
 * 验证活动列表是否已加载就绪
 * @returns boolean
 */
export function isActivityListReady(): boolean {
  const activityRows = findAllElements(SELECTORS.ACTIVITY.ROW);
  return activityRows.length > 0;
}

/**
 * 等待页面加载完成
 * 分为两个阶段：
 * 1. 等待页面基础加载完成（document.readyState === 'complete'）
 * 2. 等待活动列表加载完成（最多10秒）
 *
 * @param timeout 页面基础加载超时时间（毫秒）
 * @returns Promise<boolean> 是否加载成功
 */
export async function waitForPageLoad(timeout: number = CURRENT_DELAYS.PAGE_LOAD): Promise<boolean> {
  const startTime = Date.now();

  // 阶段1: 等待页面基础加载完成
  while (Date.now() - startTime < timeout) {
    if (isPageLoaded()) {
      console.log('[PageManager] Page loaded, now waiting for activity list...');
      break;
    }
    await delay(100);
  }

  if (!isPageLoaded()) {
    console.warn('[PageManager] Page load timeout');
    return false;
  }

  // 阶段2: 等待活动列表加载完成（最多10秒）
  const LIST_LOAD_TIMEOUT = 10000;
  const listStartTime = Date.now();

  while (Date.now() - listStartTime < LIST_LOAD_TIMEOUT) {
    if (isActivityListReady()) {
      // 额外等待一段时间，确保DOM完全渲染并稳定
      await delay(500);
      console.log('[PageManager] Activity list loaded successfully');
      return true;
    }
    await delay(100);
  }

  console.warn('[PageManager] Activity list load timeout after 10 seconds');
  return false;
}

/**
 * 获取当前页码
 * @returns 当前页码，默认为1
 */
export function getCurrentPage(): number {
  const currentPageElement = findElement(SELECTORS.PAGINATION.PAGE_INDEX);

  if (!currentPageElement) {
    console.warn('[PageManager] Cannot find current page indicator, assuming page 1');
    return 1;
  }

  const pageText = currentPageElement.textContent?.trim();

  if (!pageText) {
    return 1;
  }

  // 处理范围格式："1-20 of 41", "21-40 of 41", "41-41 of 41"
  const rangeMatch = pageText.match(/^(\d+)-(\d+)\s+of\s+(\d+)$/);
  if (rangeMatch) {
    const startItem = parseInt(rangeMatch[1], 10);
    const endItem = parseInt(rangeMatch[2], 10);
    const totalItems = parseInt(rangeMatch[3], 10);

    console.log(`[PageManager] Detected range format: ${pageText} (start: ${startItem}, end: ${endItem}, total: ${totalItems})`);

    // 根据起始位置计算页码
    // 例如：startItem = 1 → 第1页, startItem = 21 → 第2页, startItem = 41 → 第3页
    const pageNumber = Math.floor((startItem - 1) / SELECTORS.PAGINATION.ITEMS_PER_PAGE) + 1;

    console.log(`[PageManager] Calculated page number: ${pageNumber} (assuming ${SELECTORS.PAGINATION.ITEMS_PER_PAGE} items per page)`);
    return pageNumber;
  }

  // 处理简单数字格式："1", "2", "3"
  const pageNumber = parseInt(pageText, 10);

  if (isNaN(pageNumber)) {
    console.warn(`[PageManager] Cannot parse page number from: "${pageText}", assuming page 1`);
    return 1;
  }

  return pageNumber;
}

/**
 * 检查是否有下一页
 * @returns boolean
 */
export function hasNextPage(): boolean {
  const nextButton = findElement<HTMLButtonElement>(SELECTORS.PAGINATION.NEXT_PAGE);

  if (!nextButton) {
    console.log('[PageManager] No next page button found');
    return false;
  }

  // 检查按钮是否可用（未禁用）
  return isElementInteractive(nextButton);
}

/**
 * 跳转到下一页
 * @returns Promise<boolean> 是否成功跳转
 */
export async function goToNextPage(): Promise<boolean> {
  console.log('[PageManager] Attempting to go to next page');

  const currentPage = getCurrentPage();
  const nextButton = findElement<HTMLButtonElement>(SELECTORS.PAGINATION.NEXT_PAGE);

  if (!nextButton) {
    console.warn('[PageManager] Next page button not found');
    return false;
  }

  if (!isElementInteractive(nextButton)) {
    console.warn('[PageManager] Next page button is not interactive');
    return false;
  }

  // 点击下一页按钮
  const clicked = await clickElement(nextButton, CURRENT_DELAYS.PAGE_LOAD);

  if (!clicked) {
    console.error('[PageManager] Failed to click next page button');
    return false;
  }

  // 等待页面加载
  await waitForPageLoad();

  // 验证页码是否增加
  const newPage = getCurrentPage();
  const success = newPage > currentPage;

  if (success) {
    console.log(`[PageManager] Successfully navigated to page ${newPage}`);
  } else {
    console.warn(`[PageManager] Page number did not change (still ${currentPage})`);
  }

  return success;
}

/**
 * 检查是否在第一页
 * @returns boolean
 */
export function isOnFirstPage(): boolean {
  const currentPage = getCurrentPage();
  return currentPage === 1;
}

/**
 * 回到第一页
 * @returns Promise<boolean> 是否成功回到第一页
 */
export async function goToFirstPage(): Promise<boolean> {

  // 使用封装的点击排序按钮函数，不管是不是第一页，都点击一次排序
  const clicked = await clickSortButton();

  if (!clicked) {
    return false;
  }

  return true;
}

/**
 * 确保页面回到第一页（包含重试逻辑）
 * @param maxRetries 最大重试次数
 * @returns Promise<boolean>
 */
export async function ensureFirstPage(maxRetries: number = 3): Promise<boolean> {
  for (let i = 0; i < maxRetries; i++) {
    const success = await goToFirstPage();

    if (success) {
      return true;
    }

    console.warn(`[PageManager] Failed to reach first page, retry ${i + 1}/${maxRetries}`);
    await delay(1000);
  }

  return false;
}

/**
 * 点击排序按钮并等待页面加载
 * @returns Promise<boolean> 是否点击成功
 */
async function clickSortButton(): Promise<boolean> {
  const sortButton = findElement<HTMLButtonElement>(SELECTORS.SORT.SORT_BUTTON);

  if (!sortButton) {
    console.error('[PageManager] Date sort button not found');
    return false;
  }

  if (!isElementInteractive(sortButton)) {
    console.error('[PageManager] Date sort button is not interactive');
    return false;
  }

  // 点击排序按钮
  const clicked = await clickElement(sortButton, CURRENT_DELAYS.PAGE_LOAD);

  if (!clicked) {
    console.error('[PageManager] Failed to click sort button');
    return false;
  }

  // 等待页面重新加载
  await waitForPageLoad();

  return true;
}

/**
 * 检查列表是否按时间降序排序
 * @returns boolean
 */
export function isTimeSortedDescending(): boolean {
  // 检查排序按钮的状态或排序指示器
  const sortButton = findElement(SELECTORS.SORT.SORT_BY_DATE);

  if (!sortButton) {
    console.warn('[PageManager] Cannot find sort by date button');
    return false;
  }

  // 检查是否有降序排序的指示（通常是特定的class或aria属性）
  const isDescending =
    sortButton.classList.contains(SELECTORS.SORT.SORT_CLASSES.DESC);

  return isDescending;
}

/**
 * 设置列表按时间降序排序
 * @returns Promise<boolean>
 */
export async function sortByTimeDescending(): Promise<boolean> {
  console.log('[PageManager] Attempting to sort by time (descending)');

  // 如果已经是降序排序，直接返回
  if (isTimeSortedDescending()) {
    console.log('[PageManager] Already sorted by time (descending)');
    return true;
  }

  // 使用封装的点击排序按钮函数
  const clicked = await clickSortButton();

  if (!clicked) {
    return false;
  }

  // 验证排序是否成功
  const success = isTimeSortedDescending();

  if (success) {
    console.log('[PageManager] Successfully sorted by time (descending)');
  } else {
    console.warn('[PageManager] Sorting may have failed, or requires another click');
    // 某些实现需要点击两次才能切换到降序
    if (!isTimeSortedDescending()) {
      await clickSortButton();
    }
  }

  return isTimeSortedDescending();
}

/**
 * 确保列表按时间降序排序（包含重试逻辑）
 * @param maxRetries 最大重试次数
 * @returns Promise<boolean>
 */
export async function ensureTimeSortedList(maxRetries: number = 2): Promise<boolean> {
  for (let i = 0; i < maxRetries; i++) {
    const success = await sortByTimeDescending();

    if (success) {
      return true;
    }

    console.warn(`[PageManager] Failed to sort list, retry ${i + 1}/${maxRetries}`);
    await delay(1000);
  }

  return false;
}

/**
 * 获取当前页面的所有活动行元素
 * @returns HTMLElement[]
 */
export function getActivityRowElements(): HTMLElement[] {
  return findAllElements(SELECTORS.ACTIVITY.ROW);
}

/**
 * 从活动行元素中提取活动ID
 * @param activityRow 活动行元素
 * @returns string | null
 */
export function extractActivityId(activityRow: HTMLElement): string | null {
  // 尝试从 data 属性获取
  const idFromData = activityRow.getAttribute(SELECTORS.ACTIVITY.DATA_ACTIVITY_ID);
  if (idFromData) {
    console.log('[[ExecuteEngine-Activity]] find by idFromData');
    return idFromData;
  }

  // 尝试从其他可能的属性或子元素中提取
  // 这里可能需要根据实际的Strava页面结构调整
  const idFromHref = activityRow.querySelector(SELECTORS.ACTIVITY.ACTIVITY_LINK);
  if (idFromHref) {
    console.log('[[ExecuteEngine-Activity]] find by idFromHref');
    const href = idFromHref.getAttribute('href');
    const match = href?.match(/\/activities\/(\d+)/);
    if (match) {
      return match[1];
    }
  }

  console.warn('[PageManager] Cannot extract activity ID from row', activityRow);
  return null;
}

/**
 * 验证页面环境是否准备就绪
 * @returns { ready: boolean; errors: string[] }
 */
export function validatePageEnvironment(): { ready: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!isOnTrainingLogPage()) {
    errors.push('Not on training log page');
  }

  if (!isPageLoaded()) {
    console.log('song Page not loaded')
    errors.push('Page not loaded');
  }

  const activityRows = getActivityRowElements();
  if (activityRows.length === 0) {
    errors.push('No activity list found on page');
  }

  return {
    ready: errors.length === 0,
    errors,
  };
}

/**
 * 完整的页面准备流程（回到第一页 + 时间排序）
 * @returns Promise<{ success: boolean; errors: string[] }>
 */
export async function preparePageForExecution(): Promise<{ success: boolean; errors: string[] }> {
  console.log('[PageManager] Starting page preparation...');

  const errors: string[] = [];

  // 1. 验证基础环境
  const envValidation = validatePageEnvironment();
  if (!envValidation.ready) {
    errors.push(...envValidation.errors);
    return { success: false, errors };
  }

  // 2. 确保回到第一页
  const firstPageSuccess = await ensureFirstPage();
  if (!firstPageSuccess) {
    errors.push('Unable to return to first page');
    return { success: false, errors };
  }

  // 3. 确保列表按时间排序
  const sortSuccess = await ensureTimeSortedList();
  if (!sortSuccess) {
    errors.push('Unable to sort list by time');
    return { success: false, errors };
  }

  console.log('[PageManager] Page preparation completed successfully');
  return { success: true, errors: [] };
}

