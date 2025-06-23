import { Card, Group, Avatar, Text, Badge, Button, Stack, Box, Anchor, Textarea, Modal, Image, Grid, Paper } from '@mantine/core';
import { IconCheck, IconX, IconFile, IconPdf, IconUser, IconEye, IconClock, IconAlertCircle, IconMail, IconPhone, IconSchool, IconBook, IconId } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { useState } from 'react';
import { approveSubmission, rejectSubmission } from '../services/submissionService';
import { getErrorMessage } from '../utils/errorUtils';

// This is a mock data type. We will replace it with the real one from the backend later.
export type Submission = {
  id: string;
  name: string;
  submittedAt: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'PAID';
  documentType: string;
  documentName: string;
  documentUrl?: string;
  approvedBy?: string;
  email?: string;
  phoneNumber?: string;
  institutionName?: string;
  courseOfStudy?: string;
  studentIdNumber?: string;
  ticketType?: string;
  amount?: number;
  paymentMethod?: string;
};

interface SubmissionCardProps {
  submission: Submission;
}

const statusColors = {
  PENDING_APPROVAL: 'yellow',
  APPROVED: 'green',
  REJECTED: 'red',
  PAID: 'blue',
} as const;

const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.pdf')) {
        return <IconPdf size="1rem" />;
    }
    return <IconFile size="1rem" />;
}

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'PENDING_APPROVAL':
            return <IconClock size="0.75rem" />;
        case 'APPROVED':
            return <IconCheck size="0.75rem" />;
        case 'REJECTED':
            return <IconX size="0.75rem" />;
        case 'PAID':
            return <IconCheck size="0.75rem" />;
        default:
            return <IconAlertCircle size="0.75rem" />;
    }
};

export function SubmissionCard({ submission }: SubmissionCardProps) {
  const queryClient = useQueryClient();
  const [rejectionReason, setRejectionReason] = useState('');
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);

  const approveMutation = useMutation({
    mutationFn: () => approveSubmission(submission.id),
    onSuccess: () => {
      notifications.show({
        title: 'Success',
        message: 'Submission approved successfully.',
        color: 'green',
      });
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
    onError: (error) => {
        notifications.show({
            title: 'Error',
            message: getErrorMessage(error),
            color: 'red',
        });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: (reason: string) => rejectSubmission(submission.id, reason),
     onSuccess: () => {
      notifications.show({
        title: 'Success',
        message: 'Submission rejected successfully.',
        color: 'orange',
      });
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
    onError: (error) => {
        notifications.show({
            title: 'Error',
            message: getErrorMessage(error),
            color: 'red',
        });
    }
  });

  const openRejectModal = () => modals.openConfirmModal({
    title: 'Reject Submission',
    children: (
      <Textarea
        label="Reason for rejection"
        placeholder="Please provide a reason"
        required
        data-autofocus
        value={rejectionReason}
        onChange={(event) => setRejectionReason(event.target.value)}
      />
    ),
    labels: { confirm: 'Reject Submission', cancel: 'Cancel' },
    onConfirm: () => rejectMutation.mutate(rejectionReason),
  });

  const { name, submittedAt, status, documentType, documentName, documentUrl, approvedBy, email, phoneNumber, institutionName, courseOfStudy, studentIdNumber } = submission;
  const initial = name?.charAt(0)?.toUpperCase() || '?';

  const handleViewDocument = () => {
    if (documentUrl) {
      setIsDocumentModalOpen(true);
    } else {
      notifications.show({
        title: 'No Document Available',
        message: 'No document has been uploaded for this submission.',
        color: 'yellow',
      });
    }
  };

  return (
    <>
      <Card shadow="sm" padding="lg" radius="md" withBorder style={{ borderColor: '#E5E7EB' }} bg="white">
        <Stack>
          <Group justify="space-between">
            <Group>
              <Avatar color="brand.5" radius="xl">
                {initial}
              </Avatar>
              <div>
                <Text fw={500}>{name}</Text>
                <Text size="xs" c="gray.6">
                  {submittedAt}
                </Text>
              </div>
            </Group>
            <Group gap="xs" align="center">
              <Badge color={statusColors[submission.status]} variant="light" size="sm">
                {getStatusIcon(submission.status)}
                {submission.status === 'PENDING_APPROVAL' ? 'Pending' : 
                 submission.status === 'APPROVED' ? 'Approved' : 
                 submission.status === 'REJECTED' ? 'Rejected' : 'Paid'}
              </Badge>
              {submission.ticketType && (
                <Badge color="gray" variant="light" size="sm">
                  {submission.ticketType === 'STUDENT' ? 'Student' : 'Non-Student'}
                </Badge>
              )}
              {submission.amount && (
                <Badge color="green" variant="light" size="sm">
                  ₵{submission.amount}
                </Badge>
              )}
              {submission.paymentMethod && (
                <Badge color="blue" variant="light" size="sm">
                  {submission.paymentMethod === 'mobile_money' ? 'Mobile Money' : 
                   submission.paymentMethod === 'card' ? 'Card' : submission.paymentMethod}
                </Badge>
              )}
            </Group>
          </Group>

          <Box pl={54}>
            <Text size="sm" c="gray.7">{documentType || 'Unknown Document Type'}</Text>
            <Card p="xs" withBorder mt="xs" style={{ maxWidth: '300px', backgroundColor: '#F9FAFB' }}>
               <Group gap="xs">
                  {getFileIcon(documentName || '')}
                  <Text size="sm">{documentName || 'Unknown Document'}</Text>
               </Group>
            </Card>
          </Box>

          {status === 'PENDING_APPROVAL' && (
            <Group justify="space-between" mt="md">
              <Anchor component="button" size="sm" style={{ color: '#401516' }} onClick={handleViewDocument}>
                  <Group gap="xs" align="center">
                      <IconEye size={16} />
                      <Text inherit>Preview Documents</Text>
                  </Group>
              </Anchor>
            </Group>
          )}

          {status === 'APPROVED' && (
               <Group justify="space-between" mt="md">
                  <Anchor component="button" size="sm" c="gray.7" onClick={handleViewDocument}>
                      <Group gap="xs" align="center">
                          <IconEye size={16} />
                          <Text inherit>View Documents</Text>
                      </Group>
                  </Anchor>
                 <Group gap="xs">
                   <IconUser size="1rem" />
                   <Text size="xs" c="gray.6">
                     Approved by {approvedBy || 'Unknown'}
                   </Text>
                 </Group>
               </Group>
          )}

          {status === 'REJECTED' && (
            <Group justify="space-between" mt="md">
              <Anchor component="button" size="sm" c="gray.7" onClick={handleViewDocument}>
                  <Group gap="xs" align="center">
                      <IconEye size={16} />
                      <Text inherit>View Documents</Text>
                  </Group>
              </Anchor>
            </Group>
          )}

          {/* Action buttons - only show for pending student submissions */}
          {submission.status === 'PENDING_APPROVAL' && submission.ticketType === 'STUDENT' && (
            <Group gap="xs" mt="md">
              <Button
                size="xs"
                color="green"
                onClick={() => approveMutation.mutate()}
                loading={approveMutation.isPending}
              >
                Approve
              </Button>
              <Button
                size="xs"
                color="red"
                variant="outline"
                onClick={openRejectModal}
                loading={rejectMutation.isPending}
              >
                Reject
              </Button>
            </Group>
          )}
        </Stack>
      </Card>

      {/* Document Preview Modal */}
      <Modal
        opened={isDocumentModalOpen}
        onClose={() => setIsDocumentModalOpen(false)}
        title={
          <Group>
            <Avatar color="brand.5" radius="xl" size="md">
              {initial}
            </Avatar>
            <div>
              <Text fw={600} size="lg">{name}</Text>
              <Text size="sm" c="gray.6">Student Application</Text>
            </div>
          </Group>
        }
        size="xl"
        centered
        styles={{
          title: { flex: 1 },
          header: { borderBottom: '1px solid #E5E7EB', paddingBottom: '1rem' },
          body: { padding: '1.5rem' },
          content: { borderRadius: '12px', backgroundColor: 'white' }
        }}
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
      >
        <Stack gap="xl">
          {/* Student Information */}
          <Paper withBorder p="lg" radius="md" bg="white" shadow="sm">
            <Group mb="md">
              <IconUser size={20} color="#401516" />
              <Text fw={600} size="lg">Student Information</Text>
            </Group>
            <Grid gutter="md">
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Group gap="sm" mb="md">
                  <IconMail size={18} color="#401516" />
                  <div>
                    <Text size="xs" c="gray.6" tt="uppercase" fw={500}>Email</Text>
                    <Text size="sm" fw={500}>{email || 'Not provided'}</Text>
                  </div>
                </Group>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Group gap="sm" mb="md">
                  <IconPhone size={18} color="#401516" />
                  <div>
                    <Text size="xs" c="gray.6" tt="uppercase" fw={500}>Phone Number</Text>
                    <Text size="sm" fw={500}>{phoneNumber || 'Not provided'}</Text>
                  </div>
                </Group>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Group gap="sm" mb="md">
                  <IconSchool size={18} color="#401516" />
                  <div>
                    <Text size="xs" c="gray.6" tt="uppercase" fw={500}>Institution</Text>
                    <Text size="sm" fw={500}>{institutionName || 'Not provided'}</Text>
                  </div>
                </Group>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Group gap="sm" mb="md">
                  <IconBook size={18} color="#401516" />
                  <div>
                    <Text size="xs" c="gray.6" tt="uppercase" fw={500}>Course of Study</Text>
                    <Text size="sm" fw={500}>{courseOfStudy || 'Not provided'}</Text>
                  </div>
                </Group>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Group gap="sm" mb="md">
                  <IconId size={18} color="#401516" />
                  <div>
                    <Text size="xs" c="gray.6" tt="uppercase" fw={500}>Student ID Number</Text>
                    <Text size="sm" fw={500}>{studentIdNumber || 'Not provided'}</Text>
                  </div>
                </Group>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Group gap="sm" mb="md">
                  <IconClock size={18} color="#401516" />
                  <div>
                    <Text size="xs" c="gray.6" tt="uppercase" fw={500}>Submitted</Text>
                    <Text size="sm" fw={500}>{submittedAt}</Text>
                  </div>
                </Group>
              </Grid.Col>
            </Grid>
          </Paper>

          {/* Document Preview */}
          <Paper withBorder p="lg" radius="md" bg="white" shadow="sm">
            <Group mb="md">
              <IconFile size={20} color="#401516" />
              <Text fw={600} size="lg">Verification Document</Text>
            </Group>
            {documentUrl ? (
              <Box>
                {documentUrl.toLowerCase().includes('.pdf') ? (
                  <Paper withBorder p="md" radius="md" bg="gray.0">
                    <Group gap="sm">
                      <IconPdf size={24} color="#EF4444" />
                      <div>
                        <Text fw={500}>{documentName || 'Student ID Document'}</Text>
                        <Text size="sm" c="gray.6">PDF Document</Text>
                      </div>
                    </Group>
                    <Button 
                      mt="md" 
                      variant="outline" 
                      leftSection={<IconEye size={16} />}
                      onClick={() => window.open(documentUrl, '_blank', 'noopener,noreferrer')}
                      style={{ borderColor: '#401516', color: '#401516' }}
                      fullWidth
                    >
                      Open PDF in New Tab
                    </Button>
                  </Paper>
                ) : (
                  <Box>
                    <Paper withBorder p="md" radius="md" bg="gray.0">
                      <Image
                        src={documentUrl}
                        alt="Student ID Document"
                        radius="md"
                        style={{ maxHeight: '400px', objectFit: 'contain', width: '100%' }}
                        fallbackSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='14' fill='%236b7280'%3EImage not available%3C/text%3E%3C/svg%3E"
                      />
                    </Paper>
                    <Text size="sm" c="gray.6" mt="xs" ta="center">
                      {documentName || 'Student ID Document'}
                    </Text>
                  </Box>
                )}
              </Box>
            ) : (
              <Paper withBorder p="md" radius="md" bg="gray.0">
                <Group gap="sm">
                  <IconAlertCircle size={20} color="#F59E0B" />
                  <div>
                    <Text fw={500} c="orange">No Document Available</Text>
                    <Text size="sm" c="gray.6">No verification document has been uploaded</Text>
                  </div>
                </Group>
              </Paper>
            )}
          </Paper>

          {/* Action Buttons */}
          {status === 'PENDING_APPROVAL' && (
            <Paper withBorder p="md" radius="md" bg="white">
              <Group justify="flex-end" gap="md">
                <Button 
                  leftSection={<IconX size={16} />} 
                  variant="outline"
                  color="red"
                  onClick={() => {
                    setIsDocumentModalOpen(false);
                    openRejectModal();
                  }}
                  loading={rejectMutation.isPending}
                >
                  Reject Application
                </Button>
                <Button 
                  leftSection={<IconCheck size={16} />} 
                  style={{ backgroundColor: '#401516', color: 'white' }}
                  onClick={() => {
                    setIsDocumentModalOpen(false);
                    approveMutation.mutate();
                  }}
                  loading={approveMutation.isPending}
                >
                  Approve Application
                </Button>
              </Group>
            </Paper>
          )}
        </Stack>
      </Modal>
    </>
  );
} 