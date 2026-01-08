import { Modal, Stepper, Button, Group, Stack, Text, Paper, Box } from '@mantine/core';
import { useState } from 'react';
import { ScenarioSelector } from './steps/ScenarioSelector';
import { FilterConfig } from './steps/FilterConfig';
import { PreviewResults } from './steps/PreviewResults';
import { ExecutionProgress } from './steps/ExecutionProgress';
import { ExecutionResults } from './steps/ExecutionResults';
import type { ScenarioType, FilterConfig as FilterConfigType, UpdateConfig } from '@/types/activity';

interface BulkEditModalProps {
  opened: boolean;
  onClose: () => void;
}

export function BulkEditModal({ opened, onClose }: BulkEditModalProps) {
  const [active, setActive] = useState(0);
  const [selectedScenario, setSelectedScenario] = useState<ScenarioType | null>(null);
  const [filters, setFilters] = useState<FilterConfigType | null>(null);
  const [updates, setUpdates] = useState<UpdateConfig | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionComplete, setExecutionComplete] = useState(false);

  const handleClose = () => {
    // Reset state on close
    setActive(0);
    setSelectedScenario(null);
    setFilters(null);
    setUpdates(null);
    setIsExecuting(false);
    setExecutionComplete(false);
    onClose();
  };

  const nextStep = () => setActive((current) => Math.min(current + 1, 4));
  const prevStep = () => setActive((current) => Math.max(current - 1, 0));

  const handleScenarioSelect = (scenario: ScenarioType) => {
    setSelectedScenario(scenario);
  };

  const handleFilterSubmit = (filterConfig: FilterConfigType, updateConfig: UpdateConfig) => {
    setFilters(filterConfig);
    setUpdates(updateConfig);
    nextStep();
  };

  const handleStartExecution = () => {
    setIsExecuting(true);
    nextStep();
  };

  const handleExecutionComplete = () => {
    setIsExecuting(false);
    setExecutionComplete(true);
    nextStep();
  };

  const getStepContent = () => {
    switch (active) {
      case 0:
        return (
          <ScenarioSelector 
            selectedScenario={selectedScenario} 
            onSelect={handleScenarioSelect} 
          />
        );
      case 1:
        return selectedScenario ? (
          <FilterConfig 
            scenario={selectedScenario} 
            onSubmit={handleFilterSubmit}
            initialFilters={filters}
            initialUpdates={updates}
          />
        ) : null;
      case 2:
        return filters && updates ? (
          <PreviewResults 
            scenario={selectedScenario!}
            filters={filters}
            updates={updates}
            onStartExecution={handleStartExecution}
          />
        ) : null;
      case 3:
        return (
          <ExecutionProgress 
            scenario={selectedScenario!}
            filters={filters!}
            updates={updates!}
            onComplete={handleExecutionComplete}
          />
        );
      case 4:
        return (
          <ExecutionResults 
            onClose={handleClose}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group gap="sm">
          <Text size="lg" fw={600} className="text-primary">⚡ Bulk Edit</Text>
          <Text size="sm" c="dimmed">Pro Tools</Text>
        </Group>
      }
      size="xl"
      radius="lg"
      centered
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
      }}
      styles={{
        content: {
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        },
      }}
      classNames={{
        body: 'animate-slide-up',
      }}
    >
      <Stack gap="lg">
        {/* Stepper */}
        <Stepper 
          active={active} 
          color="stravaOrange"
          size="sm"
          styles={{
            separator: {
              marginLeft: 4,
              marginRight: 4,
            },
          }}
        >
          <Stepper.Step label="选择场景" description="选择操作类型" />
          <Stepper.Step label="配置条件" description="设置筛选和更新" />
          <Stepper.Step label="预览结果" description="确认匹配活动" />
          <Stepper.Step label="执行更新" description="批量处理中" />
          <Stepper.Step label="完成" description="查看结果" />
        </Stepper>

        {/* Step Content */}
        <Paper p="md" radius="md" className="bg-secondary/30 min-h-[300px]">
          <Box className="animate-fade-horizontal" key={active}>
            {getStepContent()}
          </Box>
        </Paper>

        {/* Navigation Buttons */}
        {active < 3 && (
          <Group justify="space-between">
            <Button 
              variant="subtle" 
              color="gray" 
              onClick={active === 0 ? handleClose : prevStep}
            >
              {active === 0 ? '取消' : '上一步'}
            </Button>
            
            {active < 2 && (
              <Button 
                color="stravaOrange"
                onClick={nextStep}
                disabled={active === 0 && !selectedScenario}
                className="bg-strava-orange hover:bg-strava-orange-hover"
              >
                下一步
              </Button>
            )}
          </Group>
        )}
      </Stack>
    </Modal>
  );
}
