/**
 * DOM 操作辅助工具
 * 封装常用的 DOM 操作，提供统一的接口和错误处理
 */

import { CURRENT_DELAYS, delay } from '~/config/delays';

/**
 * 查找单个元素（使用 XPath）
 * @param xpath - XPath 表达式
 * @param parent - 父元素（可选）
 * @returns 找到的元素或null
 */
export function findElement<T extends HTMLElement = HTMLElement>(
  xpath: string,
  parent: Node = document
): T | null {
  try {
    const result = document.evaluate(
      xpath,
      parent,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    );
    return result.singleNodeValue as T | null;
  } catch (error) {
    console.error(`[DOM] XPath query failed: ${xpath}`, error);
    return null;
  }
}

/**
 * 查找所有匹配的元素（使用 XPath）
 * @param xpath - XPath 表达式
 * @param parent - 父元素（可选）
 * @returns HTMLElement 数组
 */
export function findAllElements<T extends HTMLElement = HTMLElement>(
  xpath: string,
  parent: Node = document
): T[] {
  try {
    const result = document.evaluate(
      xpath,
      parent,
      null,
      XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
      null
    );
    const elements: T[] = [];
    for (let i = 0; i < result.snapshotLength; i++) {
      const node = result.snapshotItem(i);
      if (node) {
        elements.push(node as T);
      }
    }
    return elements;
  } catch (error) {
    console.error(`[DOM] XPath query all failed: ${xpath}`, error);
    return [];
  }
}

/**
 * 点击元素并等待
 * @param element - HTMLElement或null
 * @param waitMs - 点击后等待的毫秒数
 * @returns Promise<boolean> 是否成功点击
 */
export async function clickElement(
  element: HTMLElement | null,
  waitMs: number = 0
): Promise<boolean> {
  if (!element) {
    console.warn('[DOM] Attempted to click a null element.');
    return false;
  }
  
  element.click();
  
  if (waitMs > 0) {
    await delay(waitMs);
  }
  
  return true;
}

/**
 * 设置输入框或下拉框的值
 * 触发 input 和 change 事件以确保 React/Vue 组件响应
 * @param element - HTMLInputElement 或 HTMLSelectElement 或 null
 * @param value - 要设置的值
 * @returns boolean 是否成功设置
 */
export function setInputValue(
  element: HTMLInputElement | HTMLSelectElement | null,
  value: string
): boolean {
  if (!element) {
    console.warn('[DOM] Attempted to set value on a null element.');
    return false;
  }
  
  element.value = value;
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
  
  return true;
}

/**
 * 检查元素是否存在（使用 XPath）
 * @param xpath - XPath 表达式
 * @param parent - 父元素（可选）
 * @returns boolean 是否存在
 */
export function elementExists(
  xpath: string,
  parent: Node = document
): boolean {
  return findElement(xpath, parent) !== null;
}

/**
 * 等待元素出现（使用 XPath）
 * @param xpath - XPath 表达式
 * @param timeout - 超时时间（毫秒）
 * @returns Promise<HTMLElement | null>
 */
export async function waitForElement(
  xpath: string,
  timeout: number = 5000
): Promise<HTMLElement | null> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const element = findElement<HTMLElement>(xpath);
    if (element) {
      return element;
    }
    await delay(100);
  }

  console.warn('[DOM] Element not found:', xpath);
  return null;
}

/**
 * 检查元素是否可见
 * @param element - HTMLElement 或 null
 * @returns boolean
 */
export function isElementVisible(element: HTMLElement | null): boolean {
  if (!element) return false;

  const style = window.getComputedStyle(element);
  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    style.opacity !== '0' &&
    element.offsetParent !== null
  );
}

/**
 * 获取元素的文本内容（使用 XPath）
 * @param xpath - XPath 表达式
 * @param parent - 父元素（可选）
 * @returns string | null
 */
export function getElementText(
  xpath: string,
  parent: Node = document
): string | null {
  const element = findElement(xpath, parent);
  return element ? element.textContent : null;
}

/**
 * 验证 XPath 选择器是否有效
 * 可以在开发时用于测试选择器
 * 
 * @param xpath - 要验证的 XPath 选择器
 * @returns 选择器是否有效且有匹配元素
 */
export function validateSelector(xpath: string): boolean {
  try {
    const result = document.evaluate(
      xpath,
      document,
      null,
      XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
      null
    );
    const isValid = result.snapshotLength > 0;
    console.log(`[XPath验证] ${xpath}: ${isValid ? '✅ 有效' : '❌ 无匹配'}`);
    return isValid;
  } catch (error) {
    console.error(`[XPath验证] ${xpath}: ❌ 语法错误`, error);
    return false;
  }
}

/**
 * 批量验证 XPath 选择器组
 * 用于开发和调试
 * 
 * @param xpathGroup - XPath 选择器组对象
 * @returns 验证结果摘要
 */
export function validateSelectorGroup(xpathGroup: Record<string, string>): {
  total: number;
  valid: number;
  invalid: string[];
} {
  const results = {
    total: 0,
    valid: 0,
    invalid: [] as string[]
  };
  
  for (const [key, xpath] of Object.entries(xpathGroup)) {
    results.total++;
    if (validateSelector(xpath)) {
      results.valid++;
    } else {
      results.invalid.push(`${key}: ${xpath}`);
    }
  }
  
  console.log(`[XPath选择器组验证] ${results.valid}/${results.total} 有效`);
  if (results.invalid.length > 0) {
    console.warn('[无效XPath选择器]:', results.invalid);
  }
  
  return results;
}

/**
 * XPath 查询工具函数：查询单个元素
 * （findElement 的别名，保持向后兼容）
 * 
 * @param xpath - XPath 表达式
 * @param contextNode - 上下文节点，默认为 document
 * @returns 找到的第一个元素，如果没有则返回 null
 */
export const queryByXPath = findElement;

/**
 * XPath 查询工具函数：查询所有匹配的元素
 * （findAllElements 的别名，保持向后兼容）
 * 
 * @param xpath - XPath 表达式
 * @param contextNode - 上下文节点，默认为 document
 * @returns 所有匹配的元素数组
 */
export const queryAllByXPath = findAllElements;
