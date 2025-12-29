'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import {
    Search,
    MoreVertical,
    Edit,
    Trash2,
    Copy,
    Eye,
    Star,
    Users,
} from 'lucide-react';
import type { RosterPattern } from '@/types/roster-pattern';
import { rosterPatternService } from '@/services/roster-pattern.service';
import { PatternPreview } from './pattern-preview';

interface PatternListProps {
    patterns: RosterPattern[];
    onEdit: (id: number) => void;
}

export function PatternList({ patterns, onEdit }: PatternListProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [personilFilter, setPersonilFilter] = useState<string>('all');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
    const [selectedPattern, setSelectedPattern] =
        useState<RosterPattern | null>(null);

    const queryClient = useQueryClient();

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id: number) => rosterPatternService.deletePattern(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roster-patterns'] });
            setDeleteDialogOpen(false);
            setSelectedPattern(null);
        },
    });

    // Filter patterns
    const filteredPatterns = patterns.filter((pattern) => {
        const matchesSearch =
            pattern.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            pattern.description
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase());

        const matchesPersonil =
            personilFilter === 'all' ||
            pattern.personil_count === parseInt(personilFilter);

        return matchesSearch && matchesPersonil;
    });

    // Get unique personil counts
    const personilCounts = Array.from(
        new Set(patterns.map((p) => p.personil_count))
    ).sort((a, b) => a - b);

    const handleDelete = (pattern: RosterPattern) => {
        setSelectedPattern(pattern);
        setDeleteDialogOpen(true);
    };

    const handlePreview = (pattern: RosterPattern) => {
        setSelectedPattern(pattern);
        setPreviewDialogOpen(true);
    };

    const handleDuplicate = (pattern: RosterPattern) => {
        // TODO: Implement duplicate functionality
        console.log('Duplicate pattern:', pattern);
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <div className='flex items-center justify-between'>
                        <div>
                            <CardTitle>Pattern Library</CardTitle>
                            <CardDescription>
                                {filteredPatterns.length} pattern(s) available
                            </CardDescription>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className='flex gap-4 mt-4'>
                        <div className='relative flex-1'>
                            <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                            <Input
                                placeholder='Search patterns...'
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className='pl-10'
                            />
                        </div>
                        <Select
                            value={personilFilter}
                            onValueChange={setPersonilFilter}
                        >
                            <SelectTrigger className='w-[200px]'>
                                <SelectValue placeholder='Filter by personil' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='all'>
                                    All Personil
                                </SelectItem>
                                {personilCounts.map((count) => (
                                    <SelectItem
                                        key={count}
                                        value={count.toString()}
                                    >
                                        {count} Personil
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>

                <CardContent>
                    {filteredPatterns.length === 0 ? (
                        <div className='flex flex-col items-center justify-center py-12 text-center'>
                            <Users className='h-12 w-12 text-muted-foreground mb-4' />
                            <h3 className='text-lg font-semibold'>
                                No patterns found
                            </h3>
                            <p className='text-sm text-muted-foreground mt-2'>
                                {searchQuery || personilFilter !== 'all'
                                    ? 'Try adjusting your filters'
                                    : 'Create your first roster pattern to get started'}
                            </p>
                        </div>
                    ) : (
                        <div className='rounded-md border'>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Personil</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Last Used</TableHead>
                                        <TableHead>Usage</TableHead>
                                        <TableHead className='w-[70px]'>
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredPatterns.map((pattern) => (
                                        <TableRow key={pattern.id}>
                                            <TableCell className='font-medium'>
                                                <div className='flex items-center gap-2'>
                                                    {pattern.is_default && (
                                                        <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
                                                    )}
                                                    {pattern.name}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant='secondary'>
                                                    {pattern.personil_count}{' '}
                                                    Users
                                                </Badge>
                                            </TableCell>
                                            <TableCell className='max-w-[300px] truncate'>
                                                {pattern.description || (
                                                    <span className='text-muted-foreground italic'>
                                                        No description
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {pattern.is_default ? (
                                                    <Badge>Default</Badge>
                                                ) : (
                                                    <Badge variant='outline'>
                                                        Custom
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className='text-muted-foreground'>
                                                {pattern.last_used_at
                                                    ? format(
                                                          new Date(
                                                              pattern.last_used_at
                                                          ),
                                                          'MMM dd, yyyy'
                                                      )
                                                    : 'Never'}
                                            </TableCell>
                                            <TableCell>
                                                <span className='text-sm text-muted-foreground'>
                                                    {pattern.usage_count} times
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            variant='ghost'
                                                            size='sm'
                                                        >
                                                            <MoreVertical className='h-4 w-4' />
                                                            <span className='sr-only'>
                                                                Actions
                                                            </span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align='end'>
                                                        <DropdownMenuLabel>
                                                            Actions
                                                        </DropdownMenuLabel>
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                handlePreview(
                                                                    pattern
                                                                )
                                                            }
                                                        >
                                                            <Eye className='mr-2 h-4 w-4' />
                                                            Preview
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                onEdit(
                                                                    pattern.id
                                                                )
                                                            }
                                                        >
                                                            <Edit className='mr-2 h-4 w-4' />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                handleDuplicate(
                                                                    pattern
                                                                )
                                                            }
                                                        >
                                                            <Copy className='mr-2 h-4 w-4' />
                                                            Duplicate
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                handleDelete(
                                                                    pattern
                                                                )
                                                            }
                                                            className='text-destructive'
                                                            disabled={
                                                                pattern.is_default
                                                            }
                                                        >
                                                            <Trash2 className='mr-2 h-4 w-4' />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the pattern &quot;
                            {selectedPattern?.name}&quot;. This action cannot be
                            undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() =>
                                selectedPattern &&
                                deleteMutation.mutate(selectedPattern.id)
                            }
                            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                        >
                            {deleteMutation.isPending
                                ? 'Deleting...'
                                : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Preview Dialog */}
            {selectedPattern && (
                <PatternPreview
                    open={previewDialogOpen}
                    onOpenChange={setPreviewDialogOpen}
                    pattern={selectedPattern}
                />
            )}
        </>
    );
}
