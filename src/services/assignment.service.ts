import apiClient from '@/lib/api-client';
import type { Pattern } from './pattern.service';

// Assignment types
export interface RosterAssignment {
    id: number;
    user_id: number;
    user_name: string;
    user_phone: string;
    user_role: string;
    pattern_id: number;
    pattern_name: string;
    pattern_data: number[];
    assignment_month: string; // YYYY-MM-DD format (first day of month)
    notes: string | null;
    assigned_at: string;
}

export interface CreateAssignmentInput {
    user_id: number;
    pattern_id: number;
    assignment_month: string; // YYYY-MM-01 format
    notes?: string;
}

export interface UpdateAssignmentInput {
    id: number;
    pattern_id?: number;
    notes?: string;
}

export interface BulkAssignmentInput {
    assignment_month: string;
    assignments: Array<{
        user_id: number;
        pattern_id: number;
    }>;
}

export const assignmentService = {
    // Get all assignments
    async getAssignments(
        month?: string,
        userId?: number
    ): Promise<RosterAssignment[]> {
        const params = new URLSearchParams();
        if (month) params.append('month', month);
        if (userId) params.append('user_id', userId.toString());

        const response = await apiClient.get<{
            success: boolean;
            data: RosterAssignment[];
            count: number;
        }>(`/roster-assignments?${params.toString()}`);
        return response.data.data;
    },

    // Get assignments for specific month
    async getMonthAssignments(
        year: number,
        month: number
    ): Promise<RosterAssignment[]> {
        const response = await apiClient.get<{
            success: boolean;
            data: RosterAssignment[];
            count: number;
            month: string;
        }>(`/roster-assignments/month/${year}/${month}`);
        return response.data.data;
    },

    // Create assignment
    async createAssignment(
        data: CreateAssignmentInput
    ): Promise<RosterAssignment> {
        const response = await apiClient.post<{
            success: boolean;
            data: RosterAssignment;
        }>('/roster-assignments', data);
        return response.data.data;
    },

    // Update assignment
    async updateAssignment(
        data: UpdateAssignmentInput
    ): Promise<RosterAssignment> {
        const { id, ...updateData } = data;
        const response = await apiClient.put<{
            success: boolean;
            data: RosterAssignment;
        }>(`/roster-assignments/${id}`, updateData);
        return response.data.data;
    },

    // Delete assignment
    async deleteAssignment(id: number): Promise<void> {
        await apiClient.delete(`/roster-assignments/${id}`);
    },

    // Bulk create/update assignments
    async bulkAssign(data: BulkAssignmentInput): Promise<RosterAssignment[]> {
        const response = await apiClient.post<{
            success: boolean;
            data: RosterAssignment[];
            count: number;
        }>('/roster-assignments/bulk', data);
        return response.data.data;
    },
};
