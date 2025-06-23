import React from 'react';
import { Container, Grid, Paper, Title, Text, Group, Badge, Select, Table, Avatar, Pagination, Button, Loader, Center, Alert, Modal, Stack, Divider } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { getDashboardStats, getApprovedTickets } from '../services/submissionService';
import type { DashboardStats } from '../types';
import { IconUsers, IconBuildingStore, IconReceipt, IconCreditCard, IconEye, IconAlertCircle, IconDownload } from '@tabler/icons-react';
import { keepPreviousData } from '@tanstack/react-query'

// Define a type for a single ticket
interface Ticket {
    id: string;
    fullName: string;
    email: string;
    ticketType: 'STUDENT' | 'NON_STUDENT';
    amount: number;
    paymentMethod: 'mobile_money' | 'card';
    phoneNumber: string;
    paymentReference?: string;
    createdAt: string;
    ticketCode?: string;
    institutionName?: string;
    courseOfStudy?: string;
    studentIdNumber?: string;
    verificationStatus?: string;
    qrCodeUrl?: string;
}

// Define a type for the paginated API response
interface PaginatedTickets {
    content: Ticket[];
    totalPages: number;
    totalElements: number;
    numberOfElements: number;
}

function StatCard({ title, value, subValue, icon: Icon, color }: { title: string, value: string | number, subValue: string, icon: React.ElementType, color: string }) {
    return (
        <Paper withBorder p="md" radius="md" bg="white" style={{ borderColor: '#E5E7EB' }}>
            <Group justify="space-between">
                <div>
                    <Text c="#4B5563" tt="uppercase" fw={700} fz="xs">
                        {title}
                    </Text>
                    <Text fw={700} fz="xl" c={color}>
                        {value}
                    </Text>
                    <Text c="#4B5563" fz="sm">
                        {subValue}
                    </Text>
                </div>
                <Icon size="2rem" color={color} stroke={1.5} />
            </Group>
        </Paper>
    );
}

function TicketDetailsModal({ ticket, opened, onClose }: { ticket: Ticket | null, opened: boolean, onClose: () => void }) {
    if (!ticket) return null;

    return (
        <Modal opened={opened} onClose={onClose} title="Ticket Details" size="lg" centered bg="white">
            <Stack gap="md">
                <Group>
                    <Avatar size={60} src={`https://ui-avatars.com/api/?name=${ticket.fullName}&background=random`} radius={60} />
                    <div>
                        <Text fw={600} fz="lg" c="#4B5563">{ticket.fullName}</Text>
                        <Text c="dimmed">{ticket.email}</Text>
                        <Badge color={ticket.ticketType === 'STUDENT' ? 'blue' : 'violet'} variant="light">
                            {ticket.ticketType.replace('_', ' ')}
                        </Badge>
                    </div>
                </Group>

                <Divider />

                <Grid>
                    <Grid.Col span={6}>
                        <Text fw={500} c="#4B5563">Ticket Code</Text>
                        <Text c="#4B5563">{ticket.ticketCode || 'N/A'}</Text>
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <Text fw={500} c="#4B5563">Amount</Text>
                        <Text fw={600} c="#4B5563">Gh {ticket.amount.toFixed(2)}</Text>
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <Text fw={500} c="#4B5563">Payment Method</Text>
                        <Text c="#4B5563">{ticket.paymentMethod ? ticket.paymentMethod.replace('_', ' ') : 'N/A'}</Text>
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <Text fw={500} c="#4B5563">Phone Number</Text>
                        <Text c="#4B5563">{ticket.phoneNumber}</Text>
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <Text fw={500} c="#4B5563">Payment Reference</Text>
                        <Text c="#4B5563">{ticket.paymentReference || 'N/A'}</Text>
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <Text fw={500} c="#4B5563">Created Date</Text>
                        <Text c="#4B5563">{new Date(ticket.createdAt).toLocaleDateString()}</Text>
                    </Grid.Col>
                </Grid>

                {ticket.ticketType === 'STUDENT' && (
                    <>
                        <Divider />
                        <Text fw={600} c="#4B5563">Student Information</Text>
                        <Grid>
                            <Grid.Col span={6}>
                                <Text fw={500} c="#4B5563">Institution</Text>
                                <Text c="#4B5563">{ticket.institutionName || 'N/A'}</Text>
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Text fw={500} c="#4B5563">Course of Study</Text>
                                <Text c="#4B5563">{ticket.courseOfStudy || 'N/A'}</Text>
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Text fw={500} c="#4B5563">Student ID</Text>
                                <Text c="#4B5563">{ticket.studentIdNumber || 'N/A'}</Text>
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <Text fw={500} c="#4B5563">Verification Status</Text>
                                <Badge color="green" variant="light">{ticket.verificationStatus || 'N/A'}</Badge>
                            </Grid.Col>
                        </Grid>
                    </>
                )}

                {ticket.qrCodeUrl && (
                    <>
                        <Divider />
                        <Text fw={600} c="#4B5563">QR Code</Text>
                        <Center>
                            <img src={ticket.qrCodeUrl} alt="QR Code" style={{ maxWidth: '200px' }} />
                        </Center>
                    </>
                )}
            </Stack>
        </Modal>
    );
}

function ApprovedTicketsPage() {
  const [activePage, setPage] = React.useState(1);
  const [ticketTypeFilter, setTicketTypeFilter] = React.useState<string | null>('');
  const [paymentMethodFilter, setPaymentMethodFilter] = React.useState<string | null>('');
  const [selectedTicket, setSelectedTicket] = React.useState<Ticket | null>(null);
  const [modalOpened, setModalOpened] = React.useState(false);

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ['dashboardStats'],
    queryFn: getDashboardStats,
  });

  const { data: ticketsData, isLoading: isLoadingTickets, isError, error } = useQuery<PaginatedTickets, Error>({
      queryKey: ['approvedTickets', activePage, ticketTypeFilter, paymentMethodFilter],
      queryFn: () => getApprovedTickets({ page: activePage - 1, size: 10, ticketType: ticketTypeFilter, paymentMethod: paymentMethodFilter }),
      placeholderData: keepPreviousData,
  });

  const handleDownload = () => {
    if (!ticketsData?.content) return;
    
    // Create CSV content
    const headers = ['Name', 'Email', 'Type', 'Amount', 'Payment Method', 'Phone', 'Reference', 'Date'];
    const csvContent = [
      headers.join(','),
      ...ticketsData.content.map(ticket => [
        ticket.fullName,
        ticket.email,
        ticket.ticketType.replace('_', ' '),
        ticket.amount.toFixed(2),
        ticket.paymentMethod ? ticket.paymentMethod.replace('_', ' ') : 'N/A',
        ticket.phoneNumber,
        ticket.paymentReference || 'N/A',
        new Date(ticket.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `approved-tickets-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const openTicketModal = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setModalOpened(true);
  };
  
  const rows = ticketsData?.content?.map((ticket: Ticket) => (
    <Table.Tr key={ticket.id} style={{ borderColor: '#E5E7EB' }}>
      <Table.Td style={{ borderColor: '#E5E7EB' }}>
        <Group gap="sm">
          <Avatar size={40} src={`https://ui-avatars.com/api/?name=${ticket.fullName}&background=random`} radius={40} />
          <div>
            <Text fz="sm" fw={500} c="#4B5563">
              {ticket.fullName}
            </Text>
            <Text fz="xs" c="dimmed">
              {ticket.email}
            </Text>
          </div>
        </Group>
      </Table.Td>
      <Table.Td style={{ borderColor: '#E5E7EB' }}>
        <Badge color={ticket.ticketType === 'STUDENT' ? 'blue' : 'violet'} variant="light">
            {ticket.ticketType.replace('_', ' ')}
        </Badge>
      </Table.Td>
      <Table.Td c="#4B5563" style={{ borderColor: '#E5E7EB' }}>{ticket.amount.toFixed(2)}</Table.Td>
      <Table.Td c="#4B5563" style={{ borderColor: '#E5E7EB' }}>{ticket.paymentMethod ? ticket.paymentMethod.replace('_', ' ') : 'N/A'}</Table.Td>
      <Table.Td c="#4B5563" style={{ borderColor: '#E5E7EB' }}>
        <div>
          <Text fz="sm">{ticket.phoneNumber}</Text>
          {ticket.paymentReference && (
            <Text fz="xs" c="dimmed">Ref: {ticket.paymentReference}</Text>
          )}
        </div>
      </Table.Td>
      <Table.Td c="#4B5563" style={{ borderColor: '#E5E7EB' }}>{new Date(ticket.createdAt).toLocaleDateString()}</Table.Td>
      <Table.Td style={{ borderColor: '#E5E7EB' }}>
        <IconEye 
          style={{ cursor: 'pointer', color: '#2563EB' }} 
          onClick={() => openTicketModal(ticket)}
        />
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Container fluid>
      <Title order={2} mb="lg" c="#4B5563">Approved Tickets</Title>
      
      <Grid>
          <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
              <StatCard title="Student Tickets" value={stats?.studentTicketsCount ?? 0} subValue={`Gh ${stats?.studentTicketsValue.toFixed(2) ?? 0}`} icon={IconUsers} color="#2563EB" />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
              <StatCard title="Non-Student Tickets" value={stats?.nonStudentTicketsCount ?? 0} subValue={`Gh ${stats?.nonStudentTicketsValue.toFixed(2) ?? 0}`} icon={IconBuildingStore} color="#9333EA" />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
              <StatCard title="Total Revenue" value={`Gh ${stats?.totalRevenue.toFixed(2) ?? 0}`} subValue={`${stats?.totalTickets ?? 0} tickets`} icon={IconReceipt} color="#16A34A" />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
              <StatCard title="Payment Methods" value={`Mobile: ${stats?.mobileMoneyPayments ?? 0}`} subValue={`Card: ${stats?.cardPayments ?? 0}`} icon={IconCreditCard} color="#4B5563" />
          </Grid.Col>
      </Grid>
      
      <Paper withBorder p="lg" radius="md" mt="xl" bg="white" style={{ borderColor: '#E5E7EB' }}>
        <Group justify="space-between" mb="lg">
            <Title order={3} c="#4B5563">Approved Ticket Details</Title>
            <Group>
                <Select
                    label="Filter by Type"
                    placeholder="All Types"
                    value={ticketTypeFilter}
                    data={[{value: '', label: 'All Types'}, { value: 'STUDENT', label: 'Students' }, { value: 'NON_STUDENT', label: 'Non-Students' }]}
                    onChange={setTicketTypeFilter}
                    styles={{
                        input: {
                            backgroundColor: '#D9D9D9',
                            color: '#000'
                        },
                        label: {
                            color: '#000'
                        },
                        option: {
                            color: '#000'
                        },
                        dropdown: {
                            backgroundColor: '#D9D9D9'
                        }
                    }}
                />
                <Select
                    label="Filter by Payment"
                    placeholder="All Payments"
                    value={paymentMethodFilter}
                    data={[{value: '', label: 'All Payments'}, { value: 'mobile_money', label: 'Mobile Money' }, { value: 'card', label: 'Card' }]}
                    onChange={setPaymentMethodFilter}
                    styles={{
                        input: {
                            backgroundColor: '#D9D9D9',
                            color: '#000'
                        },
                        label: {
                            color: '#000'
                        },
                        option: {
                            color: '#000'
                        },
                        dropdown: {
                            backgroundColor: '#D9D9D9'
                        }
                    }}
                />
            </Group>
        </Group>
        
        {isLoadingTickets && <Center><Loader /></Center>}
        {isError && <Alert icon={<IconAlertCircle size="1rem" />} title="Error!" color="red">{error.message}</Alert>}
        {!isLoadingTickets && !isError && (
            <>
                <Table.ScrollContainer minWidth={800}>
                    <Table verticalSpacing="sm" bg="white" style={{ borderColor: '#E5E7EB' }}>
                        <Table.Thead>
                            <Table.Tr style={{ borderColor: '#E5E7EB' }}>
                                <Table.Th c="#4B5563" style={{ borderColor: '#E5E7EB' }}>Name</Table.Th>
                                <Table.Th c="#4B5563" style={{ borderColor: '#E5E7EB' }}>Type</Table.Th>
                                <Table.Th c="#4B5563" style={{ borderColor: '#E5E7EB' }}>Amount</Table.Th>
                                <Table.Th c="#4B5563" style={{ borderColor: '#E5E7EB' }}>Payment Method</Table.Th>
                                <Table.Th c="#4B5563" style={{ borderColor: '#E5E7EB' }}>Phone/Reference</Table.Th>
                                <Table.Th c="#4B5563" style={{ borderColor: '#E5E7EB' }}>Date</Table.Th>
                                <Table.Th c="#4B5563" style={{ borderColor: '#E5E7EB' }}>Actions</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>{rows}</Table.Tbody>
                    </Table>
                </Table.ScrollContainer>
                <Group justify="space-between" align="center" mt="lg">
                    <Text c="#4B5563">Showing {ticketsData?.numberOfElements ? (activePage - 1) * 10 + 1 : 0} to {(activePage - 1) * 10 + (ticketsData?.numberOfElements ?? 0)} of {ticketsData?.totalElements ?? 0} results</Text>
                    <Pagination total={ticketsData?.totalPages ?? 1} value={activePage} onChange={setPage} />
                </Group>
            </>
        )}
      </Paper>
      
      <Group justify="flex-end" mt="lg">
        <Button 
          size="md" 
          bg="#401516" 
          leftSection={<IconDownload size={16} />}
          onClick={handleDownload}
        >
          Download Report
        </Button>
      </Group>

      <TicketDetailsModal 
        ticket={selectedTicket} 
        opened={modalOpened} 
        onClose={() => setModalOpened(false)} 
      />

    </Container>
  );
}

export default ApprovedTicketsPage; 