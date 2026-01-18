import type { ExtensionSettings } from '~/types/settings';
import { DEFAULT_SETTINGS, STORAGE_KEY, INTERVAL_CONFIG } from '~/types/settings';

/**
 * 从Chrome Storage读取设置
 */
export async function getSettings(): Promise<ExtensionSettings> {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    return result[STORAGE_KEY] || DEFAULT_SETTINGS;
  } catch (error) {
    console.error('[Storage] Failed to get settings:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * 保存设置到Chrome Storage
 */
export async function saveSettings(settings: ExtensionSettings): Promise<boolean> {
  try {
    await chrome.storage.local.set({ [STORAGE_KEY]: settings });
    return true;
  } catch (error) {
    console.error('[Storage] Failed to save settings:', error);
    return false;
  }
}

/**
 * 监听设置变化
 */
export function onSettingsChange(
  callback: (settings: ExtensionSettings) => void
): () => void {
  const listener = (
    changes: { [key: string]: chrome.storage.StorageChange },
    areaName: string
  ) => {
    if (areaName === 'local' && changes[STORAGE_KEY]) {
      callback(changes[STORAGE_KEY].newValue);
    }
  };

  chrome.storage.onChanged.addListener(listener);

  // 返回取消监听的函数
  return () => {
    chrome.storage.onChanged.removeListener(listener);
  };
}

/**
 * 获取当前用户设置的操作延迟时间（毫秒）
 * @returns 延迟时间，如果读取失败或未设置，返回默认值3000ms
 */
export async function getOperationDelay(): Promise<number> {
  try {
    const settings = await getSettings();
    
    // 安全检查
    if (!settings?.intervalSpeed) {
      return INTERVAL_CONFIG.default;
    }
    
    const speed = settings.intervalSpeed;
    
    // 类型检查（运行时验证）
    if (!(speed in INTERVAL_CONFIG)) {
      console.warn(`[Storage] Invalid intervalSpeed: ${speed}, using default`);
      return INTERVAL_CONFIG.default;
    }
    
    return INTERVAL_CONFIG[speed];
  } catch (error) {
    console.error('[Storage] Failed to get operation delay:', error);
    return INTERVAL_CONFIG.default;
  }
}
