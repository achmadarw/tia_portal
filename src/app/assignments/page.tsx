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
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Users,
    Save,
    RefreshCw,
    Sparkles,
    Library,
    CalendarDays,
} from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';
import { PatternManagementModal } from '@/components/patterns/pattern-management-modal';
import { ShiftManagementModal } from '@/components/shifts/shift-management-modal';
import { RosterCalendarView } from '@/components/roster/roster-calendar-view';
import { shiftService } from '@/services/shift.service';

export default function AssignmentsPage() {
    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const [assignments, setAssignments] = useState<Record<number, number>>({});
    const [hasChanges, setHasChanges] = useState(false);
    const [patternModalOpen, setPatternModalOpen] = useState(false);
    const [shiftModalOpen, setShiftModalOpen] = useState(false);

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

    // Fetch shifts for dynamic rendering
    const { data: shifts } = useQuery({
        queryKey: ['shifts'],
        queryFn: () => shiftService.getShifts(),
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
                            <div className='flex gap-2'>
                                <Button
                                    onClick={() => setShiftModalOpen(true)}
                                    variant='outline'
                                    className='border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 shadow-sm'
                                >
                                    <CalendarDays className='h-4 w-4 mr-2' />
                                    Manage Shifts
                                </Button>
                                <Button
                                    onClick={() => setPatternModalOpen(true)}
                                    variant='outline'
                                    className='border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 shadow-sm'
                                >
                                    <Library className='h-4 w-4 mr-2' />
                                    Manage Patterns
                                </Button>
                            </div>
                        }
                    />

                    {/* Main Calendar Card */}
                    <Card className='border border-gray-200 dark:border-gray-800 shadow-sm'>
                        <CardHeader>
                            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                                <div>
                                    <CardTitle className='flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white'>
                                        <Users className='h-5 w-5 text-gray-600 dark:text-gray-400' />
                                        Personnel Assignments
                                    </CardTitle>
                                    <CardDescription className='mt-1'>
                                        Assign patterns to each person
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
                                        Add active users first to manage roster
                                        assignments
                                    </p>
                                </div>
                            ) : !patterns || patterns.length === 0 ? (
                                <div className='text-center py-12 bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800'>
                                    <p className='text-gray-500 mb-4'>
                                        No patterns found
                                    </p>
                                    <p className='text-sm text-gray-400'>
                                        Create shift patterns first using the
                                        &quot;Manage Patterns&quot; button
                                    </p>
                                </div>
                            ) : (
                                <RosterCalendarView
                                    selectedMonth={selectedMonth}
                                    userAssignments={userAssignments}
                                    patterns={patterns}
                                    shifts={shifts}
                                    onPatternChange={handlePatternChange}
                                    onPrevMonth={handlePrevMonth}
                                    onNextMonth={handleNextMonth}
                                    isLoading={isLoading}
                                />
                            )}
                        </CardContent>
                    </Card>
                </PageContainer>

                {/* Pattern Management Modal */}
                <PatternManagementModal
                    open={patternModalOpen}
                    onOpenChange={setPatternModalOpen}
                />

                {/* Shift Management Modal */}
                <ShiftManagementModal
                    open={shiftModalOpen}
                    onOpenChange={setShiftModalOpen}
                />
            </DashboardLayout>
        </ProtectedRoute>
    );
}
