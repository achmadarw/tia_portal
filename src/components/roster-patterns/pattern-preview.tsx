'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Calendar,
    Users,
    Clock,
    TrendingUp,
    CheckCircle2,
    AlertCircle,
} from 'lucide-react';
import type { RosterPattern } from '@/types/roster-pattern';
import { format } from 'date-fns';

interface PatternPreviewProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    pattern: RosterPattern;
}

const SHIFT_NAMES = ['OFF', 'Pagi', 'Siang', 'Sore'];
const SHIFT_COLORS = [
    'bg-red-100 text-red-700 border-red-200',
    'bg-blue-100 text-blue-700 border-blue-200',
    'bg-orange-100 text-orange-700 border-orange-200',
    'bg-purple-100 text-purple-700 border-purple-200',
];

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function PatternPreview({
    open,
    onOpenChange,
    pattern,
}: PatternPreviewProps) {
    // Calculate pattern statistics
    const stats = calculatePatternStats(pattern);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
                <DialogHeader>
                    <div className='flex items-start justify-between'>
                        <div>
                            <DialogTitle className='text-2xl'>
                                {pattern.name}
                            </DialogTitle>
                            <DialogDescription className='mt-2'>
                                {pattern.description ||
                                    'No description provided'}
                            </DialogDescription>
                        </div>
                        {pattern.is_default && (
                            <Badge variant='default' className='ml-4'>
                                Default Pattern
                            </Badge>
                        )}
                    </div>
                </DialogHeader>

                <div className='space-y-6'>
                    {/* Metadata */}
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                        <Card>
                            <CardHeader className='pb-3'>
                                <CardTitle className='text-sm font-medium flex items-center gap-2'>
                                    <Users className='h-4 w-4 text-muted-foreground' />
                                    Personil
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className='text-2xl font-bold'>
                                    {pattern.personil_count}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className='pb-3'>
                                <CardTitle className='text-sm font-medium flex items-center gap-2'>
                                    <Calendar className='h-4 w-4 text-muted-foreground' />
                                    Cycle
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className='text-2xl font-bold'>7 Days</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className='pb-3'>
                                <CardTitle className='text-sm font-medium flex items-center gap-2'>
                                    <Clock className='h-4 w-4 text-muted-foreground' />
                                    Usage
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className='text-2xl font-bold'>
                                    {pattern.usage_count}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className='pb-3'>
                                <CardTitle className='text-sm font-medium flex items-center gap-2'>
                                    <TrendingUp className='h-4 w-4 text-muted-foreground' />
                                    Coverage
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className='text-2xl font-bold'>
                                    {stats.averageCoverage}%
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <Separator />

                    {/* Pattern Grid Preview */}
                    <div>
                        <h3 className='text-lg font-semibold mb-4'>
                            7-Day Cycle Pattern
                        </h3>
                        <div className='rounded-lg border overflow-hidden'>
                            <div className='overflow-x-auto'>
                                <table className='w-full'>
                                    <thead>
                                        <tr className='bg-muted/50'>
                                            <th className='px-4 py-3 text-left text-sm font-medium border-r'>
                                                Row
                                            </th>
                                            {DAY_NAMES.map((day) => (
                                                <th
                                                    key={day}
                                                    className='px-4 py-3 text-center text-sm font-medium'
                                                >
                                                    {day}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pattern.pattern_data.map(
                                            (row, rowIndex) => (
                                                <tr
                                                    key={rowIndex}
                                                    className='border-t'
                                                >
                                                    <td className='px-4 py-3 text-sm font-medium border-r bg-muted/30'>
                                                        Row {rowIndex + 1}
                                                    </td>
                                                    {row.map(
                                                        (
                                                            shiftNum,
                                                            dayIndex
                                                        ) => (
                                                            <td
                                                                key={dayIndex}
                                                                className='px-2 py-3'
                                                            >
                                                                <div className='flex justify-center'>
                                                                    <Badge
                                                                        variant='outline'
                                                                        className={`${SHIFT_COLORS[shiftNum]} min-w-[60px] justify-center`}
                                                                    >
                                                                        {
                                                                            SHIFT_NAMES[
                                                                                shiftNum
                                                                            ]
                                                                        }
                                                                    </Badge>
                                                                </div>
                                                            </td>
                                                        )
                                                    )}
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Pattern Analysis */}
                    <div>
                        <h3 className='text-lg font-semibold mb-4'>
                            Pattern Analysis
                        </h3>
                        <div className='space-y-3'>
                            <div className='flex items-start gap-3 p-3 rounded-lg bg-muted/50'>
                                {stats.isBalanced ? (
                                    <CheckCircle2 className='h-5 w-5 text-green-600 mt-0.5' />
                                ) : (
                                    <AlertCircle className='h-5 w-5 text-orange-600 mt-0.5' />
                                )}
                                <div className='flex-1'>
                                    <p className='text-sm font-medium'>
                                        {stats.isBalanced
                                            ? 'Balanced OFF days distribution'
                                            : 'Unbalanced OFF days distribution'}
                                    </p>
                                    <p className='text-sm text-muted-foreground mt-1'>
                                        OFF days per week:{' '}
                                        {stats.offDaysDistribution.join(', ')}
                                    </p>
                                </div>
                            </div>

                            <div className='flex items-start gap-3 p-3 rounded-lg bg-muted/50'>
                                {stats.fullCoverage ? (
                                    <CheckCircle2 className='h-5 w-5 text-green-600 mt-0.5' />
                                ) : (
                                    <AlertCircle className='h-5 w-5 text-orange-600 mt-0.5' />
                                )}
                                <div className='flex-1'>
                                    <p className='text-sm font-medium'>
                                        {stats.fullCoverage
                                            ? 'Full coverage maintained'
                                            : 'Coverage gaps detected'}
                                    </p>
                                    <p className='text-sm text-muted-foreground mt-1'>
                                        Average {stats.averageCoverage}%
                                        coverage per day
                                    </p>
                                </div>
                            </div>

                            <div className='flex items-start gap-3 p-3 rounded-lg bg-muted/50'>
                                <CheckCircle2 className='h-5 w-5 text-blue-600 mt-0.5' />
                                <div className='flex-1'>
                                    <p className='text-sm font-medium'>
                                        Pattern cycles every 7 days
                                    </p>
                                    <p className='text-sm text-muted-foreground mt-1'>
                                        Predictable schedule for all personnel
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Metadata Footer */}
                    <div className='pt-4 border-t text-sm text-muted-foreground'>
                        <div className='flex justify-between'>
                            <span>
                                Created:{' '}
                                {format(
                                    new Date(pattern.created_at),
                                    'MMM dd, yyyy HH:mm'
                                )}
                            </span>
                            {pattern.last_used_at && (
                                <span>
                                    Last used:{' '}
                                    {format(
                                        new Date(pattern.last_used_at),
                                        'MMM dd, yyyy'
                                    )}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// Helper function to calculate pattern statistics
function calculatePatternStats(pattern: RosterPattern) {
    const { pattern_data } = pattern;
    const rowCount = pattern_data.length;
    const dayCount = 7;

    // Count OFF days per row
    const offDaysDistribution = pattern_data.map(
        (row) => row.filter((shift) => shift === 0).length
    );

    // Check if OFF days are balanced (all rows have same or ±1 OFF days)
    const minOffDays = Math.min(...offDaysDistribution);
    const maxOffDays = Math.max(...offDaysDistribution);
    const isBalanced = maxOffDays - minOffDays <= 1;

    // Calculate average coverage per day (how many people working)
    let totalCoverage = 0;
    for (let day = 0; day < dayCount; day++) {
        const workingCount = pattern_data.filter(
            (row) => row[day] !== 0
        ).length;
        totalCoverage += workingCount;
    }
    const averageCoverage = Math.round(
        (totalCoverage / (dayCount * rowCount)) * 100
    );

    // Check if there's always at least minimum coverage
    const fullCoverage = pattern_data.every((_, day) => {
        const workingCount = pattern_data.filter(
            (row) => row[day] !== 0
        ).length;
        return workingCount >= Math.floor(rowCount * 0.6); // At least 60% coverage
    });

    return {
        offDaysDistribution,
        isBalanced,
        averageCoverage,
        fullCoverage,
    };
}
