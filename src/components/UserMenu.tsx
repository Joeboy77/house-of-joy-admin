import { Menu, Group, Avatar, Text, rem } from '@mantine/core';
import { IconLogout, IconUserCircle } from '@tabler/icons-react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

export function UserMenu() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <Group style={{ cursor: 'pointer' }}>
          <Avatar color="brand.5" radius="xl">
            <IconUserCircle size={24} />
          </Avatar>
          <div style={{ flex: 1 }}>
            <Text size="sm" fw={500}>
              {user?.email || 'Admin User'}
            </Text>
            <Text c="dimmed" size="xs">
              {user?.role || 'Administrator'}
            </Text>
          </div>
        </Group>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Application</Menu.Label>
        <Menu.Item
          leftSection={<IconLogout style={{ width: rem(14), height: rem(14) }} />}
          onClick={handleLogout}
        >
          Logout
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
} 