import { useState } from 'react';
import { Space, Typography, Card, Select, DatePicker, InputNumber, Button, Checkbox, Divider, Tag, Slider } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ScenarioType, FilterConfig as FilterConfigType, UpdateConfig, DateRange, SportType, RideType, PrivacyLevel } from '~/types/activity';
import { mockBikes, mockShoes } from '~/data/mockData';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';

const { Text } = Typography;
const { RangePicker } = DatePicker;

interface FilterConfigProps {
  scenario: ScenarioType;
  onSubmit: (filters: FilterConfigType, updates: UpdateConfig) => void;
  onExecute?: (filters: FilterConfigType, updates: UpdateConfig) => void;
  onPrevious?: () => void;
  initialFilters?: FilterConfigType | null;
  initialUpdates?: UpdateConfig | null;
}

const sportTypeOptions = [
  { value: 'Ride', label: '🚴 Ride' },
  { value: 'Run', label: '🏃 Run' }
];

const rideTypeOptions = [
  { value: 'Road', label: '🛣️ Ride' },
  { value: 'Race', label: '🏁 Race' },
  { value: 'Workout', label: '💪 Workout' }
];

const privacyOptions = [
  { value: 'everyone', label: '🌍 Public (Everyone)' },
  { value: 'followers_only', label: '👥 Followers Only' },
  { value: 'only_me', label: '🔒 Only Me' },
];

export function FilterConfig({ scenario, onSubmit, onExecute, onPrevious, initialFilters, initialUpdates }: FilterConfigProps) {
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
  const [selectedGear, setSelectedGear] = useState<string | undefined>(
    initialUpdates?.gearId || undefined
  );
  const [selectedPrivacy, setSelectedPrivacy] = useState<string | undefined>(
    initialUpdates?.privacy || undefined
  );
  const [selectedRideType, setSelectedRideType] = useState<string | undefined>(
    initialUpdates?.rideType || undefined
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

  const updateDateRange = (id: string, dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    setDateRanges(dateRanges.map(r =>
      r.id === id ? { ...r, start: dates?.[0]?.toDate() || null, end: dates?.[1]?.toDate() || null } : r
    ));
  };

  const maxDistance = scenario === 'shoes' ? 42 : 300;

  const getGearOptions = () => {
    if (scenario === 'bikes') {
      return mockBikes
        .filter(b => !b.retired)
        .map(b => ({ value: b.id, label: `${b.name} (${b.distance.toFixed(0)} mi)` }));
    }
    if (scenario === 'shoes') {
      return mockShoes
        .filter(s => !s.retired)
        .map(s => ({ value: s.id, label: `${s.name} (${s.distance.toFixed(0)} mi)` }));
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
    if (scenario === 'bikes' || scenario === 'ride_type') return '🚴 Ride';
    if (scenario === 'shoes') return '🏃 Run';
    return null;
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card title="📋 Filter Conditions" size="small">
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {/* Sport Type */}
          {getLockedSportType() ? (
            <div>
              <Text strong>Sport: </Text>
              <Tag color="blue">{getLockedSportType()} (Locked)</Tag>
            </div>
          ) : (
            <div>
              <Text strong>Sport</Text>
              <Select
                mode="multiple"
                placeholder="Select sport"
                options={sportTypeOptions}
                value={selectedSportTypes}
                onChange={setSelectedSportTypes}
                style={{ width: '100%', marginTop: 8 }}
              />
            </div>
          )}

          {/* Date Ranges */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text strong>Date Range</Text>
              <Button
                type="link"
                size="small"
                icon={<PlusOutlined />}
                onClick={addDateRange}
              >
                Add Date Range
              </Button>
            </div>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              {dateRanges.map((range) => (
                <Space key={range.id} style={{ width: '100%' }}>
                  <RangePicker
                    value={[
                      range.start ? dayjs(range.start) : null,
                      range.end ? dayjs(range.end) : null
                    ]}
                    onChange={(dates) => updateDateRange(range.id, dates as [dayjs.Dayjs | null, dayjs.Dayjs | null])}
                    style={{ flex: 1 }}
                  />
                  {dateRanges.length > 1 && (
                    <Button
                      type="text"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => removeDateRange(range.id)}
                    />
                  )}
                </Space>
              ))}
            </Space>
          </div>

          {/* Distance Range */}
          {(scenario === 'bikes' || scenario === 'shoes' || scenario === 'ride_type') && (
            <div>
              <Text strong>Distance Range (mi): {distanceRange[0]} - {distanceRange[1]}</Text>
              <div style={{ marginTop: 8 }}>
                <Slider
                  range
                  min={0}
                  max={maxDistance}
                  value={distanceRange}
                  onChange={(value) => setDistanceRange(value as [number, number])}
                  tooltip={{ formatter: (value) => `${value} mi` }}
                />
              </div>
            </div>
          )}

          {/* Ride Type Filter */}
          {scenario === 'bikes' && (
            <div>
              <Text strong>Ride Type Filter</Text>
              <Select
                mode="multiple"
                placeholder="Select ride types to filter"
                options={rideTypeOptions}
                value={selectedRideTypes}
                onChange={setSelectedRideTypes}
                style={{ width: '100%', marginTop: 8 }}
              />
            </div>
          )}
        </Space>
      </Card>

      <Card title="✏️ Update To" size="small">
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {/* Gear Selection */}
          {(scenario === 'bikes' || scenario === 'shoes') && (
            <div>
              <Text strong>{scenario === 'bikes' ? 'Select Bike' : 'Select Shoes'} *</Text>
              <Select
                placeholder={scenario === 'bikes' ? 'Please select a bike to assign' : 'Please select shoes to assign'}
                options={getGearOptions()}
                value={selectedGear}
                onChange={setSelectedGear}
                style={{ width: '100%', marginTop: 8 }}
              />
            </div>
          )}

          {/* Privacy Selection */}
          {scenario === 'privacy' && (
            <div>
              <Text strong>Privacy Settings *</Text>
              <Select
                placeholder="Select new privacy setting"
                options={privacyOptions}
                value={selectedPrivacy}
                onChange={setSelectedPrivacy}
                style={{ width: '100%', marginTop: 8 }}
              />
            </div>
          )}

          {/* Ride Type Selection */}
          {scenario === 'ride_type' && (
            <div>
              <Text strong>Ride Type *</Text>
              <Select
                placeholder="Select ride type"
                options={rideTypeOptions}
                value={selectedRideType}
                onChange={setSelectedRideType}
                style={{ width: '100%', marginTop: 8 }}
              />
            </div>
          )}

          {/* Optional Privacy Update */}
          {scenario !== 'privacy' && (
            <>
              <Checkbox
                checked={updatePrivacyToo}
                onChange={(e) => setUpdatePrivacyToo(e.target.checked)}
              >
                Also update privacy settings
              </Checkbox>
              <Select
                placeholder="Select new privacy setting"
                options={privacyOptions}
                value={selectedPrivacy}
                onChange={setSelectedPrivacy}
                disabled={!updatePrivacyToo}
                style={{ width: '100%' }}
              />
            </>
          )}
        </Space>
      </Card>

      {/* Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
        <Button onClick={onPrevious}>Previous</Button>
        <Space>
          <Button
            color="cyan"
            variant="solid"
            onClick={() => {
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
              onExecute?.(filters, updates);
            }}
            disabled={
              (scenario === 'bikes' && !selectedGear) ||
              (scenario === 'shoes' && !selectedGear) ||
              (scenario === 'privacy' && !selectedPrivacy) ||
              (scenario === 'ride_type' && !selectedRideType)
            }
          >
            Execute Now
          </Button>
          <Button
            type="primary"
            onClick={handleSubmit}
            disabled={
              (scenario === 'bikes' && !selectedGear) ||
              (scenario === 'shoes' && !selectedGear) ||
              (scenario === 'privacy' && !selectedPrivacy) ||
              (scenario === 'ride_type' && !selectedRideType)
            }
          >
            Preview
          </Button>
        </Space>
      </div>
    </Space>
  );
}
