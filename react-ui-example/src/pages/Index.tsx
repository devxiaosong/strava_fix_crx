import { useState } from 'react';
import { Container, Stack, Title, Text, Group, Badge } from '@mantine/core';
import { StravaHeader } from '@/components/strava/StravaHeader';
import { SearchFilterBar } from '@/components/strava/SearchFilterBar';
import { ActivityTable } from '@/components/strava/ActivityTable';
import { BulkEditModal } from '@/components/bulk-edit/BulkEditModal';
import { mockActivities } from '@/data/mockData';

const Index = () => {
  const [bulkEditOpen, setBulkEditOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <StravaHeader />
      
      <Container size="xl" py="xl">
        <Stack gap="lg">
          {/* Page Header */}
          <Group justify="space-between" align="center">
            <div>
              <Title order={2} className="text-foreground">My Activities</Title>
              <Text c="dimmed" size="sm">
                Manage and view all your training activities
              </Text>
            </div>
            <Badge color="indigo" variant="light" size="lg">
              {mockActivities.length} Activities
            </Badge>
          </Group>
          
          {/* Search and Filter */}
          <SearchFilterBar onBulkEditClick={() => setBulkEditOpen(true)} />
          
          {/* Activities Table */}
          <ActivityTable activities={mockActivities} />
        </Stack>
      </Container>
      
      {/* Bulk Edit Modal */}
      <BulkEditModal 
        opened={bulkEditOpen} 
        onClose={() => setBulkEditOpen(false)} 
      />
    </div>
  );
};

export default Index;
