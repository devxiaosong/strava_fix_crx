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
 * 格式化相对时间（如：2小时前、3天前）
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

  if (days > 0) return `${days}天前`;
  if (hours > 0) return `${hours}小时前`;
  if (minutes > 0) return `${minutes}分钟前`;
  return `${seconds}秒前`;
}

/**
 * 格式化距离（米转公里，保留2位小数）
 * @param distanceInMeters 距离（米）
 * @returns 格式化后的距离字符串（如：12.34 km）
 */
export function formatDistance(distanceInMeters: number): string {
  if (distanceInMeters === null || distanceInMeters === undefined) {
    return '0 km';
  }

  const km = distanceInMeters / 1000;
  return `${km.toFixed(2)} km`;
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
 * 格式化运动类型为中文
 * @param sportType 运动类型
 * @returns 中文名称
 */
export function formatSportType(sportType: SportType): string {
  const sportTypeMap: Record<SportType, string> = {
    'Ride': '骑行',
    'Run': '跑步',
    'Swim': '游泳',
    'Hike': '徒步',
    'Walk': '步行',
    'AlpineSki': '高山滑雪',
    'BackcountrySki': '野外滑雪',
    'Canoeing': '独木舟',
    'Crossfit': '综合健身',
    'EBikeRide': '电动自行车',
    'Elliptical': '椭圆机',
    'Golf': '高尔夫',
    'Handcycle': '手摇自行车',
    'IceSkate': '滑冰',
    'InlineSkate': '轮滑',
    'Kayaking': '皮划艇',
    'Kitesurf': '风筝冲浪',
    'NordicSki': '越野滑雪',
    'RockClimbing': '攀岩',
    'RollerSki': '滚轴滑雪',
    'Rowing': '划船',
    'Snowboard': '滑雪板',
    'Snowshoe': '雪鞋',
    'Soccer': '足球',
    'StairStepper': '踏步机',
    'StandUpPaddling': '站立式划桨',
    'Surfing': '冲浪',
    'VirtualRide': '虚拟骑行',
    'VirtualRun': '虚拟跑步',
    'WeightTraining': '力量训练',
    'Wheelchair': '轮椅',
    'Windsurf': '帆板',
    'Workout': '健身',
    'Yoga': '瑜伽',
  };

  return sportTypeMap[sportType] || sportType;
}

/**
 * 格式化骑行类型为中文
 * @param rideType 骑行类型
 * @returns 中文名称
 */
export function formatRideType(rideType: RideType | null | undefined): string {
  if (!rideType) return '无';

  const rideTypeMap: Record<RideType, string> = {
    'ride': '骑行',
    'commute': '通勤',
    'workout': '训练',
  };

  return rideTypeMap[rideType] || rideType;
}

/**
 * 格式化隐私级别为中文
 * @param privacy 隐私级别
 * @returns 中文名称
 */
export function formatPrivacyLevel(privacy: PrivacyLevel): string {
  const privacyMap: Record<PrivacyLevel, string> = {
    'everyone': '所有人可见',
    'followers': '仅关注者可见',
    'only_me': '仅自己可见',
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
 * @returns 格式化后的时间字符串（如：还剩 2分30秒）
 */
export function formatEstimatedTime(seconds: number): string {
  if (seconds <= 0) return '即将完成';

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `还剩 ${hours}小时${remainingMinutes}分钟`;
  }

  if (minutes > 0) {
    return `还剩 ${minutes}分${remainingSeconds}秒`;
  }

  return `还剩 ${remainingSeconds}秒`;
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
    parts.push(`运动类型: ${formatSportType(filters.sportType)}`);
  }

  if (filters.dateRange) {
    parts.push(`日期: ${formatDate(filters.dateRange.start)} 至 ${formatDate(filters.dateRange.end)}`);
  }

  if (filters.distanceRange) {
    parts.push(`距离: ${filters.distanceRange.min}-${filters.distanceRange.max} km`);
  }

  if (filters.rideType) {
    parts.push(`骑行类型: ${formatRideType(filters.rideType)}`);
  }

  return parts.length > 0 ? parts.join(', ') : '无筛选条件';
}

/**
 * 将 UpdateConfig 转换为人类可读的字符串
 * @param updates UpdateConfig对象
 * @returns 描述字符串数组
 */
export function formatUpdateDescription(updates: any): string[] {
  const descriptions: string[] = [];

  if (updates.bikeId !== undefined) {
    descriptions.push(`更新自行车`);
  }

  if (updates.shoesId !== undefined) {
    descriptions.push(`更新跑鞋`);
  }

  if (updates.visibility !== undefined) {
    descriptions.push(`更新隐私设置为: ${formatPrivacyLevel(updates.visibility)}`);
  }

  if (updates.workoutType !== undefined) {
    descriptions.push(`更新骑行类型为: ${formatRideType(updates.workoutType)}`);
  }

  return descriptions.length > 0 ? descriptions : ['无更新操作'];
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

  return '发生未知错误';
}

