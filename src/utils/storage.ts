import type { ExtensionSettings } from '~/types/settings';
import { DEFAULT_SETTINGS, STORAGE_KEY } from '~/types/settings';

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
