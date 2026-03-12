'use client';

import { useAuth } from '@/contexts/auth-context';
import { createClient } from '@/lib/supabase/client';
import { getCategoryLabel, getStatusColor, formatDate, formatFileSize } from '@/lib/utils';
import { DATASET_CATEGORIES, PAGE_STATUSES } from '@/lib/constants';
import { useEffect, useState } from 'react';
import { FileImage, Filter, Loader2, Eye } from 'lucide-react';
import type { RawPage } from '@/lib/database.types';

export default function MyUploadsPage() {
    const { profile } = useAuth();
    const [pages, setPages] = useState<RawPage[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [selectedPage, setSelectedPage] = useState<RawPage | null>(null);

    useEffect(() => {
        if (!profile) return;
        const supabase = createClient();
        async function load() {
            let q = supabase.from('raw_pages').select('*').eq('contributor_id', profile!.id).order('created_at', { ascending: false });
            if (statusFilter) q = q.eq('status', statusFilter);
            if (categoryFilter) q = q.eq('category', categoryFilter);
            const { data } = await q.limit(100);
            setPages(data || []);
            setLoading(false);
        }
        load();
    }, [profile, statusFilter, categoryFilter]);

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">My Uploads</h1>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-6 p-4 bg-white rounded-2xl border">
                <Filter className="w-5 h-5 text-slate-400 mt-1.5" />
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-1.5 rounded-lg border bg-slate-50 text-sm">
                    <option value="">All Statuses</option>
                    {PAGE_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
                <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="px-3 py-1.5 rounded-lg border bg-slate-50 text-sm">
                    <option value="">All Categories</option>
                    {DATASET_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
            ) : pages.length === 0 ? (
                <div className="text-center py-20 text-slate-400"><FileImage className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>No uploads found</p></div>
            ) : (
                <div className="bg-white rounded-2xl border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b">
                                <tr>
                                    <th className="text-left px-4 py-3 font-medium text-slate-600">File</th>
                                    <th className="text-left px-4 py-3 font-medium text-slate-600">Category</th>
                                    <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                                    <th className="text-left px-4 py-3 font-medium text-slate-600">Size</th>
                                    <th className="text-left px-4 py-3 font-medium text-slate-600">Date</th>
                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {pages.map(p => (
                                    <tr key={p.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3"><div className="flex items-center gap-2"><FileImage className="w-4 h-4 text-slate-400" /><span className="truncate max-w-[200px]">{p.original_filename || p.id.slice(0, 8)}</span></div></td>
                                        <td className="px-4 py-3 text-slate-600">{getCategoryLabel(p.category)}</td>
                                        <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(p.status)}`}>{p.status.replace('_', ' ')}</span></td>
                                        <td className="px-4 py-3 text-slate-500">{p.file_size ? formatFileSize(p.file_size) : '—'}</td>
                                        <td className="px-4 py-3 text-slate-500">{formatDate(p.created_at)}</td>
                                        <td className="px-4 py-3"><button onClick={() => setSelectedPage(p)} className="text-blue-600 hover:underline text-xs flex items-center gap-1"><Eye className="w-3.5 h-3.5" />View</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {selectedPage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedPage(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold mb-4">{selectedPage.original_filename}</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-slate-500">Category</span><span>{getCategoryLabel(selectedPage.category)}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Status</span><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedPage.status)}`}>{selectedPage.status}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Dimensions</span><span>{selectedPage.width}×{selectedPage.height}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Size</span><span>{selectedPage.file_size ? formatFileSize(selectedPage.file_size) : '—'}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Uploaded</span><span>{formatDate(selectedPage.created_at)}</span></div>
                            {selectedPage.reviewer_notes && <div className="mt-3 p-3 rounded-lg bg-amber-50 text-sm"><strong>Reviewer Notes:</strong> {selectedPage.reviewer_notes}</div>}
                        </div>
                        <button onClick={() => setSelectedPage(null)} className="mt-4 w-full py-2 rounded-xl border font-medium hover:bg-slate-50">Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}
