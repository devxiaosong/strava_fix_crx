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
  elementExists,
} from '~/utils/domHelper';
import {
  isPageLoaded,
  isOnTrainingLogPage,
  isElementInteractive,
} from '~/utils/validator';

/**
 * 等待页面加载完成
 * @param timeout 超时时间（毫秒）
 * @returns Promise<boolean> 是否加载成功
 */
export async function waitForPageLoad(timeout: number = CURRENT_DELAYS.PAGE_LOAD): Promise<boolean> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    if (isPageLoaded()) {
      // 额外等待一段时间，确保DOM完全渲染
      await delay(500);
      return true;
    }
    await delay(100);
  }

  console.warn('[PageManager] Page load timeout');
  return false;
}

/**
 * 等待元素出现
 * @param selector CSS选择器
 * @param timeout 超时时间（毫秒）
 * @returns Promise<HTMLElement | null>
 */
export async function waitForElement(
  selector: string,
  timeout: number = 5000
): Promise<HTMLElement | null> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const element = findElement(selector);
    if (element) {
      return element;
    }
    await delay(100);
  }

  console.warn('[PageManager] Element not found:', selector);
  return null;
}

/**
 * 获取当前页码
 * @returns 当前页码，默认为1
 */
export function getCurrentPage(): number {
  const currentPageElement = findElement(SELECTORS.CURRENT_PAGE_INDICATOR);
  
  if (!currentPageElement) {
    console.warn('[PageManager] Cannot find current page indicator, assuming page 1');
    return 1;
  }

  const pageText = currentPageElement.textContent?.trim();
  const pageNumber = pageText ? parseInt(pageText, 10) : 1;

  return isNaN(pageNumber) ? 1 : pageNumber;
}

/**
 * 获取总页数
 * @returns 总页数，如果无法确定则返回null
 */
export function getTotalPages(): number | null {
  // 尝试从分页元素中提取总页数
  const lastPageButton = findElement(SELECTORS.LAST_PAGE_BUTTON);
  
  if (!lastPageButton) {
    console.warn('[PageManager] Cannot find last page button');
    return null;
  }

  const pageText = lastPageButton.textContent?.trim();
  const pageNumber = pageText ? parseInt(pageText, 10) : null;

  return pageNumber && !isNaN(pageNumber) ? pageNumber : null;
}

/**
 * 检查是否有下一页
 * @returns boolean
 */
export function hasNextPage(): boolean {
  const nextButton = findElement<HTMLButtonElement>(SELECTORS.NEXT_PAGE_BUTTON);
  
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
  const nextButton = findElement<HTMLButtonElement>(SELECTORS.NEXT_PAGE_BUTTON);

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
  console.log('[PageManager] Attempting to go to first page');

  // 如果已经在第一页，直接返回成功
  if (isOnFirstPage()) {
    console.log('[PageManager] Already on first page');
    return true;
  }

  const firstPageButton = findElement<HTMLButtonElement>(SELECTORS.FIRST_PAGE_BUTTON);

  if (!firstPageButton) {
    console.warn('[PageManager] First page button not found, trying previous page repeatedly');
    return await goToFirstPageByPrevious();
  }

  if (!isElementInteractive(firstPageButton)) {
    console.warn('[PageManager] First page button is not interactive');
    return false;
  }

  // 点击第一页按钮
  const clicked = await clickElement(firstPageButton, CURRENT_DELAYS.PAGE_LOAD);
  
  if (!clicked) {
    console.error('[PageManager] Failed to click first page button');
    return false;
  }

  // 等待页面加载
  await waitForPageLoad();

  // 验证是否在第一页
  const success = isOnFirstPage();
  
  if (success) {
    console.log('[PageManager] Successfully navigated to first page');
  } else {
    console.warn('[PageManager] Failed to reach first page');
  }

  return success;
}

/**
 * 通过反复点击"上一页"按钮回到第一页（备用方法）
 * @param maxAttempts 最大尝试次数，防止无限循环
 * @returns Promise<boolean>
 */
async function goToFirstPageByPrevious(maxAttempts: number = 20): Promise<boolean> {
  let attempts = 0;

  while (!isOnFirstPage() && attempts < maxAttempts) {
    const prevButton = findElement<HTMLButtonElement>(SELECTORS.PREVIOUS_PAGE_BUTTON);

    if (!prevButton || !isElementInteractive(prevButton)) {
      console.warn('[PageManager] Cannot go back further');
      break;
    }

    const clicked = await clickElement(prevButton, CURRENT_DELAYS.PAGE_LOAD);
    if (!clicked) {
      console.error('[PageManager] Failed to click previous page button');
      return false;
    }

    await waitForPageLoad();
    attempts++;
  }

  return isOnFirstPage();
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
 * 检查列表是否按时间降序排序
 * @returns boolean
 */
export function isTimeSortedDescending(): boolean {
  // 检查排序按钮的状态或排序指示器
  const sortButton = findElement(SELECTORS.SORT_BY_DATE_BUTTON);
  
  if (!sortButton) {
    console.warn('[PageManager] Cannot find sort by date button');
    return false;
  }

  // 检查是否有降序排序的指示（通常是特定的class或aria属性）
  const isDescending =
    sortButton.classList.contains('desc') ||
    sortButton.classList.contains('descending') ||
    sortButton.getAttribute('aria-sort') === 'descending';

  return isDescending;
}

/**
 * 设置列表按时间降序排序
 * @returns Promise<boolean>
 */
export async function sortByTimeDescending(): Promise<boolean> {
  console.log('[PageManager] Attempting to sort by time (descending)');

  const sortButton = findElement<HTMLButtonElement>(SELECTORS.SORT_BY_DATE_BUTTON);

  if (!sortButton) {
    console.error('[PageManager] Sort by date button not found');
    return false;
  }

  // 如果已经是降序排序，直接返回
  if (isTimeSortedDescending()) {
    console.log('[PageManager] Already sorted by time (descending)');
    return true;
  }

  // 点击排序按钮
  const clicked = await clickElement(sortButton, CURRENT_DELAYS.PAGE_LOAD);
  
  if (!clicked) {
    console.error('[PageManager] Failed to click sort button');
    return false;
  }

  // 等待页面重新加载
  await waitForPageLoad();

  // 验证排序是否成功
  const success = isTimeSortedDescending();
  
  if (success) {
    console.log('[PageManager] Successfully sorted by time (descending)');
  } else {
    console.warn('[PageManager] Sorting may have failed, or requires another click');
    // 某些实现需要点击两次才能切换到降序
    if (!isTimeSortedDescending()) {
      await clickElement(sortButton, CURRENT_DELAYS.PAGE_LOAD);
      await waitForPageLoad();
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
 * @returns NodeListOf<HTMLElement>
 */
export function getActivityRowElements(): NodeListOf<HTMLElement> {
  return findAllElements(SELECTORS.ACTIVITY_ROW);
}

/**
 * 从活动行元素中提取活动ID
 * @param activityRow 活动行元素
 * @returns string | null
 */
export function extractActivityId(activityRow: HTMLElement): string | null {
  // 尝试从 data 属性获取
  const idFromData = activityRow.getAttribute(SELECTORS.ACTIVITY_ID_DATA_ATTR);
  if (idFromData) {
    return idFromData;
  }

  // 尝试从其他可能的属性或子元素中提取
  // 这里可能需要根据实际的Strava页面结构调整
  const idFromHref = activityRow.querySelector('a[href*="/activities/"]');
  if (idFromHref) {
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
 * 获取当前页面的活动ID列表
 * @returns string[]
 */
export function getPageActivityIds(): string[] {
  const rows = getActivityRowElements();
  const ids: string[] = [];

  rows.forEach(row => {
    const id = extractActivityId(row);
    if (id) {
      ids.push(id);
    }
  });

  console.log(`[PageManager] Found ${ids.length} activities on current page`);
  return ids;
}

/**
 * 验证页面环境是否准备就绪
 * @returns { ready: boolean; errors: string[] }
 */
export function validatePageEnvironment(): { ready: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!isOnTrainingLogPage()) {
    errors.push('不在训练日志页面');
  }

  if (!isPageLoaded()) {
    errors.push('页面未加载完成');
  }

  const activityRows = getActivityRowElements();
  if (activityRows.length === 0) {
    errors.push('页面上没有找到活动列表');
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
    errors.push('无法回到第一页');
    return { success: false, errors };
  }

  // 3. 确保列表按时间排序
  const sortSuccess = await ensureTimeSortedList();
  if (!sortSuccess) {
    errors.push('无法按时间排序列表');
    return { success: false, errors };
  }

  console.log('[PageManager] Page preparation completed successfully');
  return { success: true, errors: [] };
}

