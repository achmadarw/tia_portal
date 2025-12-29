import axios from 'axios';
import {
    RosterPattern,
    CreateRosterPatternInput,
    UpdateRosterPatternInput,
    RosterPatternFilters,
} from '@/types/roster-pattern';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3008/api';

// Create axios instance with auth token
const api = axios.create({
    baseURL: API_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const rosterPatternService = {
    /**
     * Get all roster patterns with optional filters
     */
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

        const response = await api.get<{
            success: boolean;
            data: RosterPattern[];
        }>(`/roster-patterns?${params.toString()}`);
        return response.data.data;
    },

    /**
     * Get pattern by ID
     */
    async getPatternById(id: number): Promise<RosterPattern> {
        const response = await api.get<{
            success: boolean;
            data: RosterPattern;
        }>(`/roster-patterns/${id}`);
        return response.data.data;
    },

    /**
     * Get default pattern for specific personil count
     */
    async getDefaultPattern(
        personilCount: number
    ): Promise<RosterPattern | null> {
        try {
            const response = await api.get<{
                success: boolean;
                data: RosterPattern;
            }>(`/roster-patterns/default/${personilCount}`);
            return response.data.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                return null;
            }
            throw error;
        }
    },

    /**
     * Create new pattern
     */
    async createPattern(
        data: CreateRosterPatternInput
    ): Promise<RosterPattern> {
        const response = await api.post<{
            success: boolean;
            data: RosterPattern;
        }>('/roster-patterns', data);
        return response.data.data;
    },

    /**
     * Update existing pattern
     */
    async updatePattern(
        id: number,
        data: UpdateRosterPatternInput
    ): Promise<RosterPattern> {
        const response = await api.put<{
            success: boolean;
            data: RosterPattern;
        }>(`/roster-patterns/${id}`, data);
        return response.data.data;
    },

    /**
     * Delete pattern
     */
    async deletePattern(id: number): Promise<void> {
        await api.delete(`/roster-patterns/${id}`);
    },

    /**
     * Record pattern usage
     */
    async recordUsage(id: number): Promise<void> {
        await api.post(`/roster-patterns/${id}/use`);
    },

    /**
     * Validate pattern data
     */
    async validatePattern(
        patternData: number[][],
        personilCount: number
    ): Promise<{
        valid: boolean;
        errors: string[];
        stats: Record<string, unknown>;
    }> {
        const response = await api.post<{
            success: boolean;
            valid: boolean;
            errors: string[];
            stats: Record<string, unknown>;
        }>('/roster-patterns/validate', {
            pattern_data: patternData,
            personil_count: personilCount,
        });
        return response.data;
    },
};

// React Query hooks
export const rosterPatternKeys = {
    all: ['roster-patterns'] as const,
    lists: () => [...rosterPatternKeys.all, 'list'] as const,
    list: (filters?: RosterPatternFilters) =>
        [...rosterPatternKeys.lists(), filters] as const,
    details: () => [...rosterPatternKeys.all, 'detail'] as const,
    detail: (id: number) => [...rosterPatternKeys.details(), id] as const,
    default: (count: number) =>
        [...rosterPatternKeys.all, 'default', count] as const,
};
