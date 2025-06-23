import { NavLink as MantineNavLink, Stack, Modal, Text, Button, Group, Center } from '@mantine/core';
import { IconCheck, IconClock, IconLogout, IconShield } from '@tabler/icons-react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate, NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import { useMemo, useState } from 'react';

export function Sidebar() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [logoutModalOpened, setLogoutModalOpened] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setLogoutModalOpened(false);
  };

  const navLinks = useMemo(() => [
    { href: '/dashboard', label: 'Verification Queue', icon: IconClock },
    { href: '/approved-tickets', label: 'Approved Tickets', icon: IconCheck },
    { href: '/protocol-team', label: 'Protocol Team', icon: IconShield },
  ], []);

  return (
    <>
    <Modal
        opened={logoutModalOpened}
        onClose={() => setLogoutModalOpened(false)}
        centered
        withCloseButton={true}
        size="sm"
        padding="xl"
        radius="md"
        styles={{
          content: {
            backgroundColor: 'white',
          },
          header: {
            backgroundColor: 'white',
          },
          close: {
            color: '#B91C1C',
            '&:hover': {
              backgroundColor: '#FEE2E2',
            },
          },
        }}
        overlayProps={{
          blur: 3,
        }}
      >
        <Stack align="center" gap="lg">
            <Center style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: '#B91C1C' }}>
              <IconLogout size={32} color="white" />
            </Center>
          
          <Stack align="center" gap="xs">
            <Text size="xl" fw={700}>Log Out?</Text>
            <Text c="dimmed">You will be log out of your account.</Text>
          </Stack>

          <Group grow w="100%">
            <Button 
              variant="default" 
              onClick={() => setLogoutModalOpened(false)} 
              radius="md"
              styles={{
                root: {
                  '&:hover': {
                    backgroundColor: '#F3F4F6',
                  },
                },
              }}
            >
              Cancel
            </Button>
            <Button 
              color="red" 
              onClick={handleLogout} 
              radius="md" 
              style={{backgroundColor: '#B91C1C'}}
              styles={{
                root: {
                  '&:hover': {
                    backgroundColor: '#991B1B',
                  },
                },
              }}
            >
              Log Out
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Stack>
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.href;
          return (
            <RouterNavLink to={link.href} key={link.href} style={{ textDecoration: 'none' }}>
              <MantineNavLink
                label={link.label}
                leftSection={<Icon size="1rem" stroke={1.5} />}
                active={isActive}
                onClick={() => navigate(link.href)}
                styles={(theme) => ({
                  root: {
                    borderRadius: theme.radius.sm,
                    color: isActive ? theme.colors.blue[9] : theme.colors.gray[7],
                    backgroundColor: isActive ? '#EFF6FF' : 'transparent',
                    fontWeight: isActive ? 500 : 400,
                  },
                  icon: {
                    color: isActive ? theme.colors.blue[9] : theme.colors.gray[7],
                  },
                })}
              />
            </RouterNavLink>
          );
        })}
        <MantineNavLink
          label="Logout"
          leftSection={<IconLogout size="1rem" stroke={1.5} />}
          onClick={() => setLogoutModalOpened(true)}
          variant="subtle"
          styles={(theme) => ({ 
            root: { 
              color: theme.colors.gray[7],
              '&:hover': {
                backgroundColor: 'transparent',
              },
            } 
          })}
        />
      </Stack>
    </>
  );
} 