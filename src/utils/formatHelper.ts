/**
 * 数据格式化工具
 * 提供各类数据的格式化和转换功能
 */

import type { Activity, SportType, RideType, PrivacyLevel } from '~/types/activity';

/**
 * 格式化日期为 YYYY-MM-DD 格式
 * @param date 日期对象、时间戳或日期字符串
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date | number | string): string {
  const d = typeof date === 'object' ? date : new Date(date);
  
  if (isNaN(d.getTime())) {
    return 'Invalid Date';
  }

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * 格式化日期时间为 YYYY-MM-DD HH:mm:ss 格式
 * @param date 日期对象、时间戳或日期字符串
 * @returns 格式化后的日期时间字符串
 */
export function formatDateTime(date: Date | number | string): string {
  const d = typeof date === 'object' ? date : new Date(date);
  
  if (isNaN(d.getTime())) {
    return 'Invalid Date';
  }

  const datePart = formatDate(d);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return `${datePart} ${hours}:${minutes}:${seconds}`;
}

/**
 * 格式化相对时间（如：2 hours ago, 3 days ago）
 * @param timestamp 时间戳
 * @returns 相对时间字符串
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
}

/**
 * 格式化距离（米转英里，保留2位小数）
 * @param distanceInMeters 距离（米）
 * @returns 格式化后的距离字符串（如：12.34 mi）
 */
export function formatDistance(distanceInMeters: number): string {
  if (distanceInMeters === null || distanceInMeters === undefined) {
    return '0 mi';
  }

  const miles = distanceInMeters / 1609.34;  // 米 → 英里
  return `${miles.toFixed(2)} mi`;
}

/**
 * 格式化距离（公里，保留2位小数）
 * @param distanceInKm 距离（公里）
 * @returns 格式化后的距离字符串（如：12.34 km）
 */
export function formatDistanceKm(distanceInKm: number): string {
  if (distanceInKm === null || distanceInKm === undefined) {
    return '0 km';
  }

  return `${distanceInKm.toFixed(2)} km`;
}

/**
 * 格式化时长（秒转为 HH:mm:ss 或 mm:ss）
 * @param durationInSeconds 时长（秒）
 * @returns 格式化后的时长字符串
 */
export function formatDuration(durationInSeconds: number): string {
  if (durationInSeconds === null || durationInSeconds === undefined || durationInSeconds < 0) {
    return '00:00';
  }

  const hours = Math.floor(durationInSeconds / 3600);
  const minutes = Math.floor((durationInSeconds % 3600) / 60);
  const seconds = Math.floor(durationInSeconds % 60);

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * 格式化配速（分钟/公里）
 * @param speedInMps 速度（米/秒）
 * @returns 格式化后的配速字符串（如：5:30 /km）
 */
export function formatPace(speedInMps: number): string {
  if (speedInMps === null || speedInMps === undefined || speedInMps <= 0) {
    return '--:-- /km';
  }

  // 米/秒 -> 分钟/公里
  const secondsPerKm = 1000 / speedInMps;
  const minutes = Math.floor(secondsPerKm / 60);
  const seconds = Math.floor(secondsPerKm % 60);

  return `${minutes}:${String(seconds).padStart(2, '0')} /km`;
}

/**
 * 格式化速度（公里/小时）
 * @param speedInMps 速度（米/秒）
 * @returns 格式化后的速度字符串（如：18.5 km/h）
 */
export function formatSpeed(speedInMps: number): string {
  if (speedInMps === null || speedInMps === undefined || speedInMps < 0) {
    return '0 km/h';
  }

  // 米/秒 -> 公里/小时
  const kmh = speedInMps * 3.6;
  return `${kmh.toFixed(1)} km/h`;
}

/**
 * 格式化运动类型（直接返回英文）
 * @param sportType 运动类型
 * @returns 运动类型名称
 */
export function formatSportType(sportType: SportType): string {
  // 直接返回英文，不做翻译
  return sportType;
}

/**
 * 获取运动类型对应的图标
 * @param sportType 运动类型
 * @returns emoji 图标
 */
export function getSportIcon(sportType: string): string {
  const icons: Record<string, string> = {
    'Ride': '🚴',
    'Run': '🏃',
    'VirtualRide': '🎮',
    'VirtualRun': '🎮',
    'Swim': '🏊',
    'Walk': '🚶',
    'Hike': '🥾',
    'AlpineSki': '⛷️',
    'BackcountrySki': '🎿',
    'Canoeing': '🛶',
    'Crossfit': '🏋️',
    'EBikeRide': '🚴‍♂️',
    'Elliptical': '🏃‍♂️',
    'Golf': '⛳',
    'IceSkate': '⛸️',
    'InlineSkate': '⛸️',
    'Kayaking': '🚣',
    'Kitesurf': '🪁',
    'NordicSki': '⛷️',
    'RockClimbing': '🧗',
    'Rowing': '🚣',
    'Snowboard': '🏂',
    'Soccer': '⚽',
    'Surfing': '🏄',
    'WeightTraining': '🏋️',
    'Workout': '💪',
    'Yoga': '🧘',
  };
  return icons[sportType] || '🏃';
}

/**
 * 格式化骑行类型（直接返回英文）
 * @param rideType 骑行类型
 * @returns 骑行类型名称
 */
export function formatRideType(rideType: RideType | null | undefined): string {
  if (!rideType) return 'None';
  // 直接返回英文，不做翻译
  return rideType;
}

/**
 * 格式化隐私级别（直接返回英文）
 * @param privacy 隐私级别
 * @returns 隐私级别名称
 */
export function formatPrivacyLevel(privacy: PrivacyLevel): string {
  const privacyMap: Record<PrivacyLevel, string> = {
    'everyone': 'Everyone',
    'followers_only': 'Followers Only',
    'only_me': 'Only Me',
  };

  return privacyMap[privacy] || privacy;
}

/**
 * 格式化进度百分比
 * @param current 当前值
 * @param total 总值
 * @returns 百分比字符串（如：75%）
 */
export function formatProgress(current: number, total: number): string {
  if (total === 0) return '0%';
  const percentage = Math.round((current / total) * 100);
  return `${percentage}%`;
}

/**
 * 格式化数字，添加千位分隔符
 * @param num 数字
 * @returns 格式化后的字符串（如：1,234,567）
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的文件大小（如：1.23 MB）
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * 格式化预计剩余时间
 * @param seconds 秒数
 * @returns 格式化后的时间字符串（如：2m 30s remaining）
 */
export function formatEstimatedTime(seconds: number): string {
  if (seconds <= 0) return 'Almost done';

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m remaining`;
  }

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s remaining`;
  }

  return `${remainingSeconds}s remaining`;
}

/**
 * 截断长文本，添加省略号
 * @param text 文本
 * @param maxLength 最大长度
 * @returns 截断后的文本
 */
export function truncateText(text: string, maxLength: number = 50): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

/**
 * 格式化活动名称（截断并显示运动类型）
 * @param activity 活动对象
 * @returns 格式化后的活动名称
 */
export function formatActivityName(activity: Activity): string {
  const sportType = formatSportType(activity.sport_type);
  const name = truncateText(activity.name, 30);
  return `${sportType} - ${name}`;
}

/**
 * 将 FilterConfig 转换为人类可读的字符串
 * @param filters FilterConfig对象
 * @returns 描述字符串
 */
export function formatFilterDescription(filters: any): string {
  const parts: string[] = [];

  if (filters.sportType) {
    parts.push(`Sport: ${formatSportType(filters.sportType)}`);
  }

  if (filters.dateRange) {
    parts.push(`Date: ${formatDate(filters.dateRange.start)} to ${formatDate(filters.dateRange.end)}`);
  }

  if (filters.distanceRange) {
    parts.push(`Distance: ${filters.distanceRange.min}-${filters.distanceRange.max} km`);
  }

  if (filters.rideType) {
    parts.push(`Ride Type: ${formatRideType(filters.rideType)}`);
  }

  return parts.length > 0 ? parts.join(', ') : 'No filters';
}

/**
 * 将 UpdateConfig 转换为人类可读的字符串
 * @param updates UpdateConfig对象
 * @returns 描述字符串数组
 */
export function formatUpdateDescription(updates: any): string[] {
  const descriptions: string[] = [];

  if (updates.gearId !== undefined) {
    descriptions.push(`Update gear`);
  }

  if (updates.privacy !== undefined) {
    descriptions.push(`Update visibility to: ${formatPrivacyLevel(updates.privacy)}`);
  }

  if (updates.rideType !== undefined) {
    descriptions.push(`Update ride type to: ${formatRideType(updates.rideType)}`);
  }

  return descriptions.length > 0 ? descriptions : ['No updates'];
}

/**
 * 格式化错误信息为用户友好的文本
 * @param error 错误对象或错误信息
 * @returns 格式化后的错误信息
 */
export function formatErrorMessage(error: any): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (error && error.message) {
    return error.message;
  }

  return 'Unknown error occurred';
}

