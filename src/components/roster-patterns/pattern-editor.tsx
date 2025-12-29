'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, CheckCircle2, Lightbulb } from 'lucide-react';
import { PatternGrid } from './pattern-grid';
import { rosterPatternService } from '@/services/roster-pattern.service';
import { shiftService } from '@/services/shift.service';
import type { Shift } from '@/types/shift';

interface PatternEditorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    patternId?: number | null;
}

// Form validation schema
const patternFormSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    description: z.string().optional(),
    personil_count: z.number().min(3).max(10),
    pattern_data: z
        .array(z.array(z.number().min(0)))
        .min(3, 'At least 3 rows required'),
    is_default: z.boolean(),
});

type PatternFormValues = z.infer<typeof patternFormSchema>;

// Pattern templates
const PATTERN_TEMPLATES = {
    balanced: {
        name: 'Balanced Coverage',
        description: 'Equal distribution of OFF days',
        4: [
            [1, 3, 2, 3, 2, 2, 0],
            [0, 1, 3, 2, 3, 3, 2],
            [2, 0, 1, 3, 3, 3, 3],
            [3, 2, 0, 1, 1, 1, 1],
        ],
        5: [
            [1, 3, 3, 3, 2, 2, 0],
            [3, 3, 2, 2, 1, 0, 1],
            [3, 2, 3, 2, 0, 1, 3],
            [2, 0, 1, 1, 3, 3, 3],
            [0, 1, 2, 3, 3, 3, 2],
        ],
    },
    weekendPriority: {
        name: 'Weekend Priority',
        description: 'More OFF days on weekends',
        4: [
            [1, 2, 3, 1, 2, 0, 0],
            [2, 3, 1, 2, 3, 1, 0],
            [3, 1, 2, 3, 0, 2, 1],
            [0, 0, 3, 1, 2, 3, 2],
        ],
    },
};

export function PatternEditor({
    open,
    onOpenChange,
    patternId,
}: PatternEditorProps) {
    const [activeTab, setActiveTab] = useState('basic');
    const queryClient = useQueryClient();

    // Fetch shifts from database
    const { data: shifts = [] } = useQuery<Shift[]>({
        queryKey: ['shifts'],
        queryFn: () => shiftService.getShifts(),
    });

    // Fetch existing pattern if editing
    const { data: existingPattern, isLoading } = useQuery({
        queryKey: ['roster-pattern', patternId],
        queryFn: () => rosterPatternService.getPatternById(patternId!),
        enabled: !!patternId,
    });

    // Form setup
    const form = useForm<PatternFormValues>({
        resolver: zodResolver(patternFormSchema),
        defaultValues: {
            name: '',
            description: '',
            personil_count: 5,
            pattern_data: [],
            is_default: false,
        },
    });

    // Load existing pattern data
    useEffect(() => {
        if (existingPattern) {
            form.reset({
                name: existingPattern.name,
                description: existingPattern.description || '',
                personil_count: existingPattern.personil_count,
                pattern_data: existingPattern.pattern_data,
                is_default: existingPattern.is_default,
            });
        } else if (open && !patternId) {
            // Reset for new pattern
            form.reset({
                name: '',
                description: '',
                personil_count: 5,
                pattern_data: [],
                is_default: false,
            });
        }
    }, [existingPattern, open, patternId, form]);

    // Create mutation
    const createMutation = useMutation({
        mutationFn: (data: PatternFormValues) =>
            rosterPatternService.createPattern(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roster-patterns'] });
            onOpenChange(false);
            form.reset();
        },
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: (data: PatternFormValues) =>
            rosterPatternService.updatePattern({ ...data, id: patternId! }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roster-patterns'] });
            queryClient.invalidateQueries({
                queryKey: ['roster-pattern', patternId],
            });
            onOpenChange(false);
        },
    });

    const onSubmit = (data: PatternFormValues) => {
        if (patternId) {
            updateMutation.mutate(data);
        } else {
            createMutation.mutate(data);
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending;
    const error = createMutation.error || updateMutation.error;

    // Apply template
    const applyTemplate = (templateKey: keyof typeof PATTERN_TEMPLATES) => {
        const template = PATTERN_TEMPLATES[templateKey];
        const personilCount = form.watch('personil_count');
        const patternData =
            template[personilCount as keyof typeof template] ||
            template[5 as keyof typeof template];

        if (patternData) {
            form.setValue('pattern_data', patternData as number[][]);
            form.setValue('name', template.name);
            form.setValue('description', template.description);
        }
    };

    // Validate pattern
    const patternData = form.watch('pattern_data');
    const validation = validatePattern(patternData);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='max-w-7xl h-[95vh] flex flex-col'>
                <DialogHeader className='flex-shrink-0'>
                    <DialogTitle className='text-2xl'>
                        {patternId ? 'Edit Pattern' : 'Create New Pattern'}
                    </DialogTitle>
                    <DialogDescription className='text-base'>
                        Design a shift rotation pattern for your security
                        personnel. Define schedules for the entire week.
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className='flex items-center justify-center py-12'>
                        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
                    </div>
                ) : (
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className='flex flex-col flex-1 min-h-0'
                        >
                            <Tabs
                                value={activeTab}
                                onValueChange={setActiveTab}
                                className='flex flex-col flex-1 min-h-0'
                            >
                                <TabsList className='grid w-full grid-cols-2 flex-shrink-0'>
                                    <TabsTrigger value='basic'>
                                        Basic Info
                                    </TabsTrigger>
                                    <TabsTrigger value='pattern'>
                                        Pattern Design
                                    </TabsTrigger>
                                </TabsList>

                                {/* Basic Info Tab */}
                                <TabsContent
                                    value='basic'
                                    className='space-y-4 mt-4 overflow-y-auto flex-1'
                                >
                                    <FormField
                                        control={form.control}
                                        name='name'
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Pattern Name *
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder='e.g., Balanced 5 Personil'
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    A descriptive name for this
                                                    rotation pattern
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name='description'
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Description
                                                </FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder='Describe when and how to use this pattern...'
                                                        rows={3}
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name='personil_count'
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Number of Personil *
                                                </FormLabel>
                                                <Select
                                                    onValueChange={(value) =>
                                                        field.onChange(
                                                            parseInt(value)
                                                        )
                                                    }
                                                    value={field.value?.toString()}
                                                    disabled={!!patternId} // Don't allow changing personil count when editing
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {[
                                                            3, 4, 5, 6, 7, 8, 9,
                                                            10,
                                                        ].map((num) => (
                                                            <SelectItem
                                                                key={num}
                                                                value={num.toString()}
                                                            >
                                                                {num} Personil
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription>
                                                    Number of security personnel
                                                    in this rotation
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Pattern Templates */}
                                    <div className='space-y-3'>
                                        <FormLabel>Quick Templates</FormLabel>
                                        <div className='grid grid-cols-2 gap-2'>
                                            <Button
                                                type='button'
                                                variant='outline'
                                                onClick={() =>
                                                    applyTemplate('balanced')
                                                }
                                                className='justify-start'
                                            >
                                                <Lightbulb className='mr-2 h-4 w-4' />
                                                Balanced Coverage
                                            </Button>
                                            <Button
                                                type='button'
                                                variant='outline'
                                                onClick={() =>
                                                    applyTemplate(
                                                        'weekendPriority'
                                                    )
                                                }
                                                className='justify-start'
                                            >
                                                <Lightbulb className='mr-2 h-4 w-4' />
                                                Weekend Priority
                                            </Button>
                                        </div>
                                    </div>
                                </TabsContent>

                                {/* Pattern Design Tab */}
                                <TabsContent
                                    value='pattern'
                                    className='space-y-4 mt-4 overflow-y-auto flex-1'
                                >
                                    {/* Instructions Card */}
                                    <div className='rounded-lg border bg-muted/50 p-4'>
                                        <h4 className='text-sm font-semibold mb-2'>
                                            📋 How to Design Your Pattern
                                        </h4>
                                        <ul className='text-sm text-muted-foreground space-y-1 list-disc list-inside'>
                                            <li>
                                                Click on any cell to change the
                                                shift assignment
                                            </li>
                                            <li>
                                                Each row represents one
                                                person&apos;s weekly schedule
                                            </li>
                                            <li>
                                                Use templates below for quick
                                                setup
                                            </li>
                                            <li>
                                                Ensure balanced OFF days for
                                                fairness
                                            </li>
                                        </ul>
                                    </div>

                                    {/* Shift Legend */}
                                    <div className='rounded-lg border bg-card p-4'>
                                        <h4 className='text-sm font-semibold mb-3'>
                                            Shift Types
                                        </h4>
                                        <div className='flex flex-wrap gap-2'>
                                            <div className='flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-100 text-gray-700 border border-gray-300'>
                                                <span className='text-sm font-medium'>
                                                    OFF
                                                </span>
                                                <span className='text-xs text-gray-500'>
                                                    - Rest Day
                                                </span>
                                            </div>
                                            <div className='flex items-center gap-2 px-3 py-1.5 rounded-md bg-sky-100 text-sky-700 border border-sky-300'>
                                                <span className='text-sm font-medium'>
                                                    Pagi
                                                </span>
                                                <span className='text-xs text-sky-600'>
                                                    - Morning
                                                </span>
                                            </div>
                                            <div className='flex items-center gap-2 px-3 py-1.5 rounded-md bg-amber-100 text-amber-700 border border-amber-300'>
                                                <span className='text-sm font-medium'>
                                                    Siang
                                                </span>
                                                <span className='text-xs text-amber-600'>
                                                    - Afternoon
                                                </span>
                                            </div>
                                            <div className='flex items-center gap-2 px-3 py-1.5 rounded-md bg-violet-100 text-violet-700 border border-violet-300'>
                                                <span className='text-sm font-medium'>
                                                    Sore
                                                </span>
                                                <span className='text-xs text-violet-600'>
                                                    - Evening
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name='pattern_data'
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className='text-base font-semibold'>
                                                    Weekly Shift Schedule
                                                </FormLabel>
                                                <FormDescription className='mb-4'>
                                                    Click any cell to cycle
                                                    through shift options
                                                </FormDescription>
                                                <FormControl>
                                                    <PatternGrid
                                                        personilCount={form.watch(
                                                            'personil_count'
                                                        )}
                                                        patternData={
                                                            field.value
                                                        }
                                                        onChange={
                                                            field.onChange
                                                        }
                                                        disabled={isPending}
                                                        shifts={shifts}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Separator />

                                    {/* Pattern Validation */}
                                    {patternData && patternData.length > 0 && (
                                        <div className='rounded-lg border bg-card p-4 space-y-3'>
                                            <h4 className='text-sm font-semibold flex items-center gap-2'>
                                                <CheckCircle2 className='h-4 w-4 text-green-600' />
                                                Pattern Analysis
                                            </h4>
                                            {validation.isBalanced ? (
                                                <Alert className='border-green-200 bg-green-50'>
                                                    <CheckCircle2 className='h-4 w-4 text-green-600' />
                                                    <AlertDescription className='text-green-800'>
                                                        ✓ OFF days are balanced
                                                        across all rows - Good
                                                        pattern!
                                                    </AlertDescription>
                                                </Alert>
                                            ) : (
                                                <Alert variant='destructive'>
                                                    <AlertCircle className='h-4 w-4' />
                                                    <AlertDescription>
                                                        ⚠ Unbalanced OFF days:{' '}
                                                        {validation.offDaysDistribution.join(
                                                            ', '
                                                        )}{' '}
                                                        days off per person
                                                    </AlertDescription>
                                                </Alert>
                                            )}
                                            <div className='flex gap-2 flex-wrap'>
                                                <Badge
                                                    variant='secondary'
                                                    className='text-xs'
                                                >
                                                    📊{' '}
                                                    {validation.averageCoverage}
                                                    % Average Coverage
                                                </Badge>
                                                <Badge
                                                    variant={
                                                        validation.fullCoverage
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                    className='text-xs'
                                                >
                                                    {validation.fullCoverage
                                                        ? '✓ Full Coverage'
                                                        : '⚠ Coverage Gaps'}
                                                </Badge>
                                            </div>
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>

                            {error && (
                                <Alert
                                    variant='destructive'
                                    className='flex-shrink-0'
                                >
                                    <AlertCircle className='h-4 w-4' />
                                    <AlertDescription>
                                        {error instanceof Error
                                            ? error.message
                                            : 'An error occurred'}
                                    </AlertDescription>
                                </Alert>
                            )}

                            <DialogFooter className='flex-shrink-0 pt-4 border-t'>
                                <Button
                                    type='button'
                                    variant='outline'
                                    onClick={() => onOpenChange(false)}
                                    disabled={isPending}
                                >
                                    Cancel
                                </Button>
                                <Button type='submit' disabled={isPending}>
                                    {isPending && (
                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                    )}
                                    {patternId
                                        ? 'Update Pattern'
                                        : 'Create Pattern'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                )}
            </DialogContent>
        </Dialog>
    );
}

// Helper: Validate pattern
function validatePattern(patternData: number[][]) {
    if (!patternData || patternData.length === 0) {
        return {
            isBalanced: false,
            offDaysDistribution: [],
            averageCoverage: 0,
            fullCoverage: false,
        };
    }

    const rowCount = patternData.length;
    const dayCount = 7;

    const offDaysDistribution = patternData.map(
        (row) => row.filter((shift) => shift === 0).length
    );

    const minOffDays = Math.min(...offDaysDistribution);
    const maxOffDays = Math.max(...offDaysDistribution);
    const isBalanced = maxOffDays - minOffDays <= 1;

    let totalCoverage = 0;
    for (let day = 0; day < dayCount; day++) {
        const workingCount = patternData.filter((row) => row[day] !== 0).length;
        totalCoverage += workingCount;
    }
    const averageCoverage = Math.round(
        (totalCoverage / (dayCount * rowCount)) * 100
    );

    const fullCoverage = patternData.every((_, day) => {
        const workingCount = patternData.filter((row) => row[day] !== 0).length;
        return workingCount >= Math.floor(rowCount * 0.6);
    });

    return {
        isBalanced,
        offDaysDistribution,
        averageCoverage,
        fullCoverage,
    };
}
