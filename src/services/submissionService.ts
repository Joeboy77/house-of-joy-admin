import api from './api';
import type { DashboardStats, CreateAdminUserRequest } from '../types';

export const getSubmissions = async (status: string | null) => {
    let queryStatus = status;
    if (status === 'PENDING') {
        queryStatus = 'PENDING'; 
    } else if (status === 'APPROVED') {
        queryStatus = 'APPROVED';
    } else if (status === 'REJECTED') {
        queryStatus = 'REJECTED';
    } else if (status === 'PAID') {
        queryStatus = 'PAID';
    }
    
    const params = queryStatus && queryStatus !== 'ALL' ? { status: queryStatus } : {};
    const response = await api.get('/student-tickets/admin/applications', { params });
    return response.data;
};


export const getDashboardStats = async (): Promise<DashboardStats> => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
};


export const approveSubmission = async (ticketId: string) => {
    const response = await api.post(`/student-tickets/admin/approve/${ticketId}`);
    return response.data;
};


export const rejectSubmission = async (ticketId: string, reason: string) => {
    const response = await api.post(`/student-tickets/admin/reject/${ticketId}`, { reason });
    return response.data;
};

interface GetApprovedTicketsParams {
    page: number;
    size: number;
    ticketType: string | null;
    paymentMethod: string | null;
}

export const getApprovedTickets = async ({ page, size, ticketType, paymentMethod }: GetApprovedTicketsParams) => {
    const params: any = {
        page,
        size,
        paymentStatus: 'SUCCESS', // We only want paid tickets
        ticketType: ticketType || null,
        paymentMethod: paymentMethod || null,
    };

    // Remove null or undefined params
    Object.keys(params).forEach(key => (params[key] == null) && delete params[key]);

    const response = await api.get('/admin/dashboard/tickets', { params });
    return response.data;
};

export const createSubAdmin = async (data: CreateAdminUserRequest) => {
    const response = await api.post('/admin/users/protocol-team', data);
    return response.data;
};

export const getProtocolTeam = async () => {
    const response = await api.get('/admin/users/protocol-team');
    return response.data;
}; 