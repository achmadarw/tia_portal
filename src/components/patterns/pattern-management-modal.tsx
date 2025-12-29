'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patternService, type Pattern } from '@/services/pattern.service';
import { shiftService } from '@/services/shift.service';
import type { Shift } from '@/types/shift';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Star, Calendar } from 'lucide-react';
import { SinglePatternEditor } from '@/components/patterns/single-pattern-editor';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface PatternManagementModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function PatternManagementModal({
    open,
    onOpenChange,
}: PatternManagementModalProps) {
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingPatternId, setEditingPatternId] = useState<number | null>(
        null
    );
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedPattern, setSelectedPattern] = useState<Pattern | null>(
        null
    );

    const queryClient = useQueryClient();

    const { data: patterns, isLoading } = useQuery({
        queryKey: ['patterns'],
        queryFn: () => patternService.getPatterns(true),
    });

    // Fetch shifts from database
    const { data: shifts = [] } = useQuery<Shift[]>({
        queryKey: ['shifts'],
        queryFn: () => shiftService.getShifts(),
    });

    const deleteMutation = useMutation({
        mutationFn: patternService.deletePattern,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['patterns'] });
            queryClient.invalidateQueries({ queryKey: ['roster-assignments'] });
            setDeleteDialogOpen(false);
            setSelectedPattern(null);
        },
    });

    const handleCreate = () => {
        setEditingPatternId(null);
        setIsEditorOpen(true);
    };

    const handleEdit = (pattern: Pattern) => {
        setEditingPatternId(pattern.id);
        setIsEditorOpen(true);
    };

    const handleDelete = (pattern: Pattern) => {
        setSelectedPattern(pattern);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (selectedPattern) {
            deleteMutation.mutate(selectedPattern.id);
        }
    };

    const handleEditorClose = () => {
        setIsEditorOpen(false);
        setEditingPatternId(null);
        // Refresh assignments when pattern is created/updated
        queryClient.invalidateQueries({ queryKey: ['roster-assignments'] });
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className='max-w-4xl max-h-[90vh]'>
                    <DialogHeader>
                        <div className='flex items-center gap-3'>
                            <div className='rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 p-2'>
                                <Calendar className='h-5 w-5 text-white' />
                            </div>
                            <div>
                                <DialogTitle className='text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
                                    Pattern Library
                                </DialogTitle>
                                <DialogDescription className='mt-1'>
                                    Create and manage 7-day shift rotation
                                    patterns
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className='space-y-4'>
                        {/* Create Pattern Button */}
                        <Button
                            onClick={handleCreate}
                            className='w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all'
                        >
                            <Plus className='h-4 w-4 mr-2' />
                            Create New Pattern
                        </Button>

                        {/* Pattern List */}
                        <ScrollArea className='h-[400px] pr-4'>
                            {isLoading ? (
                                <div className='text-center py-8 text-gray-500'>
                                    Loading patterns...
                                </div>
                            ) : patterns?.length === 0 ? (
                                <div className='text-center py-12'>
                                    <Calendar className='h-12 w-12 mx-auto text-gray-300 mb-3' />
                                    <p className='text-gray-500 mb-2'>
                                        No patterns yet
                                    </p>
                                    <p className='text-sm text-gray-400'>
                                        Create your first shift pattern to get
                                        started
                                    </p>
                                </div>
                            ) : (
                                <div className='space-y-3'>
                                    {patterns?.map((pattern) => (
                                        <div
                                            key={pattern.id}
                                            className='group border-2 rounded-lg p-4 hover:border-blue-500/50 hover:-translate-y-0.5 hover:shadow-md transition-all bg-white dark:bg-gray-950'
                                        >
                                            {/* Pattern Header */}
                                            <div className='flex items-start justify-between mb-3'>
                                                <div className='flex-1'>
                                                    <div className='flex items-center gap-2 mb-1'>
                                                        <h3 className='text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors'>
                                                            {pattern.name}
                                                        </h3>
                                                        <Badge className='bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0'>
                                                            <Star className='h-3 w-3 mr-1 fill-white' />
                                                            Pattern
                                                        </Badge>
                                                    </div>
                                                    {pattern.description && (
                                                        <p className='text-sm text-gray-600 dark:text-gray-400'>
                                                            {
                                                                pattern.description
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                                <div className='flex gap-2'>
                                                    <Button
                                                        variant='ghost'
                                                        size='icon'
                                                        onClick={() =>
                                                            handleEdit(pattern)
                                                        }
                                                        className='h-8 w-8 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950'
                                                    >
                                                        <Edit className='h-4 w-4' />
                                                    </Button>
                                                    <Button
                                                        variant='ghost'
                                                        size='icon'
                                                        onClick={() =>
                                                            handleDelete(
                                                                pattern
                                                            )
                                                        }
                                                        className='h-8 w-8 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950'
                                                    >
                                                        <Trash2 className='h-4 w-4' />
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* 7-Day Pattern Grid */}
                                            <div className='grid grid-cols-7 gap-2'>
                                                {pattern.pattern_data.map(
                                                    (
                                                        shift: number,
                                                        index: number
                                                    ) => (
                                                        <div
                                                            key={index}
                                                            className='text-center'
                                                        >
                                                            <div className='text-xs text-gray-500 dark:text-gray-400 mb-1'>
                                                                {
                                                                    [
                                                                        'Mon',
                                                                        'Tue',
                                                                        'Wed',
                                                                        'Thu',
                                                                        'Fri',
                                                                        'Sat',
                                                                        'Sun',
                                                                    ][index]
                                                                }
                                                            </div>
                                                            <div
                                                                className='px-2 py-1.5 rounded-md text-xs font-medium transition-transform hover:scale-105'
                                                                style={{
                                                                    backgroundColor:
                                                                        shift ===
                                                                        0
                                                                            ? '#F3F4F6'
                                                                            : shifts.find(
                                                                                  (
                                                                                      s
                                                                                  ) =>
                                                                                      s.id ===
                                                                                      shift
                                                                              )
                                                                                  ?.color ||
                                                                              '#6B7280',
                                                                    color:
                                                                        shift ===
                                                                        0
                                                                            ? '#6B7280'
                                                                            : '#FFFFFF',
                                                                }}
                                                            >
                                                                {shift === 0
                                                                    ? 'OFF'
                                                                    : shifts.find(
                                                                          (s) =>
                                                                              s.id ===
                                                                              shift
                                                                      )?.code ||
                                                                      shifts.find(
                                                                          (s) =>
                                                                              s.id ===
                                                                              shift
                                                                      )?.name ||
                                                                      '?'}
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>

                        {/* Footer Info */}
                        <div className='pt-4 border-t'>
                            <p className='text-xs text-gray-500 dark:text-gray-400 text-center'>
                                {patterns?.length || 0} pattern(s) available •
                                Create patterns to use in monthly assignments
                            </p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Pattern Editor Dialog */}
            <SinglePatternEditor
                open={isEditorOpen}
                onOpenChange={handleEditorClose}
                patternId={editingPatternId}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Pattern?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete &quot;
                            {selectedPattern?.name}&quot;? This action cannot be
                            undone.
                            {selectedPattern && (
                                <div className='mt-4 p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md'>
                                    <p className='text-sm text-amber-800 dark:text-amber-200'>
                                        ⚠️ This pattern may be used in existing
                                        assignments. Deleting it will not affect
                                        already generated rosters.
                                    </p>
                                </div>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className='bg-red-600 hover:bg-red-700'
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending
                                ? 'Deleting...'
                                : 'Delete Pattern'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
