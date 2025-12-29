'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assignmentService } from '@/services/assignment.service';
import { patternService } from '@/services/pattern.service';
import { userService } from '@/services/user.service';
import { rosterService } from '@/services/roster.service';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PageContainer } from '@/components/layout/page-container';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Calendar,
    Users,
    Save,
    RefreshCw,
    Sparkles,
    Library,
    CalendarDays,
    TableProperties,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, addMonths, subMonths } from 'date-fns';
import { PatternManagementModal } from '@/components/patterns/pattern-management-modal';
import { RosterCalendarView } from '@/components/roster/roster-calendar-view';

const SHIFT_LABELS = ['OFF', 'P', 'S', 'M'];
const SHIFT_COLORS = [
    'bg-gray-100 text-gray-700',
    'bg-sky-100 text-sky-700',
    'bg-amber-100 text-amber-700',
    'bg-violet-100 text-violet-700',
];

export default function AssignmentsPage() {
    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const [assignments, setAssignments] = useState<Record<number, number>>({});
    const [hasChanges, setHasChanges] = useState(false);
    const [patternModalOpen, setPatternModalOpen] = useState(false);

    const queryClient = useQueryClient();

    const monthString = format(selectedMonth, 'yyyy-MM-01');
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth() + 1;

    // Fetch current assignments for selected month
    const { data: currentAssignments, isLoading: loadingAssignments } =
        useQuery({
            queryKey: ['roster-assignments', year, month],
            queryFn: () => assignmentService.getMonthAssignments(year, month),
        });

    // Fetch active patterns
    const { data: patterns, isLoading: loadingPatterns } = useQuery({
        queryKey: ['patterns'],
        queryFn: () => patternService.getPatterns(true),
    });

    // Fetch active users
    const { data: users, isLoading: loadingUsers } = useQuery({
        queryKey: ['users', 'active'],
        queryFn: () => userService.getUsers({ status: 'active' }),
    });

    // Initialize assignments state from currentAssignments
    useEffect(() => {
        if (currentAssignments && currentAssignments.length > 0) {
            const initialAssignments: Record<number, number> = {};
            currentAssignments.forEach((assignment) => {
                if (assignment.pattern_id) {
                    initialAssignments[assignment.user_id] =
                        assignment.pattern_id;
                }
            });
            setAssignments(initialAssignments);
            setHasChanges(false);
        }
    }, [currentAssignments]);

    // Save assignments mutation
    const saveMutation = useMutation({
        mutationFn: () => {
            const assignmentData = Object.entries(assignments).map(
                ([userId, patternId]) => ({
                    user_id: parseInt(userId),
                    pattern_id: patternId,
                })
            );

            return assignmentService.bulkAssign({
                assignment_month: monthString,
                assignments: assignmentData,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roster-assignments'] });
            setHasChanges(false);
        },
    });

    // Generate roster mutation
    const generateMutation = useMutation({
        mutationFn: (force: boolean) => {
            return rosterService.generateRoster({
                month: monthString,
                force,
            });
        },
        onSuccess: (data) => {
            // Show success message
            alert(
                `Roster generated successfully!\n\n` +
                    `Month: ${data.month}\n` +
                    `Days: ${data.days}\n` +
                    `Users: ${data.users}\n` +
                    `Created: ${data.created} shift assignments\n` +
                    `${data.skipped > 0 ? `Skipped: ${data.skipped}\n` : ''}`
            );
        },
        onError: (error: unknown) => {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Unknown error occurred';
            alert(`Failed to generate roster: ${errorMessage}`);
        },
    });

    const handlePatternChange = (userId: number, patternId: string) => {
        setAssignments((prev) => ({
            ...prev,
            [userId]: parseInt(patternId),
        }));
        setHasChanges(true);
    };

    const handleSave = () => {
        saveMutation.mutate();
    };

    const handlePrevMonth = () => {
        setSelectedMonth((prev) => subMonths(prev, 1));
        setAssignments({});
        setHasChanges(false);
    };

    const handleNextMonth = () => {
        setSelectedMonth((prev) => addMonths(prev, 1));
        setAssignments({});
        setHasChanges(false);
    };

    const handleAutoAssign = () => {
        // Auto-assign patterns in rotation
        if (!patterns || patterns.length === 0 || !users) return;

        const newAssignments: Record<number, number> = {};

        users.forEach((user, idx) => {
            const patternIdx = idx % patterns.length;
            newAssignments[user.id] = patterns[patternIdx].id;
        });

        setAssignments(newAssignments);
        setHasChanges(true);
    };

    // Combine users with existing assignments
    const userAssignments = useMemo(() => {
        if (!users) return [];

        return users.map((user) => {
            const existingAssignment = currentAssignments?.find(
                (a) => a.user_id === user.id
            );

            // Check if there's a pending change in assignments state
            const pendingPatternId = assignments[user.id];
            const patternId =
                pendingPatternId !== undefined
                    ? pendingPatternId
                    : existingAssignment?.pattern_id || null;

            const pattern = patterns?.find((p) => p.id === patternId);

            return {
                user_id: user.id,
                user_name: user.name,
                user_phone: user.phone,
                pattern_id: patternId,
                pattern_name:
                    pattern?.name || existingAssignment?.pattern_name || null,
            };
        });
    }, [users, currentAssignments, patterns, assignments]);

    const isLoading = loadingAssignments || loadingPatterns || loadingUsers;

    return (
        <ProtectedRoute>
            <DashboardLayout>
                <PageContainer>
                    {/* Page Header */}
                    <PageHeader
                        title='Roster Management'
                        description='Manage shift patterns and personnel assignments'
                        actions={
                            <Button
                                onClick={() => setPatternModalOpen(true)}
                                variant='outline'
                                className='border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 shadow-sm'
                            >
                                <Library className='h-4 w-4 mr-2' />
                                Manage Patterns
                            </Button>
                        }
                    />

                    {/* Month Selector Card */}
                    <Card className='border border-gray-200 dark:border-gray-800 shadow-sm'>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white'>
                                <Calendar className='h-5 w-5 text-gray-600 dark:text-gray-400' />
                                Select Month
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className='flex items-center justify-center gap-4'>
                                <Button
                                    variant='outline'
                                    onClick={handlePrevMonth}
                                    disabled={isLoading}
                                    size='sm'
                                    className='shadow-sm'
                                >
                                    Previous
                                </Button>
                                <div className='min-w-[200px] text-center'>
                                    <h3 className='text-2xl font-bold text-gray-900 dark:text-white'>
                                        {format(selectedMonth, 'MMMM yyyy')}
                                    </h3>
                                </div>
                                <Button
                                    variant='outline'
                                    onClick={handleNextMonth}
                                    disabled={isLoading}
                                    size='sm'
                                    className='shadow-sm'
                                >
                                    Next
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <Card className='border border-gray-200 dark:border-gray-800 shadow-sm'>
                        <CardHeader>
                            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                                <div>
                                    <CardTitle className='flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white'>
                                        <Users className='h-5 w-5 text-gray-600 dark:text-gray-400' />
                                        Personnel Assignments
                                    </CardTitle>
                                    <CardDescription className='mt-1'>
                                        Assign patterns to each person for{' '}
                                        {format(selectedMonth, 'MMMM yyyy')}
                                    </CardDescription>
                                </div>
                                <div className='flex flex-wrap gap-2'>
                                    <Button
                                        variant='outline'
                                        size='sm'
                                        onClick={handleAutoAssign}
                                        disabled={
                                            isLoading ||
                                            !patterns ||
                                            patterns.length === 0
                                        }
                                        className='shadow-sm'
                                    >
                                        <RefreshCw className='h-4 w-4 mr-2' />
                                        Auto Assign
                                    </Button>
                                    <Button
                                        size='sm'
                                        onClick={handleSave}
                                        disabled={
                                            !hasChanges ||
                                            saveMutation.isPending
                                        }
                                        className='bg-blue-600 hover:bg-blue-700 shadow-sm'
                                    >
                                        <Save className='h-4 w-4 mr-2' />
                                        Save
                                    </Button>
                                    <Button
                                        size='sm'
                                        className='bg-purple-600 hover:bg-purple-700 shadow-sm'
                                        onClick={() =>
                                            generateMutation.mutate(false)
                                        }
                                        disabled={
                                            generateMutation.isPending ||
                                            !userAssignments ||
                                            userAssignments.filter(
                                                (a) => a.pattern_id
                                            ).length === 0
                                        }
                                    >
                                        <Sparkles className='h-4 w-4 mr-2' />
                                        Generate Roster
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue='calendar' className='w-full'>
                                <TabsList className='grid w-full max-w-md mx-auto grid-cols-2'>
                                    <TabsTrigger
                                        value='calendar'
                                        className='flex items-center gap-2'
                                    >
                                        <CalendarDays className='h-4 w-4' />
                                        Calendar View
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value='table'
                                        className='flex items-center gap-2'
                                    >
                                        <TableProperties className='h-4 w-4' />
                                        Table View
                                    </TabsTrigger>
                                </TabsList>
                                {/* Calendar View Tab */}
                                <TabsContent value='calendar' className='mt-6'>
                                    {isLoading ? (
                                        <div className='flex items-center justify-center py-12'>
                                            <div className='text-gray-500'>
                                                Loading...
                                            </div>
                                        </div>
                                    ) : !users || users.length === 0 ? (
                                        <div className='text-center py-12 bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800'>
                                            <p className='text-gray-500 mb-4'>
                                                No active users found
                                            </p>
                                            <p className='text-sm text-gray-400'>
                                                Add active users first to manage
                                                roster assignments
                                            </p>
                                        </div>
                                    ) : !patterns || patterns.length === 0 ? (
                                        <div className='text-center py-12 bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800'>
                                            <p className='text-gray-500 mb-4'>
                                                No patterns found
                                            </p>
                                            <p className='text-sm text-gray-400'>
                                                Create shift patterns first
                                                using the &quot;Manage
                                                Patterns&quot; button
                                            </p>
                                        </div>
                                    ) : (
                                        <RosterCalendarView
                                            selectedMonth={selectedMonth}
                                            userAssignments={userAssignments}
                                            patterns={patterns}
                                            onPatternChange={
                                                handlePatternChange
                                            }
                                        />
                                    )}
                                </TabsContent>
                                {/* Table View Tab */}
                                <TabsContent value='table' className='mt-6'>
                                    {isLoading ? (
                                        <div className='flex items-center justify-center py-12'>
                                            <div className='text-gray-500'>
                                                Loading...
                                            </div>
                                        </div>
                                    ) : !users || users.length === 0 ? (
                                        <div className='text-center py-12'>
                                            <p className='text-gray-500 mb-4'>
                                                No active users found
                                            </p>
                                            <p className='text-sm text-gray-400'>
                                                Add active users first to manage
                                                roster assignments
                                            </p>
                                        </div>
                                    ) : !patterns || patterns.length === 0 ? (
                                        <div className='text-center py-12'>
                                            <p className='text-gray-500 mb-4'>
                                                No patterns found
                                            </p>
                                            <p className='text-sm text-gray-400'>
                                                Create shift patterns first
                                                using the &quot;Manage
                                                Patterns&quot; button
                                            </p>
                                        </div>
                                    ) : (
                                        <Table>
                                            <TableHeader>
                                                <TableRow className='bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800'>
                                                    <TableHead className='font-semibold'>
                                                        Personnel
                                                    </TableHead>
                                                    <TableHead className='font-semibold'>
                                                        Current Pattern
                                                    </TableHead>
                                                    <TableHead className='font-semibold'>
                                                        Assign Pattern
                                                    </TableHead>
                                                    <TableHead className='font-semibold'>
                                                        Preview
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {userAssignments.map(
                                                    (assignment) => {
                                                        const selectedPatternId =
                                                            assignments[
                                                                assignment
                                                                    .user_id
                                                            ] ||
                                                            assignment.pattern_id;
                                                        const selectedPattern =
                                                            patterns?.find(
                                                                (p) =>
                                                                    p.id ===
                                                                    selectedPatternId
                                                            );

                                                        return (
                                                            <TableRow
                                                                key={
                                                                    assignment.user_id
                                                                }
                                                                className='hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors border-b border-gray-100 dark:border-gray-900 last:border-0'
                                                            >
                                                                <TableCell className='font-medium text-gray-900 dark:text-white'>
                                                                    <div>
                                                                        <div className='font-semibold'>
                                                                            {
                                                                                assignment.user_name
                                                                            }
                                                                        </div>
                                                                        <div className='text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5'>
                                                                            {
                                                                                assignment.user_phone
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className='text-sm text-gray-600 dark:text-gray-400'>
                                                                        {assignment.pattern_name || (
                                                                            <span className='text-gray-400 dark:text-gray-500 italic'>
                                                                                Not
                                                                                assigned
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Select
                                                                        value={
                                                                            selectedPatternId?.toString() ||
                                                                            ''
                                                                        }
                                                                        onValueChange={(
                                                                            value
                                                                        ) =>
                                                                            handlePatternChange(
                                                                                assignment.user_id,
                                                                                value
                                                                            )
                                                                        }
                                                                    >
                                                                        <SelectTrigger className='w-[250px] shadow-sm'>
                                                                            <SelectValue placeholder='Select pattern' />
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
                                                                </TableCell>
                                                                <TableCell>
                                                                    {selectedPattern && (
                                                                        <div className='flex gap-1'>
                                                                            {selectedPattern.pattern_data.map(
                                                                                (
                                                                                    shift,
                                                                                    idx
                                                                                ) => (
                                                                                    <div
                                                                                        key={
                                                                                            idx
                                                                                        }
                                                                                        className={cn(
                                                                                            'w-8 h-8 rounded flex items-center justify-center text-xs font-bold',
                                                                                            SHIFT_COLORS[
                                                                                                shift
                                                                                            ]
                                                                                        )}
                                                                                    >
                                                                                        {
                                                                                            SHIFT_LABELS[
                                                                                                shift
                                                                                            ]
                                                                                        }
                                                                                    </div>
                                                                                )
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    }
                                                )}
                                            </TableBody>
                                        </Table>
                                    )}
                                    \n{' '}
                                </TabsContent>
                                \n{' '}
                            </Tabs>
                        </CardContent>
                    </Card>

                    {/* Pattern Legend */}
                    {patterns && patterns.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Available Patterns</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                                    {patterns.map((pattern) => (
                                        <div
                                            key={pattern.id}
                                            className='border rounded-lg p-3 space-y-2'
                                        >
                                            <div className='font-semibold text-sm'>
                                                {pattern.name}
                                            </div>
                                            <div className='flex gap-1'>
                                                {pattern.pattern_data.map(
                                                    (shift, idx) => (
                                                        <div
                                                            key={idx}
                                                            className={cn(
                                                                'flex-1 aspect-square rounded flex items-center justify-center text-xs font-bold',
                                                                SHIFT_COLORS[
                                                                    shift
                                                                ]
                                                            )}
                                                        >
                                                            {
                                                                SHIFT_LABELS[
                                                                    shift
                                                                ]
                                                            }
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </PageContainer>

                {/* Pattern Management Modal */}
                <PatternManagementModal
                    open={patternModalOpen}
                    onOpenChange={setPatternModalOpen}
                />
            </DashboardLayout>
        </ProtectedRoute>
    );
}
