import { useState, useEffect } from 'react';
import { Space, Typography, Table, Tag, Progress, Card, Button, Alert } from 'antd';
import type { ScenarioType, FilterConfig, UpdateConfig, Activity } from '~/types/activity';
import { formatDate, formatDistance, getSportIcon } from '~/utils/formatHelper';
import { runPreview } from '~/engine/previewEngine';
import type { PreviewProgress } from '~/engine/previewEngine';

const { Text, Title } = Typography;

interface PreviewResultsProps {
  scenario: ScenarioType;
  filters: FilterConfig;
  updates: UpdateConfig;
  onStartExecution: () => void;
}

export function PreviewResults({ scenario, filters, updates, onStartExecution }: PreviewResultsProps) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [scanned, setScanned] = useState(0);
  const [matchedActivities, setMatchedActivities] = useState<Activity[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const startPreview = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await runPreview({
          filters,
          onProgress: (progressData: PreviewProgress) => {
            if (!isMounted) return;

            setScanned(progressData.scannedActivities);
            setTotalPages(progressData.currentPage);
            
            // 计算进度百分比
            if (progressData.estimatedTotal) {
              setProgress((progressData.scannedActivities / progressData.estimatedTotal) * 100);
            } else {
              // 如果不知道总数，显示活动状态
              setProgress(progressData.matchedActivities);
            }
          },
        });

        if (!isMounted) return;

        if (result.success) {
          console.log('[PreviewResults] Matched activities:', result.matchedActivities);
          console.log('[PreviewResults] Sample activity:', result.matchedActivities[0]);
          setMatchedActivities(result.matchedActivities);
          setScanned(result.totalScanned);
          setTotalPages(result.totalPages);
          setLoading(false);
        } else {
          setError(result.error || 'Preview scan failed');
          setLoading(false);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('[PreviewResults] Preview failed:', err);
        setError((err as Error).message || 'Preview scan failed');
        setLoading(false);
      }
    };

    startPreview();

    return () => {
      isMounted = false;
    };
  }, [filters]);

  if (loading) {
    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }} align="center">
        <Title level={4}>Scanning and matching activities...</Title>
        <Card style={{ width: '100%' }}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Progress percent={typeof progress === 'number' ? Math.round(progress) : 0} status="active" />
            <Space size="large" style={{ width: '100%', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <Title level={2} style={{ color: '#1890ff', margin: 0 }}>{scanned}</Title>
                <Text type="secondary">Scanned</Text>
              </div>
              <div style={{ textAlign: 'center' }}>
                <Title level={2} style={{ color: '#52c41a', margin: 0 }}>{matchedActivities.length}</Title>
                <Text type="secondary">Matched</Text>
              </div>
              <div style={{ textAlign: 'center' }}>
                <Title level={2} style={{ margin: 0 }}>{totalPages}</Title>
                <Text type="secondary">Pages</Text>
              </div>
            </Space>
          </Space>
        </Card>
      </Space>
    );
  }

  if (error) {
    return (
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Alert
          message="Preview Failed"
          description={error}
          type="error"
          showIcon
        />
        <div>
          <Text>Scanned {scanned} activities, matched {matchedActivities.length}</Text>
        </div>
        {matchedActivities.length > 0 && (
          <div style={{ textAlign: 'right' }}>
            <Button type="primary" onClick={onStartExecution}>
              Continue (with matched activities)
            </Button>
          </div>
        )}
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
      dataIndex: 'start_time',
      key: 'start_time',
      render: (startTime: string) => formatDate(startTime),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Distance',
      dataIndex: 'distance_raw',
      key: 'distance_raw',
      render: (distanceRaw: number) => formatDistance(distanceRaw),
    },
  ];

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <div>
        <Text strong>Matched </Text>
        <Tag color="orange">{matchedActivities.length}</Tag>
        <Text strong>activities (scanned {scanned}, {totalPages} pages)</Text>
      </div>
      <Table
        dataSource={matchedActivities}
        columns={columns}
        rowKey="id"
        size="small"
        pagination={{ pageSize: 10 }}
        scroll={{ y: 250 }}
      />
      <div style={{ textAlign: 'right' }}>
        <Button 
          type="primary" 
          onClick={onStartExecution}
          disabled={matchedActivities.length === 0}
        >
          Start Execution
        </Button>
      </div>
    </Space>
  );
}
