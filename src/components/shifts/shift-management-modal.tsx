'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    shiftService,
    CreateShiftInput,
    UpdateShiftInput,
} from '@/services/shift.service';
import type { Shift } from '@/types/shift';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, Clock } from 'lucide-react';

interface ShiftManagementModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ShiftManagementModal({
    open,
    onOpenChange,
}: ShiftManagementModalProps) {
    const queryClient = useQueryClient();
    const [editingShift, setEditingShift] = useState<Shift | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState<CreateShiftInput>({
        name: '',
        start_time: '07:00',
        end_time: '15:00',
        color: '#2196F3',
        description: '',
    });

    // Fetch shifts
    const { data: shifts, isLoading } = useQuery({
        queryKey: ['shifts'],
        queryFn: () => shiftService.getShifts(),
        enabled: open,
    });

    // Create mutation
    const createMutation = useMutation({
        mutationFn: (data: CreateShiftInput) => shiftService.createShift(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shifts'] });
            resetForm();
        },
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateShiftInput }) =>
            shiftService.updateShift(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shifts'] });
            resetForm();
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id: number) => shiftService.deleteShift(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shifts'] });
        },
    });

    // Toggle status mutation
    const toggleMutation = useMutation({
        mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
            shiftService.toggleShiftStatus(id, isActive),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shifts'] });
        },
    });

    const resetForm = () => {
        setFormData({
            name: '',
            start_time: '07:00',
            end_time: '15:00',
            color: '#2196F3',
            description: '',
        });
        setEditingShift(null);
        setIsFormOpen(false);
    };

    const handleEdit = (shift: Shift) => {
        setEditingShift(shift);
        setFormData({
            name: shift.name,
            start_time: shift.start_time,
            end_time: shift.end_time,
            color: shift.color,
            description: shift.description || '',
        });
        setIsFormOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingShift) {
            updateMutation.mutate({
                id: editingShift.id,
                data: formData,
            });
        } else {
            createMutation.mutate(formData);
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this shift?')) {
            deleteMutation.mutate(id);
        }
    };

    const activeShifts = shifts?.filter((s) => s.is_active) || [];
    const inactiveShifts = shifts?.filter((s) => !s.is_active) || [];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
                <DialogHeader>
                    <DialogTitle>Shift Management</DialogTitle>
                    <DialogDescription>
                        Manage work shifts and schedules
                    </DialogDescription>
                </DialogHeader>

                <div className='space-y-6'>
                    {/* Add Shift Button */}
                    {!isFormOpen && (
                        <Button
                            onClick={() => setIsFormOpen(true)}
                            className='w-full'
                        >
                            <Plus className='h-4 w-4 mr-2' />
                            Add New Shift
                        </Button>
                    )}

                    {/* Form */}
                    {isFormOpen && (
                        <form
                            onSubmit={handleSubmit}
                            className='space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900'
                        >
                            <div className='grid grid-cols-2 gap-4'>
                                <div className='space-y-2'>
                                    <Label htmlFor='name'>Shift Name *</Label>
                                    <Input
                                        id='name'
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                name: e.target.value,
                                            })
                                        }
                                        placeholder='e.g., Morning Shift'
                                        required
                                    />
                                </div>

                                <div className='space-y-2'>
                                    <Label htmlFor='color'>Color *</Label>
                                    <div className='flex gap-2'>
                                        <Input
                                            id='color'
                                            type='color'
                                            value={formData.color}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    color: e.target.value,
                                                })
                                            }
                                            className='w-20 h-10'
                                        />
                                        <Input
                                            value={formData.color}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    color: e.target.value,
                                                })
                                            }
                                            placeholder='#2196F3'
                                            className='flex-1'
                                        />
                                    </div>
                                </div>

                                <div className='space-y-2'>
                                    <Label htmlFor='start_time'>
                                        Start Time *
                                    </Label>
                                    <Input
                                        id='start_time'
                                        type='time'
                                        value={formData.start_time}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                start_time: e.target.value,
                                            })
                                        }
                                        required
                                    />
                                </div>

                                <div className='space-y-2'>
                                    <Label htmlFor='end_time'>End Time *</Label>
                                    <Input
                                        id='end_time'
                                        type='time'
                                        value={formData.end_time}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                end_time: e.target.value,
                                            })
                                        }
                                        required
                                    />
                                </div>
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='description'>Description</Label>
                                <Textarea
                                    id='description'
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            description: e.target.value,
                                        })
                                    }
                                    placeholder='Optional description'
                                    rows={2}
                                />
                            </div>

                            <div className='flex gap-2'>
                                <Button
                                    type='submit'
                                    disabled={
                                        createMutation.isPending ||
                                        updateMutation.isPending
                                    }
                                >
                                    {editingShift ? 'Update' : 'Create'} Shift
                                </Button>
                                <Button
                                    type='button'
                                    variant='outline'
                                    onClick={resetForm}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    )}

                    {/* Active Shifts */}
                    <div className='space-y-3'>
                        <h3 className='font-semibold text-sm text-gray-700 dark:text-gray-300'>
                            Active Shifts
                        </h3>
                        {isLoading ? (
                            <div className='text-center py-4 text-sm text-gray-500'>
                                Loading...
                            </div>
                        ) : activeShifts.length === 0 ? (
                            <div className='text-center py-8 text-sm text-gray-500'>
                                No active shifts. Create one to get started.
                            </div>
                        ) : (
                            <div className='space-y-2'>
                                {activeShifts.map((shift) => (
                                    <div
                                        key={shift.id}
                                        className='flex items-center justify-between p-3 border rounded-lg bg-white dark:bg-gray-950 hover:shadow-md transition-shadow'
                                    >
                                        <div className='flex items-center gap-3'>
                                            <div
                                                className='w-4 h-4 rounded-full border-2'
                                                style={{
                                                    backgroundColor:
                                                        shift.color,
                                                    borderColor: shift.color,
                                                }}
                                            />
                                            <div>
                                                <div className='font-medium text-sm'>
                                                    {shift.name}
                                                </div>
                                                <div className='flex items-center gap-2 text-xs text-gray-500'>
                                                    <Clock className='h-3 w-3' />
                                                    {shift.start_time} -{' '}
                                                    {shift.end_time}
                                                </div>
                                            </div>
                                        </div>

                                        <div className='flex items-center gap-2'>
                                            <Button
                                                variant='ghost'
                                                size='sm'
                                                onClick={() =>
                                                    handleEdit(shift)
                                                }
                                            >
                                                <Edit className='h-4 w-4' />
                                            </Button>
                                            <Button
                                                variant='ghost'
                                                size='sm'
                                                onClick={() =>
                                                    toggleMutation.mutate({
                                                        id: shift.id,
                                                        isActive: false,
                                                    })
                                                }
                                            >
                                                Deactivate
                                            </Button>
                                            <Button
                                                variant='ghost'
                                                size='sm'
                                                onClick={() =>
                                                    handleDelete(shift.id)
                                                }
                                                className='text-red-600 hover:text-red-700 hover:bg-red-50'
                                            >
                                                <Trash2 className='h-4 w-4' />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Inactive Shifts */}
                    {inactiveShifts.length > 0 && (
                        <div className='space-y-3'>
                            <h3 className='font-semibold text-sm text-gray-700 dark:text-gray-300'>
                                Inactive Shifts
                            </h3>
                            <div className='space-y-2'>
                                {inactiveShifts.map((shift) => (
                                    <div
                                        key={shift.id}
                                        className='flex items-center justify-between p-3 border rounded-lg bg-gray-50 dark:bg-gray-900 opacity-60'
                                    >
                                        <div className='flex items-center gap-3'>
                                            <div
                                                className='w-4 h-4 rounded-full border-2'
                                                style={{
                                                    backgroundColor:
                                                        shift.color,
                                                    borderColor: shift.color,
                                                }}
                                            />
                                            <div>
                                                <div className='font-medium text-sm'>
                                                    {shift.name}
                                                </div>
                                                <div className='flex items-center gap-2 text-xs text-gray-500'>
                                                    <Clock className='h-3 w-3' />
                                                    {shift.start_time} -{' '}
                                                    {shift.end_time}
                                                </div>
                                            </div>
                                        </div>

                                        <Button
                                            variant='outline'
                                            size='sm'
                                            onClick={() =>
                                                toggleMutation.mutate({
                                                    id: shift.id,
                                                    isActive: true,
                                                })
                                            }
                                        >
                                            Activate
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
