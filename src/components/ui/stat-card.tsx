import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
    title: string;
    value: string | number;
    icon?: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    description?: string;
    variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
    className?: string;
}

const variantStyles = {
    default: {
        border: 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700',
        icon: 'text-gray-600 dark:text-gray-400',
        value: 'text-gray-900 dark:text-white',
    },
    primary: {
        border: 'border-blue-200 dark:border-blue-900/50 hover:border-blue-400',
        icon: 'text-blue-600 dark:text-blue-400',
        value: 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent',
    },
    success: {
        border: 'border-green-200 dark:border-green-900/50 hover:border-green-400',
        icon: 'text-green-600 dark:text-green-400',
        value: 'bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent',
    },
    warning: {
        border: 'border-orange-200 dark:border-orange-900/50 hover:border-orange-400',
        icon: 'text-orange-600 dark:text-orange-400',
        value: 'bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent',
    },
    danger: {
        border: 'border-red-200 dark:border-red-900/50 hover:border-red-400',
        icon: 'text-red-600 dark:text-red-400',
        value: 'bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent',
    },
};

export function StatCard({
    title,
    value,
    icon: Icon,
    trend,
    description,
    variant = 'default',
    className,
}: StatCardProps) {
    const styles = variantStyles[variant];

    return (
        <div
            className={cn(
                'group relative overflow-hidden rounded-xl border bg-white dark:bg-gray-950 p-6 transition-all duration-300',
                'shadow-sm hover:shadow-md hover:-translate-y-1',
                styles.border,
                className
            )}
        >
            {/* Background gradient on hover */}
            <div className='absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-blue-50/50 dark:to-blue-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300' />

            <div className='relative'>
                {/* Header */}
                <div className='flex items-start justify-between mb-4'>
                    <div>
                        <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                            {title}
                        </p>
                        {description && (
                            <p className='text-xs text-gray-500 dark:text-gray-500 mt-1'>
                                {description}
                            </p>
                        )}
                    </div>
                    {Icon && (
                        <div
                            className={cn(
                                'rounded-lg p-2 bg-gray-50 dark:bg-gray-900 transition-colors group-hover:scale-110 duration-300',
                                styles.icon
                            )}
                        >
                            <Icon className='h-5 w-5' />
                        </div>
                    )}
                </div>

                {/* Value */}
                <div className='flex items-baseline gap-2'>
                    <p
                        className={cn(
                            'text-3xl font-bold tracking-tight',
                            styles.value
                        )}
                    >
                        {value}
                    </p>
                    {trend && (
                        <span
                            className={cn(
                                'text-sm font-medium',
                                trend.isPositive
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-red-600 dark:text-red-400'
                            )}
                        >
                            {trend.isPositive ? '+' : ''}
                            {trend.value}%
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
