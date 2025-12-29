'use client';

import { useMemo } from 'react';
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
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

interface RosterCalendarViewProps {
    selectedMonth: Date;
    userAssignments: UserAssignment[];
    patterns: Pattern[];
    shifts?: Shift[];
    onPatternChange: (userId: number, patternId: string) => void;
    onPrevMonth: () => void;
    onNextMonth: () => void;
    isLoading?: boolean;
}

export function RosterCalendarView({
    selectedMonth,
    userAssignments,
    patterns,
    shifts,
    onPatternChange,
    onPrevMonth,
    onNextMonth,
    isLoading = false,
}: RosterCalendarViewProps) {
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
                color: '#9CA3AF',
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
                    shortLabel: shift.name.charAt(0).toUpperCase(),
                };
            });

        return config;
    }, [shifts]);

    const daysInMonth = getDaysInMonth(selectedMonth);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // Calculate roster data for each user
    const rosterData = userAssignments.map((assignment) => {
        const pattern = patterns?.find((p) => p.id === assignment.pattern_id);
        const shifts = pattern
            ? Array.from({ length: daysInMonth }, (_, dayIndex) => {
                  const patternIndex = dayIndex % 7;
                  return pattern.pattern_data[patternIndex];
              })
            : Array(daysInMonth).fill(0);

        return {
            ...assignment,
            shifts,
            pattern,
        };
    });

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
        <div className='space-y-0'>
            {/* Calendar Card - Everything inside one card */}
            <Card className='border-gray-200 dark:border-gray-800'>
                <CardContent className='p-6 space-y-4'>
                    {/* Statistics - Horizontal flexible layout */}
                    <div className='flex flex-wrap items-center gap-4 py-3 px-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800'>
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
                                            style={{ color: shift.color }}
                                        >
                                            {stats.shiftCounts[shift.id] || 0}
                                        </span>
                                    </div>
                                ))}
                    </div>

                    {/* Legend - Horizontal */}
                    <div className='flex flex-wrap items-center gap-3 py-2 px-4 bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800'>
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

                    {/* Month Selector + Calendar Grid - Single Container */}
                    <div className='border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden'>
                        {/* Month Selector - Fixed, tidak scroll */}
                        <div className='flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800'>
                            <Button
                                variant='outline'
                                onClick={onPrevMonth}
                                disabled={isLoading}
                                size='sm'
                            >
                                Previous
                            </Button>
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

                        {/* Calendar Grid - Scrollable */}
                        <div className='overflow-x-auto'>
                            <div className='inline-block min-w-full align-middle'>
                                <div className='overflow-hidden'>
                                    {/* Header Row */}
                                    <div className='bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex'>
                                        {/* Personnel Column Header - Sticky */}
                                        <div className='sticky left-0 z-20 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 w-64 flex-shrink-0 shadow-[2px_0_5px_rgba(0,0,0,0.05)]'>
                                            <div className='p-3'>
                                                <span className='text-sm font-semibold text-gray-900 dark:text-white'>
                                                    Personnel
                                                </span>
                                            </div>
                                        </div>

                                        {/* Days Header - Scrollable */}
                                        <div className='flex'>
                                            {days.map((day) => {
                                                const date = new Date(
                                                    selectedMonth.getFullYear(),
                                                    selectedMonth.getMonth(),
                                                    day
                                                );
                                                const isWeekend =
                                                    date.getDay() === 0 ||
                                                    date.getDay() === 6;

                                                return (
                                                    <div
                                                        key={day}
                                                        className={cn(
                                                            'w-16 flex-shrink-0 p-2 text-center border-r border-gray-100 dark:border-gray-800',
                                                            isWeekend &&
                                                                'bg-orange-50/50 dark:bg-orange-950/10'
                                                        )}
                                                    >
                                                        <div className='text-xs font-medium text-gray-900 dark:text-white'>
                                                            {day}
                                                        </div>
                                                        <div className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>
                                                            {format(
                                                                date,
                                                                'EEE'
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Personnel Rows */}
                                    <div className='divide-y divide-gray-100 dark:divide-gray-800'>
                                        {rosterData.map((user) => (
                                            <div
                                                key={user.user_id}
                                                className='flex hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors'
                                            >
                                                {/* Personnel Info - Sticky */}
                                                <div className='sticky left-0 z-10 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 w-64 flex-shrink-0 shadow-[2px_0_5px_rgba(0,0,0,0.05)]'>
                                                    <div className='p-3 space-y-2'>
                                                        <div className='font-semibold text-sm text-gray-900 dark:text-white'>
                                                            {user.user_name}
                                                        </div>
                                                        <Select
                                                            value={
                                                                user.pattern_id?.toString() ||
                                                                ''
                                                            }
                                                            onValueChange={(
                                                                value
                                                            ) =>
                                                                onPatternChange(
                                                                    user.user_id,
                                                                    value
                                                                )
                                                            }
                                                        >
                                                            <SelectTrigger className='h-8 text-xs w-full'>
                                                                <SelectValue placeholder='No pattern' />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {patterns?.map(
                                                                    (
                                                                        pattern
                                                                    ) => (
                                                                        <SelectItem
                                                                            key={
                                                                                pattern.id
                                                                            }
                                                                            value={pattern.id.toString()}
                                                                        >
                                                                            {
                                                                                pattern.name
                                                                            }
                                                                        </SelectItem>
                                                                    )
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>

                                                {/* Shift Cells - Scrollable */}
                                                <div className='flex'>
                                                    {user.shifts.map(
                                                        (shift, dayIndex) => {
                                                            const date =
                                                                new Date(
                                                                    selectedMonth.getFullYear(),
                                                                    selectedMonth.getMonth(),
                                                                    dayIndex + 1
                                                                );
                                                            const isWeekend =
                                                                date.getDay() ===
                                                                    0 ||
                                                                date.getDay() ===
                                                                    6;
                                                            const currentShiftConfig =
                                                                shiftConfig[
                                                                    shift as number
                                                                ];

                                                            if (
                                                                !currentShiftConfig
                                                            ) {
                                                                return (
                                                                    <div
                                                                        key={
                                                                            dayIndex
                                                                        }
                                                                        className={cn(
                                                                            'w-16 flex-shrink-0 flex items-center justify-center p-2',
                                                                            isWeekend
                                                                                ? 'bg-gray-100 dark:bg-gray-900'
                                                                                : 'bg-white dark:bg-gray-950'
                                                                        )}
                                                                    >
                                                                        <div className='w-10 h-10 rounded-md bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-500'>
                                                                            ?
                                                                        </div>
                                                                    </div>
                                                                );
                                                            }

                                                            return (
                                                                <div
                                                                    key={
                                                                        dayIndex
                                                                    }
                                                                    className={cn(
                                                                        'w-16 flex-shrink-0 p-2 flex items-center justify-center border-r border-gray-100 dark:border-gray-800',
                                                                        isWeekend &&
                                                                            'bg-gray-50/50 dark:bg-gray-900/50'
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
                                                        }
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
