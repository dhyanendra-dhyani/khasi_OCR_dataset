'use client';

import { useAuth } from '@/contexts/auth-context';
import { createClient } from '@/lib/supabase/client';
import { DATASET_CATEGORIES, SOURCE_TYPES, CAPTURE_TYPES, QUALITY_LEVELS, DISTRICTS_MEGHALAYA, ALLOWED_FILE_TYPES, MAX_FILE_SIZE, MIN_IMAGE_WIDTH, MIN_IMAGE_HEIGHT } from '@/lib/constants';
import { metadataSchema, type MetadataInput } from '@/lib/validations';
import { computeFileHash, getImageDimensions, formatFileSize, getCategoryLabel } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { Upload, ArrowLeft, ArrowRight, CheckCircle, XCircle, Loader2, AlertTriangle, FileImage, Trash2, Camera, Info } from 'lucide-react';
import Link from 'next/link';

interface UploadedFile {
    id: string; file: File; preview: string; hash: string; width: number; height: number;
    status: 'pending' | 'error'; error?: string; isDuplicate: boolean;
}

export default function UploadPage() {
    const router = useRouter();
    const { profile, canUpload } = useAuth();
    const [step, setStep] = useState(1);
    const [category, setCategory] = useState('');
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [metadataMap, setMetadataMap] = useState<Record<string, MetadataInput>>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const form = useForm<MetadataInput>({
        resolver: zodResolver(metadataSchema as any),
        defaultValues: { language_primary: 'Khasi', blur_present: false, shadow_present: false, skew_present: false, low_contrast: false, faded_text: false, multi_column: false, contains_tables: false, contains_stamps: false, contains_sensitive_info: false },
    });

    const validFiles = files.filter(f => f.status !== 'error');

    const handleFileAdd = useCallback(async (newFiles: FileList | File[]) => {
        const adds: UploadedFile[] = [];
        for (const file of Array.from(newFiles)) {
            if (!ALLOWED_FILE_TYPES.includes(file.type)) { adds.push({ id: uuidv4(), file, preview: '', hash: '', width: 0, height: 0, status: 'error', error: 'Unsupported file type', isDuplicate: false }); continue; }
            if (file.size > MAX_FILE_SIZE) { adds.push({ id: uuidv4(), file, preview: '', hash: '', width: 0, height: 0, status: 'error', error: `Too large (${formatFileSize(file.size)})`, isDuplicate: false }); continue; }
            try {
                const [hash, dims] = await Promise.all([computeFileHash(file), getImageDimensions(file)]);
                let error: string | undefined;
                if (dims.width < MIN_IMAGE_WIDTH || dims.height < MIN_IMAGE_HEIGHT) error = `Too small (${dims.width}×${dims.height})`;
                const isDuplicate = files.some(f => f.hash === hash) || adds.some(f => f.hash === hash);
                adds.push({ id: uuidv4(), file, preview: URL.createObjectURL(file), hash, width: dims.width, height: dims.height, status: error ? 'error' : 'pending', error, isDuplicate });
            } catch { adds.push({ id: uuidv4(), file, preview: '', hash: '', width: 0, height: 0, status: 'error', error: 'Failed to read file', isDuplicate: false }); }
        }
        setFiles(prev => [...prev, ...adds]);
    }, [files]);

    const removeFile = (id: string) => { setFiles(prev => prev.filter(f => f.id !== id)); const m = { ...metadataMap }; delete m[id]; setMetadataMap(m); };

    const saveMetadata = (data: MetadataInput) => {
        const vf = validFiles;
        setMetadataMap(prev => ({ ...prev, [vf[currentIdx].id]: data }));
        if (currentIdx < vf.length - 1) { setCurrentIdx(prev => prev + 1); form.reset({ language_primary: 'Khasi', blur_present: false, shadow_present: false, skew_present: false, low_contrast: false, faded_text: false, multi_column: false, contains_tables: false, contains_stamps: false, contains_sensitive_info: false }); }
        else setStep(4);
    };

    const handleFinalSubmit = async () => {
        if (!profile) return; setSubmitting(true); setSubmitError('');
        try {
            const supabase = createClient();
            const { data: batch, error: bErr } = await supabase.from('upload_batches').insert({ contributor_id: profile.id, category, title: `Batch ${new Date().toISOString().slice(0, 10)}`, status: 'submitted', submitted_at: new Date().toISOString() }).select().single();
            if (bErr) throw bErr;
            for (const uf of validFiles) {
                const meta = metadataMap[uf.id]; if (!meta) continue;
                const ext = uf.file.name.split('.').pop();
                const path = `${profile.id}/${batch.id}/${uf.id}.${ext}`;
                const { error: uErr } = await supabase.storage.from('raw-pages').upload(path, uf.file, { contentType: uf.file.type });
                if (uErr) throw uErr;
                const { data: page, error: pErr } = await supabase.from('raw_pages').insert({ id: uf.id, batch_id: batch.id, contributor_id: profile.id, category, original_file_path: path, original_filename: uf.file.name, file_size: uf.file.size, file_hash: uf.hash, mime_type: uf.file.type, width: uf.width, height: uf.height, status: 'submitted' }).select().single();
                if (pErr) throw pErr;
                const { error: mErr } = await supabase.from('raw_page_metadata').insert({ page_id: page.id, ...meta, document_year: meta.document_year || null, district: meta.district || null, source_institution: meta.source_institution || null, contributor_notes: meta.contributor_notes || null });
                if (mErr) throw mErr;
            }
            await supabase.from('audit_logs').insert({ user_id: profile.id, action: 'batch_upload', entity_type: 'upload_batch', entity_id: batch.id, details: { category, page_count: validFiles.length } });
            setSubmitSuccess(true);
        } catch (err: unknown) { setSubmitError(err instanceof Error ? err.message : 'Upload failed'); } finally { setSubmitting(false); }
    };

    if (!canUpload) return (
        <div className="max-w-lg mx-auto mt-20 text-center"><div className="p-8 rounded-2xl bg-white border"><AlertTriangle className="w-12 h-12 mx-auto mb-4 text-amber-500" /><h2 className="text-xl font-bold mb-2">Upload Not Available</h2><p className="text-slate-600 mb-4">{!profile?.onboarding_completed ? 'Complete your profile first.' : profile?.status === 'pending' ? 'Account pending approval.' : 'Account suspended.'}</p>{!profile?.onboarding_completed && <Link href="/dashboard/complete-profile" className="text-blue-600 font-medium hover:underline">Complete Profile</Link>}</div></div>
    );

    if (submitSuccess) return (
        <div className="max-w-lg mx-auto mt-20 text-center animate-fade-in"><div className="p-8 rounded-2xl bg-white border"><CheckCircle className="w-16 h-16 mx-auto mb-4 text-emerald-500" /><h2 className="text-2xl font-bold mb-2">Upload Submitted! 🎉</h2><p className="text-slate-600 mb-6">{validFiles.length} page(s) submitted for review.</p><div className="flex gap-3 justify-center"><Link href="/dashboard" className="px-6 py-2.5 rounded-xl border font-medium hover:bg-slate-50">Dashboard</Link><button onClick={() => { setStep(1); setCategory(''); setFiles([]); setMetadataMap({}); setCurrentIdx(0); setSubmitSuccess(false); }} className="px-6 py-2.5 rounded-xl gradient-primary text-white font-medium">Upload More</button></div></div></div>
    );

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            {/* Progress */}
            <div className="flex items-center justify-center gap-2 mb-8">
                {[1, 2, 3, 4].map(s => (<div key={s} className="flex items-center gap-2"><div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step === s ? 'gradient-primary text-white' : step > s ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>{step > s ? <CheckCircle className="w-4 h-4" /> : s}</div><span className={`hidden sm:block text-sm ${step === s ? 'font-medium' : 'text-slate-400'}`}>{['Category', 'Upload', 'Metadata', 'Review'][s - 1]}</span>{s < 4 && <div className={`w-8 h-0.5 ${step > s ? 'bg-emerald-300' : 'bg-slate-200'}`} />}</div>))}
            </div>

            {/* Step 1 */}
            {step === 1 && (<div><h2 className="text-2xl font-bold mb-2">Select Document Category</h2><p className="text-slate-500 mb-6">What type of Khasi document?</p><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">{DATASET_CATEGORIES.map(c => (<button key={c.value} onClick={() => { setCategory(c.value); setStep(2) }} className={`p-4 rounded-xl border text-left card-hover ${category === c.value ? 'border-blue-500 bg-blue-50' : ''}`}><div className="font-medium text-sm">{c.label}</div><div className="text-xs text-slate-500 mt-1">{c.description}</div></button>))}</div></div>)}

            {/* Step 2 */}
            {step === 2 && (<div><div className="flex items-center justify-between mb-6"><div><h2 className="text-2xl font-bold">Upload Images</h2><p className="text-slate-500 text-sm">Category: {getCategoryLabel(category)}</p></div><button onClick={() => setStep(1)} className="text-sm text-blue-600 hover:underline flex items-center gap-1"><ArrowLeft className="w-4 h-4" />Change</button></div>
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 mb-6 flex items-start gap-2"><Camera className="w-5 h-5 text-blue-600 mt-0.5" /><span className="text-sm text-blue-700"><strong>Tips:</strong> Full page, good lighting, no shadows/fingers, one page per image.</span></div>
                <div onDrop={e => { e.preventDefault(); if (e.dataTransfer.files.length) handleFileAdd(e.dataTransfer.files) }} onDragOver={e => e.preventDefault()} onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all"><Upload className="w-10 h-10 mx-auto mb-3 text-slate-400" /><p className="font-medium">Drag & drop images here</p><p className="text-sm text-slate-400 mt-1">JPG, PNG, WebP · Max 20MB</p><input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={e => e.target.files && handleFileAdd(e.target.files)} className="hidden" /></div>
                {files.length > 0 && <div className="mt-6 space-y-2">{files.map(uf => (<div key={uf.id} className={`flex items-center gap-3 p-3 rounded-xl border ${uf.status === 'error' ? 'border-red-200 bg-red-50' : uf.isDuplicate ? 'border-amber-200 bg-amber-50' : 'bg-white'}`}>{uf.preview ? <img src={uf.preview} alt="" className="w-12 h-12 rounded-lg object-cover" /> : <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center"><FileImage className="w-5 h-5 text-slate-400" /></div>}<div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{uf.file.name}</p><p className="text-xs text-slate-500">{formatFileSize(uf.file.size)}{uf.width > 0 && ` · ${uf.width}×${uf.height}`}</p>{uf.error && <p className="text-xs text-red-600">{uf.error}</p>}{uf.isDuplicate && <p className="text-xs text-amber-600">⚠ Possible duplicate</p>}</div><button onClick={() => removeFile(uf.id)} className="p-2 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button></div>))}</div>}
                <div className="flex justify-end mt-6"><button onClick={() => { setCurrentIdx(0); setStep(3) }} disabled={validFiles.length === 0} className="px-6 py-2.5 rounded-xl gradient-primary text-white font-medium disabled:opacity-50 flex items-center gap-2">Next: Metadata <ArrowRight className="w-4 h-4" /></button></div>
            </div>)}

            {/* Step 3 */}
            {step === 3 && validFiles[currentIdx] && (<div><div className="flex items-center justify-between mb-6"><div><h2 className="text-xl font-bold">Metadata ({currentIdx + 1}/{validFiles.length})</h2><p className="text-slate-500 text-sm">{validFiles[currentIdx].file.name}</p></div><button onClick={() => setStep(2)} className="text-sm text-blue-600 hover:underline flex items-center gap-1"><ArrowLeft className="w-4 h-4" />Back</button></div>
                <div className="grid lg:grid-cols-5 gap-6">
                    <div className="lg:col-span-2"><div className="sticky top-24 bg-white rounded-2xl border p-4"><img src={validFiles[currentIdx].preview} alt="" className="w-full rounded-xl object-contain max-h-80" /></div></div>
                    <div className="lg:col-span-3"><form onSubmit={form.handleSubmit(saveMetadata)} className="bg-white rounded-2xl border p-6 space-y-4">
                        <div><label className="block text-sm font-medium mb-1">Title *</label><input {...form.register('document_title')} className="w-full px-3 py-2 rounded-xl border bg-slate-50 focus:ring-2 focus:ring-blue-500 text-sm" placeholder="e.g. Textbook Ch3 Page 15" />{form.formState.errors.document_title && <p className="text-red-500 text-xs mt-1">{form.formState.errors.document_title.message}</p>}</div>
                        <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium mb-1">Source *</label><select {...form.register('source_type')} className="w-full px-3 py-2 rounded-xl border bg-slate-50 text-sm"><option value="">Select</option>{SOURCE_TYPES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}</select>{form.formState.errors.source_type && <p className="text-red-500 text-xs mt-1">{form.formState.errors.source_type.message}</p>}</div><div><label className="block text-sm font-medium mb-1">Capture *</label><select {...form.register('capture_type')} className="w-full px-3 py-2 rounded-xl border bg-slate-50 text-sm"><option value="">Select</option>{CAPTURE_TYPES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</select>{form.formState.errors.capture_type && <p className="text-red-500 text-xs mt-1">{form.formState.errors.capture_type.message}</p>}</div></div>
                        <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium mb-1">Quality *</label><select {...form.register('quality_level')} className="w-full px-3 py-2 rounded-xl border bg-slate-50 text-sm"><option value="">Select</option>{QUALITY_LEVELS.map(q => <option key={q.value} value={q.value}>{q.label}</option>)}</select>{form.formState.errors.quality_level && <p className="text-red-500 text-xs mt-1">{form.formState.errors.quality_level.message}</p>}</div><div><label className="block text-sm font-medium mb-1">District</label><select {...form.register('district')} className="w-full px-3 py-2 rounded-xl border bg-slate-50 text-sm"><option value="">Select</option>{DISTRICTS_MEGHALAYA.map(d => <option key={d} value={d}>{d}</option>)}</select></div></div>
                        <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium mb-1">Institution</label><input {...form.register('source_institution')} className="w-full px-3 py-2 rounded-xl border bg-slate-50 text-sm" placeholder="Optional" /></div><div><label className="block text-sm font-medium mb-1">Year</label><input {...form.register('document_year', { valueAsNumber: true })} type="number" className="w-full px-3 py-2 rounded-xl border bg-slate-50 text-sm" placeholder="Optional" /></div></div>
                        <div><label className="block text-sm font-medium mb-2">Quality Flags</label><div className="grid grid-cols-3 gap-1">{([['blur_present', 'Blur'], ['shadow_present', 'Shadow'], ['skew_present', 'Skew'], ['low_contrast', 'Low contrast'], ['faded_text', 'Faded'], ['multi_column', 'Multi-col'], ['contains_tables', 'Tables'], ['contains_stamps', 'Stamps'], ['contains_sensitive_info', 'Sensitive']] as const).map(([n, l]) => <label key={n} className="flex items-center gap-1.5 text-xs p-1.5 rounded hover:bg-slate-50 cursor-pointer"><input type="checkbox" {...form.register(n)} className="w-3.5 h-3.5 rounded" />{l}</label>)}</div></div>
                        <div><label className="block text-sm font-medium mb-1">Notes</label><textarea {...form.register('contributor_notes')} className="w-full px-3 py-2 rounded-xl border bg-slate-50 text-sm" rows={2} /></div>
                        <div className="p-3 rounded-xl bg-amber-50 border border-amber-100"><label className="flex items-start gap-2 cursor-pointer"><input type="checkbox" {...form.register('consent_given')} className="w-4 h-4 mt-0.5 rounded" /><span className="text-sm text-amber-800">I confirm the right to share this document for research/OCR training. *</span></label>{form.formState.errors.consent_given && <p className="text-red-500 text-xs mt-1">{form.formState.errors.consent_given.message}</p>}</div>
                        <div className="flex justify-between pt-2"><span className="text-sm text-slate-500">Page {currentIdx + 1}/{validFiles.length}</span><button type="submit" className="px-6 py-2.5 rounded-xl gradient-primary text-white font-medium flex items-center gap-2">{currentIdx < validFiles.length - 1 ? <>Save & Next <ArrowRight className="w-4 h-4" /></> : <>Save & Review <CheckCircle className="w-4 h-4" /></>}</button></div>
                    </form></div>
                </div>
            </div>)}

            {/* Step 4 */}
            {step === 4 && (<div><h2 className="text-2xl font-bold mb-2">Review & Submit</h2>
                {submitError && <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm mb-4 flex items-start gap-2"><XCircle className="w-5 h-5" />{submitError}</div>}
                <div className="bg-white rounded-2xl border p-6 mb-6"><div className="flex items-center gap-3 mb-4"><Info className="w-5 h-5 text-blue-600" /><div><p className="font-medium">Category: {getCategoryLabel(category)}</p><p className="text-sm text-slate-500">{validFiles.length} pages ready</p></div></div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">{validFiles.map((uf, i) => (<div key={uf.id} className="relative rounded-xl border overflow-hidden group"><img src={uf.preview} alt="" className="w-full aspect-[3/4] object-cover" /><div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center"><button onClick={() => { setCurrentIdx(i); setStep(3) }} className="opacity-0 group-hover:opacity-100 text-white text-xs bg-white/20 px-2 py-1 rounded-lg backdrop-blur-sm">Edit</button></div><div className="p-1.5"><p className="text-xs truncate">{metadataMap[uf.id]?.document_title || 'Untitled'}</p></div>{!metadataMap[uf.id] && <div className="absolute top-1 right-1 bg-red-500 text-white text-[10px] px-1 rounded">No meta</div>}</div>))}</div></div>
                <div className="flex justify-between"><button onClick={() => setStep(3)} className="px-5 py-2.5 rounded-xl border font-medium hover:bg-slate-50 flex items-center gap-2"><ArrowLeft className="w-4 h-4" />Edit</button><button onClick={handleFinalSubmit} disabled={submitting || validFiles.some(f => !metadataMap[f.id])} className="px-8 py-3 rounded-xl gradient-primary text-white font-semibold disabled:opacity-50 flex items-center gap-2">{submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Upload className="w-4 h-4" />Submit</>}</button></div>
            </div>)}
        </div>
    );
}
