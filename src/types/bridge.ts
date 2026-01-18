/**
 * 消息桥接类型定义
 * 用于 MAIN world 和 ISOLATED world 之间的通信
 */

import type { ExtensionSettings } from './settings';

/**
 * 支持的请求类型
 */
export type BridgeRequestType = 
  | 'GET_OPERATION_DELAY'
  | 'GET_SETTINGS'
  | 'LOG_INFO'
  | 'LOG_DEBUG'
  | 'LOG_WARNING'
  | 'LOG_ERROR';

/**
 * 请求消息结构
 */
export interface BridgeRequest {
  type: BridgeRequestType;
  id: string;
  payload?: any;
}

/**
 * 响应消息结构
 */
export interface BridgeResponse<T = any> {
  id: string;
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * 日志请求载荷
 */
export interface LogPayload {
  eventName: string;
  eventBody: string;
}

/**
 * 请求处理器映射类型
 */
export interface BridgeHandlers {
  'GET_OPERATION_DELAY': () => Promise<number>;
  'GET_SETTINGS': () => Promise<ExtensionSettings>;
  'LOG_INFO': (payload: LogPayload) => Promise<boolean>;
  'LOG_DEBUG': (payload: LogPayload) => Promise<boolean>;
  'LOG_WARNING': (payload: LogPayload) => Promise<boolean>;
  'LOG_ERROR': (payload: LogPayload) => Promise<boolean>;
}

/**
 * 桥接事件名称
 */
export const BRIDGE_EVENTS = {
  REQUEST: 'extension-bridge-request',
  RESPONSE: 'extension-bridge-response',
} as const;
