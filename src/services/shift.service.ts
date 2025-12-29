import apiClient from '@/lib/api-client';
import type { Shift } from '@/types/shift';

export interface CreateShiftInput {
    name: string;
    code: string;
    start_time: string;
    end_time: string;
    color: string;
    description?: string;
}

export interface UpdateShiftInput {
    name?: string;
    code?: string;
    start_time?: string;
    end_time?: string;
    color?: string;
    description?: string;
    is_active?: boolean;
}

export const shiftService = {
    // Get all shifts
    async getShifts(activeOnly?: boolean): Promise<Shift[]> {
        const params = activeOnly ? '?active=true' : '';
        const response = await apiClient.get<{
            success: boolean;
            data: Shift[];
        }>(`/shifts${params}`);
        return response.data.data || response.data;
    },

    // Get active shifts only
    async getActiveShifts(): Promise<Shift[]> {
        return this.getShifts(true);
    },

    // Get shift by ID
    async getShiftById(id: number): Promise<Shift> {
        const response = await apiClient.get<{ success: boolean; data: Shift }>(
            `/shifts/${id}`
        );
        return response.data.data || response.data;
    },

    // Create new shift
    async createShift(data: CreateShiftInput): Promise<Shift> {
        const response = await apiClient.post<{
            success: boolean;
            data: Shift;
        }>('/shifts', data);
        return response.data.data || response.data;
    },

    // Update shift
    async updateShift(id: number, data: UpdateShiftInput): Promise<Shift> {
        const response = await apiClient.put<{ success: boolean; data: Shift }>(
            `/shifts/${id}`,
            data
        );
        return response.data.data || response.data;
    },

    // Delete shift
    async deleteShift(id: number): Promise<void> {
        await apiClient.delete(`/shifts/${id}`);
    },

    // Toggle shift active status
    async toggleShiftStatus(id: number, isActive: boolean): Promise<Shift> {
        return this.updateShift(id, { is_active: isActive });
    },
};
