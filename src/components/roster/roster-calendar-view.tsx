'use client';

import { useMemo, useState } from 'react';
import { format, getDaysInMonth } from 'date-fns';
import { cn } from '@/lib/utils';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpDown } from 'lucide-react';
import type { Shift } from '@/types/shift';

interface Pattern {
    id: number;
    name: string;
    pattern_data: number[];
}

interface UserAssignment {
    user_id: number;
    user_name: string;
    user_phone: string;
    pattern_id: number | null;
    pattern_name: string | null;
}

interface ShiftAssignment {
    user_id: number;
    shift_id: number;
    assignment_date: string;
}

interface RosterCalendarViewProps {
    selectedMonth: Date;
    userAssignments: UserAssignment[];
    patterns: Pattern[];
    shifts?: Shift[];
    shiftAssignments?: ShiftAssignment[];
    onPatternChange: (userId: number, patternId: string) => void;
    onPrevMonth: () => void;
    onNextMonth: () => void;
    isLoading?: boolean;
    sortOrder?: 'first' | 'last';
    onSortOrderChange?: (order: 'first' | 'last') => void;
}

export function RosterCalendarView({
    selectedMonth,
    userAssignments,
    patterns,
    shifts,
    shiftAssignments = [],
    onPatternChange,
    onPrevMonth,
    onNextMonth,
    isLoading = false,
    sortOrder: externalSortOrder,
    onSortOrderChange,
}: RosterCalendarViewProps) {
    // Sort order state: 'first' or 'last'
    // Use external sortOrder if provided, otherwise use internal state
    const [internalSortOrder, setInternalSortOrder] = useState<
        'first' | 'last'
    >('first');
    const sortOrder = externalSortOrder ?? internalSortOrder;

    const handleSortOrderChange = (newOrder: 'first' | 'last') => {
        if (onSortOrderChange) {
            onSortOrderChange(newOrder);
        } else {
            setInternalSortOrder(newOrder);
        }
    };

    // Build shift configuration dynamically from shifts prop
    const shiftConfig: Record<
        number,
        { label: string; color: string; shortLabel: string }
    > = useMemo(() => {
        const config: Record<
            number,
            { label: string; color: string; shortLabel: string }
        > = {
            0: {
                label: 'OFF',
                color: '#EF4444',
                shortLabel: 'O',
            },
        };

        if (!shifts || shifts.length === 0) {
            // Add default shifts
            config[1] = { label: 'Pagi', color: '#2196F3', shortLabel: 'P' };
            config[2] = { label: 'Siang', color: '#FF9800', shortLabel: 'S' };
            config[3] = { label: 'Malam', color: '#9C27B0', shortLabel: 'M' };
            return config;
        }

        shifts
            .filter((shift) => shift.is_active)
            .forEach((shift) => {
                config[shift.id] = {
                    label: shift.name,
                    color: shift.color,
                    shortLabel:
                        shift.code || shift.name.charAt(0).toUpperCase(),
                };
            });

        return config;
    }, [shifts]);

    const daysInMonth = getDaysInMonth(selectedMonth);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // Calculate roster data for each user
    const rosterData = useMemo(() => {
        const data = userAssignments.map((assignment) => {
            const pattern = patterns?.find(
                (p) => p.id === assignment.pattern_id
            );

            // Create shifts array for the month
            const shifts = Array.from(
                { length: daysInMonth },
                (_, dayIndex) => {
                    const day = dayIndex + 1;
                    const dateStr = format(
                        new Date(
                            selectedMonth.getFullYear(),
                            selectedMonth.getMonth(),
                            day
                        ),
                        'yyyy-MM-dd'
                    );

                    // Check if there's an actual shift assignment for this date
                    const actualAssignment = shiftAssignments.find(
                        (sa) =>
                            sa.user_id === assignment.user_id &&
                            sa.assignment_date === dateStr
                    );

                    if (actualAssignment) {
                        // Use actual shift assignment from database
                        return actualAssignment.shift_id;
                    } else if (pattern) {
                        // Fallback to pattern data if no actual assignment
                        const patternIndex = dayIndex % 7;
                        return pattern.pattern_data[patternIndex];
                    } else {
                        // No pattern and no assignment = OFF (0)
                        return 0;
                    }
                }
            );

            // Find first OFF day position and day of week
            const firstOffDay =
                shifts.findIndex((shiftId) => shiftId === 0) + 1;

            // Get day of week for first OFF (0=Sunday, 1=Monday, ..., 6=Saturday)
            let offDayOfWeek = 0;
            if (firstOffDay > 0 && firstOffDay <= 999) {
                const offDate = new Date(
                    selectedMonth.getFullYear(),
                    selectedMonth.getMonth(),
                    firstOffDay
                );
                offDayOfWeek = offDate.getDay();
                // Convert Sunday (0) to 7 for proper sorting (closest to weekend)
                if (offDayOfWeek === 0) offDayOfWeek = 7;
            }

            return {
                ...assignment,
                shifts,
                pattern,
                firstOffDay: firstOffDay || 999, // 999 if no OFF found
                offDayOfWeek, // 1=Monday, 2=Tuesday, ..., 6=Saturday, 7=Sunday
            };
        });

        // Sort based on sortOrder state
        if (sortOrder === 'first') {
            // Sort by first OFF day number (1, 2, 3, ...)
            return data.sort((a, b) => a.firstOffDay - b.firstOffDay);
        } else {
            // Sort by day of week descending (Sunday=7, Saturday=6, ..., Monday=1)
            return data.sort((a, b) => b.offDayOfWeek - a.offDayOfWeek);
        }
    }, [
        userAssignments,
        patterns,
        daysInMonth,
        selectedMonth,
        shiftAssignments,
        sortOrder,
    ]);

    // Calculate statistics dynamically based on available shifts
    const totalAssignments = userAssignments.filter((a) => a.pattern_id).length;
    const totalUsers = userAssignments.length;

    const shiftCounts: Record<number, number> = { 0: 0 };
    if (shifts) {
        shifts.forEach((shift) => {
            if (shift.is_active) {
                shiftCounts[shift.id] = 0;
            }
        });
    }

    rosterData.forEach((user) => {
        user.shifts.forEach((shift) => {
            if (shiftCounts[shift] !== undefined) {
                shiftCounts[shift]++;
            }
        });
    });

    const stats = {
        assignedUsers: totalAssignments,
        totalUsers,
        unassignedUsers: totalUsers - totalAssignments,
        shiftCounts,
    };

    return (
        <div className='border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden'>
            {/* Month Selector - Fixed, tidak scroll */}
            <div className='flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800'>
                <div className='flex items-center gap-2'>
                    <Button
                        variant='outline'
                        onClick={onPrevMonth}
                        disabled={isLoading}
                        size='sm'
                    >
                        Previous
                    </Button>
                    <Button
                        variant='outline'
                        onClick={() =>
                            handleSortOrderChange(
                                sortOrder === 'first' ? 'last' : 'first'
                            )
                        }
                        disabled={isLoading}
                        size='sm'
                        className='gap-2'
                    >
                        <ArrowUpDown className='h-4 w-4' />
                        {sortOrder === 'first' ? 'First OFF' : 'Last OFF'}
                    </Button>
                </div>
                <h3 className='text-2xl font-bold text-gray-900 dark:text-white'>
                    {format(selectedMonth, 'MMMM yyyy')}
                </h3>
                <Button
                    variant='outline'
                    onClick={onNextMonth}
                    disabled={isLoading}
                    size='sm'
                >
                    Next
                </Button>
            </div>

            {/* Calendar Grid - Split Layout */}
            <div className='flex'>
                {/* Left Side - Personnel Column (Fixed) */}
                <div className='w-64 flex-shrink-0 border-r border-gray-200 dark:border-gray-800'>
                    {/* Personnel Header */}
                    <div className='bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-3'>
                        <span className='text-sm font-semibold text-gray-900 dark:text-white'>
                            Personnel
                        </span>
                    </div>

                    {/* Personnel Rows */}
                    <div className='divide-y divide-gray-100 dark:divide-gray-800'>
                        {rosterData.map((user) => (
                            <div
                                key={user.user_id}
                                className='p-3 space-y-2 bg-white dark:bg-gray-950 hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors min-h-[92px] flex flex-col justify-center'
                            >
                                <div className='font-semibold text-sm text-gray-900 dark:text-white'>
                                    {user.user_name}
                                </div>
                                <Select
                                    value={user.pattern_id?.toString() || ''}
                                    onValueChange={(value) =>
                                        onPatternChange(user.user_id, value)
                                    }
                                >
                                    <SelectTrigger className='h-8 text-xs w-full'>
                                        <SelectValue placeholder='No pattern' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {patterns?.map((pattern) => (
                                            <SelectItem
                                                key={pattern.id}
                                                value={pattern.id.toString()}
                                            >
                                                {pattern.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Side - Calendar Grid (Scrollable) */}
                <div className='flex-1 overflow-x-auto'>
                    <div className='min-w-max'>
                        {/* Days Header */}
                        <div className='bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex'>
                            {days.map((day) => {
                                const date = new Date(
                                    selectedMonth.getFullYear(),
                                    selectedMonth.getMonth(),
                                    day
                                );
                                const isWeekend =
                                    date.getDay() === 0 || date.getDay() === 6;

                                return (
                                    <div
                                        key={day}
                                        className={cn(
                                            'w-16 flex-shrink-0 p-2 text-center border-r border-gray-100 dark:border-gray-800',
                                            isWeekend &&
                                                'bg-red-100 dark:bg-red-950/30'
                                        )}
                                    >
                                        <div className='text-xs font-medium text-gray-900 dark:text-white'>
                                            {day}
                                        </div>
                                        <div className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>
                                            {format(date, 'EEE')}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Days Rows */}
                        <div className='divide-y divide-gray-100 dark:divide-gray-800'>
                            {rosterData.map((user) => (
                                <div
                                    key={user.user_id}
                                    className='flex hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors min-h-[92px]'
                                >
                                    {/* Shift Cells */}
                                    {user.shifts.map((shift, dayIndex) => {
                                        const date = new Date(
                                            selectedMonth.getFullYear(),
                                            selectedMonth.getMonth(),
                                            dayIndex + 1
                                        );
                                        const isWeekend =
                                            date.getDay() === 0 ||
                                            date.getDay() === 6;
                                        const currentShiftConfig =
                                            shiftConfig[shift as number];

                                        if (!currentShiftConfig) {
                                            console.warn(
                                                `❌ Shift ID ${shift} tidak ditemukan di shiftConfig untuk user ${
                                                    user.user_name
                                                } pada hari ${dayIndex + 1}`
                                            );
                                            return (
                                                <div
                                                    key={dayIndex}
                                                    className={cn(
                                                        'w-16 flex-shrink-0 flex items-center justify-center p-2 border-r border-gray-100 dark:border-gray-800',
                                                        isWeekend
                                                            ? 'bg-gray-100 dark:bg-gray-900'
                                                            : 'bg-white dark:bg-gray-950'
                                                    )}
                                                    title={`Shift ID ${shift} not found`}
                                                >
                                                    <div className='w-10 h-10 rounded-md bg-gray-200 dark:bg-gray-800 flex flex-col items-center justify-center text-[10px] font-bold text-gray-500'>
                                                        <span>?</span>
                                                        <span className='text-[8px]'>
                                                            ID:{shift}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        }

                                        return (
                                            <div
                                                key={dayIndex}
                                                className={cn(
                                                    'w-16 flex-shrink-0 p-2 flex items-center justify-center border-r border-gray-100 dark:border-gray-800',
                                                    isWeekend &&
                                                        'bg-red-100 dark:bg-red-900/70'
                                                )}
                                            >
                                                {user.pattern_id ? (
                                                    <div
                                                        className='w-10 h-10 rounded-md flex items-center justify-center text-sm font-bold border transition-all hover:scale-110 cursor-pointer'
                                                        style={{
                                                            backgroundColor: `${currentShiftConfig.color}30`,
                                                            borderColor:
                                                                currentShiftConfig.color,
                                                            color: currentShiftConfig.color,
                                                        }}
                                                        title={`${user.user_name} - ${currentShiftConfig.label}`}
                                                    >
                                                        {
                                                            currentShiftConfig.shortLabel
                                                        }
                                                    </div>
                                                ) : (
                                                    <div className='text-xs text-gray-300 dark:text-gray-700'>
                                                        -
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer - Statistics & Legend */}
            <div className='border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900'>
                {/* Statistics */}
                <div className='flex flex-wrap items-center gap-4 py-3 px-6'>
                    <div className='flex items-center gap-2'>
                        <span className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                            Assigned:
                        </span>
                        <span className='text-lg font-bold text-gray-900 dark:text-white'>
                            {stats.assignedUsers}/{stats.totalUsers}
                        </span>
                    </div>

                    {shifts &&
                        shifts
                            .filter(
                                (shift) => shift.is_active && shift.id !== 0
                            )
                            .map((shift, index) => (
                                <div
                                    key={shift.id}
                                    className='flex items-center gap-2'
                                >
                                    {index > 0 && (
                                        <div className='w-px h-4 bg-gray-300 dark:bg-gray-700' />
                                    )}
                                    <div
                                        className='w-3 h-3 rounded-full'
                                        style={{
                                            backgroundColor: shift.color,
                                        }}
                                    />
                                    <span className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                                        {shift.name}:
                                    </span>
                                    <span
                                        className='text-lg font-bold'
                                        style={{
                                            color: shift.color,
                                        }}
                                    >
                                        {stats.shiftCounts[shift.id] || 0}
                                    </span>
                                </div>
                            ))}
                </div>

                {/* Legend */}
                <div className='flex flex-wrap items-center gap-3 py-2 px-6 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950'>
                    <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                        Legend:
                    </span>
                    {Object.entries(shiftConfig).map(([key, config]) => (
                        <Badge
                            key={key}
                            variant='outline'
                            className='font-medium border'
                            style={{
                                backgroundColor: `${config.color}20`,
                                borderColor: config.color,
                                color: config.color,
                            }}
                        >
                            {config.label}
                        </Badge>
                    ))}
                </div>
            </div>
        </div>
    );
}
