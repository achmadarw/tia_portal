import apiClient from '@/lib/api-client';

export interface GenerateRosterRequest {
    month: string; // Format: "YYYY-MM-DD" (first day of month)
    force?: boolean; // Overwrite existing assignments
}

export interface GenerateRosterResponse {
    month: string;
    days: number;
    users: number;
    created: number;
    skipped: number;
    errors?: Array<{
        user_id: number;
        user_name: string;
        date: string;
        error: string;
    }>;
}

export interface ShiftAssignment {
    id: number;
    user_id: number;
    shift_id: number;
    assignment_date: string; // Format: "YYYY-MM-DD"
    is_replacement: boolean;
    replaced_user_id: number | null;
    notes: string | null;
    user_name: string;
    shift_name: string;
    shift_code: string;
    shift_color: string;
}

export interface GetShiftAssignmentsRequest {
    month: string; // Format: "YYYY-MM-DD"
    user_id?: number;
}

class RosterService {
    /**
     * Auto-generate monthly roster based on pattern assignments
     */
    async generateRoster(
        request: GenerateRosterRequest
    ): Promise<GenerateRosterResponse> {
        const response = await apiClient.post(`/roster/generate`, request);

        return response.data.data;
    }

    /**
     * Get shift assignments for a specific month
     */
    async getShiftAssignments(
        request: GetShiftAssignmentsRequest
    ): Promise<ShiftAssignment[]> {
        const params = new URLSearchParams();
        params.append('month', request.month);
        if (request.user_id) {
            params.append('user_id', request.user_id.toString());
        }

        const response = await apiClient.get<{
            success: boolean;
            data: ShiftAssignment[];
        }>(`/roster/shift-assignments?${params.toString()}`);

        return response.data.data;
    }
}

export const rosterService = new RosterService();
