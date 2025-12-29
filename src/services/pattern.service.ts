import apiClient from '@/lib/api-client';

// Pattern types
export interface Pattern {
    id: number;
    name: string;
    description: string;
    pattern_data: number[]; // 7-day array: 0=OFF, 1=Pagi, 2=Siang, 3=Sore
    is_active: boolean;
    created_by: number | null;
    created_at: string;
    updated_at: string;
    usage_count: number;
    last_used_at: string | null;
}

export interface CreatePatternInput {
    name: string;
    description?: string;
    pattern_data: number[]; // Must be array of 7 integers (0-3)
}

export interface UpdatePatternInput {
    id: number;
    name?: string;
    description?: string;
    pattern_data?: number[];
    is_active?: boolean;
}

export const patternService = {
    // Get all patterns
    async getPatterns(active?: boolean): Promise<Pattern[]> {
        const params = new URLSearchParams();
        if (active !== undefined) {
            params.append('active', active.toString());
        }

        const response = await apiClient.get<{
            success: boolean;
            data: Pattern[];
            count: number;
        }>(`/patterns?${params.toString()}`);
        return response.data.data;
    },

    // Get pattern by ID
    async getPatternById(id: number): Promise<Pattern> {
        const response = await apiClient.get<{
            success: boolean;
            data: Pattern;
        }>(`/patterns/${id}`);
        return response.data.data;
    },

    // Create new pattern
    async createPattern(data: CreatePatternInput): Promise<Pattern> {
        const response = await apiClient.post<{
            success: boolean;
            data: Pattern;
        }>('/patterns', data);
        return response.data.data;
    },

    // Update pattern
    async updatePattern(data: UpdatePatternInput): Promise<Pattern> {
        const { id, ...updateData } = data;
        const response = await apiClient.put<{
            success: boolean;
            data: Pattern;
        }>(`/patterns/${id}`, updateData);
        return response.data.data;
    },

    // Delete pattern
    async deletePattern(id: number): Promise<void> {
        await apiClient.delete(`/patterns/${id}`);
    },
};
