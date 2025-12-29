'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Copy, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Shift } from '@/types/shift';

interface PatternGridProps {
    personilCount: number;
    patternData: number[][];
    onChange: (data: number[][]) => void;
    disabled?: boolean;
    shifts?: Shift[];
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function PatternGrid({
    personilCount,
    patternData,
    onChange,
    disabled = false,
    shifts = [],
}: PatternGridProps) {
    const [selectedCell, setSelectedCell] = useState<{
        row: number;
        day: number;
    } | null>(null);

    // Initialize pattern if empty or undefined
    if (!patternData || patternData.length === 0) {
        const initialPattern = Array(personilCount)
            .fill(null)
            .map(() => Array(7).fill(0));
        onChange(initialPattern);
        return null;
    }

    // Adjust rows if personil count changed
    if (patternData.length !== personilCount) {
        const newPattern = Array(personilCount)
            .fill(null)
            .map((_, i) => patternData[i] || Array(7).fill(0));
        onChange(newPattern);
    }

    const handleCellClick = (rowIndex: number, dayIndex: number) => {
        if (disabled) return;
        setSelectedCell({ row: rowIndex, day: dayIndex });
    };

    const handleShiftChange = (value: string) => {
        if (!selectedCell || disabled) return;

        const newPattern = patternData.map((row, rowIndex) =>
            row.map((shift, dayIndex) => {
                if (
                    rowIndex === selectedCell.row &&
                    dayIndex === selectedCell.day
                ) {
                    return parseInt(value);
                }
                return shift;
            })
        );

        onChange(newPattern);
        setSelectedCell(null);
    };

    const handleAddRow = () => {
        if (disabled) return;
        const newRow = Array(7).fill(0);
        onChange([...patternData, newRow]);
    };

    const handleRemoveRow = (rowIndex: number) => {
        if (disabled || patternData.length <= 1) return;
        onChange(patternData.filter((_, i) => i !== rowIndex));
    };

    const handleDuplicateRow = (rowIndex: number) => {
        if (disabled) return;
        const rowToDuplicate = [...patternData[rowIndex]];
        onChange([...patternData, rowToDuplicate]);
    };

    const handleClearRow = (rowIndex: number) => {
        if (disabled) return;
        const newPattern = patternData.map((row, i) =>
            i === rowIndex ? Array(7).fill(0) : row
        );
        onChange(newPattern);
    };

    return (
        <div className='space-y-3'>
            {/* Compact Card Layout - No horizontal scroll */}
            <div className='space-y-3'>
                {patternData.map((row, rowIndex) => (
                    <div
                        key={rowIndex}
                        className='rounded-lg border-2 bg-white shadow-sm hover:shadow-md transition-shadow'
                    >
                        {/* Card Header */}
                        <div className='flex items-center justify-between px-4 py-2 bg-slate-50 border-b-2'>
                            <div className='font-semibold text-slate-700'>
                                Person {rowIndex + 1}
                            </div>
                            <div className='flex items-center gap-1'>
                                <Button
                                    type='button'
                                    variant='ghost'
                                    size='sm'
                                    onClick={() => handleDuplicateRow(rowIndex)}
                                    disabled={disabled}
                                    title='Duplicate this person'
                                    className='h-7 w-7 p-0 hover:bg-blue-100 hover:text-blue-700'
                                >
                                    <Copy className='h-3.5 w-3.5' />
                                </Button>
                                <Button
                                    type='button'
                                    variant='ghost'
                                    size='sm'
                                    onClick={() => handleClearRow(rowIndex)}
                                    disabled={disabled}
                                    title='Clear all shifts to OFF'
                                    className='h-7 w-7 p-0 hover:bg-amber-100 hover:text-amber-700'
                                >
                                    <Trash2 className='h-3.5 w-3.5' />
                                </Button>
                                {patternData.length > 1 && (
                                    <Button
                                        type='button'
                                        variant='ghost'
                                        size='sm'
                                        onClick={() =>
                                            handleRemoveRow(rowIndex)
                                        }
                                        disabled={disabled}
                                        title='Remove this person'
                                        className='h-7 w-7 p-0 hover:bg-red-100 hover:text-red-700'
                                    >
                                        <X className='h-3.5 w-3.5' />
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Card Body - 7 day grid */}
                        <div className='p-3'>
                            <div className='grid grid-cols-7 gap-2'>
                                {row.map((shiftId, dayIndex) => {
                                    const shift =
                                        shiftId === 0
                                            ? {
                                                  id: 0,
                                                  name: 'OFF',
                                                  code: 'OFF',
                                                  color: '#9CA3AF',
                                              }
                                            : shifts.find(
                                                  (s) => s.id === shiftId
                                              );
                                    const isWeekend = dayIndex >= 5;
                                    const isSelected =
                                        selectedCell?.row === rowIndex &&
                                        selectedCell?.day === dayIndex;

                                    return (
                                        <div
                                            key={dayIndex}
                                            className='flex flex-col items-center gap-1.5'
                                        >
                                            <div
                                                className={cn(
                                                    'text-[10px] font-bold uppercase tracking-wide',
                                                    isWeekend
                                                        ? 'text-red-600'
                                                        : 'text-slate-500'
                                                )}
                                            >
                                                {DAY_NAMES[dayIndex]}
                                            </div>
                                            <button
                                                type='button'
                                                onClick={() =>
                                                    handleCellClick(
                                                        rowIndex,
                                                        dayIndex
                                                    )
                                                }
                                                disabled={disabled}
                                                className={cn(
                                                    'w-full aspect-square rounded-lg border-2 text-xs font-bold transition-all flex items-center justify-center',
                                                    'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1',
                                                    isSelected &&
                                                        'ring-2 ring-primary ring-offset-1 scale-110 shadow-lg',
                                                    disabled &&
                                                        'opacity-50 cursor-not-allowed',
                                                    !disabled &&
                                                        'hover:scale-110 hover:shadow-lg cursor-pointer active:scale-95'
                                                )}
                                                style={{
                                                    backgroundColor: shift
                                                        ? `${shift.color}20`
                                                        : '#F3F4F6',
                                                    color:
                                                        shift?.color ||
                                                        '#6B7280',
                                                    borderColor:
                                                        shift?.color ||
                                                        '#D1D5DB',
                                                }}
                                            >
                                                {shift?.code ||
                                                    shift?.name ||
                                                    '?'}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Person Button */}
            <Button
                type='button'
                variant='outline'
                onClick={handleAddRow}
                disabled={disabled}
                className='w-full border-2 border-dashed hover:border-solid hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300'
            >
                <Plus className='mr-2 h-4 w-4' />
                Add Another Person
            </Button>

            {/* Shift Selector Dialog */}
            {selectedCell && !disabled && (
                <div
                    className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'
                    onClick={() => setSelectedCell(null)}
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
                                Person {selectedCell.row + 1} •{' '}
                                {DAY_NAMES[selectedCell.day]}
                            </p>
                        </div>
                        <div className='grid grid-cols-2 gap-3 mb-4'>
                            {/* OFF Option */}
                            <button
                                type='button'
                                onClick={() => handleShiftChange('0')}
                                className={cn(
                                    'py-4 px-4 rounded-lg border-2 text-sm font-bold transition-all',
                                    'hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary active:scale-95',
                                    'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300'
                                )}
                            >
                                OFF
                            </button>
                            {/* Database Shifts */}
                            {shifts
                                .filter((s) => s.is_active)
                                .map((shift) => (
                                    <button
                                        key={shift.id}
                                        type='button'
                                        onClick={() =>
                                            handleShiftChange(
                                                shift.id.toString()
                                            )
                                        }
                                        className={cn(
                                            'py-4 px-4 rounded-lg border-2 text-sm font-bold transition-all',
                                            'hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary active:scale-95'
                                        )}
                                        style={{
                                            backgroundColor: `${shift.color}20`,
                                            color: shift.color,
                                            borderColor: shift.color,
                                        }}
                                    >
                                        {shift.code || shift.name}
                                    </button>
                                ))}
                        </div>
                        <Button
                            type='button'
                            variant='outline'
                            onClick={() => setSelectedCell(null)}
                            className='w-full border-2 hover:bg-slate-100'
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
