'use client';

import { useAuth } from '@/contexts/auth-context';
import { createClient } from '@/lib/supabase/client';
import { formatDateTime } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { Loader2, Activity, Search } from 'lucide-react';
import type { AuditLog } from '@/lib/database.types';

export default function SettingsPage() {
    const { isAdmin } = useAuth();
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionFilter, setActionFilter] = useState('');

    useEffect(() => {
        if (!isAdmin) return;
        const supabase = createClient();
        async function load() {
            let q = supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100);
            if (actionFilter) q = q.ilike('action', `%${actionFilter}%`);
            const { data } = await q;
            setLogs(data || []);
            setLoading(false);
        }
        load();
    }, [isAdmin, actionFilter]);

    if (!isAdmin) return <div className="text-center py-20 text-slate-500">Admin access required.</div>;

    return (
        <div className="max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Audit Logs & Settings</h1>

            <div className="flex gap-3 mb-6 p-4 bg-white rounded-2xl border">
                <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input value={actionFilter} onChange={e => { setActionFilter(e.target.value); setLoading(true); }} className="w-full pl-9 pr-3 py-1.5 rounded-lg border bg-slate-50 text-sm" placeholder="Filter by action..." /></div>
            </div>

            {loading ? <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div> : (
                <div className="bg-white rounded-2xl border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b"><tr>
                                <th className="text-left px-4 py-3 font-medium text-slate-600">Time</th>
                                <th className="text-left px-4 py-3 font-medium text-slate-600">Action</th>
                                <th className="text-left px-4 py-3 font-medium text-slate-600">Entity</th>
                                <th className="text-left px-4 py-3 font-medium text-slate-600">Details</th>
                            </tr></thead>
                            <tbody className="divide-y">
                                {logs.map(log => (
                                    <tr key={log.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{formatDateTime(log.created_at)}</td>
                                        <td className="px-4 py-3"><span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-medium">{log.action}</span></td>
                                        <td className="px-4 py-3 text-slate-500">{log.entity_type} {log.entity_id ? `(${String(log.entity_id).slice(0, 8)}...)` : ''}</td>
                                        <td className="px-4 py-3 text-xs text-slate-400 max-w-[300px] truncate">{JSON.stringify(log.details)}</td>
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
