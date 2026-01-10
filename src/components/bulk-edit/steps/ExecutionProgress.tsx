import { useState, useEffect, useRef } from 'react';
import { Space, Typography, Progress, Card, Tag, Button, Alert } from 'antd';
import type { ScenarioType, FilterConfig, UpdateConfig } from '~/types/activity';
import { runExecution, pauseExecution, resumeExecution } from '~/engine/executeEngine';
import type { ExecutionProgress as ExecutionProgressData } from '~/engine/executeEngine';
import { formatEstimatedTime } from '~/utils/formatHelper';

const { Text, Title } = Typography;

interface ExecutionProgressProps {
  scenario: ScenarioType;
  filters: FilterConfig;
  updates: UpdateConfig;
  onComplete: () => void;
}

export function ExecutionProgress({ scenario, filters, updates, onComplete }: ExecutionProgressProps) {
  const [progressPercent, setProgressPercent] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [status, setStatus] = useState<string>('preparing');
  const [estimatedTime, setEstimatedTime] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const executionStartedRef = useRef(false);

  useEffect(() => {
    if (executionStartedRef.current) return;
    executionStartedRef.current = true;

    let isMounted = true;

    const startExecution = async () => {
      try {
        const result = await runExecution({
          filters,
          updates,
          onProgress: (progressData: ExecutionProgressData) => {
            if (!isMounted) return;

            setProcessedCount(progressData.processedActivities);
            setSuccessCount(progressData.successfulUpdates);
            setFailedCount(progressData.failedUpdates);
            setSkippedCount(progressData.skippedActivities);
            setCurrentPage(progressData.currentPage);
            setTotalPages(progressData.totalPages);
            setStatus(progressData.status);
            
            if (progressData.estimatedTimeRemaining !== undefined) {
              setEstimatedTime(progressData.estimatedTimeRemaining);
            }

            if (progressData.error) {
              setError(progressData.error);
            }

            // 计算进度百分比
            if (progressData.totalPages > 0) {
              setProgressPercent((progressData.currentPage / progressData.totalPages) * 100);
            } else if (progressData.processedActivities > 0) {
              // 基于已处理的活动数估算
              const total = progressData.processedActivities + progressData.skippedActivities;
              if (total > 0) {
                setProgressPercent((progressData.processedActivities / total) * 100);
              }
            }
          },
          maxRetries: 2,
          continueOnError: true,
        });

        if (!isMounted) return;

        if (result.success || result.successfulUpdates > 0) {
          onComplete();
        } else {
          setError(result.error || 'Execution failed');
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('[ExecutionProgress] Execution failed:', err);
        setError((err as Error).message || 'Execution failed');
      }
    };

    startExecution();

    return () => {
      isMounted = false;
    };
  }, [filters, updates, onComplete]);

  const handlePauseResume = () => {
    if (isPaused) {
      resumeExecution({ filters, updates });
      setIsPaused(false);
    } else {
      pauseExecution();
      setIsPaused(true);
    }
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }} align="center">
      <Title level={4}>
        {status === 'preparing' && 'Preparing...'}
        {status === 'executing' && 'Executing Bulk Update...'}
        {status === 'paused' && 'Execution Paused'}
        {status === 'completed' && 'Execution Complete'}
        {status === 'error' && 'Execution Error'}
      </Title>
      
      {error && (
        <Alert
          message="Error During Execution"
          description={error}
          type="warning"
          showIcon
          closable
          onClose={() => setError(null)}
        />
      )}

      <Card style={{ width: '100%' }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Progress 
            percent={Math.round(progressPercent)} 
            status={status === 'error' ? 'exception' : isPaused ? 'normal' : 'active'} 
          />
          
          <Space size="large" style={{ width: '100%', justifyContent: 'space-around' }}>
            <div style={{ textAlign: 'center' }}>
              <Title level={2} style={{ color: '#1890ff', margin: 0 }}>{processedCount}</Title>
              <Text type="secondary">Processed</Text>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Title level={2} style={{ color: '#52c41a', margin: 0 }}>{successCount}</Title>
              <Text type="secondary">Success</Text>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Title level={2} style={{ color: '#faad14', margin: 0 }}>{skippedCount}</Title>
              <Text type="secondary">Skipped</Text>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Title level={2} style={{ color: '#f5222d', margin: 0 }}>{failedCount}</Title>
              <Text type="secondary">Failed</Text>
            </div>
          </Space>

          <Space size="middle" style={{ width: '100%', justifyContent: 'center' }}>
            <Text type="secondary">
              Page: {currentPage} / {totalPages || '?'}
            </Text>
            {estimatedTime > 0 && (
              <Text type="secondary">
                {formatEstimatedTime(estimatedTime)}
              </Text>
            )}
          </Space>

          <Button 
            type={isPaused ? 'primary' : 'default'}
            onClick={handlePauseResume}
            block
            disabled={status === 'completed' || status === 'error'}
          >
            {isPaused ? 'Resume' : 'Pause'}
          </Button>
        </Space>
      </Card>
    </Space>
  );
}
