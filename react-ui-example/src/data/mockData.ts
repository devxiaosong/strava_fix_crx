import type { Activity, Bike, Shoe } from '@/types/activity';

// Mock Bikes
export const mockBikes: Bike[] = [
  {
    id: 'bike_1',
    name: 'Cervélo R5',
    brand: 'Cervélo',
    model: 'R5',
    sport_type: 'Ride',
    distance: 4520,
    retired: false,
  },
  {
    id: 'bike_2',
    name: 'Canyon Grail CF',
    brand: 'Canyon',
    model: 'Grail CF SL 8',
    sport_type: 'Ride',
    distance: 1850,
    retired: false,
  },
  {
    id: 'bike_3',
    name: 'Trek Fuel EX',
    brand: 'Trek',
    model: 'Fuel EX 9.8',
    sport_type: 'Ride',
    distance: 980,
    retired: false,
  },
  {
    id: 'bike_4',
    name: 'Old Road Bike',
    brand: 'Giant',
    model: 'TCR',
    sport_type: 'Ride',
    distance: 12500,
    retired: true,
  },
];

// Mock Shoes
export const mockShoes: Shoe[] = [
  {
    id: 'shoe_1',
    name: 'Nike Vaporfly 3',
    brand: 'Nike',
    model: 'Vaporfly 3',
    sport_type: 'Run',
    distance: 320,
    retired: false,
  },
  {
    id: 'shoe_2',
    name: 'ASICS Gel-Kayano 30',
    brand: 'ASICS',
    model: 'Gel-Kayano 30',
    sport_type: 'Run',
    distance: 580,
    retired: false,
  },
  {
    id: 'shoe_3',
    name: 'Hoka Clifton 9',
    brand: 'Hoka',
    model: 'Clifton 9',
    sport_type: 'Run',
    distance: 450,
    retired: false,
  },
  {
    id: 'shoe_4',
    name: 'Old Training Shoes',
    brand: 'Brooks',
    model: 'Ghost 14',
    sport_type: 'Run',
    distance: 850,
    retired: true,
  },
];

// Mock Activities
export const mockActivities: Activity[] = [
  {
    id: 'act_1',
    sport_type: 'Ride',
    name: 'Morning Coffee Ride',
    date: '2025-01-07T07:30:00',
    distance: 42.5,
    moving_time: 5400,
    elapsed_time: 6000,
    total_elevation_gain: 320,
    privacy: 'everyone',
    gear_id: 'bike_1',
    ride_type: 'Road',
  },
  {
    id: 'act_2',
    sport_type: 'Run',
    name: 'Easy Recovery Run',
    date: '2025-01-06T18:00:00',
    distance: 8.2,
    moving_time: 2700,
    elapsed_time: 2850,
    total_elevation_gain: 45,
    privacy: 'followers_only',
    gear_id: 'shoe_2',
  },
  {
    id: 'act_3',
    sport_type: 'Ride',
    name: 'Weekend Gravel Adventure',
    date: '2025-01-05T09:00:00',
    distance: 78.3,
    moving_time: 12600,
    elapsed_time: 14400,
    total_elevation_gain: 890,
    privacy: 'everyone',
    gear_id: 'bike_2',
    ride_type: 'Gravel',
  },
  {
    id: 'act_4',
    sport_type: 'Run',
    name: 'Tempo Run',
    date: '2025-01-04T06:30:00',
    distance: 10.0,
    moving_time: 2400,
    elapsed_time: 2500,
    total_elevation_gain: 85,
    privacy: 'everyone',
    gear_id: 'shoe_1',
  },
  {
    id: 'act_5',
    sport_type: 'Ride',
    name: 'Commute to Office',
    date: '2025-01-03T08:15:00',
    distance: 12.4,
    moving_time: 1800,
    elapsed_time: 2100,
    total_elevation_gain: 65,
    privacy: 'only_me',
    gear_id: 'bike_1',
    ride_type: 'Commute',
  },
  {
    id: 'act_6',
    sport_type: 'Ride',
    name: 'MTB Trail Session',
    date: '2025-01-02T14:00:00',
    distance: 25.6,
    moving_time: 5400,
    elapsed_time: 7200,
    total_elevation_gain: 650,
    privacy: 'everyone',
    gear_id: 'bike_3',
    ride_type: 'MountainBike',
  },
  {
    id: 'act_7',
    sport_type: 'Run',
    name: 'Long Sunday Run',
    date: '2024-12-29T08:00:00',
    distance: 21.1,
    moving_time: 6300,
    elapsed_time: 6600,
    total_elevation_gain: 180,
    privacy: 'everyone',
    gear_id: 'shoe_3',
  },
  {
    id: 'act_8',
    sport_type: 'VirtualRide',
    name: 'Zwift Race - Watopia',
    date: '2024-12-28T19:00:00',
    distance: 35.2,
    moving_time: 3600,
    elapsed_time: 3650,
    total_elevation_gain: 420,
    privacy: 'everyone',
  },
  {
    id: 'act_9',
    sport_type: 'Ride',
    name: 'New Year Training Ride',
    date: '2025-01-01T10:00:00',
    distance: 65.0,
    moving_time: 9000,
    elapsed_time: 10800,
    total_elevation_gain: 720,
    privacy: 'followers_only',
    gear_id: 'bike_1',
    ride_type: 'Workout',
  },
  {
    id: 'act_10',
    sport_type: 'Run',
    name: 'Hill Repeats',
    date: '2024-12-30T17:30:00',
    distance: 6.5,
    moving_time: 2100,
    elapsed_time: 2400,
    total_elevation_gain: 220,
    privacy: 'everyone',
    gear_id: 'shoe_1',
  },
];

// Helper functions
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function formatDistance(km: number): string {
  return `${km.toFixed(1)} km`;
}

export function formatElevation(meters: number): string {
  return `${meters} m`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getSportIcon(sportType: string): string {
  const icons: Record<string, string> = {
    'Ride': '🚴',
    'Run': '🏃',
    'VirtualRide': '🎮',
    'VirtualRun': '🎮',
    'Swim': '🏊',
    'Walk': '🚶',
    'Hike': '🥾',
  };
  return icons[sportType] || '🏃';
}
