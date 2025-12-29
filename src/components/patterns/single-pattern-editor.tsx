'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { patternService, type Pattern } from '@/services/pattern.service';
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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SinglePatternEditorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    patternId?: number | null;
}

const SHIFT_OPTIONS = [
    {
        value: 0,
        label: 'OFF',
        color: 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300',
    },
    {
        value: 1,
        label: 'Pagi',
        color: 'bg-sky-100 text-sky-700 hover:bg-sky-200 border-sky-300',
    },
    {
        value: 2,
        label: 'Siang',
        color: 'bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-300',
    },
    {
        value: 3,
        label: 'Sore',
        color: 'bg-violet-100 text-violet-700 hover:bg-violet-200 border-violet-300',
    },
];

const DAY_NAMES = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
];

const formSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    description: z.string().optional(),
    pattern_data: z
        .array(z.number().min(0).max(3))
        .length(7, 'Pattern must have exactly 7 days'),
});

type FormValues = z.infer<typeof formSchema>;

export function SinglePatternEditor({
    open,
    onOpenChange,
    patternId,
}: SinglePatternEditorProps) {
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const queryClient = useQueryClient();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            description: '',
            pattern_data: [0, 0, 0, 0, 0, 0, 0], // All OFF by default
        },
    });

    // Fetch pattern if editing
    const { data: existingPattern, isLoading } = useQuery({
        queryKey: ['pattern', patternId],
        queryFn: () => patternService.getPatternById(patternId!),
        enabled: !!patternId && open,
    });

    // Load existing pattern data into form
    React.useEffect(() => {
        if (existingPattern) {
            form.reset({
                name: existingPattern.name,
                description: existingPattern.description || '',
                pattern_data: existingPattern.pattern_data,
            });
        }
    }, [existingPattern, form]);

    // Create/Update mutations
    const createMutation = useMutation({
        mutationFn: patternService.createPattern,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['patterns'] });
            onOpenChange(false);
            form.reset();
        },
    });

    const updateMutation = useMutation({
        mutationFn: patternService.updatePattern,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['patterns'] });
            queryClient.invalidateQueries({ queryKey: ['pattern', patternId] });
            onOpenChange(false);
        },
    });

    const onSubmit = (data: FormValues) => {
        if (patternId) {
            updateMutation.mutate({ id: patternId, ...data });
        } else {
            createMutation.mutate(data);
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending;
    const error = createMutation.error || updateMutation.error;

    const handleCellClick = (dayIndex: number) => {
        if (isPending) return;
        setSelectedDay(dayIndex);
    };

    const handleShiftSelect = (shiftValue: number) => {
        if (selectedDay === null) return;

        const currentPattern = form.getValues('pattern_data');
        const newPattern = [...currentPattern];
        newPattern[selectedDay] = shiftValue;
        form.setValue('pattern_data', newPattern);
        setSelectedDay(null);
    };

    const patternData = form.watch('pattern_data');
    const offDayCount = patternData.filter((shift) => shift === 0).length;
    const workDayCount = 7 - offDayCount;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='max-w-4xl'>
                <DialogHeader>
                    <DialogTitle className='text-2xl'>
                        {patternId ? 'Edit Pattern' : 'Create New Pattern'}
                    </DialogTitle>
                    <DialogDescription className='text-base'>
                        Design a 7-day shift rotation pattern. This pattern can
                        be assigned to any personnel.
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
                            className='space-y-6'
                        >
                            {/* Basic Info */}
                            <div className='space-y-4'>
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
                                                    placeholder='e.g., Weekend OFF Pattern'
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
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder='Describe when to use this pattern...'
                                                    rows={2}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Pattern Grid */}
                            <FormField
                                control={form.control}
                                name='pattern_data'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className='text-base font-semibold'>
                                            7-Day Shift Pattern *
                                        </FormLabel>
                                        <FormDescription className='mb-4'>
                                            Click any day to change the shift
                                            assignment
                                        </FormDescription>
                                        <FormControl>
                                            <div className='rounded-lg border-2 bg-white p-4'>
                                                <div className='grid grid-cols-7 gap-3'>
                                                    {field.value.map(
                                                        (
                                                            shiftNum,
                                                            dayIndex
                                                        ) => {
                                                            const shift =
                                                                SHIFT_OPTIONS[
                                                                    shiftNum
                                                                ];
                                                            const isWeekend =
                                                                dayIndex >= 5;
                                                            const isSelected =
                                                                selectedDay ===
                                                                dayIndex;

                                                            return (
                                                                <div
                                                                    key={
                                                                        dayIndex
                                                                    }
                                                                    className='flex flex-col items-center gap-2'
                                                                >
                                                                    <div
                                                                        className={cn(
                                                                            'text-xs font-bold uppercase tracking-wide',
                                                                            isWeekend
                                                                                ? 'text-red-600'
                                                                                : 'text-slate-600'
                                                                        )}
                                                                    >
                                                                        {
                                                                            DAY_NAMES[
                                                                                dayIndex
                                                                            ]
                                                                        }
                                                                    </div>
                                                                    <button
                                                                        type='button'
                                                                        onClick={() =>
                                                                            handleCellClick(
                                                                                dayIndex
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            isPending
                                                                        }
                                                                        className={cn(
                                                                            'w-full aspect-square rounded-lg border-2 text-sm font-bold transition-all',
                                                                            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1',
                                                                            'flex items-center justify-center',
                                                                            shift.color,
                                                                            isSelected &&
                                                                                'ring-2 ring-primary ring-offset-1 scale-110 shadow-lg',
                                                                            isPending &&
                                                                                'opacity-50 cursor-not-allowed',
                                                                            !isPending &&
                                                                                'hover:scale-110 hover:shadow-lg cursor-pointer active:scale-95'
                                                                        )}
                                                                    >
                                                                        {
                                                                            shift.label
                                                                        }
                                                                    </button>
                                                                </div>
                                                            );
                                                        }
                                                    )}
                                                </div>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Pattern Stats */}
                            <div className='rounded-lg border bg-muted/50 p-4'>
                                <h4 className='text-sm font-semibold mb-2'>
                                    Pattern Summary
                                </h4>
                                <div className='flex gap-4 text-sm'>
                                    <div>
                                        <span className='text-muted-foreground'>
                                            Work Days:
                                        </span>{' '}
                                        <span className='font-semibold'>
                                            {workDayCount}
                                        </span>
                                    </div>
                                    <div>
                                        <span className='text-muted-foreground'>
                                            OFF Days:
                                        </span>{' '}
                                        <span className='font-semibold'>
                                            {offDayCount}
                                        </span>
                                    </div>
                                    <div>
                                        <span className='text-muted-foreground'>
                                            Coverage:
                                        </span>{' '}
                                        <span className='font-semibold'>
                                            {Math.round(
                                                (workDayCount / 7) * 100
                                            )}
                                            %
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <Alert variant='destructive'>
                                    <AlertCircle className='h-4 w-4' />
                                    <AlertDescription>
                                        {error instanceof Error
                                            ? error.message
                                            : 'An error occurred'}
                                    </AlertDescription>
                                </Alert>
                            )}

                            <DialogFooter>
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

                {/* Shift Selector Dialog */}
                {selectedDay !== null && !isPending && (
                    <div
                        className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'
                        onClick={() => setSelectedDay(null)}
                    >
                        <div
                            className='bg-white rounded-xl shadow-2xl p-6 w-[320px] border-2 border-slate-200'
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className='mb-4'>
                                <h3 className='text-lg font-bold text-slate-800'>
                                    Select Shift
                                </h3>
                                <p className='text-sm text-slate-500 mt-1'>
                                    {DAY_NAMES[selectedDay]}
                                </p>
                            </div>
                            <div className='grid grid-cols-2 gap-3 mb-4'>
                                {SHIFT_OPTIONS.map((shift) => (
                                    <button
                                        key={shift.value}
                                        type='button'
                                        onClick={() =>
                                            handleShiftSelect(shift.value)
                                        }
                                        className={cn(
                                            'py-4 px-4 rounded-lg border-2 text-sm font-bold transition-all',
                                            'hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary active:scale-95',
                                            shift.color
                                        )}
                                    >
                                        {shift.label}
                                    </button>
                                ))}
                            </div>
                            <Button
                                type='button'
                                variant='outline'
                                onClick={() => setSelectedDay(null)}
                                className='w-full border-2 hover:bg-slate-100'
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
