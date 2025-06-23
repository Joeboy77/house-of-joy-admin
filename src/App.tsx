import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { theme } from './theme';
import { LoginPage } from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ApprovedTicketsPage from './pages/ApprovedTicketsPage';
import { MainLayout } from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import ProtocolTeamPage from './pages/ProtocolTeamPage';

const queryClient = new QueryClient();

function App() {
  return (
    <MantineProvider theme={theme}>
      <Notifications />
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="approved-tickets" element={<ApprovedTicketsPage />} />
              <Route path="protocol-team" element={<ProtocolTeamPage />} />
            </Route>
          </Routes>
        </Router>
      </QueryClientProvider>
    </MantineProvider>
  );
}

export default App;
