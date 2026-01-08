// Activity types and interfaces for Strava Bulk Edit

export type SportType = 'Ride' | 'Run' | 'Swim' | 'Walk' | 'Hike' | 'VirtualRide' | 'VirtualRun';

export type RideType = 'Race' | 'Workout' | 'Commute' | 'Gravel' | 'MountainBike' | 'Road';

export type PrivacyLevel = 'everyone' | 'followers_only' | 'only_me';

export interface Activity {
  id: string;
  sport_type: SportType;
  name: string;
  date: string;
  distance: number; // in km
  moving_time: number; // in seconds
  elapsed_time: number; // in seconds
  total_elevation_gain: number; // in meters
  privacy: PrivacyLevel;
  gear_id?: string;
  ride_type?: RideType;
}

export interface Gear {
  id: string;
  name: string;
  brand: string;
  model?: string;
  sport_type: 'Ride' | 'Run';
  distance: number; // total distance in km
  retired: boolean;
}

export interface Bike extends Gear {
  sport_type: 'Ride';
  frame_type?: string;
}

export interface Shoe extends Gear {
  sport_type: 'Run';
}

// Bulk Edit Scenario Types
export type ScenarioType = 
  | 'privacy'
  | 'shoes'
  | 'bikes'
  | 'ride_type';

export interface ScenarioConfig {
  id: ScenarioType;
  icon: string;
  title: string;
  description: string;
  sportTypes: SportType[];
}

export interface DateRange {
  id: string;
  start: Date | null;
  end: Date | null;
}

export interface FilterConfig {
  sportTypes: SportType[];
  dateRanges: DateRange[];
  distanceRange: [number, number];
  rideTypes?: RideType[];
}

export interface UpdateConfig {
  gearId?: string;
  privacy?: PrivacyLevel;
  rideType?: RideType;
}

export interface BulkEditTask {
  id: string;
  scenario: ScenarioType;
  filters: FilterConfig;
  updates: UpdateConfig;
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed';
  progress: {
    total: number;
    processed: number;
    success: number;
    failed: number;
  };
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  failedActivities?: { id: string; name: string; error: string }[];
}
