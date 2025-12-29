export interface Shift {
    id: number;
    name: string;
    code: string;
    start_time: string;
    end_time: string;
    color: string;
    description?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}
