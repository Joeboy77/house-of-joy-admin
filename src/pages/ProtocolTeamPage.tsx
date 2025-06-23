import { useQuery } from '@tanstack/react-query';
import { Container, Title, Text, Table, Paper, Group, Badge, Center, Loader, Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { getProtocolTeam } from '../services/submissionService';
import { getErrorMessage } from '../utils/errorUtils';

interface ProtocolMember {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  active: boolean;
  createdAt: string;
}

function ProtocolTeamPage() {
  const { data: team, isLoading, isError, error } = useQuery<ProtocolMember[], Error>({
    queryKey: ['protocolTeam'],
    queryFn: getProtocolTeam,
  });

  const rows = team?.map((member) => (
    <Table.Tr key={member.id} style={{ borderColor: '#E5E7EB' }}>
      <Table.Td style={{ color: 'black' }}>{member.fullName}</Table.Td>
      <Table.Td style={{ color: 'black' }}>{member.email}</Table.Td>
      <Table.Td style={{ color: 'black' }}>{member.phoneNumber}</Table.Td>
      <Table.Td>
        <Badge color={member.active ? 'green' : 'gray'} variant="light">
          {member.active ? 'Active' : 'Inactive'}
        </Badge>
      </Table.Td>
      <Table.Td style={{ color: 'black' }}>{new Date(member.createdAt).toLocaleDateString()}</Table.Td>
    </Table.Tr>
  ));

  return (
    <Container fluid>
      <Group justify="space-between" mb="lg">
        <div>
          <Title order={2} style={{ color: 'black' }}>Protocol Team</Title>
          <Text c="dimmed">Manage and view all protocol team members.</Text>
        </div>
      </Group>

      <Paper withBorder p="lg" radius="md" style={{ borderColor: '#E5E7EB', backgroundColor: 'white' }}>
        {isLoading && <Center><Loader /></Center>}
        {isError && (
          <Alert icon={<IconAlertCircle size="1rem" />} title="Error!" color="red">
            {getErrorMessage(error)}
          </Alert>
        )}
        {!isLoading && !isError && (
          <Table.ScrollContainer minWidth={800}>
            <Table 
              verticalSpacing="sm" 
              withTableBorder 
              withRowBorders 
              style={{ borderColor: '#E5E7EB' }}
            >
              <Table.Thead>
                <Table.Tr style={{ borderColor: '#E5E7EB' }}>
                  <Table.Th style={{ color: 'black' }}>Full Name</Table.Th>
                  <Table.Th style={{ color: 'black' }}>Email</Table.Th>
                  <Table.Th style={{ color: 'black' }}>Phone Number</Table.Th>
                  <Table.Th style={{ color: 'black' }}>Status</Table.Th>
                  <Table.Th style={{ color: 'black' }}>Date Joined</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{rows}</Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}
      </Paper>
    </Container>
  );
}

export default ProtocolTeamPage; 