'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Shield,
    Loader2,
    AlertCircle,
    Eye,
    EyeOff,
    Sparkles,
} from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const { login, isAuthenticated } = useAuth();
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const [showPassword, setShowPassword] = React.useState(false);
    const [formData, setFormData] = React.useState({
        email: '',
        password: '',
    });

    // Redirect if already authenticated
    React.useEffect(() => {
        if (isAuthenticated) {
            router.push('/patterns');
        }
    }, [isAuthenticated, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(formData.email, formData.password);
            router.push('/patterns');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    return (
        <div className='min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-blue-950 dark:to-purple-950'>
            {/* Animated background */}
            <div className='absolute inset-0 overflow-hidden'>
                <div className='absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-400/20 to-transparent rounded-full blur-3xl' />
                <div className='absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-400/20 to-transparent rounded-full blur-3xl' />
            </div>

            {/* Main content */}
            <div className='relative min-h-screen flex items-center justify-center p-4'>
                <div className='w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center'>
                    {/* Left side - Branding */}
                    <div className='hidden lg:block space-y-8'>
                        <div className='space-y-4'>
                            <h1 className='text-6xl font-bold text-gray-900 dark:text-white leading-tight'>
                                Welcome to{' '}
                                <span className='bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
                                    TIA Portal
                                </span>
                            </h1>
                            <p className='text-xl text-gray-600 dark:text-gray-400'>
                                Advanced Time & Attendance Management with Face
                                Recognition
                            </p>
                        </div>

                        {/* Features */}
                        <div className='grid grid-cols-2 gap-4'>
                            {[
                                {
                                    icon: '🎯',
                                    title: 'Smart Roster',
                                    desc: 'AI scheduling',
                                },
                                {
                                    icon: '👤',
                                    title: 'Face Recognition',
                                    desc: 'Contactless',
                                },
                                {
                                    icon: '📊',
                                    title: 'Analytics',
                                    desc: 'Real-time insights',
                                },
                                {
                                    icon: '🔒',
                                    title: 'Secure',
                                    desc: 'Enterprise-grade',
                                },
                            ].map((feature, i) => (
                                <div
                                    key={i}
                                    className='p-4 rounded-2xl bg-white/40 dark:bg-white/5 backdrop-blur-sm border border-white/60 dark:border-white/10 transition-transform hover:-translate-y-1'
                                >
                                    <div className='text-3xl mb-2'>
                                        {feature.icon}
                                    </div>
                                    <h3 className='font-semibold text-gray-900 dark:text-white mb-1'>
                                        {feature.title}
                                    </h3>
                                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                                        {feature.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right side - Login form */}
                    <div>
                        <div className='relative'>
                            {/* Glow effect */}
                            <div className='absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur-2xl opacity-20' />

                            {/* Card */}
                            <div className='relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl p-8 md:p-10 rounded-3xl border border-white/60 dark:border-gray-800 shadow-2xl'>
                                {/* Logo */}
                                <div className='flex flex-col items-center mb-8'>
                                    <div className='relative'>
                                        <div className='absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-xl opacity-50' />
                                        <div className='relative bg-gradient-to-br from-blue-600 to-purple-600 p-4 rounded-2xl shadow-lg'>
                                            <Shield className='h-10 w-10 text-white' />
                                        </div>
                                    </div>
                                    <h2 className='mt-6 text-3xl font-bold text-gray-900 dark:text-white'>
                                        Sign in to TIA
                                    </h2>
                                    <p className='mt-2 text-sm text-gray-600 dark:text-gray-400'>
                                        Enter your credentials to continue
                                    </p>
                                </div>

                                {/* Error alert */}
                                {error && (
                                    <Alert
                                        variant='destructive'
                                        className='mb-6'
                                    >
                                        <AlertCircle className='h-4 w-4' />
                                        <AlertDescription>
                                            {error}
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {/* Form */}
                                <form
                                    onSubmit={handleSubmit}
                                    className='space-y-6'
                                >
                                    <div className='space-y-2'>
                                        <Label
                                            htmlFor='email'
                                            className='text-gray-900 dark:text-white'
                                        >
                                            Email Address
                                        </Label>
                                        <Input
                                            id='email'
                                            name='email'
                                            type='email'
                                            autoComplete='email'
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            className='h-12 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400'
                                            placeholder='admin@tia.com'
                                            disabled={loading}
                                        />
                                    </div>

                                    <div className='space-y-2'>
                                        <Label
                                            htmlFor='password'
                                            className='text-gray-900 dark:text-white'
                                        >
                                            Password
                                        </Label>
                                        <div className='relative'>
                                            <Input
                                                id='password'
                                                name='password'
                                                type={
                                                    showPassword
                                                        ? 'text'
                                                        : 'password'
                                                }
                                                autoComplete='current-password'
                                                required
                                                value={formData.password}
                                                onChange={handleChange}
                                                className='h-12 pr-12 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400'
                                                placeholder='••••••••'
                                                disabled={loading}
                                            />
                                            <button
                                                type='button'
                                                onClick={() =>
                                                    setShowPassword(
                                                        !showPassword
                                                    )
                                                }
                                                className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                                disabled={loading}
                                            >
                                                {showPassword ? (
                                                    <EyeOff className='h-5 w-5' />
                                                ) : (
                                                    <Eye className='h-5 w-5' />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <Button
                                        type='submit'
                                        disabled={loading}
                                        className='w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5'
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                                                Signing in...
                                            </>
                                        ) : (
                                            'Sign in'
                                        )}
                                    </Button>
                                </form>

                                {/* Demo info */}
                                <div className='mt-6 pt-6 border-t border-gray-200 dark:border-gray-700'>
                                    <p className='text-xs text-gray-500 dark:text-gray-400 text-center'>
                                        Demo: admin@tia.com / admin123
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
