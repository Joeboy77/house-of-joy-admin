export interface LoginRequest {
  email: string;
  password?: string; // Making password optional for the type definition flexibility
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export interface DashboardStats {
  studentTicketsCount: number;
  studentTicketsValue: number;
  nonStudentTicketsCount: number;
  nonStudentTicketsValue: number;
  totalRevenue: number;
  totalTickets: number;
  mobileMoneyPayments: number;
  cardPayments: number;
  pendingStudentApplications: number;
  totalStudentApplications: number;
  rejectedStudentApplications: number;
  paidStudentApplications: number;
}

export interface CreateAdminUserRequest {
  fullName: string;
  email: string;
  password?: string;
  phoneNumber: string;
} 