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
}

export const rosterService = new RosterService();
