import { Table, Badge, Text, Group, ActionIcon, Tooltip, Paper, Box } from '@mantine/core';
import { IconChevronUp, IconChevronDown, IconEdit, IconTrash, IconLock, IconWorld, IconUsers } from '@tabler/icons-react';
import { useState } from 'react';
import type { Activity, PrivacyLevel } from '@/types/activity';
import { formatDuration, formatDistance, formatElevation, formatDate, getSportIcon } from '@/data/mockData';

interface ActivityTableProps {
  activities: Activity[];
}

type SortField = 'date' | 'distance' | 'moving_time' | 'total_elevation_gain';
type SortDirection = 'asc' | 'desc';

const privacyIcons: Record<PrivacyLevel, React.ReactNode> = {
  everyone: <IconWorld size={14} className="text-green-600" />,
  followers_only: <IconUsers size={14} className="text-blue-600" />,
  only_me: <IconLock size={14} className="text-gray-600" />,
};

const sportColors: Record<string, string> = {
  'Ride': 'orange',
  'Run': 'green',
  'VirtualRide': 'grape',
  'VirtualRun': 'grape',
  'Swim': 'cyan',
  'Walk': 'teal',
  'Hike': 'lime',
};

export function ActivityTable({ activities }: ActivityTableProps) {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedActivities = [...activities].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'date':
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        break;
      case 'distance':
        comparison = a.distance - b.distance;
        break;
      case 'moving_time':
        comparison = a.moving_time - b.moving_time;
        break;
      case 'total_elevation_gain':
        comparison = a.total_elevation_gain - b.total_elevation_gain;
        break;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const SortHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Table.Th 
      style={{ cursor: 'pointer' }}
      onClick={() => handleSort(field)}
    >
      <Group gap="xs" wrap="nowrap">
        {children}
        {sortField === field && (
          sortDirection === 'asc' 
            ? <IconChevronUp size={14} /> 
            : <IconChevronDown size={14} />
        )}
      </Group>
    </Table.Th>
  );

  return (
    <Paper shadow="sm" radius="lg" className="overflow-hidden">
      <Box className="overflow-x-auto">
        <Table highlightOnHover verticalSpacing="md" horizontalSpacing="md">
          <Table.Thead className="bg-secondary">
            <Table.Tr>
              <Table.Th>Sport</Table.Th>
              <SortHeader field="date">Date</SortHeader>
              <Table.Th>Title</Table.Th>
              <SortHeader field="moving_time">Time</SortHeader>
              <SortHeader field="distance">Distance</SortHeader>
              <SortHeader field="total_elevation_gain">Elevation</SortHeader>
              <Table.Th>Privacy</Table.Th>
              <Table.Th style={{ width: 80 }}>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {sortedActivities.map((activity) => (
              <Table.Tr key={activity.id} className="transition-colors">
                <Table.Td>
                  <Badge 
                    color={sportColors[activity.sport_type] || 'gray'} 
                    variant="light"
                    leftSection={<Text size="xs">{getSportIcon(activity.sport_type)}</Text>}
                  >
                    {activity.sport_type}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed">
                    {formatDate(activity.date)}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text 
                    fw={500} 
                    className="text-strava-orange hover:underline cursor-pointer"
                    style={{ maxWidth: 250 }}
                    truncate
                  >
                    {activity.name}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{formatDuration(activity.moving_time)}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" fw={500}>{formatDistance(activity.distance)}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{formatElevation(activity.total_elevation_gain)}</Text>
                </Table.Td>
                <Table.Td>
                  <Tooltip label={activity.privacy.replace('_', ' ')}>
                    <span>{privacyIcons[activity.privacy]}</span>
                  </Tooltip>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <ActionIcon variant="subtle" color="gray" size="sm">
                      <IconEdit size={14} />
                    </ActionIcon>
                    <ActionIcon variant="subtle" color="red" size="sm">
                      <IconTrash size={14} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Box>
    </Paper>
  );
}
