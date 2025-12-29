'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    LayoutGrid,
    Users,
    Calendar,
    LogOut,
    Menu,
    X,
    ChevronLeft,
    Bell,
    Search,
} from 'lucide-react';

interface NavItem {
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    description?: string;
}

const navItems: NavItem[] = [
    {
        title: 'User Management',
        href: '/users',
        icon: Users,
        description: 'Manage security personnel',
    },
    {
        title: 'Roster Management',
        href: '/assignments',
        icon: Calendar,
        description: 'Manage patterns and assignments',
    },
];

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = React.useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

    // Use actual user from auth context with safe fallback
    const displayUser = {
        name: user?.name || 'Admin',
        email: user?.email || 'admin@tia.com',
        role: user?.role || 'Administrator',
    };

    const handleLogout = () => {
        logout();
    };

    return (
        <div className='flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900'>
            {/* Sidebar - Desktop */}
            <aside
                className={cn(
                    'hidden lg:flex flex-col border-r bg-white dark:bg-gray-950 transition-all duration-300',
                    sidebarOpen ? 'w-64' : 'w-20'
                )}
            >
                {/* Logo & Toggle */}
                <div className='flex items-center justify-between p-4 border-b'>
                    <Link
                        href='/'
                        className={cn(
                            'flex items-center gap-3 font-semibold transition-opacity',
                            !sidebarOpen && 'opacity-0'
                        )}
                    >
                        <div className='rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 p-2 shadow-md'>
                            <LayoutGrid className='h-6 w-6 text-white' />
                        </div>
                        {sidebarOpen && (
                            <span className='text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
                                TIA Portal
                            </span>
                        )}
                    </Link>
                    <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className='h-8 w-8'
                    >
                        <ChevronLeft
                            className={cn(
                                'h-4 w-4 transition-transform',
                                !sidebarOpen && 'rotate-180'
                            )}
                        />
                    </Button>
                </div>

                {/* Navigation */}
                <ScrollArea className='flex-1 px-3 py-4'>
                    <nav className='space-y-2'>
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                                        isActive
                                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
                                        !sidebarOpen && 'justify-center'
                                    )}
                                    title={
                                        !sidebarOpen ? item.title : undefined
                                    }
                                >
                                    <Icon className='h-5 w-5 flex-shrink-0' />
                                    {sidebarOpen && <span>{item.title}</span>}
                                </Link>
                            );
                        })}
                    </nav>
                </ScrollArea>

                {/* User Profile */}
                <div className='border-t p-4'>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant='ghost'
                                className={cn(
                                    'w-full justify-start gap-3 h-auto py-2',
                                    !sidebarOpen && 'justify-center px-0'
                                )}
                            >
                                <Avatar className='h-8 w-8'>
                                    <AvatarFallback className='bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-bold'>
                                        {displayUser.name.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                {sidebarOpen && (
                                    <div className='flex flex-col items-start text-sm'>
                                        <span className='font-medium text-gray-900 dark:text-white'>
                                            {displayUser.name}
                                        </span>
                                        <span className='text-xs text-gray-500 dark:text-gray-400'>
                                            {displayUser.role}
                                        </span>
                                    </div>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end' className='w-56'>
                            <DropdownMenuLabel>
                                <div className='flex flex-col space-y-1'>
                                    <p className='text-sm font-medium'>
                                        {displayUser.name}
                                    </p>
                                    <p className='text-xs text-muted-foreground'>
                                        {displayUser.email}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={handleLogout}
                                className='text-red-600'
                            >
                                <LogOut className='mr-2 h-4 w-4' />
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </aside>

            {/* Mobile Sidebar */}
            {mobileMenuOpen && (
                <>
                    <div
                        className='fixed inset-0 z-40 bg-black/50 lg:hidden'
                        onClick={() => setMobileMenuOpen(false)}
                    />
                    <aside className='fixed inset-y-0 left-0 z-50 w-64 flex flex-col border-r bg-white dark:bg-gray-950 lg:hidden'>
                        <div className='flex items-center justify-between p-4 border-b'>
                            <Link
                                href='/'
                                className='flex items-center gap-3 font-semibold'
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <div className='rounded-lg bg-blue-600 p-2'>
                                    <LayoutGrid className='h-6 w-6 text-white' />
                                </div>
                                <span className='text-xl text-gray-900 dark:text-white'>
                                    TIA Portal
                                </span>
                            </Link>
                            <Button
                                variant='ghost'
                                size='icon'
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <X className='h-5 w-5' />
                            </Button>
                        </div>

                        <ScrollArea className='flex-1 px-3 py-4'>
                            <nav className='space-y-2'>
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = pathname === item.href;

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={cn(
                                                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                                                isActive
                                                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
                                                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                                            )}
                                            onClick={() =>
                                                setMobileMenuOpen(false)
                                            }
                                        >
                                            <Icon className='h-5 w-5' />
                                            <span>{item.title}</span>
                                        </Link>
                                    );
                                })}
                            </nav>
                        </ScrollArea>

                        <div className='border-t p-4'>
                            <div className='flex items-center gap-3 mb-3'>
                                <Avatar className='h-8 w-8'>
                                    <AvatarFallback className='bg-blue-600 text-white text-sm'>
                                        {displayUser.name.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className='flex flex-col text-sm'>
                                    <span className='font-medium text-gray-900 dark:text-white'>
                                        {displayUser.name}
                                    </span>
                                    <span className='text-xs text-gray-500 dark:text-gray-400'>
                                        {displayUser.role}
                                    </span>
                                </div>
                            </div>
                            <Button
                                variant='outline'
                                className='w-full justify-start gap-2 text-red-600 border-red-200 hover:bg-red-50'
                                onClick={handleLogout}
                            >
                                <LogOut className='h-4 w-4' />
                                Logout
                            </Button>
                        </div>
                    </aside>
                </>
            )}

            {/* Main Content */}
            <div className='flex-1 flex flex-col overflow-hidden'>
                {/* Top Bar - Desktop & Mobile */}
                <header className='border-b bg-white dark:bg-gray-950 sticky top-0 z-30'>
                    <div className='flex items-center justify-between px-6 py-3'>
                        {/* Left: Mobile Menu + Page Title */}
                        <div className='flex items-center gap-4'>
                            <Button
                                variant='ghost'
                                size='icon'
                                className='lg:hidden'
                                onClick={() => setMobileMenuOpen(true)}
                            >
                                <Menu className='h-5 w-5' />
                            </Button>

                            {/* Search Bar - Hidden on mobile */}
                            <div className='hidden md:flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 w-80'>
                                <Search className='h-4 w-4 text-gray-400' />
                                <input
                                    type='text'
                                    placeholder='Search...'
                                    className='bg-transparent border-none outline-none text-sm w-full placeholder:text-gray-400'
                                />
                            </div>
                        </div>

                        {/* Right: Notifications + User Avatar */}
                        <div className='flex items-center gap-3'>
                            {/* Notifications */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant='ghost'
                                        size='icon'
                                        className='relative'
                                    >
                                        <Bell className='h-5 w-5' />
                                        <span className='absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full' />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align='end'
                                    className='w-80'
                                >
                                    <DropdownMenuLabel>
                                        Notifications
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <div className='p-4 text-center text-sm text-gray-500'>
                                        No new notifications
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* User Menu */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant='ghost'
                                        className='gap-2 px-2'
                                    >
                                        <Avatar className='h-8 w-8'>
                                            <AvatarFallback className='bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-bold'>
                                                {displayUser.name.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className='hidden md:flex flex-col items-start text-sm'>
                                            <span className='font-medium text-gray-900 dark:text-white'>
                                                {displayUser.name}
                                            </span>
                                            <span className='text-xs text-gray-500 dark:text-gray-400'>
                                                {displayUser.role}
                                            </span>
                                        </div>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align='end'
                                    className='w-56'
                                >
                                    <DropdownMenuLabel>
                                        <div className='flex flex-col space-y-1'>
                                            <p className='text-sm font-medium'>
                                                {displayUser.name}
                                            </p>
                                            <p className='text-xs text-muted-foreground'>
                                                {displayUser.email}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={handleLogout}
                                        className='text-red-600 cursor-pointer'
                                    >
                                        <LogOut className='mr-2 h-4 w-4' />
                                        Logout
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className='flex-1 overflow-auto bg-gray-50 dark:bg-gray-900'>
                    {children}
                </main>
            </div>
        </div>
    );
}
