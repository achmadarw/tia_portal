'use client';

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
    onPatternChange: (userId: number, patternId: string) => void;
}

const SHIFT_CONFIG = {
    0: {
        label: 'OFF',
        color: 'bg-gray-100 text-gray-600 border-gray-200',
        shortLabel: 'O',
    },
    1: {
        label: 'Pagi',
        color: 'bg-blue-100 text-blue-700 border-blue-200',
        shortLabel: 'P',
    },
    2: {
        label: 'Siang',
        color: 'bg-orange-100 text-orange-700 border-orange-200',
        shortLabel: 'S',
    },
    3: {
        label: 'Malam',
        color: 'bg-purple-100 text-purple-700 border-purple-200',
        shortLabel: 'M',
    },
};

export function RosterCalendarView({
    selectedMonth,
    userAssignments,
    patterns,
    onPatternChange,
}: RosterCalendarViewProps) {
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

    // Calculate statistics
    const totalAssignments = userAssignments.filter((a) => a.pattern_id).length;
    const totalUsers = userAssignments.length;

    const totalShifts = { pagi: 0, siang: 0, malam: 0, off: 0 };
    rosterData.forEach((user) => {
        user.shifts.forEach((shift) => {
            if (shift === 0) totalShifts.off++;
            else if (shift === 1) totalShifts.pagi++;
            else if (shift === 2) totalShifts.siang++;
            else if (shift === 3) totalShifts.malam++;
        });
    });

    const stats = {
        assignedUsers: totalAssignments,
        totalUsers,
        unassignedUsers: totalUsers - totalAssignments,
        ...totalShifts,
    };

    return (
        <div className='space-y-6'>
            {/* Statistics Bar */}
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                <Card className='border-gray-200 dark:border-gray-800'>
                    <CardContent className='p-4'>
                        <div className='text-sm text-gray-600 dark:text-gray-400'>
                            Assigned
                        </div>
                        <div className='text-2xl font-bold text-gray-900 dark:text-white mt-1'>
                            {stats.assignedUsers}/{stats.totalUsers}
                        </div>
                    </CardContent>
                </Card>
                <Card className='border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/20'>
                    <CardContent className='p-4'>
                        <div className='text-sm text-blue-600 dark:text-blue-400'>
                            Pagi Shifts
                        </div>
                        <div className='text-2xl font-bold text-blue-700 dark:text-blue-300 mt-1'>
                            {stats.pagi}
                        </div>
                    </CardContent>
                </Card>
                <Card className='border-orange-200 dark:border-orange-900 bg-orange-50 dark:bg-orange-950/20'>
                    <CardContent className='p-4'>
                        <div className='text-sm text-orange-600 dark:text-orange-400'>
                            Siang Shifts
                        </div>
                        <div className='text-2xl font-bold text-orange-700 dark:text-orange-300 mt-1'>
                            {stats.siang}
                        </div>
                    </CardContent>
                </Card>
                <Card className='border-purple-200 dark:border-purple-900 bg-purple-50 dark:bg-purple-950/20'>
                    <CardContent className='p-4'>
                        <div className='text-sm text-purple-600 dark:text-purple-400'>
                            Malam Shifts
                        </div>
                        <div className='text-2xl font-bold text-purple-700 dark:text-purple-300 mt-1'>
                            {stats.malam}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Legend */}
            <div className='flex flex-wrap items-center gap-3 bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800'>
                <span className='text-sm font-medium text-gray-700 dark:text-gray-300 mr-2'>
                    Legend:
                </span>
                {Object.entries(SHIFT_CONFIG).map(([key, config]) => (
                    <Badge
                        key={key}
                        variant='outline'
                        className={cn('font-medium border', config.color)}
                    >
                        {config.label}
                    </Badge>
                ))}
            </div>

            {/* Calendar - Scrollable Container */}
            <Card className='border-gray-200 dark:border-gray-800'>
                <CardContent className='p-0'>
                    <div className='overflow-x-auto'>
                        <div className='inline-block min-w-full align-middle'>
                            <div className='overflow-hidden'>
                                {/* Header Row */}
                                <div className='bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex'>
                                    {/* Personnel Column Header - Sticky */}
                                    <div className='sticky left-0 z-20 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 w-64 flex-shrink-0'>
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
                                                        {format(date, 'EEE')}
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
                                            <div className='sticky left-0 z-10 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 w-64 flex-shrink-0'>
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
                                                                (pattern) => (
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
                                                        const date = new Date(
                                                            selectedMonth.getFullYear(),
                                                            selectedMonth.getMonth(),
                                                            dayIndex + 1
                                                        );
                                                        const isWeekend =
                                                            date.getDay() ===
                                                                0 ||
                                                            date.getDay() === 6;
                                                        const shiftConfig =
                                                            SHIFT_CONFIG[
                                                                shift as keyof typeof SHIFT_CONFIG
                                                            ];

                                                        return (
                                                            <div
                                                                key={dayIndex}
                                                                className={cn(
                                                                    'w-16 flex-shrink-0 p-2 flex items-center justify-center border-r border-gray-100 dark:border-gray-800',
                                                                    isWeekend &&
                                                                        'bg-gray-50/50 dark:bg-gray-900/50'
                                                                )}
                                                            >
                                                                {user.pattern_id ? (
                                                                    <div
                                                                        className={cn(
                                                                            'w-10 h-10 rounded-md flex items-center justify-center text-sm font-bold border transition-all hover:scale-110 cursor-pointer',
                                                                            shiftConfig.color
                                                                        )}
                                                                        title={`${user.user_name} - ${shiftConfig.label}`}
                                                                    >
                                                                        {
                                                                            shiftConfig.shortLabel
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
                </CardContent>
            </Card>

            {/* Empty State */}
            {userAssignments.length === 0 && (
                <Card className='border-gray-200 dark:border-gray-800'>
                    <CardContent className='p-12 text-center'>
                        <p className='text-gray-500 dark:text-gray-400'>
                            No personnel found
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
