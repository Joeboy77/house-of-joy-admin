import { useState } from 'react';
import { Title, Text, Stack, Group, Button, Alert, Badge, Loader, Center, TextInput, Select, Paper, Modal, PasswordInput } from '@mantine/core';
import { IconInfoCircle, IconPlus, IconSearch, IconFilter } from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SubmissionCard } from '../components/SubmissionCard';
import type { Submission } from '../components/SubmissionCard';
import { useAuthStore } from '../store/useAuthStore';
import { getSubmissions, getDashboardStats, createSubAdmin } from '../services/submissionService';
import { getErrorMessage } from '../utils/errorUtils';
import type { DashboardStats, CreateAdminUserRequest } from '../types';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';

enum SubmissionStatus {
    ALL = 'ALL',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    PENDING = 'PENDING',
    PAID = 'PAID',
}

function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [activeFilter, setActiveFilter] = useState<SubmissionStatus>(SubmissionStatus.ALL);
  const [searchTerm, setSearchTerm] = useState('');
  const [institutionFilter, setInstitutionFilter] = useState<string>('');
  const [ticketTypeFilter, setTicketTypeFilter] = useState<string>('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('');
  const [addAdminModalOpened, { open: openAddAdminModal, close: closeAddAdminModal }] = useDisclosure(false);

  const form = useForm({
    initialValues: {
      fullName: '',
      email: '',
      password: '',
      phoneNumber: '',
    },
    validate: {
      fullName: (value) => (value.trim().length > 2 ? null : 'Full name must have at least 3 characters'),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (value.length >= 8 ? null : 'Password must have at least 8 characters'),
      phoneNumber: (value) => (/^\+?\d{10,14}$/.test(value) ? null : 'Please enter a valid phone number'),
    },
  });

  const queryClient = useQueryClient();

  const createAdminMutation = useMutation({
    mutationFn: createSubAdmin,
    onSuccess: () => {
      notifications.show({
        title: 'Sub Admin Created',
        message: 'The new protocol team member has been added successfully.',
        color: 'green',
      });
      closeAddAdminModal();
      form.reset();
    },
    onError: (error) => {
      notifications.show({
        title: 'Creation Failed',
        message: getErrorMessage(error),
        color: 'red',
      });
    },
  });

  const handleCreateAdmin = (values: CreateAdminUserRequest) => {
    createAdminMutation.mutate(values);
  };

  const { data: stats, isLoading: isLoadingStats } = useQuery<DashboardStats>({
    queryKey: ['dashboardStats'],
    queryFn: getDashboardStats,
  });

  const { data: submissions, isLoading, error } = useQuery<any[], Error>({
    queryKey: ['submissions', activeFilter],
    queryFn: () => getSubmissions(activeFilter),
  });

  const transformTicketToSubmission = (ticket: any): Submission => {
    const documentUrl = ticket.verificationDocumentUrl || ticket.studentDocumentUrl || null;
    
    let status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'PAID';
    
    // For paid tickets tab, all tickets are marked as PAID
    if (activeFilter === SubmissionStatus.PAID) {
      status = 'PAID';
    } else {
      // For student application tabs, use verification status
      if (ticket.verificationStatus) {
        switch (ticket.verificationStatus) {
          case 'PENDING':
            status = 'PENDING_APPROVAL';
            break;
          case 'APPROVED':
            status = 'APPROVED';
            break;
          case 'REJECTED':
            status = 'REJECTED';
            break;
          default:
            status = 'PENDING_APPROVAL';
        }
      } else {
        switch (ticket.ticketStatus) {
          case 'PENDING_VERIFICATION':
            status = 'PENDING_APPROVAL';
            break;
          case 'PAID':
            status = 'PAID';
            break;
          default:
            status = 'PENDING_APPROVAL';
        }
      }
    }
    
    return {
      id: ticket.id.toString(),
      name: ticket.fullName || 'Unknown',
      submittedAt: new Date(ticket.createdAt).toLocaleDateString(),
      status: status,
      documentType: ticket.ticketType === 'STUDENT' ? 'Student Verification' : 'Non-Student Ticket',
      documentName: documentUrl ? 'Student ID Document' : (ticket.ticketType === 'STUDENT' ? 'No document uploaded' : 'N/A'),
      documentUrl: documentUrl,
      approvedBy: status === 'APPROVED' || status === 'PAID' ? 'System' : undefined,
      email: ticket.email,
      phoneNumber: ticket.phoneNumber,
      institutionName: ticket.institutionName,
      courseOfStudy: ticket.courseOfStudy,
      studentIdNumber: ticket.studentIdNumber,
      ticketType: ticket.ticketType,
      amount: ticket.amount,
      paymentMethod: ticket.paymentMethod,
    };
  };

  const renderSubmissions = () => {
    if (isLoading) {
      return <Center><Loader /></Center>;
    }

    if (error) {
        return <Alert color="red" title="Error fetching submissions">{getErrorMessage(error)}</Alert>;
    }
      
    if (!submissions || submissions.length === 0) {
      return <Text>No submissions found for this category.</Text>;
    }

    // Transform backend data to frontend format
    let transformedSubmissions = submissions.map(transformTicketToSubmission);

    // Apply search filter
    if (searchTerm) {
      transformedSubmissions = transformedSubmissions.filter(submission =>
        submission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.phoneNumber?.includes(searchTerm) ||
        submission.institutionName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.courseOfStudy?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply institution filter
    if (institutionFilter) {
      transformedSubmissions = transformedSubmissions.filter(submission =>
        submission.institutionName === institutionFilter
      );
    }

    // Apply ticket type filter
    if (ticketTypeFilter) {
      transformedSubmissions = transformedSubmissions.filter(submission =>
        submission.ticketType === ticketTypeFilter
      );
    }

    // Apply payment method filter
    if (paymentMethodFilter) {
      transformedSubmissions = transformedSubmissions.filter(submission =>
        submission.paymentMethod === paymentMethodFilter
      );
    }

    if (transformedSubmissions.length === 0) {
      return <Text>No submissions match your search criteria.</Text>;
    }

    return transformedSubmissions.map((submission) => (
      <SubmissionCard key={submission.id} submission={submission} />
    ));
  };

  return (
    <>
      <Modal
        opened={addAdminModalOpened}
        onClose={closeAddAdminModal}
        title={<Title order={3}>Add Sub Admin (Protocol)</Title>}
        centered
        overlayProps={{ blur: 3 }}
        styles={{
          content: { backgroundColor: 'white' },
          header: { backgroundColor: 'white', borderBottom: '1px solid #E5E7EB' },
          title: { color: 'black' },
          close: { color: 'black' },
        }}
      >
        <form onSubmit={form.onSubmit(handleCreateAdmin)}>
          <Stack>
            <TextInput
              label="Full Name"
              placeholder="Enter full name"
              required
              {...form.getInputProps('fullName')}
              styles={{
                input: { backgroundColor: 'white', color: 'black', borderColor: '#E5E7EB' },
                label: { color: 'black' },
              }}
            />
            <TextInput
              label="Email Address"
              placeholder="protocol@example.com"
              required
              {...form.getInputProps('email')}
              styles={{
                input: { backgroundColor: 'white', color: 'black', borderColor: '#E5E7EB' },
                label: { color: 'black' },
              }}
            />
            <TextInput
              label="Phone Number"
              placeholder="Enter phone number"
              required
              {...form.getInputProps('phoneNumber')}
              styles={{
                input: { backgroundColor: 'white', color: 'black', borderColor: '#E5E7EB' },
                label: { color: 'black' },
              }}
            />
            <PasswordInput
              label="Password"
              placeholder="Enter a secure password"
              required
              {...form.getInputProps('password')}
              styles={{
                input: { backgroundColor: 'white', color: 'black', borderColor: '#E5E7EB' },
                label: { color: 'black' },
              }}
            />
            <Button
              type="submit"
              mt="md"
              loading={createAdminMutation.isPending}
              style={{ backgroundColor: '#401516' }}
            >
              Create Sub Admin
            </Button>
          </Stack>
        </form>
      </Modal>

      <Stack>
        <Group justify="space-between">
          <div>
            <Title order={2} style={{ color: '#401516' }}>Verification Queue</Title>
            <Text c="gray.7">Review and approve student submissions</Text>
          </div>
          {user?.role === 'SUPER_ADMIN' && (
            <Button
              leftSection={<IconPlus size={14} />}
              style={{ backgroundColor: '#401516' }}
              onClick={openAddAdminModal}
            >
              Add Sub Admin
            </Button>
          )}
        </Group>

        <Alert 
          icon={<IconInfoCircle />} 
          title="New Submissions" 
          withCloseButton 
          styles={(theme) => ({
              root: { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' },
              title: { color: '#1E40AF', fontWeight: 'bold' },
              body: { color: '#1D4ED8' },
              message: { color: '#1D4ED8' }
          })}
        >
          {isLoadingStats ? '...' : stats?.pendingStudentApplications ?? 0} new student submissions require verification
        </Alert>

        <Group>
          <Button variant={activeFilter === SubmissionStatus.ALL ? 'filled' : 'subtle'} color="dark" onClick={() => setActiveFilter(SubmissionStatus.ALL)} rightSection={<Badge circle>{isLoadingStats ? '...' : stats?.totalStudentApplications ?? 0}</Badge>}>
              All Submissions
          </Button>
           <Button variant={activeFilter === SubmissionStatus.APPROVED ? 'filled' : 'subtle'} color="gray" onClick={() => setActiveFilter(SubmissionStatus.APPROVED)} rightSection={<Badge color="green" circle>{isLoadingStats ? '...' : Math.max(0, (stats?.totalStudentApplications || 0) - (stats?.pendingStudentApplications || 0) - (stats?.rejectedStudentApplications || 0))}</Badge>}>
              Approved
          </Button>
          <Button variant={activeFilter === SubmissionStatus.REJECTED ? 'filled' : 'subtle'} color="gray" onClick={() => setActiveFilter(SubmissionStatus.REJECTED)} rightSection={<Badge color="red" circle>{isLoadingStats ? '...' : stats?.rejectedStudentApplications ?? 0}</Badge>}>
              Rejected
          </Button>
          <Button variant={activeFilter === SubmissionStatus.PENDING ? 'filled' : 'subtle'} color="gray" onClick={() => setActiveFilter(SubmissionStatus.PENDING)} rightSection={<Badge color="yellow" circle>{isLoadingStats ? '...' : stats?.pendingStudentApplications ?? 0}</Badge>}>
              Pending
          </Button>
          <Button variant={activeFilter === SubmissionStatus.PAID ? 'filled' : 'subtle'} color="gray" onClick={() => setActiveFilter(SubmissionStatus.PAID)} rightSection={<Badge color="blue" circle>{isLoadingStats ? '...' : stats?.paidStudentApplications ?? 0}</Badge>}>
              Paid Tickets
          </Button>
        </Group>

        {/* Search and Filter Section - Only for Paid Tickets */}
        {activeFilter === SubmissionStatus.PAID && (
          <Paper withBorder p="md" radius="md" bg="white">
            <Group gap="md" align="flex-end">
              <TextInput
                placeholder="Search by name, phone, institution, or course..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftSection={<IconSearch size={16} />}
                style={{ flex: 1 }}
                bg="white"
              />
              <Select
                placeholder="Filter by ticket type"
                value={ticketTypeFilter}
                onChange={(value) => setTicketTypeFilter(value || '')}
                data={[
                  { value: '', label: 'All Types' },
                  { value: 'STUDENT', label: 'Student Tickets' },
                  { value: 'NON_STUDENT', label: 'Non-Student Tickets' },
                ]}
                leftSection={<IconFilter size={16} />}
                clearable
                bg="white"
              />
              <Select
                placeholder="Filter by payment method"
                value={paymentMethodFilter}
                onChange={(value) => setPaymentMethodFilter(value || '')}
                data={[
                  { value: '', label: 'All Methods' },
                  { value: 'mobile_money', label: 'Mobile Money' },
                  { value: 'card', label: 'Card Payment' },
                ]}
                leftSection={<IconFilter size={16} />}
                clearable
                bg="white"
              />
              <Select
                placeholder="Filter by institution"
                value={institutionFilter}
                onChange={(value) => setInstitutionFilter(value || '')}
                data={[
                  { value: '', label: 'All Institutions' },
                  { value: 'UG', label: 'University of Ghana' },
                  { value: 'KNUST', label: 'KNUST' },
                  { value: 'UC', label: 'University of Cape Coast' },
                  { value: 'UCC', label: 'University of Cape Coast' },
                  { value: 'UDS', label: 'University for Development Studies' },
                  { value: 'UEW', label: 'University of Education, Winneba' },
                  { value: 'UPSA', label: 'University of Professional Studies' },
                  { value: 'GIMPA', label: 'GIMPA' },
                  { value: 'Ashesi', label: 'Ashesi University' },
                  { value: 'Central', label: 'Central University' },
                  { value: 'Valley View', label: 'Valley View University' },
                  { value: 'Regent', label: 'Regent University' },
                  { value: 'Ghana Tech', label: 'Ghana Technology University' },
                  { value: 'Accra Tech', label: 'Accra Technical University' },
                  { value: 'Kumasi Tech', label: 'Kumasi Technical University' },
                  { value: 'Cape Coast Tech', label: 'Cape Coast Technical University' },
                  { value: 'Ho Tech', label: 'Ho Technical University' },
                  { value: 'Koforidua Tech', label: 'Koforidua Technical University' },
                  { value: 'Sunyani Tech', label: 'Sunyani Technical University' },
                  { value: 'Takoradi Tech', label: 'Takoradi Technical University' },
                  { value: 'Tamale Tech', label: 'Tamale Technical University' },
                  { value: 'Wa Tech', label: 'Wa Technical University' },
                  { value: 'Other', label: 'Other Institution' },
                ]}
                leftSection={<IconFilter size={16} />}
                clearable
                bg="white"
              />
              {(searchTerm || institutionFilter || ticketTypeFilter || paymentMethodFilter) && (
                <Button 
                  variant="subtle" 
                  color="gray" 
                  onClick={() => {
                    setSearchTerm('');
                    setInstitutionFilter('');
                    setTicketTypeFilter('');
                    setPaymentMethodFilter('');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </Group>
          </Paper>
        )}

        <Stack>
          {renderSubmissions()}
        </Stack>
      </Stack>
    </>
  );
}

export default DashboardPage; 