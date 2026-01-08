import { useState, useEffect } from 'react';
import { Space, Typography, Progress, Card, Tag, Button } from 'antd';
import type { ScenarioType, FilterConfig, UpdateConfig } from '~/types/activity';
import { mockActivities } from '~/data/mockData';

const { Text, Title } = Typography;

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
    <Space direction="vertical" size="large" style={{ width: '100%' }} align="center">
      <Title level={4}>Executing bulk update...</Title>
      <Card style={{ width: '100%' }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Progress percent={Math.round(progress)} status="active" />
          <Space size="large" style={{ width: '100%', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <Title level={2} style={{ color: '#1890ff', margin: 0 }}>{current}</Title>
              <Text type="secondary">Processed</Text>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Title level={2} style={{ margin: 0 }}>{total}</Title>
              <Text type="secondary">Total</Text>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Tag color="success" style={{ fontSize: 16, padding: '4px 12px' }}>{current} Success</Tag>
            </div>
          </Space>
          <Button 
            type={isPaused ? 'primary' : 'default'}
            onClick={() => setIsPaused(!isPaused)}
            block
          >
            {isPaused ? 'Continue' : 'Pause'}
          </Button>
        </Space>
      </Card>
    </Space>
  );
}
