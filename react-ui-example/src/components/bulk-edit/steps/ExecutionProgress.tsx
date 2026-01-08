import { useState, useEffect } from 'react';
import { Stack, Text, Progress, Paper, Group, Badge, Button } from '@mantine/core';
import type { ScenarioType, FilterConfig, UpdateConfig } from '@/types/activity';
import { mockActivities } from '@/data/mockData';

interface ExecutionProgressProps {
  scenario: ScenarioType;
  filters: FilterConfig;
  updates: UpdateConfig;
  onComplete: () => void;
}

export function ExecutionProgress({ scenario, onComplete }: ExecutionProgressProps) {
  const [progress, setProgress] = useState(0);
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const total = scenario === 'bikes' || scenario === 'ride_type' 
    ? mockActivities.filter(a => a.sport_type === 'Ride').length 
    : scenario === 'shoes' 
    ? mockActivities.filter(a => a.sport_type === 'Run').length 
    : mockActivities.length;

  useEffect(() => {
    if (isPaused) return;
    if (current >= total) {
      onComplete();
      return;
    }
    const timer = setTimeout(() => {
      setCurrent(c => c + 1);
      setProgress(((current + 1) / total) * 100);
    }, 500);
    return () => clearTimeout(timer);
  }, [current, total, isPaused, onComplete]);

  return (
    <Stack gap="lg" align="center">
      <Text fw={600} size="lg">正在执行批量更新...</Text>
      <Paper p="xl" radius="lg" withBorder w="100%">
        <Stack gap="md">
          <Progress value={progress} color="stravaOrange" size="xl" animated />
          <Group justify="center" gap="xl">
            <div className="text-center">
              <Text size="xl" fw={700} className="text-strava-orange">{current}</Text>
              <Text size="xs" c="dimmed">已处理</Text>
            </div>
            <div className="text-center">
              <Text size="xl" fw={700}>{total}</Text>
              <Text size="xs" c="dimmed">总计</Text>
            </div>
            <div className="text-center">
              <Badge color="green" size="lg">{current} 成功</Badge>
            </div>
          </Group>
          <Button 
            variant="outline" 
            color={isPaused ? 'stravaOrange' : 'gray'}
            onClick={() => setIsPaused(!isPaused)}
          >
            {isPaused ? '继续' : '暂停'}
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
}
