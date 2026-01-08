import { Result, Button, Space, Statistic, Card, Tag } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';

interface ExecutionResultsProps {
  onClose: () => void;
}

export function ExecutionResults({ onClose }: ExecutionResultsProps) {
  return (
    <Result
      icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
      title="Bulk Update Complete"
      extra={
        <Space direction="vertical" size="large" style={{ width: '100%' }} align="center">
          <Card>
            <Space size="large">
              <Statistic title="Success" value={6} valueStyle={{ color: '#3f8600' }} />
              <Statistic title="Failed" value={0} valueStyle={{ color: '#cf1322' }} />
              <Statistic title="Time(s)" value={3.2} valueStyle={{ color: '#cf1322' }} />
            </Space>
          </Card>
          <Button type="primary" onClick={onClose}>
            Close
          </Button>
        </Space>
      }
    />
  );
}
