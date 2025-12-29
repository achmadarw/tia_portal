'use client';

import * as React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PageContainer } from '@/components/layout/page-container';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/ui/stat-card';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import {
    Plus,
    Search,
    MoreVertical,
    Pencil,
    Trash2,
    Users as UsersIcon,
    UserCheck,
    Shield,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function UsersPage() {
    const [searchQuery, setSearchQuery] = React.useState('');

    // Mock users data - replace with actual API call
    const users = [
        {
            id: 1,
            name: 'Effendi',
            phone: '0851234567894',
            role: 'security',
            status: 'active',
        },
        {
            id: 2,
            name: 'Hendy',
            phone: '0851234567895',
            role: 'security',
            status: 'active',
        },
        {
            id: 3,
            name: 'Ilham',
            phone: '0851234567891',
            role: 'security',
            status: 'active',
        },
        {
            id: 4,
            name: 'Rafi',
            phone: '0851234567893',
            role: 'security',
            status: 'active',
        },
        {
            id: 5,
            name: 'Supri',
            phone: '0851234567892',
            role: 'security',
            status: 'active',
        },
    ];

    const filteredUsers = users.filter(
        (user) =>
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.phone.includes(searchQuery)
    );

    return (
        <ProtectedRoute>
            <DashboardLayout>
                <PageContainer>
                    {/* Page Header */}
                    <PageHeader
                        title='User Management'
                        description='Manage security personnel and their access'
                        actions={
                            <Button className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-sm'>
                                <Plus className='h-4 w-4 mr-2' />
                                Add User
                            </Button>
                        }
                    />

                    {/* Stats Grid */}
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                        <StatCard
                            title='Total Users'
                            value={users.length}
                            icon={UsersIcon}
                            variant='primary'
                            description='All registered users'
                        />
                        <StatCard
                            title='Active Users'
                            value={
                                users.filter((u) => u.status === 'active')
                                    .length
                            }
                            icon={UserCheck}
                            variant='success'
                            description='Currently active'
                        />
                        <StatCard
                            title='Security Staff'
                            value={
                                users.filter((u) => u.role === 'security')
                                    .length
                            }
                            icon={Shield}
                            variant='default'
                            description='Security personnel'
                        />
                    </div>

                    {/* Search and Filters */}
                    <div className='flex items-center gap-4'>
                        <div className='relative flex-1 max-w-md'>
                            <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                            <Input
                                placeholder='Search by name or phone...'
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className='pl-10 h-11 bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 shadow-sm focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:border-transparent'
                            />
                        </div>
                    </div>

                    {/* Users Table */}
                    <div className='rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden shadow-sm'>
                        <Table>
                            <TableHeader>
                                <TableRow className='bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800'>
                                    <TableHead className='font-semibold'>
                                        Name
                                    </TableHead>
                                    <TableHead className='font-semibold'>
                                        Phone
                                    </TableHead>
                                    <TableHead className='font-semibold'>
                                        Role
                                    </TableHead>
                                    <TableHead className='font-semibold'>
                                        Status
                                    </TableHead>
                                    <TableHead className='text-right font-semibold'>
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className='h-64'>
                                            <EmptyState
                                                icon={
                                                    <UsersIcon className='h-12 w-12' />
                                                }
                                                title='No users found'
                                                description='Try adjusting your search to find what you are looking for.'
                                            />
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <TableRow
                                            key={user.id}
                                            className='hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors border-b border-gray-100 dark:border-gray-900 last:border-0'
                                        >
                                            <TableCell className='font-medium text-gray-900 dark:text-white'>
                                                {user.name}
                                            </TableCell>
                                            <TableCell className='text-gray-600 dark:text-gray-400 font-mono text-sm'>
                                                {user.phone}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className='bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-0 font-medium'>
                                                    {user.role}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={
                                                        user.status === 'active'
                                                            ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300 border-0 font-medium'
                                                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-0'
                                                    }
                                                >
                                                    <span
                                                        className={
                                                            user.status ===
                                                            'active'
                                                                ? 'flex items-center gap-1.5'
                                                                : ''
                                                        }
                                                    >
                                                        {user.status ===
                                                            'active' && (
                                                            <span className='h-1.5 w-1.5 rounded-full bg-green-600 dark:bg-green-400' />
                                                        )}
                                                        {user.status}
                                                    </span>
                                                </Badge>
                                            </TableCell>
                                            <TableCell className='text-right'>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            variant='ghost'
                                                            size='icon'
                                                            className='h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-800'
                                                        >
                                                            <MoreVertical className='h-4 w-4' />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent
                                                        align='end'
                                                        className='w-40'
                                                    >
                                                        <DropdownMenuItem className='cursor-pointer'>
                                                            <Pencil className='mr-2 h-4 w-4' />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className='text-red-600 dark:text-red-400 cursor-pointer focus:text-red-600 dark:focus:text-red-400'>
                                                            <Trash2 className='mr-2 h-4 w-4' />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </PageContainer>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
