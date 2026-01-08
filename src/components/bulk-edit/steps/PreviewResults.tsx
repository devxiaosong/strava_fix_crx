import { useState, useEffect } from 'react';
import { Space, Typography, Table, Tag, Progress, Card, Button } from 'antd';
import type { ScenarioType, FilterConfig, UpdateConfig } from '~/types/activity';
import { mockActivities, formatDate, formatDistance, getSportIcon } from '~/data/mockData';

const { Text, Title } = Typography;

interface PreviewResultsProps {
  scenario: ScenarioType;
  filters: FilterConfig;
  updates: UpdateConfig;
  onStartExecution: () => void;
}

export function PreviewResults({ scenario, onStartExecution }: PreviewResultsProps) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [scanned, setScanned] = useState(0);
  const [matchedActivities, setMatchedActivities] = useState(mockActivities);

  const totalActivities = mockActivities.length;

  useEffect(() => {
    let filtered = [...mockActivities];
    if (scenario === 'bikes' || scenario === 'ride_type') {
      filtered = filtered.filter(a => a.sport_type === 'Ride');
    } else if (scenario === 'shoes') {
      filtered = filtered.filter(a => a.sport_type === 'Run');
    }

    // Simulate scanning progress
    const interval = setInterval(() => {
      setScanned(prev => {
        const next = prev + 1;
        setProgress((next / totalActivities) * 100);

        if (next >= totalActivities) {
          clearInterval(interval);
          setTimeout(() => {
            setMatchedActivities(filtered);
            setLoading(false);
          }, 300);
        }

        return next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [scenario, totalActivities]);

  if (loading) {
    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }} align="center">
        <Title level={4}>Scanning and matching activities...</Title>
        <Card style={{ width: '100%' }}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Progress percent={Math.round(progress)} status="active" />
            <Space size="large" style={{ width: '100%', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <Title level={2} style={{ color: '#1890ff', margin: 0 }}>{scanned}</Title>
                <Text type="secondary">Scanned</Text>
              </div>
              <div style={{ textAlign: 'center' }}>
                <Title level={2} style={{ margin: 0 }}>{totalActivities}</Title>
                <Text type="secondary">Total</Text>
              </div>
            </Space>
          </Space>
        </Card>
      </Space>
    );
  }

  const columns = [
    {
      title: 'Type',
      dataIndex: 'sport_type',
      key: 'sport_type',
      render: (type: string) => getSportIcon(type),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: Date) => formatDate(date),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Distance',
      dataIndex: 'distance',
      key: 'distance',
      render: (distance: number) => formatDistance(distance),
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <div>
        <Text strong>Matched </Text>
        <Tag color="orange">{matchedActivities.length}</Tag>
        <Text strong>activities</Text>
      </div>
      <Table
        dataSource={matchedActivities}
        columns={columns}
        rowKey="id"
        size="small"
        pagination={false}
        scroll={{ y: 250 }}
      />
      <div style={{ textAlign: 'right' }}>
        <Button type="primary" onClick={onStartExecution}>
          Start Execution
        </Button>
      </div>
    </Space>
  );
}
