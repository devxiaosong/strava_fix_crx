/**
 * 桥接客户端工具库
 * 供 MAIN world 使用，封装与 ISOLATED world 的通信细节
 */

import type { BridgeRequest, BridgeResponse, BridgeRequestType, LogPayload } from '~/types/bridge';
import { BRIDGE_EVENTS } from '~/types/bridge';
import type { ExtensionSettings } from '~/types/settings';

/**
 * 生成唯一请求ID
 */
function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 向 ISOLATED world 发送请求并等待响应
 * @param type 请求类型
 * @param payload 请求数据
 * @param timeout 超时时间（毫秒）
 * @returns Promise<响应数据>
 */
function sendBridgeRequest<T>(
  type: BridgeRequestType,
  payload?: any,
  timeout = 5000
): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = generateRequestId();
    
    // 设置响应监听器
    const responseHandler = ((event: CustomEvent<BridgeResponse<T>>) => {
      // 只处理匹配ID的响应
      if (event.detail.id !== id) return;
      
      // 清理监听器和定时器
      document.removeEventListener(BRIDGE_EVENTS.RESPONSE, responseHandler);
      clearTimeout(timeoutTimer);
      
      // 处理响应
      if (event.detail.success) {
        resolve(event.detail.data as T);
      } else {
        reject(new Error(event.detail.error || 'Unknown error'));
      }
    }) as EventListener;
    
    document.addEventListener(BRIDGE_EVENTS.RESPONSE, responseHandler);
    
    // 超时保护
    const timeoutTimer = setTimeout(() => {
      document.removeEventListener(BRIDGE_EVENTS.RESPONSE, responseHandler);
      reject(new Error(`Request ${type} timeout after ${timeout}ms`));
    }, timeout);
    
    // 发送请求
    const request: BridgeRequest = { type, id, payload };
    document.dispatchEvent(new CustomEvent(BRIDGE_EVENTS.REQUEST, {
      detail: request
    }));
    
    console.log(`[BridgeClient] Sent request: ${type}, id: ${id}`);
  });
}

/**
 * 获取操作延迟（带默认值和错误处理）
 * @returns 操作延迟时间（毫秒），失败时返回默认值3000ms
 */
export async function getOperationDelayFromBridge(): Promise<number> {
  try {
    const delay = await sendBridgeRequest<number>('GET_OPERATION_DELAY');
    console.log(`[BridgeClient] Got operation delay: ${delay}ms`);
    return delay;
  } catch (error) {
    console.error('[BridgeClient] Failed to get operation delay:', error);
    return 3000; // 默认值
  }
}

/**
 * 获取所有扩展设置
 * @returns 扩展设置对象，失败时返回默认设置
 */
export async function getSettingsFromBridge(): Promise<ExtensionSettings> {
  try {
    const settings = await sendBridgeRequest<ExtensionSettings>('GET_SETTINGS');
    console.log(`[BridgeClient] Got settings:`, settings);
    return settings;
  } catch (error) {
    console.error('[BridgeClient] Failed to get settings:', error);
    return { intervalSpeed: 'default' }; // 默认值
  }
}

/**
 * 记录 info 级别日志
 * @param eventName 事件名称
 * @param eventBody 事件详情
 */
export async function logInfoFromBridge(eventName: string, eventBody: string): Promise<void> {
  try {
    const payload: LogPayload = { eventName, eventBody };
    await sendBridgeRequest<boolean>('LOG_INFO', payload);
  } catch (error) {
    console.error('[BridgeClient] Failed to log info:', error);
  }
}

/**
 * 记录 debug 级别日志
 * @param eventName 事件名称
 * @param eventBody 事件详情
 */
export async function logDebugFromBridge(eventName: string, eventBody: string): Promise<void> {
  try {
    const payload: LogPayload = { eventName, eventBody };
    await sendBridgeRequest<boolean>('LOG_DEBUG', payload);
  } catch (error) {
    console.error('[BridgeClient] Failed to log debug:', error);
  }
}

/**
 * 记录 warning 级别日志
 * @param eventName 事件名称
 * @param eventBody 事件详情
 */
export async function logWarningFromBridge(eventName: string, eventBody: string): Promise<void> {
  try {
    const payload: LogPayload = { eventName, eventBody };
    await sendBridgeRequest<boolean>('LOG_WARNING', payload);
  } catch (error) {
    console.error('[BridgeClient] Failed to log warning:', error);
  }
}

/**
 * 记录 error 级别日志
 * @param eventName 事件名称
 * @param eventBody 事件详情
 */
export async function logErrorFromBridge(eventName: string, eventBody: string): Promise<void> {
  try {
    const payload: LogPayload = { eventName, eventBody };
    await sendBridgeRequest<boolean>('LOG_ERROR', payload);
  } catch (error) {
    console.error('[BridgeClient] Failed to log error:', error);
  }
}
