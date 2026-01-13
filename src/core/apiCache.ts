/**
 * API 数据缓存管理
 * 提前缓存所有 API 响应，解决"第一页问题"
 */

import type { Activity } from '~/types/activity';

/**
 * 页面数据接口
 */
export interface PageData {
  page: number;
  activities: Activity[];
  timestamp: number;
  perPage?: number;
  total?: number;
}

/**
 * 缓存统计信息
 */
export interface CacheStats {
  totalPages: number;
  totalActivities: number;
  oldestTimestamp: number;
  newestTimestamp: number;
}

/**
 * 缓存管理类
 */
class ApiCacheManager {
  private cache: Map<number, PageData> = new Map();
  private maxAge: number = 5 * 60 * 1000; // 缓存有效期：5分钟
  private enabled: boolean = true;

  /**
   * 添加或更新页面数据到缓存
   */
  set(page: number, activities: Activity[], perPage?: number, total?: number): void {
    if (!this.enabled) return;

    this.cache.set(page, {
      page,
      activities,
      timestamp: Date.now(),
      perPage,
      total,
    });

    console.log(`[ApiCache] 缓存第 ${page} 页数据 (${activities.length} 个活动)`);
  }

  /**
   * 从缓存中获取页面数据
   */
  get(page: number): PageData | null {
    if (!this.enabled) return null;

    const data = this.cache.get(page);
    if (!data) {
      console.log(`[ApiCache] 第 ${page} 页未缓存`);
      return null;
    }

    // 检查是否过期
    const age = Date.now() - data.timestamp;
    if (age > this.maxAge) {
      console.log(`[ApiCache] 第 ${page} 页缓存已过期 (${Math.round(age / 1000)}秒)`);
      this.cache.delete(page);
      return null;
    }

    console.log(`[ApiCache] 命中缓存：第 ${page} 页 (${data.activities.length} 个活动)`);
    return data;
  }

  /**
   * 检查指定页是否已缓存且有效
   */
  has(page: number): boolean {
    const data = this.get(page);
    return data !== null;
  }

  /**
   * 获取所有缓存的页码
   */
  getCachedPages(): number[] {
    return Array.from(this.cache.keys()).sort((a, b) => a - b);
  }

  /**
   * 获取所有缓存的活动（按页码顺序）
   */
  getAllActivities(): Activity[] {
    const pages = this.getCachedPages();
    const activities: Activity[] = [];

    for (const page of pages) {
      const data = this.cache.get(page);
      if (data) {
        activities.push(...data.activities);
      }
    }

    return activities;
  }

  /**
   * 清空指定页的缓存
   */
  delete(page: number): void {
    if (this.cache.delete(page)) {
      console.log(`[ApiCache] 清除第 ${page} 页缓存`);
    }
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    const count = this.cache.size;
    this.cache.clear();
    console.log(`[ApiCache] 清空所有缓存 (${count} 页)`);
  }

  /**
   * 清除过期缓存
   */
  clearExpired(): void {
    const now = Date.now();
    let expiredCount = 0;

    for (const [page, data] of this.cache.entries()) {
      if (now - data.timestamp > this.maxAge) {
        this.cache.delete(page);
        expiredCount++;
      }
    }

    if (expiredCount > 0) {
      console.log(`[ApiCache] 清除 ${expiredCount} 个过期缓存`);
    }
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): CacheStats {
    const pages = Array.from(this.cache.values());
    
    if (pages.length === 0) {
      return {
        totalPages: 0,
        totalActivities: 0,
        oldestTimestamp: 0,
        newestTimestamp: 0,
      };
    }

    const totalActivities = pages.reduce((sum, page) => sum + page.activities.length, 0);
    const timestamps = pages.map(p => p.timestamp);

    return {
      totalPages: pages.length,
      totalActivities,
      oldestTimestamp: Math.min(...timestamps),
      newestTimestamp: Math.max(...timestamps),
    };
  }

  /**
   * 启用缓存
   */
  enable(): void {
    this.enabled = true;
    console.log('[ApiCache] 缓存已启用');
  }

  /**
   * 禁用缓存
   */
  disable(): void {
    this.enabled = false;
    console.log('[ApiCache] 缓存已禁用');
  }

  /**
   * 设置缓存有效期（毫秒）
   */
  setMaxAge(ms: number): void {
    this.maxAge = ms;
    console.log(`[ApiCache] 缓存有效期设置为 ${ms / 1000} 秒`);
  }

  /**
   * 获取缓存大小
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * 打印缓存调试信息
   */
  debug(): void {
    const stats = this.getStats();
    console.log('[ApiCache] 缓存状态:', {
      enabled: this.enabled,
      maxAge: `${this.maxAge / 1000}秒`,
      ...stats,
      pages: this.getCachedPages(),
    });
  }
}

// 导出单例
export const apiCache = new ApiCacheManager();

// 导出类型供外部使用
export type { ApiCacheManager };
