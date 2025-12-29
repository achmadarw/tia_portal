import apiClient from '@/lib/api-client';

export interface User {
    id: number;
    name: string;
    email: string;
    phone: string;
    role: 'admin' | 'user' | 'security';
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
}

export interface UserFilters {
    status?: 'active' | 'inactive';
    role?: 'admin' | 'user' | 'security';
    search?: string;
}

class UserService {
    async getUsers(filters?: UserFilters): Promise<User[]> {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.role) params.append('role', filters.role);
        if (filters?.search) params.append('search', filters.search);

        const response = await apiClient.get(`/users?${params.toString()}`);

        return response.data.data;
    }

    async getUserById(id: number): Promise<User> {
        const response = await apiClient.get(`/users/${id}`);
        return response.data.data;
    }

    async createUser(userData: Partial<User>): Promise<User> {
        const response = await apiClient.post(`/users`, userData);
        return response.data.data;
    }

    async updateUser(id: number, userData: Partial<User>): Promise<User> {
        const response = await apiClient.put(`/users/${id}`, userData);
        return response.data.data;
    }

    async deleteUser(id: number): Promise<void> {
        await apiClient.delete(`/users/${id}`);
    }
}

export const userService = new UserService();
