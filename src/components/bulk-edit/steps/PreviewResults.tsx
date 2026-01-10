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
          setMatchedActivities(result.matchedActivities);
          setScanned(result.totalScanned);
          setTotalPages(result.totalPages);
          setLoading(false);
        } else {
          setError(result.error || '预览扫描失败');
          setLoading(false);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('[PreviewResults] Preview failed:', err);
        setError((err as Error).message || '预览扫描失败');
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
        <Title level={4}>扫描并匹配活动中...</Title>
        <Card style={{ width: '100%' }}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Progress percent={typeof progress === 'number' ? Math.round(progress) : 0} status="active" />
            <Space size="large" style={{ width: '100%', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <Title level={2} style={{ color: '#1890ff', margin: 0 }}>{scanned}</Title>
                <Text type="secondary">已扫描</Text>
              </div>
              <div style={{ textAlign: 'center' }}>
                <Title level={2} style={{ color: '#52c41a', margin: 0 }}>{matchedActivities.length}</Title>
                <Text type="secondary">已匹配</Text>
              </div>
              <div style={{ textAlign: 'center' }}>
                <Title level={2} style={{ margin: 0 }}>{totalPages}</Title>
                <Text type="secondary">页数</Text>
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
          message="预览失败"
          description={error}
          type="error"
          showIcon
        />
        <div>
          <Text>已扫描 {scanned} 个活动，匹配 {matchedActivities.length} 个</Text>
        </div>
        {matchedActivities.length > 0 && (
          <div style={{ textAlign: 'right' }}>
            <Button type="primary" onClick={onStartExecution}>
              继续执行（基于已匹配的活动）
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
        <Text strong>匹配到 </Text>
        <Tag color="orange">{matchedActivities.length}</Tag>
        <Text strong>个活动（共扫描 {scanned} 个，{totalPages} 页）</Text>
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
          开始执行更新
        </Button>
      </div>
    </Space>
  );
}
