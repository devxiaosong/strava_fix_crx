import { Modal, Steps, Button, Space, Typography } from 'antd';
import { useState } from 'react';
import { ScenarioSelector } from './steps/ScenarioSelector';
import { FilterConfig } from './steps/FilterConfig';
import { PreviewResults } from './steps/PreviewResults';
import { ExecutionProgress } from './steps/ExecutionProgress';
import { ExecutionResults } from './steps/ExecutionResults';
import type { ScenarioType, FilterConfig as FilterConfigType, UpdateConfig } from '~/types/activity';

const { Title, Text } = Typography;

interface BulkEditModalProps {
  open: boolean;
  onClose: () => void;
}

export function BulkEditModal({ open, onClose }: BulkEditModalProps) {
  const [current, setCurrent] = useState(0);
  const [selectedScenario, setSelectedScenario] = useState<ScenarioType | null>(null);
  const [filters, setFilters] = useState<FilterConfigType | null>(null);
  const [updates, setUpdates] = useState<UpdateConfig | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionComplete, setExecutionComplete] = useState(false);

  const handleClose = () => {
    // Reset state on close
    setCurrent(0);
    setSelectedScenario(null);
    setFilters(null);
    setUpdates(null);
    setIsExecuting(false);
    setExecutionComplete(false);
    onClose();
  };

  const next = () => setCurrent((c) => Math.min(c + 1, 4));
  const prev = () => setCurrent((c) => Math.max(c - 1, 0));

  const handleScenarioSelect = (scenario: ScenarioType) => {
    setSelectedScenario(scenario);
  };

  const handleFilterSubmit = (filterConfig: FilterConfigType, updateConfig: UpdateConfig) => {
    setFilters(filterConfig);
    setUpdates(updateConfig);
    next(); // Go to preview
  };

  const handleFilterExecute = (filterConfig: FilterConfigType, updateConfig: UpdateConfig) => {
    setFilters(filterConfig);
    setUpdates(updateConfig);
    setCurrent(3); // Skip preview, go directly to execution
    setIsExecuting(true);
  };

  const handleStartExecution = () => {
    setIsExecuting(true);
    next();
  };

  const handleExecutionComplete = () => {
    setIsExecuting(false);
    setExecutionComplete(true);
    next();
  };

  const steps = [
    { title: 'Select Scenario' },
    { title: 'Configure Filters' },
    { title: 'Preview Results' },
    { title: 'Execute Update' },
    { title: 'Complete' },
  ];

  const getStepContent = () => {
    switch (current) {
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
            onExecute={handleFilterExecute}
            onPrevious={prev}
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
      open={open}
      onCancel={handleClose}
      title={
        <Space>
          <Title level={4} style={{ margin: 0 }}>⚡ Bulk Edit</Title>
          <Text type="secondary">Pro Tools</Text>
        </Space>
      }
      width={900}
      centered
      footer={
        current === 0 ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <Button onClick={handleClose}>Cancel</Button>
            <Button 
              type="primary"
              onClick={next}
              disabled={!selectedScenario}
            >
              Next
            </Button>
          </div>
        ) : null
      }
      styles={{
        body: { minHeight: 400 },
      }}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Steps current={current} items={steps} size="small" />
        
        <div style={{ minHeight: 300 }}>
          {getStepContent()}
        </div>
      </Space>
    </Modal>
  );
}
