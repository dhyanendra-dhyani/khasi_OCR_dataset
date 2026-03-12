'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import {
    LayoutDashboard, Upload, FileSearch, Shield, BarChart3,
    Settings, Users, Download, History, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useState } from 'react';

const contributorLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/upload', label: 'Upload Dataset', icon: Upload },
    { href: '/dashboard/my-uploads', label: 'My Uploads', icon: History },
];

const reviewerLinks = [
    { href: '/dashboard/review', label: 'Review Queue', icon: FileSearch },
];

const adminLinks = [
    { href: '/dashboard/admin', label: 'Admin Overview', icon: BarChart3 },
    { href: '/dashboard/admin/contributors', label: 'Contributors', icon: Users },
    { href: '/dashboard/admin/exports', label: 'Exports', icon: Download },
    { href: '/dashboard/admin/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();
    const { isAdmin, isReviewer } = useAuth();
    const [collapsed, setCollapsed] = useState(false);

    const isActive = (href: string) => {
        if (href === '/dashboard') return pathname === '/dashboard';
        return pathname.startsWith(href);
    };

    const LinkItem = ({ href, label, icon: Icon }: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }) => (
        <Link
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive(href)
                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
        >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
        </Link>
    );

    return (
        <aside className={`hidden lg:flex flex-col border-r bg-white transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
            <div className="flex-1 p-4 space-y-6 overflow-y-auto">
                {/* Contributor Links */}
                <div>
                    {!collapsed && <p className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Main</p>}
                    <div className="space-y-1">
                        {contributorLinks.map(link => <LinkItem key={link.href} {...link} />)}
                    </div>
                </div>

                {/* Reviewer Links */}
                {isReviewer && (
                    <div>
                        {!collapsed && <p className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Review</p>}
                        <div className="space-y-1">
                            {reviewerLinks.map(link => <LinkItem key={link.href} {...link} />)}
                        </div>
                    </div>
                )}

                {/* Admin Links */}
                {isAdmin && (
                    <div>
                        {!collapsed && <p className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Admin</p>}
                        <div className="space-y-1">
                            {adminLinks.map(link => <LinkItem key={link.href} {...link} />)}
                        </div>
                    </div>
                )}
            </div>

            {/* Collapse toggle */}
            <div className="p-4 border-t">
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-slate-500 rounded-lg hover:bg-slate-50 transition-colors"
                >
                    {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /> <span>Collapse</span></>}
                </button>
            </div>
        </aside>
    );
}
