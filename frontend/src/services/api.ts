import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface Complaint {
    id: number;
    title: string;
    category: string;
    description: string;
    status: string;
    created_at: string;
    updated_at?: string;
    ai_severity_score?: number;
    ai_predicted_resolution_time?: string;
    priority?: string;
    resolution?: string;
    user_name?: string;
}

export const fetchComplaints = async (userId?: string): Promise<Complaint[]> => {
    const params = userId ? { user_id: userId } : {};
    const response = await api.get('/complaints/', { params });
    return response.data;
};

export const getComplaint = async (id: number): Promise<Complaint> => {
    const response = await api.get(`/complaints/${id}/`);
    return response.data;
};

export const createComplaint = async (title: string, category: string, description: string, userId: string): Promise<Complaint> => {
    const response = await api.post('/complaints/', { title, category, description, user_id: userId });
    return response.data;
};

export const updateComplaint = async (id: number, updates: Partial<Complaint>): Promise<Complaint> => {
    const response = await api.patch(`/complaints/${id}/`, updates);
    return response.data;
};

export const updateComplaintStatus = async (id: number, status: string): Promise<Complaint> => {
    return updateComplaint(id, { status });
};

export const getComplaintSolution = async (id: number): Promise<{ suggestion: string }> => {
    const response = await api.get(`/complaints/${id}/suggest_resolution/`);
    return response.data;
};

// Auth
export const register = async (name: string, email: string, password: string): Promise<any> => {
    const response = await api.post('/auth/register', {
        full_name: name,
        email,
        password
    });
    return response.data;
};

export const loginAPI = async (email: string, password: string): Promise<any> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
};
