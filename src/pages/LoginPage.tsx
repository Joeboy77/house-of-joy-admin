import {
  Paper,
  TextInput,
  PasswordInput,
  Checkbox,
  Button,
  Title,
  Text,
  Container,
  Group,
  Stack,
  Center,
  Image,
  Box,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authService';
import { useAuthStore } from '../store/useAuthStore';
import logo from '../assets/img/i.png';
import { getErrorMessage } from '../utils/errorUtils';
import type { LoginRequest } from '../types';

export function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [loading, { toggle }] = useDisclosure(false);

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (value.length >= 6 ? null : 'Password must have at least 6 characters'),
    },
  });

  const handleSubmit = async (values: Omit<LoginRequest, 'password'> & { password: string }) => {
    toggle();
    try {
      const data = await login({ email: values.email, password: values.password });
      setAuth(data);
      notifications.show({
        title: 'Login Successful',
        message: 'Welcome back!',
        color: 'green',
      });
      navigate('/dashboard');
    } catch (error) {
      notifications.show({
        title: 'Login Failed',
        message: getErrorMessage(error),
        color: 'red',
      });
    } finally {
      toggle();
    }
  };

  return (
    <Box
      bg="white"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Container size={420} my={40} w="100%">
        <Paper
          shadow="md"
          p={30}
          radius="md"
          style={(theme) => ({
            backgroundColor: theme.colors.brandDark[5], 
          })}
        >
          <Stack align="center" gap="md">
            <Center
              style={(theme) => ({
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: theme.colors.brand[5], // #AC0F0F
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
              })}
            >
              <Image src={logo} h={40} w={40} alt="House of Joy Logo" />
            </Center>
            <Title order={2} ta="center" c="white">
              Admin Login
            </Title>
            <Text c="dimmed" size="sm" ta="center">
              Access your admin dashboard
            </Text>
          </Stack>

          <form onSubmit={form.onSubmit(handleSubmit)} style={{ marginTop: 30 }}>
            <Stack>
              <TextInput
                label="Email Address"
                placeholder="admin@example.com"
                required
                {...form.getInputProps('email')}
                styles={{
                  input: { backgroundColor: 'white', color: 'black' },
                  label: { color: 'white', fontWeight: 400, fontSize: 'var(--mantine-font-size-xs)' },
                }}
              />
              <PasswordInput
                label="Password"
                placeholder="Enter your password"
                required
                mt="md"
                {...form.getInputProps('password')}
                styles={{
                  input: { backgroundColor: 'white', color: 'black' },
                  label: { color: 'white', fontWeight: 400, fontSize: 'var(--mantine-font-size-xs)' },
                }}
              />
              <Group justify="space-between" mt="sm">
                <Checkbox
                  label="Remember me"
                  {...form.getInputProps('rememberMe', { type: 'checkbox' })}
                  styles={{ label: { color: 'white', fontSize: 'var(--mantine-font-size-xs)' }, input: { borderColor: '#ccc' } }}
                />
              </Group>
              <Button
                fullWidth
                mt="xl"
                type="submit"
                color="brand.5" // #AC0F0F
                loading={loading}
              >
                Sign In
              </Button>
            </Stack>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}

export default LoginPage; 