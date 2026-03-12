'use client';

import { useAuth } from '@/contexts/auth-context';
import { createClient } from '@/lib/supabase/client';
import { formatDateTime, getCategoryLabel } from '@/lib/utils';
import { useState } from 'react';
import { Download, Loader2, CheckCircle, FileText, Database } from 'lucide-react';
import Papa from 'papaparse';

const exportTypes = [
    { id: 'all_pages', label: 'All Pages Manifest', desc: 'CSV of all raw pages with metadata' },
    { id: 'approved_pages', label: 'Approved Pages', desc: 'Only approved pages ready for OCR training' },
    { id: 'gold_pages', label: 'Gold / Evaluation Dataset', desc: 'Only gold-tagged pages' },
    { id: 'metadata_json', label: 'Full Metadata JSON', desc: 'Complete metadata export' },
    { id: 'contributor_stats', label: 'Contributor Stats', desc: 'Per-contributor upload and approval stats' },
];

export default function ExportsPage() {
    const { isAdmin, profile } = useAuth();
    const [exporting, setExporting] = useState('');
    const [done, setDone] = useState('');

    const doExport = async (type: string) => {
        if (!profile) return;
        setExporting(type); setDone('');
        try {
            const supabase = createClient();
            // Log export
            await supabase.from('export_jobs').insert({ requested_by: profile.id, export_type: type, status: 'processing' });

            if (type === 'all_pages' || type === 'approved_pages' || type === 'gold_pages') {
                let q = supabase.from('raw_pages').select('id, category, original_filename, file_size, file_hash, width, height, status, is_gold, created_at, raw_page_metadata(document_title, source_type, capture_type, quality_level, district, blur_present, shadow_present, skew_present)');
                if (type === 'approved_pages') q = q.eq('status', 'approved');
                if (type === 'gold_pages') q = q.eq('is_gold', true);
                const { data } = await q;
                const rows = (data || []).map((p: Record<string, unknown>) => {
                    const meta = (p.raw_page_metadata as Record<string, unknown>[])?.[0] || {};
                    return { id: p.id, category: p.category, filename: p.original_filename, size: p.file_size, hash: p.file_hash, width: p.width, height: p.height, status: p.status, is_gold: p.is_gold, created_at: p.created_at, title: meta.document_title, source: meta.source_type, capture: meta.capture_type, quality: meta.quality_level, district: meta.district, blur: meta.blur_present, shadow: meta.shadow_present, skew: meta.skew_present };
                });
                const csv = Papa.unparse(rows);
                downloadFile(csv, `${type}_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv');
            } else if (type === 'metadata_json') {
                const { data } = await supabase.from('raw_page_metadata').select('*');
                downloadFile(JSON.stringify(data, null, 2), `metadata_${new Date().toISOString().slice(0, 10)}.json`, 'application/json');
            } else if (type === 'contributor_stats') {
                const { data: pages } = await supabase.from('raw_pages').select('contributor_id, status');
                const { data: profiles } = await supabase.from('profiles').select('id, full_name, email, district, institute');
                const statsMap: Record<string, Record<string, number>> = {};
                (pages || []).forEach((p: Record<string, unknown>) => {
                    const cid = p.contributor_id as string;
                    if (!statsMap[cid]) statsMap[cid] = { total: 0, approved: 0, rejected: 0 };
                    statsMap[cid].total++;
                    if (p.status === 'approved') statsMap[cid].approved++;
                    if (p.status === 'rejected') statsMap[cid].rejected++;
                });
                const rows = (profiles || []).map((p: Record<string, unknown>) => ({ id: p.id, name: p.full_name, email: p.email, district: p.district, institute: p.institute, total: statsMap[p.id as string]?.total || 0, approved: statsMap[p.id as string]?.approved || 0, rejected: statsMap[p.id as string]?.rejected || 0 }));
                const csv = Papa.unparse(rows);
                downloadFile(csv, `contributor_stats_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv');
            }

            await supabase.from('export_jobs').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('requested_by', profile.id).eq('export_type', type).eq('status', 'processing');
            setDone(type);
        } catch (err) { console.error(err); alert('Export failed'); }
        setExporting('');
    };

    const downloadFile = (content: string, name: string, type: string) => {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = name; a.click();
        URL.revokeObjectURL(url);
    };

    if (!isAdmin) return <div className="text-center py-20 text-slate-500">Admin access required.</div>;

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Export Datasets</h1>
            <div className="space-y-4">
                {exportTypes.map(et => (
                    <div key={et.id} className="bg-white rounded-2xl border p-6 flex items-center justify-between card-hover">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                                {et.id.includes('json') ? <FileText className="w-6 h-6 text-blue-600" /> : <Database className="w-6 h-6 text-blue-600" />}
                            </div>
                            <div>
                                <h3 className="font-semibold">{et.label}</h3>
                                <p className="text-sm text-slate-500">{et.desc}</p>
                            </div>
                        </div>
                        <button onClick={() => doExport(et.id)} disabled={!!exporting} className={`px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${done === et.id ? 'bg-emerald-100 text-emerald-700' : 'gradient-primary text-white hover:opacity-90'} disabled:opacity-50`}>
                            {exporting === et.id ? <><Loader2 className="w-4 h-4 animate-spin" />Exporting...</> : done === et.id ? <><CheckCircle className="w-4 h-4" />Done</> : <><Download className="w-4 h-4" />Export</>}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
