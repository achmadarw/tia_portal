import apiClient from '@/lib/api-client';
import type {
    RosterPattern,
    CreateRosterPatternInput,
    UpdateRosterPatternInput,
    RosterPatternFilters,
} from '@/types/roster-pattern';

export const rosterPatternService = {
    // Get all patterns
    async getPatterns(
        filters?: RosterPatternFilters
    ): Promise<RosterPattern[]> {
        const params = new URLSearchParams();
        if (filters?.personil_count) {
            params.append('personil_count', filters.personil_count.toString());
        }
        if (filters?.is_default !== undefined) {
            params.append('is_default', filters.is_default.toString());
        }
        if (filters?.search) {
            params.append('search', filters.search);
        }

        const response = await apiClient.get<{
            success: boolean;
            data: RosterPattern[];
            count: number;
        }>(`/roster-patterns?${params.toString()}`);
        return response.data.data;
    },

    // Get pattern by ID
    async getPatternById(id: number): Promise<RosterPattern> {
        const response = await apiClient.get<{
            success: boolean;
            data: RosterPattern;
        }>(`/roster-patterns/${id}`);
        return response.data.data;
    },

    // Get patterns by personil count
    async getPatternsByCount(count: number): Promise<RosterPattern[]> {
        const response = await apiClient.get<RosterPattern[]>(
            `/roster-patterns/by-count/${count}`
        );
        return response.data;
    },

    // Create new pattern
    async createPattern(
        data: CreateRosterPatternInput
    ): Promise<RosterPattern> {
        const response = await apiClient.post<RosterPattern>(
            '/roster-patterns',
            data
        );
        return response.data;
    },

    // Update pattern
    async updatePattern(
        data: UpdateRosterPatternInput
    ): Promise<RosterPattern> {
        const { id, ...updateData } = data;
        const response = await apiClient.put<RosterPattern>(
            `/roster-patterns/${id}`,
            updateData
        );
        return response.data;
    },

    // Delete pattern
    async deletePattern(id: number): Promise<void> {
        await apiClient.delete(`/roster-patterns/${id}`);
    },
};
