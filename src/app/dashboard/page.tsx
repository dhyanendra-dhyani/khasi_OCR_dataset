'use client';

import { useAuth } from '@/contexts/auth-context';
import { createClient } from '@/lib/supabase/client';
import { getCategoryLabel, getStatusColor, formatDate, formatDateTime } from '@/lib/utils';
import { DATASET_CATEGORIES } from '@/lib/constants';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
    Upload, CheckCircle, Clock, XCircle, AlertTriangle,
    ArrowRight, FileImage, TrendingUp, Star, Bell, Loader2
} from 'lucide-react';
import type { RawPage, Notification as NotifType } from '@/lib/database.types';

interface DashboardStats {
    total: number;
    approved: number;
    rejected: number;
    under_review: number;
    needs_revision: number;
    drafts: number;
    categoryBreakdown: Record<string, number>;
}

export default function DashboardPage() {
    const { profile, canUpload, loading: authLoading } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentUploads, setRecentUploads] = useState<RawPage[]>([]);
    const [notifications, setNotifications] = useState<NotifType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!profile) return;
        const supabase = createClient();

        async function fetchData() {
            // Fetch pages for stats
            const { data: pages } = await supabase
                .from('raw_pages')
                .select('*')
                .eq('contributor_id', profile!.id)
                .order('created_at', { ascending: false });

            if (pages) {
                const categoryBreakdown: Record<string, number> = {};
                pages.forEach(p => {
                    categoryBreakdown[p.category] = (categoryBreakdown[p.category] || 0) + 1;
                });

                setStats({
                    total: pages.length,
                    approved: pages.filter(p => p.status === 'approved').length,
                    rejected: pages.filter(p => p.status === 'rejected').length,
                    under_review: pages.filter(p => p.status === 'under_review' || p.status === 'submitted').length,
                    needs_revision: pages.filter(p => p.status === 'needs_revision').length,
                    drafts: pages.filter(p => p.status === 'draft').length,
                    categoryBreakdown,
                });
                setRecentUploads(pages.slice(0, 5));
            }

            // Fetch notifications
            const { data: notifs } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', profile!.id)
                .order('created_at', { ascending: false })
                .limit(5);

            if (notifs) setNotifications(notifs);
            setLoading(false);
        }

        fetchData();
    }, [profile]);

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (profile && !profile.onboarding_completed) {
        return (
            <div className="max-w-lg mx-auto mt-20 text-center">
                <div className="p-8 rounded-2xl bg-white border shadow-sm">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-amber-500" />
                    <h2 className="text-xl font-bold mb-2">Complete Your Profile</h2>
                    <p className="text-slate-600 mb-6">You need to complete your profile before you can start uploading datasets.</p>
                    <Link href="/dashboard/complete-profile" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium gradient-primary">
                        Complete Profile <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        );
    }

    const statCards = [
        { label: 'Total Uploads', value: stats?.total || 0, icon: FileImage, color: 'bg-blue-50 text-blue-600' },
        { label: 'Approved', value: stats?.approved || 0, icon: CheckCircle, color: 'bg-emerald-50 text-emerald-600' },
        { label: 'Under Review', value: stats?.under_review || 0, icon: Clock, color: 'bg-amber-50 text-amber-600' },
        { label: 'Rejected', value: stats?.rejected || 0, icon: XCircle, color: 'bg-red-50 text-red-600' },
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
            {/* Welcome Banner */}
            <div className="p-6 rounded-2xl gradient-primary text-white relative overflow-hidden">
                <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="relative">
                    <h1 className="text-2xl font-bold mb-1">Welcome back, {profile?.full_name?.split(' ')[0]}! 👋</h1>
                    <p className="text-blue-100 mb-4">
                        {canUpload
                            ? 'You are an active contributor. Keep uploading great scans!'
                            : profile?.status === 'pending'
                                ? 'Your account is pending admin approval. Please wait for activation.'
                                : 'Your account is currently suspended. Contact admin for help.'}
                    </p>
                    {canUpload && (
                        <Link href="/dashboard/upload" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors">
                            <Upload className="w-4 h-4" /> Upload New Dataset
                        </Link>
                    )}
                </div>
            </div>

            {/* Status warning */}
            {profile?.status === 'pending' && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                    <Clock className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                        <p className="font-medium text-amber-800">Account Pending Approval</p>
                        <p className="text-sm text-amber-600">An admin will review and activate your account. You'll be notified once approved.</p>
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map(card => (
                    <div key={card.label} className="p-5 rounded-2xl bg-white border card-hover">
                        <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center mb-3`}>
                            <card.icon className="w-5 h-5" />
                        </div>
                        <div className="text-2xl font-bold">{card.value}</div>
                        <div className="text-sm text-slate-500">{card.label}</div>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Recent Uploads */}
                <div className="lg:col-span-2 bg-white rounded-2xl border p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Recent Uploads</h2>
                        <Link href="/dashboard/my-uploads" className="text-sm text-blue-600 hover:underline">View all</Link>
                    </div>
                    {recentUploads.length === 0 ? (
                        <div className="text-center py-10 text-slate-400">
                            <FileImage className="w-10 h-10 mx-auto mb-3 opacity-50" />
                            <p className="text-sm">No uploads yet. Start contributing!</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentUploads.map(page => (
                                <div key={page.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                                    <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                                        <FileImage className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{page.original_filename || 'Untitled'}</p>
                                        <p className="text-xs text-slate-500">{getCategoryLabel(page.category)} · {formatDate(page.created_at)}</p>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(page.status)}`}>
                                        {page.status.replace('_', ' ')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Quality Score */}
                    <div className="bg-white rounded-2xl border p-6">
                        <div className="flex items-center gap-2 mb-3">
                            <Star className="w-5 h-5 text-amber-500" />
                            <h3 className="font-semibold">Contribution Score</h3>
                        </div>
                        <div className="text-3xl font-bold gradient-text">{profile?.contribution_score || 0}</div>
                        <p className="text-xs text-slate-500 mt-1">Based on approved uploads</p>
                    </div>

                    {/* Category Breakdown */}
                    <div className="bg-white rounded-2xl border p-6">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                            Your Categories
                        </h3>
                        {stats && Object.keys(stats.categoryBreakdown).length > 0 ? (
                            <div className="space-y-2">
                                {Object.entries(stats.categoryBreakdown).slice(0, 6).map(([cat, count]) => (
                                    <div key={cat} className="flex items-center justify-between">
                                        <span className="text-sm text-slate-600 truncate">{getCategoryLabel(cat)}</span>
                                        <span className="text-sm font-medium">{count}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400">No uploads yet</p>
                        )}
                    </div>

                    {/* Notifications */}
                    <div className="bg-white rounded-2xl border p-6">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <Bell className="w-5 h-5 text-blue-600" />
                            Notifications
                        </h3>
                        {notifications.length === 0 ? (
                            <p className="text-sm text-slate-400">No notifications</p>
                        ) : (
                            <div className="space-y-2">
                                {notifications.map(n => (
                                    <div key={n.id} className={`p-3 rounded-lg text-sm ${n.read ? 'bg-slate-50' : 'bg-blue-50'}`}>
                                        <p className="font-medium text-xs">{n.title}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                                        <p className="text-xs text-slate-400 mt-1">{formatDateTime(n.created_at)}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Missing categories hint */}
                    {canUpload && (
                        <div className="bg-gradient-to-br from-violet-50 to-blue-50 rounded-2xl border border-violet-100 p-6">
                            <h3 className="font-semibold mb-2 text-sm">📊 Data Gaps</h3>
                            <p className="text-xs text-slate-600 mb-3">
                                We need more scans in these categories:
                            </p>
                            <div className="space-y-1">
                                {DATASET_CATEGORIES.slice(0, 3).map(cat => (
                                    <div key={cat.value} className="text-xs text-violet-700 bg-white/60 px-2 py-1 rounded-lg">
                                        {cat.label}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
