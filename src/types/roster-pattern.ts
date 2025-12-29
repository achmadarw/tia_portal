export interface RosterPattern {
    id: number;
    name: string;
    description: string | null;
    personil_count: number;
    pattern_data: number[][];
    is_default: boolean;
    created_by: number;
    created_at: string;
    updated_at: string;
    usage_count: number;
    last_used_at: string | null;
}

export interface CreateRosterPatternInput {
    name: string;
    description?: string;
    personil_count: number;
    pattern_data: number[][];
    is_default?: boolean;
}

export interface UpdateRosterPatternInput
    extends Partial<CreateRosterPatternInput> {
    id: number;
}

export interface RosterPatternFilters {
    personil_count?: number;
    is_default?: boolean;
    search?: string;
}
