'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patternService, type Pattern } from '@/services/pattern.service';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Star } from 'lucide-react';
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
import { cn } from '@/lib/utils';

const SHIFT_LABELS = ['OFF', 'Pagi', 'Siang', 'Sore'];
const SHIFT_COLORS = [
    'bg-gray-100 text-gray-700',
    'bg-sky-100 text-sky-700',
    'bg-amber-100 text-amber-700',
    'bg-violet-100 text-violet-700',
];

export default function PatternsPage() {
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
        queryFn: () => patternService.getPatterns(true), // Active patterns only
    });

    const deleteMutation = useMutation({
        mutationFn: patternService.deletePattern,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['patterns'] });
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

    return (
        <ProtectedRoute>
            <DashboardLayout>
                <div className='p-6 space-y-6'>
                    {/* Header */}
                    <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
                        <div>
                            <h1 className='text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
                                Pattern Library
                            </h1>
                            <p className='text-sm text-gray-600 dark:text-gray-400 mt-2'>
                                Manage 7-day shift rotation patterns
                            </p>
                        </div>
                        <Button
                            onClick={handleCreate}
                            className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 gap-2 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5'
                        >
                            <Plus className='h-4 w-4' />
                            Create Pattern
                        </Button>
                    </div>

                    {/* Patterns Grid */}
                    {isLoading ? (
                        <div className='flex items-center justify-center h-64'>
                            <div className='text-gray-500'>
                                Loading patterns...
                            </div>
                        </div>
                    ) : patterns && patterns.length > 0 ? (
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                            {patterns.map((pattern) => (
                                <Card
                                    key={pattern.id}
                                    className='group relative overflow-hidden border-2 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50'
                                >
                                    {/* Gradient overlay on hover */}
                                    <div className='absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300' />

                                    <CardHeader className='relative'>
                                        <div className='flex items-start justify-between'>
                                            <div className='flex-1'>
                                                <CardTitle className='text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors'>
                                                    {pattern.name}
                                                </CardTitle>
                                                {pattern.description && (
                                                    <CardDescription className='mt-2 text-sm'>
                                                        {pattern.description}
                                                    </CardDescription>
                                                )}
                                            </div>
                                            {pattern.usage_count > 0 && (
                                                <Badge
                                                    variant='secondary'
                                                    className='ml-2 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-700 dark:text-amber-400 border-0'
                                                >
                                                    <Star className='h-3 w-3 mr-1 fill-current' />
                                                    {pattern.usage_count}
                                                </Badge>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className='space-y-4 relative'>
                                        {/* 7-Day Pattern Visualization */}
                                        <div>
                                            <div className='text-xs font-semibold text-gray-600 dark:text-gray-400 mb-3'>
                                                Weekly Pattern
                                            </div>
                                            <div className='grid grid-cols-7 gap-1.5'>
                                                {pattern.pattern_data.map(
                                                    (shift, idx) => (
                                                        <div
                                                            key={idx}
                                                            className={cn(
                                                                'aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-bold shadow-sm transition-transform hover:scale-110',
                                                                SHIFT_COLORS[
                                                                    shift
                                                                ]
                                                            )}
                                                        >
                                                            <span className='text-[9px] opacity-70 font-medium mb-0.5'>
                                                                {
                                                                    [
                                                                        'M',
                                                                        'T',
                                                                        'W',
                                                                        'T',
                                                                        'F',
                                                                        'S',
                                                                        'S',
                                                                    ][idx]
                                                                }
                                                            </span>
                                                            <span className='text-[10px]'>
                                                                {
                                                                    SHIFT_LABELS[
                                                                        shift
                                                                    ]
                                                                }
                                                            </span>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className='flex gap-2 pt-2'>
                                            <Button
                                                variant='outline'
                                                size='sm'
                                                onClick={() =>
                                                    handleEdit(pattern)
                                                }
                                                className='flex-1 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 dark:hover:bg-blue-950 dark:hover:border-blue-700 transition-colors'
                                            >
                                                <Edit className='h-3 w-3 mr-1' />
                                                Edit
                                            </Button>
                                            <Button
                                                variant='outline'
                                                size='sm'
                                                onClick={() =>
                                                    handleDelete(pattern)
                                                }
                                                className='text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 dark:hover:bg-red-950 dark:hover:border-red-700 transition-colors'
                                            >
                                                <Trash2 className='h-3 w-3' />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className='flex flex-col items-center justify-center py-12'>
                                <div className='text-4xl mb-4'>📋</div>
                                <p className='text-gray-500 mb-4'>
                                    No patterns found
                                </p>
                                <Button onClick={handleCreate}>
                                    <Plus className='h-4 w-4 mr-2' />
                                    Create Your First Pattern
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Pattern Editor Dialog */}
                    <SinglePatternEditor
                        open={isEditorOpen}
                        onOpenChange={setIsEditorOpen}
                        patternId={editingPatternId}
                    />

                    {/* Delete Confirmation Dialog */}
                    <AlertDialog
                        open={deleteDialogOpen}
                        onOpenChange={setDeleteDialogOpen}
                    >
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    Delete Pattern?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to delete &quot;
                                    {selectedPattern?.name}&quot;? This action
                                    cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={confirmDelete}
                                    className='bg-red-600 hover:bg-red-700'
                                >
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
