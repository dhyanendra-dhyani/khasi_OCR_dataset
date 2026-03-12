'use client';

import { useAuth } from '@/contexts/auth-context';
import { createClient } from '@/lib/supabase/client';
import { getStatusColor, formatDate } from '@/lib/utils';
import { USER_ROLES } from '@/lib/constants';
import { useEffect, useState } from 'react';
import { Loader2, Users, CheckCircle, Ban, Clock, Search } from 'lucide-react';
import type { Profile } from '@/lib/database.types';

export default function ContributorsPage() {
    const { isAdmin, profile: myProfile } = useAuth();
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [acting, setActing] = useState('');

    const fetchProfiles = async () => {
        const supabase = createClient();
        let q = supabase.from('profiles').select('*').order('created_at', { ascending: false });
        if (statusFilter) q = q.eq('status', statusFilter);
        const { data } = await q;
        setProfiles(data || []);
        setLoading(false);
    };

    useEffect(() => { if (isAdmin) fetchProfiles(); }, [isAdmin, statusFilter]);

    const updateStatus = async (userId: string, newStatus: string) => {
        setActing(userId);
        const supabase = createClient();
        await supabase.from('profiles').update({ status: newStatus }).eq('id', userId);
        await supabase.from('audit_logs').insert({ user_id: myProfile!.id, action: `contributor_${newStatus}`, entity_type: 'profile', entity_id: userId });
        fetchProfiles();
        setActing('');
    };

    const updateRole = async (userId: string, newRole: string) => {
        setActing(userId);
        const supabase = createClient();
        await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
        await supabase.from('audit_logs').insert({ user_id: myProfile!.id, action: 'role_change', entity_type: 'profile', entity_id: userId, details: { new_role: newRole } });
        fetchProfiles();
        setActing('');
    };

    if (!isAdmin) return <div className="text-center py-20 text-slate-500">Admin access required.</div>;

    const filtered = profiles.filter(p => !search || p.full_name.toLowerCase().includes(search.toLowerCase()) || p.email.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Manage Contributors</h1>

            <div className="flex flex-wrap gap-3 mb-6 p-4 bg-white rounded-2xl border">
                <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-1.5 rounded-lg border bg-slate-50 text-sm" placeholder="Search by name or email..." /></div>
                <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setLoading(true); }} className="px-3 py-1.5 rounded-lg border bg-slate-50 text-sm">
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                </select>
            </div>

            {loading ? <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div> : (
                <div className="bg-white rounded-2xl border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b"><tr>
                                <th className="text-left px-4 py-3 font-medium text-slate-600">Name</th>
                                <th className="text-left px-4 py-3 font-medium text-slate-600">Email</th>
                                <th className="text-left px-4 py-3 font-medium text-slate-600">Institute</th>
                                <th className="text-left px-4 py-3 font-medium text-slate-600">District</th>
                                <th className="text-left px-4 py-3 font-medium text-slate-600">Role</th>
                                <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                                <th className="text-left px-4 py-3 font-medium text-slate-600">Joined</th>
                                <th className="px-4 py-3 font-medium text-slate-600">Actions</th>
                            </tr></thead>
                            <tbody className="divide-y">
                                {filtered.map(p => (
                                    <tr key={p.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 font-medium">{p.full_name}</td>
                                        <td className="px-4 py-3 text-slate-500">{p.email}</td>
                                        <td className="px-4 py-3 text-slate-500">{p.institute || '—'}</td>
                                        <td className="px-4 py-3 text-slate-500">{p.district || '—'}</td>
                                        <td className="px-4 py-3">
                                            <select value={p.role} onChange={e => updateRole(p.id, e.target.value)} disabled={p.id === myProfile?.id || acting === p.id} className="px-2 py-1 rounded border text-xs bg-slate-50">
                                                {USER_ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                                            </select>
                                        </td>
                                        <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(p.status)}`}>{p.status}</span></td>
                                        <td className="px-4 py-3 text-slate-500">{formatDate(p.created_at)}</td>
                                        <td className="px-4 py-3">
                                            {acting === p.id ? <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> : (
                                                <div className="flex gap-1">
                                                    {p.status === 'pending' && <button onClick={() => updateStatus(p.id, 'active')} className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50" title="Approve"><CheckCircle className="w-4 h-4" /></button>}
                                                    {p.status === 'active' && p.id !== myProfile?.id && <button onClick={() => updateStatus(p.id, 'suspended')} className="p-1.5 rounded-lg text-red-600 hover:bg-red-50" title="Suspend"><Ban className="w-4 h-4" /></button>}
                                                    {p.status === 'suspended' && <button onClick={() => updateStatus(p.id, 'active')} className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50" title="Reactivate"><CheckCircle className="w-4 h-4" /></button>}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
