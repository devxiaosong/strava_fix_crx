import { Stack, Text, Paper, Group, Badge, Button, ThemeIcon } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';

interface ExecutionResultsProps {
  onClose: () => void;
}

export function ExecutionResults({ onClose }: ExecutionResultsProps) {
  return (
    <Stack gap="lg" align="center">
      <ThemeIcon size={80} radius="xl" color="green" variant="light">
        <IconCheck size={40} />
      </ThemeIcon>
      <Text fw={600} size="xl">批量更新完成！</Text>
      <Paper p="xl" radius="lg" withBorder>
        <Group gap="xl" justify="center">
          <div className="text-center">
            <Text size="xl" fw={700} c="green">6</Text>
            <Text size="sm" c="dimmed">成功</Text>
          </div>
          <div className="text-center">
            <Text size="xl" fw={700} c="red">0</Text>
            <Text size="sm" c="dimmed">失败</Text>
          </div>
          <div className="text-center">
            <Badge color="indigo" size="lg">3.2 秒</Badge>
            <Text size="sm" c="dimmed">总耗时</Text>
          </div>
        </Group>
      </Paper>
      <Button color="stravaOrange" onClick={onClose} className="bg-strava-orange">
        完成并关闭
      </Button>
    </Stack>
  );
}
