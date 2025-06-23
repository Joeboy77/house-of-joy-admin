import { AppShell, Burger, Group, Indicator, Image } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Outlet, Link } from 'react-router-dom';
import { IconBell } from '@tabler/icons-react';
import { Sidebar } from '../components/Sidebar';
import { UserMenu } from '../components/UserMenu';
import logo from '../assets/img/logo.png';

export function MainLayout() {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 250, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
      styles={(theme) => ({
        header: {
          backgroundColor: 'white',
          borderBottom: `1px solid ${theme.colors.gray[2]}`,
        },
        navbar: {
          backgroundColor: 'white',
          borderRight: `1px solid ${theme.colors.gray[2]}`,
        },
        main: {
          backgroundColor: theme.colors.gray[0],
        },
      })}
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Link to="/dashboard">
              <Image src={logo} h={30} alt="House of Joy" visibleFrom="sm" />
            </Link>
          </Group>

          <Group>
            <Indicator inline label="3" size={16}>
                <IconBell size={24} strokeWidth={1.5} />
            </Indicator>
            <UserMenu />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Sidebar />
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
} 