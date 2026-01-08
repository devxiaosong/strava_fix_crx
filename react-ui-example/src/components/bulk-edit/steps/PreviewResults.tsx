import { useState, useEffect } from 'react';
import { Stack, Text, Paper, Table, Badge, Button, Group, Skeleton, Progress } from '@mantine/core';
import type { ScenarioType, FilterConfig, UpdateConfig} from '@/types/activity';
import { mockActivities, formatDate, formatDistance, getSportIcon } from '@/data/mockData';

interface PreviewResultsProps {
  scenario: ScenarioType;
  filters: FilterConfig;
  updates: UpdateConfig;
  onStartExecution: () => void;
}

export function PreviewResults({ scenario, filters, updates, onStartExecution }: PreviewResultsProps) {
  const [loading, setLoading] = useState(true);
  const [matchedActivities, setMatchedActivities] = useState(mockActivities);

  useEffect(() => {
    const timer = setTimeout(() => {
      // Simulate filtering
      let filtered = [...mockActivities];
      if (scenario === 'bikes' || scenario === 'ride_type') {
        filtered = filtered.filter(a => a.sport_type === 'Ride');
      } else if (scenario === 'shoes') {
        filtered = filtered.filter(a => a.sport_type === 'Run');
      }
      setMatchedActivities(filtered);
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [scenario]);

  if (loading) {
    return (
      <Stack gap="md">
        <Progress value={65} color="stravaOrange" animated />
        <Text size="sm" c="dimmed" ta="center">正在匹配活动...</Text>
        {[1, 2, 3].map(i => <Skeleton key={i} height={50} radius="md" />)}
      </Stack>
    );
  }

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Text fw={600}>匹配到 <Badge color="stravaOrange">{matchedActivities.length}</Badge> 个活动</Text>
      </Group>
      <Paper withBorder radius="md" style={{ maxHeight: 250, overflow: 'auto' }}>
        <Table highlightOnHover>
          <Table.Thead><Table.Tr>
            <Table.Th>类型</Table.Th><Table.Th>日期</Table.Th><Table.Th>名称</Table.Th><Table.Th>距离</Table.Th>
          </Table.Tr></Table.Thead>
          <Table.Tbody>
            {matchedActivities.map(a => (
              <Table.Tr key={a.id}>
                <Table.Td>{getSportIcon(a.sport_type)}</Table.Td>
                <Table.Td>{formatDate(a.date)}</Table.Td>
                <Table.Td>{a.name}</Table.Td>
                <Table.Td>{formatDistance(a.distance)}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>
      <Button color="stravaOrange" onClick={onStartExecution} className="bg-strava-orange">
        开始执行批量更新
      </Button>
    </Stack>
  );
}
