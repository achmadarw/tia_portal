import apiClient from '@/lib/api-client';
import type { Shift } from '@/types/shift';

export const shiftService = {
    // Get all shifts
    async getShifts(): Promise<Shift[]> {
        const response = await apiClient.get<Shift[]>('/shifts');
        return response.data;
    },

    // Get active shifts only
    async getActiveShifts(): Promise<Shift[]> {
        const response = await apiClient.get<Shift[]>('/shifts?active=true');
        return response.data;
    },
};
