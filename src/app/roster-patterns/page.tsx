'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function RosterPatternsPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to new pattern library page
        router.replace('/patterns');
    }, [router]);

    return (
        <ProtectedRoute>
            <div className='flex items-center justify-center h-screen'>
                <div className='text-gray-500'>
                    Redirecting to Pattern Library...
                </div>
            </div>
        </ProtectedRoute>
    );
}
