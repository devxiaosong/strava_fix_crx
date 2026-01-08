import { Group, Text, Anchor, Container, ActionIcon, Menu, Avatar, UnstyledButton, Box } from '@mantine/core';
import { IconSearch, IconBell, IconPlus, IconChevronDown } from '@tabler/icons-react';

const navItems = [
  { label: 'Dashboard', href: '#' },
  { label: 'Training', href: '#' },
  { label: 'Maps', href: '#' },
  { label: 'Challenges', href: '#' },
];

export function StravaHeader() {
  return (
    <Box className="bg-white border-b border-border sticky top-0 z-50">
      <Container size="xl">
        <Group h={56} justify="space-between">
          {/* Logo */}
          <Group gap="xl">
            <Text fw={700} size="xl" className="text-strava-orange">
              STRAVA
            </Text>
            
            {/* Navigation */}
            <Group gap="lg" visibleFrom="sm">
              {navItems.map((item) => (
                <Anchor
                  key={item.label}
                  href={item.href}
                  underline="never"
                  className="text-foreground hover:text-strava-orange transition-colors font-medium text-sm"
                >
                  {item.label}
                </Anchor>
              ))}
            </Group>
          </Group>
          
          {/* Right side */}
          <Group gap="md">
            <ActionIcon variant="subtle" color="gray" size="lg">
              <IconSearch size={20} />
            </ActionIcon>
            
            <ActionIcon variant="subtle" color="gray" size="lg">
              <IconBell size={20} />
            </ActionIcon>
            
            <ActionIcon 
              variant="filled" 
              color="stravaOrange" 
              size="lg" 
              radius="xl"
              className="bg-strava-orange hover:bg-strava-orange-hover"
            >
              <IconPlus size={18} />
            </ActionIcon>
            
            <Menu shadow="md" width={200}>
              <Menu.Target>
                <UnstyledButton>
                  <Group gap="xs">
                    <Avatar 
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=strava" 
                      size="sm" 
                      radius="xl" 
                    />
                    <IconChevronDown size={14} className="text-muted-foreground" />
                  </Group>
                </UnstyledButton>
              </Menu.Target>
              
              <Menu.Dropdown>
                <Menu.Item>My Profile</Menu.Item>
                <Menu.Item>Settings</Menu.Item>
                <Menu.Divider />
                <Menu.Item color="red">Log Out</Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </Container>
    </Box>
  );
}
