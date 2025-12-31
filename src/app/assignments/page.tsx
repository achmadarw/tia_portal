'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
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
    RotateCcw,
    FileDown,
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
    const isInitializedRef = useRef(false);

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

    // Fetch active users (security role only)
    const { data: users, isLoading: loadingUsers } = useQuery({
        queryKey: ['users', 'active', 'security'],
        queryFn: () =>
            userService.getUsers({ status: 'active', role: 'security' }),
    });

    // Fetch shifts for dynamic rendering
    const { data: shifts } = useQuery({
        queryKey: ['shifts'],
        queryFn: () => shiftService.getShifts(),
    });

    // Fetch shift assignments for the selected month
    const { data: shiftAssignments = [] } = useQuery({
        queryKey: ['shift-assignments', monthString],
        queryFn: () =>
            rosterService.getShiftAssignments({
                month: monthString,
            }),
    });

    // Initialize assignments state from currentAssignments
    const initializedAssignments = useMemo(() => {
        if (currentAssignments && currentAssignments.length > 0) {
            const result: Record<number, number> = {};
            currentAssignments.forEach((assignment) => {
                if (assignment.pattern_id) {
                    result[assignment.user_id] = assignment.pattern_id;
                }
            });
            return result;
        }
        return {};
    }, [currentAssignments]);

    // Sync assignments when initialized data changes (using ref to avoid cascading renders)
    // eslint-disable-next-line react-compiler/react-compiler
    useEffect(() => {
        if (
            Object.keys(initializedAssignments).length > 0 &&
            !isInitializedRef.current
        ) {
            isInitializedRef.current = true;
            setAssignments(initializedAssignments);
            setHasChanges(false);
        }
    }, [initializedAssignments]);

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
            // Invalidate shift assignments to refresh calendar
            queryClient.invalidateQueries({
                queryKey: ['shift-assignments', monthString],
            });

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
        isInitializedRef.current = false;
    };

    const handleNextMonth = () => {
        setSelectedMonth((prev) => addMonths(prev, 1));
        setAssignments({});
        setHasChanges(false);
        isInitializedRef.current = false;
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

    const handleReset = () => {
        if (
            confirm(
                'Are you sure you want to reset all assignments to their saved state?'
            )
        ) {
            setAssignments({});
            setHasChanges(false);
            isInitializedRef.current = false;
        }
    };

    const handleExportPDF = async () => {
        try {
            // Check if roster has been generated
            if (!shiftAssignments || shiftAssignments.length === 0) {
                alert('Please generate roster first before exporting to PDF');
                return;
            }

            console.log('🔍 Shift assignments data:', {
                count: shiftAssignments.length,
                sample: shiftAssignments.slice(0, 3),
                firstItem: shiftAssignments[0],
                firstItemKeys: shiftAssignments[0]
                    ? Object.keys(shiftAssignments[0])
                    : [],
                allDates: shiftAssignments
                    .map((a) => ({
                        shift_date: a.shift_date,
                        date: a.date,
                        assignment_date: a.assignment_date,
                        parsed: a.shift_date
                            ? new Date(a.shift_date).getDate()
                            : 'N/A',
                        user: a.user_name,
                        shiftId: a.shift_id,
                    }))
                    .slice(0, 10),
            });

            const monthStr = format(selectedMonth, 'MMMM yyyy').toUpperCase();

            // Get number of days in month
            const daysInMonth = new Date(
                selectedMonth.getFullYear(),
                selectedMonth.getMonth() + 1,
                0
            ).getDate();

            // Day names mapping
            const dayNamesMap: Record<number, string> = {
                0: 'M', // Minggu
                1: 'S', // Senin
                2: 'S', // Selasa
                3: 'R', // Rabu
                4: 'K', // Kamis
                5: 'J', // Jumat
                6: 'S', // Sabtu
            };

            // Prepare day names array
            const dayNames: string[] = [];
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(
                    selectedMonth.getFullYear(),
                    selectedMonth.getMonth(),
                    day
                );
                const dayOfWeek = date.getDay();
                dayNames.push(dayNamesMap[dayOfWeek]);
            }

            // Group shift assignments by user WITH pattern data
            const userShifts: Record<
                number,
                {
                    user_name: string;
                    shifts: Record<number, number>;
                    pattern_data?: number[];
                }
            > = {};

            console.log('🔧 Shifts master data:', {
                shiftsCount: shifts?.length,
                shiftsData: shifts,
            });

            shiftAssignments.forEach((assignment) => {
                if (!userShifts[assignment.user_id]) {
                    userShifts[assignment.user_id] = {
                        user_name: assignment.user_name,
                        shifts: {},
                        pattern_data: (assignment as any).pattern_data, // Store pattern data
                    };
                }
                // Extract day from date (1-31) - use assignment_date field
                const day = new Date(assignment.assignment_date).getDate();
                userShifts[assignment.user_id].shifts[day] =
                    assignment.shift_id;

                console.log(
                    `Assignment: user=${assignment.user_name}, date=${assignment.assignment_date}, day=${day}, shift_id=${assignment.shift_id}`
                );
            });

            console.log('👥 User shifts grouped:', {
                userCount: Object.keys(userShifts).length,
                firstUser: Object.values(userShifts)[0],
            });

            // Convert to sorted array and prepare data for backend
            const usersData = Object.entries(userShifts)
                .map(([userId, data]) => ({
                    user_id: parseInt(userId),
                    user_name: data.user_name,
                    shifts: data.shifts,
                    pattern_data: data.pattern_data,
                }))
                .sort((a, b) => a.user_name.localeCompare(b.user_name))
                .map((userData) => {
                    const userShiftsArray = [];
                    const pattern = userData.pattern_data || [];
                    const patternLength = pattern.length || 7;

                    console.log(`Processing user ${userData.user_name}:`, {
                        shiftsObject: userData.shifts,
                        pattern: pattern,
                        daysInMonth,
                    });

                    for (let day = 1; day <= daysInMonth; day++) {
                        const shiftId = userData.shifts[day];

                        if (shiftId === 0) {
                            userShiftsArray.push({
                                day,
                                shiftCode: 'O',
                                isOff: true,
                            });
                        } else if (shiftId) {
                            const shift = shifts?.find((s) => s.id === shiftId);
                            const shiftCode = shift?.code || shift?.name || '?';
                            console.log(
                                `Day ${day}: shift_id=${shiftId}, found shift:`,
                                shift,
                                `code: ${shiftCode}`
                            );
                            userShiftsArray.push({
                                day,
                                shiftCode,
                                isOff: false,
                            });
                        } else {
                            // No shift assignment in DB - check pattern for OFF
                            if (pattern.length > 0) {
                                const patternIndex = (day - 1) % patternLength;
                                const patternShiftId = pattern[patternIndex];

                                if (patternShiftId === 0) {
                                    console.log(
                                        `Day ${day}: OFF detected from pattern`
                                    );
                                    userShiftsArray.push({
                                        day,
                                        shiftCode: 'O',
                                        isOff: true,
                                    });
                                } else {
                                    console.log(
                                        `Day ${day}: No shift assignment (shiftId is undefined/null)`
                                    );
                                    userShiftsArray.push({
                                        day,
                                        shiftCode: '',
                                        isOff: false,
                                    });
                                }
                            } else {
                                console.log(
                                    `Day ${day}: No shift assignment (shiftId is undefined/null)`
                                );
                                userShiftsArray.push({
                                    day,
                                    shiftCode: '',
                                    isOff: false,
                                });
                            }
                        }
                    }
                    return {
                        name: userData.user_name.toUpperCase(),
                        shifts: userShiftsArray,
                    };
                });

            console.log('📊 Final users data for PDF:', {
                userCount: usersData.length,
                firstUserShifts: usersData[0]?.shifts.slice(0, 5),
            });

            // Call backend API to generate PDF
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/roster/export-pdf`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        month: monthStr,
                        daysInMonth,
                        dayNames,
                        users: usersData,
                    }),
                }
            );

            if (!response.ok) {
                if (response.status === 401) {
                    alert('Session expired. Please login again.');
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                    return;
                }

                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate PDF');
            }

            // Get PDF blob and trigger download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Roster-${format(selectedMonth, 'MMMM-yyyy')}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting PDF:', error);
            alert(
                `Failed to export PDF: ${
                    error instanceof Error ? error.message : 'Unknown error'
                }`
            );
        }
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
                                        variant='outline'
                                        size='sm'
                                        onClick={handleReset}
                                        disabled={!hasChanges}
                                        className='shadow-sm'
                                    >
                                        <RotateCcw className='h-4 w-4 mr-2' />
                                        Reset
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
                                        variant='outline'
                                        size='sm'
                                        onClick={handleExportPDF}
                                        disabled={
                                            isLoading ||
                                            !userAssignments ||
                                            userAssignments.length === 0
                                        }
                                        className='shadow-sm'
                                    >
                                        <FileDown className='h-4 w-4 mr-2' />
                                        Export PDF
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
                                    shiftAssignments={shiftAssignments}
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
