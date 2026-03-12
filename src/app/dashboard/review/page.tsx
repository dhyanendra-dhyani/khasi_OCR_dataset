'use client';

import { useAuth } from '@/contexts/auth-context';
import { createClient } from '@/lib/supabase/client';
import { getCategoryLabel, getStatusColor, formatDate } from '@/lib/utils';
import { DATASET_CATEGORIES, PAGE_STATUSES, QUALITY_LEVELS, REJECTION_REASONS } from '@/lib/constants';
import { useEffect, useState } from 'react';
import { Loader2, CheckCircle, XCircle, AlertTriangle, FileSearch, Eye, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import type { RawPage, RawPageMetadata } from '@/lib/database.types';

type PageWithMeta = RawPage & { raw_page_metadata: RawPageMetadata[] };

export default function ReviewPage() {
    const { isReviewer, profile } = useAuth();
    const [pages, setPages] = useState<PageWithMeta[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('submitted');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [selected, setSelected] = useState<PageWithMeta | null>(null);
    const [action, setAction] = useState('');
    const [reason, setReason] = useState('');
    const [notes, setNotes] = useState('');
    const [acting, setActing] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');

    const fetchPages = async () => {
        const supabase = createClient();
        let q = supabase.from('raw_pages').select('*, raw_page_metadata(*)').order('created_at', { ascending: false });
        if (statusFilter) q = q.eq('status', statusFilter);
        if (categoryFilter) q = q.eq('category', categoryFilter);
        const { data } = await q.limit(50);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setPages((data as any as PageWithMeta[]) || []);
        setLoading(false);
    };

    useEffect(() => { if (isReviewer) fetchPages(); }, [isReviewer, statusFilter, categoryFilter]);

    const loadPreview = async (page: PageWithMeta) => {
        setSelected(page);
        const supabase = createClient();
        const { data } = await supabase.storage.from('raw-pages').createSignedUrl(page.original_file_path, 3600);
        setPreviewUrl(data?.signedUrl || '');
    };

    const handleAction = async (act: string) => {
        if (!selected || !profile) return;
        if (act === 'reject' && !reason) { alert('Please select a rejection reason'); return; }
        setActing(true);
        try {
            const supabase = createClient();
            const newStatus = act === 'approve' ? 'approved' : act === 'reject' ? 'rejected' : 'needs_revision';
            await supabase.from('raw_pages').update({ status: newStatus, reviewer_notes: notes || null }).eq('id', selected.id);
            await supabase.from('review_actions').insert({ page_id: selected.id, reviewer_id: profile.id, action: act, reason: reason || null, notes: notes || null, previous_status: selected.status, new_status: newStatus });
            await supabase.from('audit_logs').insert({ user_id: profile.id, action: `review_${act}`, entity_type: 'raw_page', entity_id: selected.id });
            setSelected(null); setAction(''); setReason(''); setNotes(''); setPreviewUrl('');
            fetchPages();
        } catch (err) { console.error(err); alert('Action failed'); }
        setActing(false);
    };

    const handleGold = async () => {
        if (!selected || !profile) return;
        setActing(true);
        try {
            const supabase = createClient();
            await supabase.from('raw_pages').update({ is_gold: !selected.is_gold, gold_approved_by: selected.is_gold ? null : profile.id, gold_approved_at: selected.is_gold ? null : new Date().toISOString() }).eq('id', selected.id);
            await supabase.from('review_actions').insert({ page_id: selected.id, reviewer_id: profile.id, action: selected.is_gold ? 'unmark_gold' : 'mark_gold' });
            setSelected(null); fetchPages();
        } catch (err) { console.error(err); }
        setActing(false);
    };

    if (!isReviewer) return <div className="text-center py-20 text-slate-500">Access denied. Reviewer role required.</div>;

    const meta = selected?.raw_page_metadata?.[0];

    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Review Queue</h1>

            <div className="flex flex-wrap gap-3 mb-6 p-4 bg-white rounded-2xl border">
                <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setLoading(true); }} className="px-3 py-1.5 rounded-lg border bg-slate-50 text-sm">
                    <option value="">All Status</option>
                    {PAGE_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
                <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setLoading(true); }} className="px-3 py-1.5 rounded-lg border bg-slate-50 text-sm">
                    <option value="">All Categories</option>
                    {DATASET_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
                <span className="text-sm text-slate-500 self-center ml-auto">{pages.length} page(s)</span>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
            ) : pages.length === 0 ? (
                <div className="text-center py-20"><FileSearch className="w-12 h-12 mx-auto mb-3 text-slate-300" /><p className="text-slate-400">No pages to review</p></div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {pages.map(p => (
                        <div key={p.id} className="bg-white rounded-2xl border card-hover overflow-hidden cursor-pointer" onClick={() => loadPreview(p)}>
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(p.status)}`}>{p.status.replace('_', ' ')}</span>
                                    {p.is_gold && <Star className="w-4 h-4 text-amber-500 fill-amber-500" />}
                                </div>
                                <p className="text-sm font-medium truncate">{p.original_filename || p.id.slice(0, 8)}</p>
                                <p className="text-xs text-slate-500 mt-1">{getCategoryLabel(p.category)}</p>
                                <p className="text-xs text-slate-400 mt-1">{formatDate(p.created_at)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Review Modal */}
            {selected && (
                <div className="fixed inset-0 z-50 flex bg-black/50 p-4" onClick={() => { setSelected(null); setPreviewUrl(''); }}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full mx-auto max-h-[90vh] overflow-y-auto flex flex-col lg:flex-row" onClick={e => e.stopPropagation()}>
                        {/* Image */}
                        <div className="lg:w-1/2 bg-slate-100 flex items-center justify-center p-4 min-h-[300px]">
                            {previewUrl ? <img src={previewUrl} alt="" className="max-w-full max-h-[70vh] object-contain rounded-lg" /> : <Loader2 className="w-8 h-8 animate-spin text-blue-600" />}
                        </div>
                        {/* Details */}
                        <div className="lg:w-1/2 p-6 overflow-y-auto">
                            <h3 className="text-lg font-bold mb-1">{selected.original_filename}</h3>
                            <p className="text-sm text-slate-500 mb-4">{getCategoryLabel(selected.category)} · {formatDate(selected.created_at)}</p>

                            {meta && (
                                <div className="space-y-2 text-sm mb-6">
                                    <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl">
                                        <div><span className="text-slate-500">Title:</span> {meta.document_title}</div>
                                        <div><span className="text-slate-500">Source:</span> {meta.source_type}</div>
                                        <div><span className="text-slate-500">Capture:</span> {meta.capture_type}</div>
                                        <div><span className="text-slate-500">Quality:</span> {meta.quality_level}</div>
                                        <div><span className="text-slate-500">District:</span> {meta.district || '—'}</div>
                                        <div><span className="text-slate-500">Year:</span> {meta.document_year || '—'}</div>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {meta.blur_present && <span className="px-2 py-0.5 rounded bg-red-50 text-red-600 text-xs">Blur</span>}
                                        {meta.shadow_present && <span className="px-2 py-0.5 rounded bg-red-50 text-red-600 text-xs">Shadow</span>}
                                        {meta.skew_present && <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-600 text-xs">Skew</span>}
                                        {meta.low_contrast && <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-600 text-xs">Low contrast</span>}
                                        {meta.faded_text && <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-600 text-xs">Faded</span>}
                                        {meta.multi_column && <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-xs">Multi-col</span>}
                                        {meta.contains_tables && <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-xs">Tables</span>}
                                        {meta.contains_stamps && <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-xs">Stamps</span>}
                                        {meta.contains_sensitive_info && <span className="px-2 py-0.5 rounded bg-red-50 text-red-600 text-xs">Sensitive</span>}
                                    </div>
                                    {meta.contributor_notes && <div className="p-3 bg-blue-50 rounded-xl text-sm"><strong>Notes:</strong> {meta.contributor_notes}</div>}
                                </div>
                            )}

                            <div className="border-t pt-4 space-y-3">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Rejection Reason</label>
                                    <select value={reason} onChange={e => setReason(e.target.value)} className="w-full px-3 py-2 rounded-lg border bg-slate-50 text-sm">
                                        <option value="">Select if rejecting...</option>
                                        {REJECTION_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Reviewer Notes</label>
                                    <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full px-3 py-2 rounded-lg border bg-slate-50 text-sm" rows={2} placeholder="Optional notes..." />
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    <button onClick={() => handleAction('approve')} disabled={acting} className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-1.5 text-sm">
                                        <CheckCircle className="w-4 h-4" /> Approve
                                    </button>
                                    <button onClick={() => handleAction('needs_revision')} disabled={acting} className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600 disabled:opacity-50 flex items-center justify-center gap-1.5 text-sm">
                                        <AlertTriangle className="w-4 h-4" /> Revise
                                    </button>
                                    <button onClick={() => handleAction('reject')} disabled={acting} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-1.5 text-sm">
                                        <XCircle className="w-4 h-4" /> Reject
                                    </button>
                                </div>
                                {selected.status === 'approved' && (
                                    <button onClick={handleGold} disabled={acting} className={`w-full py-2 rounded-xl border text-sm font-medium flex items-center justify-center gap-1.5 ${selected.is_gold ? 'bg-amber-50 text-amber-700 border-amber-200' : 'hover:bg-amber-50'}`}>
                                        <Star className="w-4 h-4" /> {selected.is_gold ? 'Remove Gold Tag' : 'Mark as Gold'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
