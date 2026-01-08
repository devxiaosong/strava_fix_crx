import { useState } from 'react';
import { Paper, TextInput, Select, Button, Group, Text } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';

interface SearchFilterBarProps {
  onBulkEditClick: () => void;
}

const sportOptions = [
  { value: 'all', label: 'All Sports' },
  { value: 'Ride', label: 'Ride' },
  { value: 'Run', label: 'Run' },
  { value: 'VirtualRide', label: 'Virtual Ride' },
  { value: 'Swim', label: 'Swim' },
];

export function SearchFilterBar({ onBulkEditClick }: SearchFilterBarProps) {
  const [keywords, setKeywords] = useState('');
  const [sport, setSport] = useState<string | null>('all');

  return (
    <Paper shadow="sm" p="md" radius="lg" className="bg-card">
      <Group justify="space-between" align="end">
        <Group gap="md" style={{ flex: 1 }}>
          <TextInput
            placeholder="Keywords"
            value={keywords}
            onChange={(e) => setKeywords(e.currentTarget.value)}
            leftSection={<IconSearch size={16} />}
            style={{ width: 200 }}
          />
          
          <Select
            value={sport}
            onChange={setSport}
            data={sportOptions}
            placeholder="Sport"
            style={{ width: 150 }}
          />
          
          <Button variant="filled" color="indigo">
            Search
          </Button>
        </Group>
        
        <Button 
          variant="outline" 
          color="stravaOrange"
          onClick={onBulkEditClick}
          className="border-strava-orange text-strava-orange hover:bg-strava-orange hover:text-white transition-all"
          radius="xl"
          leftSection={<Text size="sm">⚡</Text>}
        >
          Bulk Edit
        </Button>
      </Group>
    </Paper>
  );
}
