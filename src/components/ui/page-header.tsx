import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface PageHeaderProps {
    title: string;
    description?: string;
    actions?: ReactNode;
    className?: string;
}

export function PageHeader({
    title,
    description,
    actions,
    className,
}: PageHeaderProps) {
    return (
        <div
            className={cn(
                'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-200 dark:border-gray-800',
                className
            )}
        >
            <div className='space-y-1'>
                <h1 className='text-3xl font-bold tracking-tight text-gray-900 dark:text-white'>
                    {title}
                </h1>
                {description && (
                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                        {description}
                    </p>
                )}
            </div>
            {actions && (
                <div className='flex items-center gap-2'>{actions}</div>
            )}
        </div>
    );
}
