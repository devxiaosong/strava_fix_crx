import { Stack, Paper, Group, Text, Badge, ThemeIcon, UnstyledButton } from '@mantine/core';
import { IconLock, IconShoe, IconBike, IconTag } from '@tabler/icons-react';
import type { ScenarioType } from '@/types/activity';

interface ScenarioSelectorProps {
  selectedScenario: ScenarioType | null;
  onSelect: (scenario: ScenarioType) => void;
}

const scenarios: { id: ScenarioType; icon: React.ReactNode; title: string; description: string; badge?: string }[] = [
  {
    id: 'privacy',
    icon: <IconLock size={24} />,
    title: '🔒 调整活动隐私设置',
    description: '批量修改活动的可见性（公开、仅关注者、仅自己）',
  },
  {
    id: 'shoes',
    icon: <IconShoe size={24} />,
    title: '👟 批量更新跑鞋',
    description: '为跑步活动批量分配或更换跑鞋装备',
    badge: '仅跑步',
  },
  {
    id: 'bikes',
    icon: <IconBike size={24} />,
    title: '🚴 批量更新自行车',
    description: '为骑行活动批量分配或更换自行车装备',
    badge: '仅骑行',
  },
  {
    id: 'ride_type',
    icon: <IconTag size={24} />,
    title: '🏷️ 标记骑行类型',
    description: '批量设置骑行活动的类型（通勤、训练、比赛等）',
    badge: '仅骑行',
  },
];

export function ScenarioSelector({ selectedScenario, onSelect }: ScenarioSelectorProps) {
  return (
    <Stack gap="md">
      <Text size="sm" c="dimmed" mb="xs">
        选择你想要执行的批量操作类型：
      </Text>
      
      {scenarios.map((scenario) => (
        <UnstyledButton key={scenario.id} onClick={() => onSelect(scenario.id)} style={{ width: '100%' }}>
          <Paper
            p="md"
            radius="lg"
            withBorder
            className={`transition-all cursor-pointer hover:shadow-md ${
              selectedScenario === scenario.id 
                ? 'border-strava-orange bg-strava-orange/5 shadow-md' 
                : 'border-border hover:border-primary/30'
            }`}
          >
            <Group gap="md" wrap="nowrap">
              <ThemeIcon 
                size="xl" 
                radius="lg" 
                variant={selectedScenario === scenario.id ? 'filled' : 'light'}
                color={selectedScenario === scenario.id ? 'stravaOrange' : 'indigo'}
              >
                {scenario.icon}
              </ThemeIcon>
              
              <div style={{ flex: 1 }}>
                <Group gap="xs" mb={4}>
                  <Text fw={600}>{scenario.title}</Text>
                  {scenario.badge && (
                    <Badge size="xs" variant="light" color="indigo">
                      {scenario.badge}
                    </Badge>
                  )}
                </Group>
                <Text size="sm" c="dimmed">
                  {scenario.description}
                </Text>
              </div>
              
              {selectedScenario === scenario.id && (
                <Badge color="stravaOrange" variant="filled">
                  已选择
                </Badge>
              )}
            </Group>
          </Paper>
        </UnstyledButton>
      ))}
    </Stack>
  );
}
