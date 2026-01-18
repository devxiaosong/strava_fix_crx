/**
 * 消息桥接器
 * 运行在 ISOLATED world，可以访问 Chrome Extension APIs
 * 通过 CustomEvent 与 MAIN world 通信
 */
import type { PlasmoCSConfig } from "plasmo";
import { getOperationDelay, getSettings } from "~/utils/storage";
import { logInfo, logDebug, logWarning, logError } from "~/utils/misc";
import type { BridgeHandlers, BridgeRequest, BridgeResponse, LogPayload } from "~/types/bridge";
import { BRIDGE_EVENTS } from "~/types/bridge";

export const config: PlasmoCSConfig = {
  matches: ["https://www.strava.com/athlete/training*"],
  run_at: "document_end"
  // 默认 ISOLATED world，可访问 chrome API
};

/**
 * 消息处理器映射
 * 所有可以从 MAIN world 调用的功能都在这里注册
 */
const handlers: BridgeHandlers = {
  'GET_OPERATION_DELAY': async () => {
    const delay = await getOperationDelay();
    console.log(`[MessageBridge] Got operation delay: ${delay}ms`);
    return delay;
  },
  
  'GET_SETTINGS': async () => {
    const settings = await getSettings();
    console.log(`[MessageBridge] Got settings:`, settings);
    return settings;
  },
  
  'LOG_INFO': async (payload: LogPayload) => {
    logInfo(payload.eventName, payload.eventBody);
    console.log(`[MessageBridge] Logged info: ${payload.eventName}`);
    return true;
  },
  
  'LOG_DEBUG': async (payload: LogPayload) => {
    logDebug(payload.eventName, payload.eventBody);
    console.log(`[MessageBridge] Logged debug: ${payload.eventName}`);
    return true;
  },
  
  'LOG_WARNING': async (payload: LogPayload) => {
    logWarning(payload.eventName, payload.eventBody);
    console.log(`[MessageBridge] Logged warning: ${payload.eventName}`);
    return true;
  },
  
  'LOG_ERROR': async (payload: LogPayload) => {
    logError(payload.eventName, payload.eventBody);
    console.log(`[MessageBridge] Logged error: ${payload.eventName}`);
    return true;
  },
};

/**
 * 处理来自 MAIN world 的请求
 */
async function handleRequest(request: BridgeRequest) {
  const { type, id, payload } = request;
  
  console.log(`[MessageBridge] Received request: ${type}, id: ${id}`);
  
  try {
    // 查找对应的处理器
    const handler = handlers[type];
    if (!handler) {
      throw new Error(`Unknown request type: ${type}`);
    }
    
    // 执行处理器（传入 payload 如果存在）
    const data = await handler(payload);
    
    // 发送成功响应
    const response: BridgeResponse = {
      id,
      success: true,
      data
    };
    
    document.dispatchEvent(new CustomEvent(BRIDGE_EVENTS.RESPONSE, {
      detail: response
    }));
    
    console.log(`[MessageBridge] Response sent for ${type}`);
  } catch (error) {
    // 发送错误响应
    const response: BridgeResponse = {
      id,
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
    
    document.dispatchEvent(new CustomEvent(BRIDGE_EVENTS.RESPONSE, {
      detail: response
    }));
    
    console.error(`[MessageBridge] Error handling ${type}:`, error);
  }
}

/**
 * 监听来自 MAIN world 的请求
 */
document.addEventListener(BRIDGE_EVENTS.REQUEST, ((event: CustomEvent<BridgeRequest>) => {
  handleRequest(event.detail);
}) as EventListener);

console.log('[MessageBridge] Initialized in ISOLATED world, ready to handle requests');
