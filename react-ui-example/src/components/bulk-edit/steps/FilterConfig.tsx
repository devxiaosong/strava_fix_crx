import { useState, useEffect } from 'react';
import { Stack, Group, Text, Paper, Select, MultiSelect, Button, Slider, Badge, ActionIcon, Divider, Checkbox } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import type { ScenarioType, FilterConfig as FilterConfigType, UpdateConfig, DateRange, SportType, RideType, PrivacyLevel } from '@/types/activity';
import { mockBikes, mockShoes } from '@/data/mockData';
import { v4 as uuidv4 } from 'uuid';

interface FilterConfigProps {
  scenario: ScenarioType;
  onSubmit: (filters: FilterConfigType, updates: UpdateConfig) => void;
  initialFilters?: FilterConfigType | null;
  initialUpdates?: UpdateConfig | null;
}

const sportTypeOptions = [
  { value: 'Ride', label: '🚴 骑行' },
  { value: 'Run', label: '🏃 跑步' },
  { value: 'VirtualRide', label: '🎮 虚拟骑行' },
  { value: 'VirtualRun', label: '🎮 虚拟跑步' },
  { value: 'Swim', label: '🏊 游泳' },
  { value: 'Walk', label: '🚶 步行' },
  { value: 'Hike', label: '🥾 徒步' },
];

const rideTypeOptions = [
  { value: 'Race', label: '🏁 比赛' },
  { value: 'Workout', label: '💪 训练' },
  { value: 'Commute', label: '🏢 通勤' },
  { value: 'Gravel', label: '🪨 砾石' },
  { value: 'MountainBike', label: '⛰️ 山地' },
  { value: 'Road', label: '🛣️ 公路' },
];

const privacyOptions = [
  { value: 'everyone', label: '🌍 公开 (所有人可见)' },
  { value: 'followers_only', label: '👥 仅关注者' },
  { value: 'only_me', label: '🔒 仅自己' },
];

export function FilterConfig({ scenario, onSubmit, initialFilters, initialUpdates }: FilterConfigProps) {
  // Initialize date ranges with a default empty range
  const [dateRanges, setDateRanges] = useState<DateRange[]>(
    initialFilters?.dateRanges || [{ id: uuidv4(), start: null, end: null }]
  );
  const [distanceRange, setDistanceRange] = useState<[number, number]>(
    initialFilters?.distanceRange || [0, scenario === 'shoes' ? 40 : 300]
  );
  const [selectedSportTypes, setSelectedSportTypes] = useState<string[]>(
    initialFilters?.sportTypes || []
  );
  const [selectedRideTypes, setSelectedRideTypes] = useState<string[]>(
    (initialFilters?.rideTypes as string[]) || []
  );

  // Update values
  const [selectedGear, setSelectedGear] = useState<string | null>(
    initialUpdates?.gearId || null
  );
  const [selectedPrivacy, setSelectedPrivacy] = useState<string | null>(
    initialUpdates?.privacy || null
  );
  const [selectedRideType, setSelectedRideType] = useState<string | null>(
    initialUpdates?.rideType || null
  );
  const [updatePrivacyToo, setUpdatePrivacyToo] = useState(false);

  const addDateRange = () => {
    setDateRanges([...dateRanges, { id: uuidv4(), start: null, end: null }]);
  };

  const removeDateRange = (id: string) => {
    if (dateRanges.length > 1) {
      setDateRanges(dateRanges.filter(r => r.id !== id));
    }
  };

  const updateDateRange = (id: string, field: 'start' | 'end', value: Date | null) => {
    setDateRanges(dateRanges.map(r => 
      r.id === id ? { ...r, [field]: value } : r
    ));
  };

  const maxDistance = scenario === 'shoes' ? 42 : 300;

  const getGearOptions = () => {
    if (scenario === 'bikes') {
      return mockBikes
        .filter(b => !b.retired)
        .map(b => ({ value: b.id, label: `${b.name} (${b.distance.toFixed(0)} km)` }));
    }
    if (scenario === 'shoes') {
      return mockShoes
        .filter(s => !s.retired)
        .map(s => ({ value: s.id, label: `${s.name} (${s.distance.toFixed(0)} km)` }));
    }
    return [];
  };

  const handleSubmit = () => {
    const filters: FilterConfigType = {
      sportTypes: selectedSportTypes as SportType[],
      dateRanges,
      distanceRange,
      rideTypes: selectedRideTypes as RideType[],
    };

    const updates: UpdateConfig = {
      gearId: selectedGear || undefined,
      privacy: (updatePrivacyToo || scenario === 'privacy') ? selectedPrivacy as PrivacyLevel : undefined,
      rideType: selectedRideType as RideType,
    };

    onSubmit(filters, updates);
  };

  const getLockedSportType = () => {
    if (scenario === 'bikes' || scenario === 'ride_type') return '🚴 骑行';
    if (scenario === 'shoes') return '🏃 跑步';
    return null;
  };

  return (
    <Stack gap="lg">
      {/* Filter Section */}
      <div>
        <Text fw={600} mb="sm">📋 筛选条件</Text>
        <Paper p="md" radius="md" withBorder>
          <Stack gap="md">
            {/* Sport Type */}
            {getLockedSportType() ? (
              <Group>
                <Text size="sm" w={100}>运动类型</Text>
                <Badge color="indigo" variant="light" size="lg">
                  {getLockedSportType()} (已锁定)
                </Badge>
              </Group>
            ) : (
              <MultiSelect
                label="运动类型"
                placeholder="选择运动类型"
                data={sportTypeOptions}
                value={selectedSportTypes}
                onChange={setSelectedSportTypes}
              />
            )}

            {/* Date Ranges */}
            <div>
              <Group justify="space-between" mb="xs">
                <Text size="sm" fw={500}>时间范围</Text>
                <Button 
                  variant="subtle" 
                  size="xs" 
                  leftSection={<IconPlus size={14} />}
                  onClick={addDateRange}
                >
                  添加时间段
                </Button>
              </Group>
              <Stack gap="xs">
                {dateRanges.map((range, index) => (
                  <Group key={range.id} gap="sm">
                    <DatePickerInput
                      placeholder="开始日期"
                      value={range.start}
                      onChange={(v) => updateDateRange(range.id, 'start', v)}
                      style={{ flex: 1 }}
                      size="sm"
                      clearable
                    />
                    <Text size="sm" c="dimmed">至</Text>
                    <DatePickerInput
                      placeholder="结束日期"
                      value={range.end}
                      onChange={(v) => updateDateRange(range.id, 'end', v)}
                      style={{ flex: 1 }}
                      size="sm"
                      clearable
                    />
                    {dateRanges.length > 1 && (
                      <ActionIcon 
                        variant="subtle" 
                        color="red" 
                        size="sm"
                        onClick={() => removeDateRange(range.id)}
                      >
                        <IconTrash size={14} />
                      </ActionIcon>
                    )}
                  </Group>
                ))}
              </Stack>
            </div>

            {/* Distance Range */}
            {(scenario === 'bikes' || scenario === 'shoes' || scenario === 'ride_type') && (
              <div>
                <Group justify="space-between" mb="xs">
                  <Text size="sm" fw={500}>距离范围</Text>
                  <Text size="sm" c="dimmed">
                    {distanceRange[0]} - {distanceRange[1]} km
                  </Text>
                </Group>
                <Group gap="md" grow>
                  <Slider
                    label="最小距离"
                    value={distanceRange[0]}
                    onChange={(v) => setDistanceRange([v, distanceRange[1]])}
                    min={0}
                    max={maxDistance}
                    color="stravaOrange"
                  />
                  <Slider
                    label="最大距离"
                    value={distanceRange[1]}
                    onChange={(v) => setDistanceRange([distanceRange[0], v])}
                    min={0}
                    max={maxDistance}
                    color="stravaOrange"
                  />
                </Group>
              </div>
            )}

            {/* Ride Type Filter (for bikes and ride_type scenarios) */}
            {(scenario === 'bikes') && (
              <MultiSelect
                label="骑行类型筛选"
                placeholder="选择要筛选的骑行类型"
                data={rideTypeOptions}
                value={selectedRideTypes}
                onChange={setSelectedRideTypes}
              />
            )}
          </Stack>
        </Paper>
      </div>

      <Divider />

      {/* Update Section */}
      <div>
        <Text fw={600} mb="sm">✏️ 更新内容</Text>
        <Paper p="md" radius="md" withBorder>
          <Stack gap="md">
            {/* Gear Selection */}
            {(scenario === 'bikes' || scenario === 'shoes') && (
              <Select
                label={scenario === 'bikes' ? '选择自行车' : '选择跑鞋'}
                placeholder={scenario === 'bikes' ? '请选择要分配的自行车' : '请选择要分配的跑鞋'}
                data={getGearOptions()}
                value={selectedGear}
                onChange={setSelectedGear}
                required
              />
            )}

            {/* Privacy Selection */}
            {scenario === 'privacy' && (
              <Select
                label="隐私设置"
                placeholder="选择新的隐私设置"
                data={privacyOptions}
                value={selectedPrivacy}
                onChange={setSelectedPrivacy}
                required
              />
            )}

            {/* Ride Type Selection */}
            {scenario === 'ride_type' && (
              <Select
                label="骑行类型"
                placeholder="选择骑行类型"
                data={rideTypeOptions}
                value={selectedRideType}
                onChange={setSelectedRideType}
                required
              />
            )}

            {/* Optional Privacy Update */}
            {scenario !== 'privacy' && (
              <>
                <Checkbox
                  label="同时更新隐私设置"
                  checked={updatePrivacyToo}
                  onChange={(e) => setUpdatePrivacyToo(e.currentTarget.checked)}
                />
                {updatePrivacyToo && (
                  <Select
                    label="隐私设置"
                    placeholder="选择新的隐私设置"
                    data={privacyOptions}
                    value={selectedPrivacy}
                    onChange={setSelectedPrivacy}
                  />
                )}
              </>
            )}
          </Stack>
        </Paper>
      </div>

      <Group justify="flex-end">
        <Button 
          color="stravaOrange"
          onClick={handleSubmit}
          disabled={
            (scenario === 'bikes' && !selectedGear) ||
            (scenario === 'shoes' && !selectedGear) ||
            (scenario === 'privacy' && !selectedPrivacy) ||
            (scenario === 'ride_type' && !selectedRideType)
          }
          className="bg-strava-orange hover:bg-strava-orange-hover"
        >
          预览匹配结果
        </Button>
      </Group>
    </Stack>
  );
}
