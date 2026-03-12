'use client';

import { useAuth } from '@/contexts/auth-context';
import { createClient } from '@/lib/supabase/client';
import { getCategoryLabel, getStatusColor, formatDate } from '@/lib/utils';
import { DATASET_CATEGORIES } from '@/lib/constants';
import { useEffect, useState } from 'react';
import { Loader2, Users, FileImage, CheckCircle, XCircle, AlertTriangle, Star, BarChart3, TrendingUp, Target, Database } from 'lucide-react';
import Link from 'next/link';

interface Stats { totalPages: number; approved: number; rejected: number; pending: number; underReview: number; gold: number; totalContributors: number; activeContributors: number; pendingContributors: number; categoryDist: Record<string, number>; qualityDist: Record<string, number>; districtDist: Record<string, number>; }

export default function AdminPage() {
    const { isAdmin } = useAuth();
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAdmin) return;
        const supabase = createClient();
        async function load() {
            const [pagesRes, profilesRes, metaRes] = await Promise.all([
                supabase.from('raw_pages').select('id, status, category, is_gold'),
                supabase.from('profiles').select('id, status, role').eq('role', 'contributor'),
                supabase.from('raw_page_metadata').select('quality_level, district'),
            ]);
            const pages = pagesRes.data || [];
            const profiles = profilesRes.data || [];
            const meta = metaRes.data || [];

            const categoryDist: Record<string, number> = {};
            pages.forEach(p => { categoryDist[p.category] = (categoryDist[p.category] || 0) + 1; });
            const qualityDist: Record<string, number> = {};
            const districtDist: Record<string, number> = {};
            meta.forEach(m => {
                if (m.quality_level) qualityDist[m.quality_level] = (qualityDist[m.quality_level] || 0) + 1;
                if (m.district) districtDist[m.district] = (districtDist[m.district] || 0) + 1;
            });

            setStats({
                totalPages: pages.length,
                approved: pages.filter(p => p.status === 'approved').length,
                rejected: pages.filter(p => p.status === 'rejected').length,
                pending: pages.filter(p => p.status === 'submitted').length,
                underReview: pages.filter(p => p.status === 'under_review').length,
                gold: pages.filter(p => p.is_gold).length,
                totalContributors: profiles.length,
                activeContributors: profiles.filter(p => p.status === 'active').length,
                pendingContributors: profiles.filter(p => p.status === 'pending').length,
                categoryDist, qualityDist, districtDist,
            });
            setLoading(false);
        }
        load();
    }, [isAdmin]);

    if (!isAdmin) return <div className="text-center py-20 text-slate-500">Admin access required.</div>;
    if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
    if (!stats) return null;

    const overviewCards = [
        { label: 'Total Pages', value: stats.totalPages, icon: FileImage, color: 'bg-blue-50 text-blue-600' },
        { label: 'Approved', value: stats.approved, icon: CheckCircle, color: 'bg-emerald-50 text-emerald-600' },
        { label: 'Pending Review', value: stats.pending + stats.underReview, icon: AlertTriangle, color: 'bg-amber-50 text-amber-600' },
        { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'bg-red-50 text-red-600' },
        { label: 'Gold Dataset', value: stats.gold, icon: Star, color: 'bg-yellow-50 text-yellow-600' },
        { label: 'Contributors', value: stats.totalContributors, icon: Users, color: 'bg-violet-50 text-violet-600' },
        { label: 'Active', value: stats.activeContributors, icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600' },
        { label: 'Pending Approval', value: stats.pendingContributors, icon: AlertTriangle, color: 'bg-amber-50 text-amber-600' },
    ];

    const targets: Record<string, number> = { textbook_scan: 500, notice_scan: 200, pamphlet_scan: 200, newspaper_scan: 300, form_scan: 200, register_scan: 150, archive_scan: 200, photocopy_scan: 150, worksheet_scan: 150, church_bulletin_scan: 100, community_document_scan: 100, other_printed_scan: 100 };

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <div className="flex gap-2">
                    <Link href="/dashboard/admin/contributors" className="px-4 py-2 rounded-xl text-sm font-medium border hover:bg-slate-50 flex items-center gap-1.5"><Users className="w-4 h-4" />Contributors</Link>
                    <Link href="/dashboard/admin/exports" className="px-4 py-2 rounded-xl text-sm font-medium gradient-primary text-white flex items-center gap-1.5"><Database className="w-4 h-4" />Exports</Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {overviewCards.map(c => (
                    <div key={c.label} className="p-5 rounded-2xl bg-white border card-hover">
                        <div className={`w-10 h-10 rounded-xl ${c.color} flex items-center justify-center mb-3`}><c.icon className="w-5 h-5" /></div>
                        <div className="text-2xl font-bold">{c.value}</div>
                        <div className="text-sm text-slate-500">{c.label}</div>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Category Distribution */}
                <div className="bg-white rounded-2xl border p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-blue-600" />Category Distribution</h3>
                    <div className="space-y-3">
                        {DATASET_CATEGORIES.map(cat => {
                            const count = stats.categoryDist[cat.value] || 0;
                            const target = targets[cat.value] || 100;
                            const pct = Math.min((count / target) * 100, 100);
                            return (
                                <div key={cat.value}>
                                    <div className="flex justify-between mb-1"><span className="text-sm">{cat.label}</span><span className="text-sm font-medium">{count}/{target}</span></div>
                                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden"><div className={`h-full rounded-full ${pct >= 80 ? 'bg-emerald-500' : pct >= 40 ? 'bg-amber-500' : 'bg-red-400'} transition-all`} style={{ width: `${pct}%` }} /></div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Data Gaps + District + Quality */}
                <div className="space-y-6">
                    {/* Data Gaps */}
                    <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl border border-red-100 p-6">
                        <h3 className="font-semibold mb-3 flex items-center gap-2"><Target className="w-5 h-5 text-red-600" />Data Gaps — Need More</h3>
                        <div className="space-y-2">
                            {DATASET_CATEGORIES.filter(c => (stats.categoryDist[c.value] || 0) < (targets[c.value] || 100) * 0.3).slice(0, 5).map(c => (
                                <div key={c.value} className="flex items-center justify-between p-2 bg-white/60 rounded-lg">
                                    <span className="text-sm">{c.label}</span>
                                    <span className="text-sm font-medium text-red-600">{stats.categoryDist[c.value] || 0}/{targets[c.value] || 100}</span>
                                </div>
                            ))}
                            {DATASET_CATEGORIES.filter(c => (stats.categoryDist[c.value] || 0) < (targets[c.value] || 100) * 0.3).length === 0 && <p className="text-sm text-slate-500">No critical gaps!</p>}
                        </div>
                    </div>

                    {/* Quality Distribution */}
                    <div className="bg-white rounded-2xl border p-6">
                        <h3 className="font-semibold mb-3">Quality Distribution</h3>
                        <div className="flex gap-2">
                            {['clean', 'medium', 'noisy', 'very_noisy'].map(q => (
                                <div key={q} className="flex-1 text-center p-3 rounded-xl bg-slate-50">
                                    <div className="text-lg font-bold">{stats.qualityDist[q] || 0}</div>
                                    <div className="text-xs text-slate-500 capitalize">{q.replace('_', ' ')}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Districts */}
                    <div className="bg-white rounded-2xl border p-6">
                        <h3 className="font-semibold mb-3">Top Districts</h3>
                        <div className="space-y-2">
                            {Object.entries(stats.districtDist).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([d, c]) => (
                                <div key={d} className="flex justify-between text-sm"><span>{d}</span><span className="font-medium">{c} pages</span></div>
                            ))}
                            {Object.keys(stats.districtDist).length === 0 && <p className="text-sm text-slate-400">No district data yet</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
