import { Space, Card, Tag, Typography } from 'antd';
import { LockOutlined, CarOutlined, EnvironmentOutlined, TagsOutlined } from '@ant-design/icons';
import type { ScenarioType } from '~/types/activity';

const { Text } = Typography;

interface ScenarioSelectorProps {
  selectedScenario: ScenarioType | null;
  onSelect: (scenario: ScenarioType) => void;
}

const scenarios: { id: ScenarioType; icon: React.ReactNode; title: string; description: string; badge?: string }[] = [
  {
    id: 'privacy',
    icon: <LockOutlined style={{ fontSize: 24 }} />,
    title: '🔒 Adjust Activity Privacy',
    description: 'Batch modify activity visibility (Public, Followers, Only Me)',
  },
  {
    id: 'shoes',
    icon: <EnvironmentOutlined style={{ fontSize: 24 }} />,
    title: '👟 Bulk Update Shoes',
    description: 'Batch assign or change shoes for running activities',
    badge: 'Running Only',
  },
  {
    id: 'bikes',
    icon: <CarOutlined style={{ fontSize: 24 }} />,
    title: '🚴 Bulk Update Bikes',
    description: 'Batch assign or change bikes for cycling activities',
    badge: 'Cycling Only',
  },
  {
    id: 'ride_type',
    icon: <TagsOutlined style={{ fontSize: 24 }} />,
    title: '🏷️ Tag Ride Type',
    description: 'Batch set ride type (Commute, Workout, Race, etc.)',
    badge: 'Cycling Only',
  },
];

export function ScenarioSelector({ selectedScenario, onSelect }: ScenarioSelectorProps) {
  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      
      {scenarios.map((scenario) => (
        <Card
          key={scenario.id}
          hoverable
          onClick={() => onSelect(scenario.id)}
          style={{
            borderColor: selectedScenario === scenario.id ? '#FC4C02' : undefined,
            backgroundColor: selectedScenario === scenario.id ? 'rgba(252, 76, 2, 0.05)' : undefined,
          }}
        >
          <Space align="start" style={{ width: '100%' }}>
            <div style={{ marginTop: 4 }}>
              {scenario.icon}
            </div>
            <div style={{ flex: 1 }}>
              <Space direction="vertical" size={4} style={{ width: '100%' }}>
                <Space>
                  <Text strong>{scenario.title}</Text>
                  {scenario.badge && (
                    <Tag color="blue">{scenario.badge}</Tag>
                  )}
                </Space>
                <Text type="secondary">{scenario.description}</Text>
              </Space>
            </div>
          </Space>
        </Card>
      ))}
    </Space>
  );
}
