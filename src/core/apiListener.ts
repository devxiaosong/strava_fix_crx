/**
 * API 监听器
 * 负责拦截和监听 Strava 的 API 请求，获取活动数据
 * 
 * 新特性：
 * - 全局初始化，页面加载时就开始拦截
 * - 自动缓存所有 API 响应，解决"第一页问题"
 * - 无需手动卸载，持续运行直到页面关闭
 */

import type { Activity } from '~/types/activity';
import { CURRENT_DELAYS } from '~/config/delays';
import { isValidApiResponse } from '~/utils/validator';
import { apiCache } from '~/core/apiCache';

/**
 * API响应回调函数类型
 */
type ApiResponseCallback = (activities: Activity[], pageInfo: PageInfo) => void;

/**
 * 页面信息接口
 */
interface PageInfo {
  page: number;
  perPage: number;
  total?: number;
}

/**
 * 监听器状态
 */
interface ListenerState {
  isListening: boolean;
  callbacks: ApiResponseCallback[];
  lastResponse: any;
  lastResponseTime: number;
}

// 全局监听器状态
const listenerState: ListenerState = {
  isListening: false,
  callbacks: [],
  lastResponse: null,
  lastResponseTime: 0,
};

/**
 * Strava 训练活动 API 的 URL 模式
 */
const TRAINING_ACTIVITIES_API_PATTERN = /\/athlete\/training_activities/;

/**
 * 原始的 fetch 和 XMLHttpRequest 引用
 */
let originalFetch: typeof fetch;
let originalXHROpen: typeof XMLHttpRequest.prototype.open;
let originalXHRSend: typeof XMLHttpRequest.prototype.send;

/**
 * 解析 Strava API 响应并提取活动数据
 * @param responseData API响应数据
 * @returns { activities: Activity[], pageInfo: PageInfo }
 */
function parseApiResponse(responseData: any): { activities: Activity[]; pageInfo: PageInfo } {
  const activities: Activity[] = [];
  let pageInfo: PageInfo = { page: 1, perPage: 20 };

  try {
    // Strava API 可能返回不同格式的数据，需要适配
    if (Array.isArray(responseData)) {
      // 直接是活动数组
      activities.push(...responseData);
    } else if (responseData.models && Array.isArray(responseData.models)) {
      // 嵌套在 models 字段中
      activities.push(...responseData.models);
    } else if (responseData.data && Array.isArray(responseData.data)) {
      // 嵌套在 data 字段中
      activities.push(...responseData.data);
    }

    // 提取分页信息
    if (responseData.page !== undefined) {
      pageInfo.page = responseData.page;
    }
    if (responseData.perPage !== undefined) {
      pageInfo.perPage = responseData.perPage;
    }
    if (responseData.total !== undefined) {
      pageInfo.total = responseData.total;
    }

    console.log(`[ApiListener] Parsed ${activities.length} activities from API response`, pageInfo);
  } catch (error) {
    console.error('[ApiListener] Failed to parse API response:', error);
  }

  return { activities, pageInfo };
}

/**
 * 触发所有注册的回调函数
 * @param activities 活动列表
 * @param pageInfo 页面信息
 */
function triggerCallbacks(activities: Activity[], pageInfo: PageInfo): void {
  // 自动缓存数据（无论是否有回调监听）
  apiCache.set(pageInfo.page, activities, pageInfo.perPage, pageInfo.total);

  // 触发所有注册的回调
  listenerState.callbacks.forEach(callback => {
    try {
      callback(activities, pageInfo);
    } catch (error) {
      console.error('[ApiListener] Callback error:', error);
    }
  });
}

/**
 * 拦截 fetch 请求
 */
function interceptFetch(): void {
  if (!originalFetch) {
    originalFetch = window.fetch;
    console.log('[ApiListener] 🔧 Saving original fetch:', typeof originalFetch);
  }

  window.fetch = async function (...args: Parameters<typeof fetch>): Promise<Response> {
    const [resource, config] = args;
    const url = typeof resource === 'string' 
      ? resource 
      : resource instanceof Request 
        ? resource.url 
        : resource.toString();

    console.log('[ApiListener] 🌐 Fetch request detected:', url);

    // 调用原始 fetch
    const response = await originalFetch.apply(this, args);

    // 检查是否是训练活动 API
    if (TRAINING_ACTIVITIES_API_PATTERN.test(url)) {
      console.log('[ApiListener] ✅ Intercepted training activities API:', url);
      console.log('[ApiListener] 📊 Response status:', response.status);

      // 克隆响应以便我们可以读取它
      const clonedResponse = response.clone();

      try {
        const data = await clonedResponse.json();
        console.log('[ApiListener] 📦 Parsed JSON data:', data);
        
        if (isValidApiResponse(data)) {
          console.log('[ApiListener] ✓ Valid API response');
          listenerState.lastResponse = data;
          listenerState.lastResponseTime = Date.now();

          const { activities, pageInfo } = parseApiResponse(data);
          console.log(`[ApiListener] 🎯 Extracted ${activities.length} activities, page ${pageInfo.page}`);
          
          // 自动缓存数据（即使没有激活监听）
          if (activities.length > 0) {
            apiCache.set(pageInfo.page, activities, pageInfo.perPage, pageInfo.total);
            console.log(`[ApiListener] 💾 Cached page ${pageInfo.page} with ${activities.length} activities`);
          }
          
          // 如果有监听器，触发回调
          if (listenerState.isListening && activities.length > 0) {
            console.log(`[ApiListener] 📢 Triggering ${listenerState.callbacks.length} callbacks`);
            triggerCallbacks(activities, pageInfo);
          } else {
            console.log('[ApiListener] ⏸️ No active listeners, data cached only');
          }
        } else {
          console.warn('[ApiListener] ⚠️ Invalid API response format');
        }
      } catch (error) {
        console.error('[ApiListener] ❌ Failed to parse fetch response:', error);
      }
    }

    return response;
  };

  console.log('[ApiListener] ✅ Fetch interception enabled, window.fetch replaced');
  console.log('[ApiListener] 🔍 Pattern to match:', TRAINING_ACTIVITIES_API_PATTERN);
}

/**
 * 拦截 XMLHttpRequest 请求
 */
function interceptXHR(): void {
  if (!originalXHROpen) {
    originalXHROpen = XMLHttpRequest.prototype.open;
    console.log('[ApiListener] 🔧 Saving original XHR.open:', typeof originalXHROpen);
  }
  if (!originalXHRSend) {
    originalXHRSend = XMLHttpRequest.prototype.send;
    console.log('[ApiListener] 🔧 Saving original XHR.send:', typeof originalXHRSend);
  }

  XMLHttpRequest.prototype.open = function (
    method: string,
    url: string | URL,
    ...rest: any[]
  ): void {
    // @ts-ignore
    this._url = url.toString();
    console.log('[ApiListener] 🌐 XHR open:', method, this._url);
    // @ts-ignore
    return originalXHROpen.apply(this, [method, url, ...rest]);
  };

  XMLHttpRequest.prototype.send = function (body?: any): void {
    // @ts-ignore
    const url = this._url;

    if (url && TRAINING_ACTIVITIES_API_PATTERN.test(url)) {
      console.log('[ApiListener] ✅ Intercepted training activities XHR:', url);
      console.log('[ApiListener] 📤 Request body:', body);

      const originalOnLoad = this.onload;
      const originalOnReadyStateChange = this.onreadystatechange;

      this.onload = function (event) {
        try {
          console.log('[ApiListener] 📊 XHR onload, status:', this.status);
          if (this.status === 200) {
            const data = JSON.parse(this.responseText);
            console.log('[ApiListener] 📦 XHR parsed JSON data:', data);
            
            if (isValidApiResponse(data)) {
              console.log('[ApiListener] ✓ Valid XHR API response');
              listenerState.lastResponse = data;
              listenerState.lastResponseTime = Date.now();

              const { activities, pageInfo } = parseApiResponse(data);
              console.log(`[ApiListener] 🎯 XHR extracted ${activities.length} activities, page ${pageInfo.page}`);
              
              // 自动缓存数据（即使没有激活监听）
              if (activities.length > 0) {
                apiCache.set(pageInfo.page, activities, pageInfo.perPage, pageInfo.total);
                console.log(`[ApiListener] 💾 XHR cached page ${pageInfo.page} with ${activities.length} activities`);
              }
              
              // 如果有监听器，触发回调
              if (listenerState.isListening && activities.length > 0) {
                console.log(`[ApiListener] 📢 XHR triggering ${listenerState.callbacks.length} callbacks`);
                triggerCallbacks(activities, pageInfo);
              } else {
                console.log('[ApiListener] ⏸️ XHR no active listeners, data cached only');
              }
            } else {
              console.warn('[ApiListener] ⚠️ Invalid XHR API response format');
            }
          }
        } catch (error) {
          console.error('[ApiListener] ❌ Failed to parse XHR response:', error);
        }

        // 调用原始回调
        if (originalOnLoad) {
          originalOnLoad.call(this, event);
        }
      };

      this.onreadystatechange = function (event) {
        console.log('[ApiListener] 📡 XHR readyState changed:', this.readyState);
        if (this.readyState === 4 && this.status === 200) {
          try {
            const data = JSON.parse(this.responseText);
            console.log('[ApiListener] 📦 XHR onreadystatechange parsed JSON data:', data);
            
            if (isValidApiResponse(data)) {
              console.log('[ApiListener] ✓ Valid XHR API response (onreadystatechange)');
              listenerState.lastResponse = data;
              listenerState.lastResponseTime = Date.now();

              const { activities, pageInfo } = parseApiResponse(data);
              console.log(`[ApiListener] 🎯 XHR extracted ${activities.length} activities, page ${pageInfo.page} (onreadystatechange)`);
              
              // 自动缓存数据（即使没有激活监听）
              if (activities.length > 0) {
                apiCache.set(pageInfo.page, activities, pageInfo.perPage, pageInfo.total);
                console.log(`[ApiListener] 💾 XHR cached page ${pageInfo.page} with ${activities.length} activities (onreadystatechange)`);
              }
              
              // 如果有监听器，触发回调
              if (listenerState.isListening && activities.length > 0) {
                console.log(`[ApiListener] 📢 XHR triggering ${listenerState.callbacks.length} callbacks (onreadystatechange)`);
                triggerCallbacks(activities, pageInfo);
              } else {
                console.log('[ApiListener] ⏸️ XHR no active listeners, data cached only (onreadystatechange)');
              }
            } else {
              console.warn('[ApiListener] ⚠️ Invalid XHR API response format (onreadystatechange)');
            }
          } catch (error) {
            console.error('[ApiListener] ❌ Failed to parse XHR response (onreadystatechange):', error);
          }
        }

        // 调用原始回调
        if (originalOnReadyStateChange) {
          originalOnReadyStateChange.call(this, event);
        }
      };
    }

    return originalXHRSend.apply(this, [body]);
  };

  console.log('[ApiListener] ✅ XHR interception enabled, XMLHttpRequest.prototype replaced');
  console.log('[ApiListener] 🔍 Pattern to match:', TRAINING_ACTIVITIES_API_PATTERN);
}

/**
 * 初始化 API 监听器（拦截 fetch 和 XHR）
 */
export function initApiListener(): void {
  console.log('[ApiListener] 🚀 Initializing API listener...');
  console.log('[ApiListener] 🔍 Current window object:', typeof window);
  console.log('[ApiListener] 🔍 window.fetch type:', typeof window.fetch);
  console.log('[ApiListener] 🔍 XMLHttpRequest type:', typeof XMLHttpRequest);
  
  if (listenerState.isListening) {
    console.warn('[ApiListener] ⚠️ Listener already initialized');
    return;
  }

  interceptFetch();
  interceptXHR();

  console.log('[ApiListener] ✅ API listener initialized successfully');
  console.log('[ApiListener] 🔍 Verifying fetch is replaced:', window.fetch.toString().includes('ApiListener'));
}

/**
 * 开始监听 API 响应
 * @param callback 接收活动数据的回调函数
 */
export function startListening(callback: ApiResponseCallback): void {
  if (!listenerState.callbacks.includes(callback)) {
    listenerState.callbacks.push(callback);
  }

  listenerState.isListening = true;
  console.log('[ApiListener] Started listening, callbacks:', listenerState.callbacks.length);
}

/**
 * 停止监听 API 响应
 * @param callback 要移除的回调函数（可选，不提供则移除所有）
 */
export function stopListening(callback?: ApiResponseCallback): void {
  if (callback) {
    const index = listenerState.callbacks.indexOf(callback);
    if (index !== -1) {
      listenerState.callbacks.splice(index, 1);
    }
  } else {
    listenerState.callbacks = [];
  }

  if (listenerState.callbacks.length === 0) {
    listenerState.isListening = false;
  }

  console.log('[ApiListener] Stopped listening, remaining callbacks:', listenerState.callbacks.length);
}

/**
 * 获取最后一次 API 响应（用于调试或恢复）
 * @returns any | null
 */
export function getLastResponse(): any | null {
  return listenerState.lastResponse;
}

/**
 * 获取最后一次响应的时间戳
 * @returns number
 */
export function getLastResponseTime(): number {
  return listenerState.lastResponseTime;
}

/**
 * 等待下一次 API 响应
 * @param timeout 超时时间（毫秒）
 * @returns Promise<{ activities: Activity[], pageInfo: PageInfo } | null>
 */
export function waitForNextResponse(
  timeout: number = CURRENT_DELAYS.API_LISTEN_TIMEOUT
): Promise<{ activities: Activity[]; pageInfo: PageInfo } | null> {
  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      stopListening(callback);
      console.warn('[ApiListener] Timeout waiting for API response');
      resolve(null);
    }, timeout);

    const callback: ApiResponseCallback = (activities, pageInfo) => {
      clearTimeout(timeoutId);
      stopListening(callback);
      resolve({ activities, pageInfo });
    };

    startListening(callback);
  });
}

/**
 * 清空监听器状态（用于重置或测试）
 */
export function resetListener(): void {
  listenerState.isListening = false;
  listenerState.callbacks = [];
  listenerState.lastResponse = null;
  listenerState.lastResponseTime = 0;
  console.log('[ApiListener] Listener state reset');
}

/**
 * 检查监听器是否正在运行
 * @returns boolean
 */
export function isListening(): boolean {
  return listenerState.isListening;
}

/**
 * 从最后的响应中提取活动数据（便捷方法）
 * @returns Activity[]
 */
export function getActivitiesFromLastResponse(): Activity[] {
  if (!listenerState.lastResponse) {
    return [];
  }

  const { activities } = parseApiResponse(listenerState.lastResponse);
  return activities;
}

/**
 * 从缓存获取指定页的数据
 * @param page 页码
 * @returns PageData | null
 */
export function getCachedPageData(page: number) {
  return apiCache.get(page);
}

/**
 * 检查指定页是否已缓存
 * @param page 页码
 * @returns boolean
 */
export function hasCachedPage(page: number): boolean {
  return apiCache.has(page);
}

/**
 * 获取所有已缓存的页码
 * @returns number[]
 */
export function getCachedPages(): number[] {
  return apiCache.getCachedPages();
}

/**
 * 清空 API 缓存
 */
export function clearCache(): void {
  apiCache.clear();
}

/**
 * 获取缓存统计信息
 */
export function getCacheStats() {
  return apiCache.getStats();
}

/**
 * 打印缓存调试信息
 */
export function debugCache(): void {
  apiCache.debug();
}

/**
 * 新的工作机制说明：
 * 
 * 1. Content Script 初始化时调用 initApiListener()
 *    - 监听器立即开始拦截所有 API 请求
 *    - 自动缓存所有响应数据
 *    - 持续运行直到页面关闭
 * 
 * 2. 用户点击"预览"时：
 *    - 检查第一页是否已缓存 (hasCachedPage(1))
 *    - 如果已缓存，直接使用 (getCachedPageData(1))
 *    - 如果未缓存，等待 API 响应
 *    - 继续翻页扫描其他页面
 * 
 * 3. 无需手动卸载监听器
 *    - 监听器全程运行
 *    - 自动管理缓存过期
 *    - 多次预览可复用缓存
 * 
 * 优势：
 * - ✅ 完美解决"第一页问题"
 * - ✅ 用户体验无感知
 * - ✅ 支持多次预览，缓存加速
 * - ✅ 代码更简洁，无需反复安装/卸载
 */

