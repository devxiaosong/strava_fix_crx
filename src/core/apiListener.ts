/**
 * API 监听器
 * 负责拦截和监听 Strava 的 API 请求，获取活动数据
 */

import type { Activity } from '~/types/activity';
import { CURRENT_DELAYS } from '~/config/delays';
import { isValidApiResponse } from '~/utils/validator';

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
  }

  window.fetch = async function (...args: Parameters<typeof fetch>): Promise<Response> {
    const [resource, config] = args;
    const url = typeof resource === 'string' ? resource : resource.url;

    // 调用原始 fetch
    const response = await originalFetch.apply(this, args);

    // 检查是否是训练活动 API
    if (TRAINING_ACTIVITIES_API_PATTERN.test(url)) {
      console.log('[ApiListener] Intercepted fetch request:', url);

      // 克隆响应以便我们可以读取它
      const clonedResponse = response.clone();

      try {
        const data = await clonedResponse.json();
        
        if (isValidApiResponse(data)) {
          listenerState.lastResponse = data;
          listenerState.lastResponseTime = Date.now();

          const { activities, pageInfo } = parseApiResponse(data);
          
          if (listenerState.isListening && activities.length > 0) {
            triggerCallbacks(activities, pageInfo);
          }
        }
      } catch (error) {
        console.error('[ApiListener] Failed to parse fetch response:', error);
      }
    }

    return response;
  };

  console.log('[ApiListener] Fetch interception enabled');
}

/**
 * 拦截 XMLHttpRequest 请求
 */
function interceptXHR(): void {
  if (!originalXHROpen) {
    originalXHROpen = XMLHttpRequest.prototype.open;
  }
  if (!originalXHRSend) {
    originalXHRSend = XMLHttpRequest.prototype.send;
  }

  XMLHttpRequest.prototype.open = function (
    method: string,
    url: string | URL,
    ...rest: any[]
  ): void {
    // @ts-ignore
    this._url = url.toString();
    // @ts-ignore
    return originalXHROpen.apply(this, [method, url, ...rest]);
  };

  XMLHttpRequest.prototype.send = function (body?: any): void {
    // @ts-ignore
    const url = this._url;

    if (url && TRAINING_ACTIVITIES_API_PATTERN.test(url)) {
      console.log('[ApiListener] Intercepted XHR request:', url);

      const originalOnLoad = this.onload;
      const originalOnReadyStateChange = this.onreadystatechange;

      this.onload = function (event) {
        try {
          if (this.status === 200) {
            const data = JSON.parse(this.responseText);
            
            if (isValidApiResponse(data)) {
              listenerState.lastResponse = data;
              listenerState.lastResponseTime = Date.now();

              const { activities, pageInfo } = parseApiResponse(data);
              
              if (listenerState.isListening && activities.length > 0) {
                triggerCallbacks(activities, pageInfo);
              }
            }
          }
        } catch (error) {
          console.error('[ApiListener] Failed to parse XHR response:', error);
        }

        // 调用原始回调
        if (originalOnLoad) {
          originalOnLoad.call(this, event);
        }
      };

      this.onreadystatechange = function (event) {
        if (this.readyState === 4 && this.status === 200) {
          try {
            const data = JSON.parse(this.responseText);
            
            if (isValidApiResponse(data)) {
              listenerState.lastResponse = data;
              listenerState.lastResponseTime = Date.now();

              const { activities, pageInfo } = parseApiResponse(data);
              
              if (listenerState.isListening && activities.length > 0) {
                triggerCallbacks(activities, pageInfo);
              }
            }
          } catch (error) {
            console.error('[ApiListener] Failed to parse XHR response:', error);
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

  console.log('[ApiListener] XHR interception enabled');
}

/**
 * 初始化 API 监听器（拦截 fetch 和 XHR）
 */
export function initApiListener(): void {
  if (listenerState.isListening) {
    console.warn('[ApiListener] Listener already initialized');
    return;
  }

  interceptFetch();
  interceptXHR();

  console.log('[ApiListener] API listener initialized');
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
 * 手动触发 DOM 操作以触发 API 请求（需要与 pageManager 配合）
 * 这个函数本身不在这里实现，而是由 pageManager 提供
 * 这里只是记录说明
 * 
 * 使用示例：
 * 1. initApiListener() - 初始化监听器
 * 2. startListening(callback) - 开始监听
 * 3. 通过 pageManager.goToNextPage() 触发翻页
 * 4. callback 会被自动调用，接收活动数据
 * 5. stopListening() - 停止监听
 */

