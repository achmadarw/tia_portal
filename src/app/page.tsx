'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

export default function Home() {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading) {
            if (isAuthenticated) {
                router.push('/roster-patterns');
            } else {
                router.push('/login');
            }
        }
    }, [isAuthenticated, isLoading, router]);

    // Show loading state while checking auth
    return (
        <div className='flex h-screen items-center justify-center'>
            <div className='text-gray-500 dark:text-gray-400'>Loading...</div>
        </div>
    );
}
