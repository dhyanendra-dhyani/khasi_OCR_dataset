'use client';

import { useAuth } from '@/contexts/auth-context';
import { createClient } from '@/lib/supabase/client';
import { DATASET_CATEGORIES, CAPTURE_TYPES, ALLOWED_FILE_TYPES, MAX_FILE_SIZE, MIN_IMAGE_WIDTH, MIN_IMAGE_HEIGHT } from '@/lib/constants';
import { computeFileHash, getImageDimensions, formatFileSize, getCategoryLabel, compressImage } from '@/lib/utils';
import { useState, useCallback, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Upload, CheckCircle, XCircle, Loader2, AlertTriangle, FileImage, Trash2, Camera, ArrowLeft, Zap } from 'lucide-react';
import Link from 'next/link';

type FileStatus = 'preparing' | 'compressing' | 'uploading' | 'done' | 'error';

interface UploadFile {
    id: string;
    file: File;
    compressedFile?: File;
    preview: string;
    hash: string;
    width: number;
    height: number;
    status: FileStatus;
    progress: number;
    error?: string;
    isDuplicate: boolean;
}

const DRAFT_KEY = 'khasi_upload_draft';

function saveDraft(category: string, captureType: string) {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ category, captureType, ts: Date.now() })); } catch { }
}

function loadDraft(): { category: string; captureType: string } | null {
    try {
        const raw = localStorage.getItem(DRAFT_KEY);
        if (!raw) return null;
        const d = JSON.parse(raw);
        // Expire drafts older than 1 hour
        if (Date.now() - d.ts > 3600000) { localStorage.removeItem(DRAFT_KEY); return null; }
        return d;
    } catch { return null; }
}

function clearDraft() {
    try { localStorage.removeItem(DRAFT_KEY); } catch { }
}

export default function UploadPage() {
    const { profile, canUpload } = useAuth();
    const [step, setStep] = useState(1);
    const [category, setCategory] = useState('');
    const [captureType, setCaptureType] = useState('');
    const [files, setFiles] = useState<UploadFile[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [uploadedCount, setUploadedCount] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Restore draft on mount
    useEffect(() => {
        const draft = loadDraft();
        if (draft) {
            setCategory(draft.category);
            setCaptureType(draft.captureType);
        }
    }, []);

    // Save draft on change
    useEffect(() => {
        if (category) saveDraft(category, captureType);
    }, [category, captureType]);

    const validFiles = files.filter(f => f.status !== 'error');
    const doneFiles = files.filter(f => f.status === 'done');
    const hasErrors = files.some(f => f.status === 'error');

    const handleFileAdd = useCallback(async (newFiles: FileList | File[]) => {
        const adds: UploadFile[] = [];
        for (const file of Array.from(newFiles)) {
            const id = uuidv4();
            if (!ALLOWED_FILE_TYPES.includes(file.type)) {
                adds.push({ id, file, preview: '', hash: '', width: 0, height: 0, status: 'error', progress: 0, error: `Unsupported type: ${file.type.split('/')[1]}`, isDuplicate: false });
                continue;
            }
            if (file.size > MAX_FILE_SIZE) {
                adds.push({ id, file, preview: '', hash: '', width: 0, height: 0, status: 'error', progress: 0, error: `Too large (${formatFileSize(file.size)})`, isDuplicate: false });
                continue;
            }
            adds.push({ id, file, preview: URL.createObjectURL(file), hash: '', width: 0, height: 0, status: 'preparing', progress: 0, isDuplicate: false });
        }
        setFiles(prev => [...prev, ...adds]);

        // Process each file async: hash, dimensions, compress
        for (const uf of adds) {
            if (uf.status === 'error') continue;
            try {
                const [hash, dims] = await Promise.all([computeFileHash(uf.file), getImageDimensions(uf.file)]);
                if (dims.width < MIN_IMAGE_WIDTH || dims.height < MIN_IMAGE_HEIGHT) {
                    setFiles(prev => prev.map(f => f.id === uf.id ? { ...f, status: 'error' as FileStatus, error: `Too small (${dims.width}×${dims.height})`, hash, width: dims.width, height: dims.height } : f));
                    continue;
                }
                // Check duplicate
                const isDup = files.some(f => f.hash === hash) || adds.filter(a => a.id !== uf.id).some(a => a.hash === hash);
                // Compress
                setFiles(prev => prev.map(f => f.id === uf.id ? { ...f, status: 'compressing' as FileStatus, progress: 30, hash, width: dims.width, height: dims.height, isDuplicate: isDup } : f));
                const compressed = await compressImage(uf.file);
                setFiles(prev => prev.map(f => f.id === uf.id ? { ...f, compressedFile: compressed, status: 'preparing' as FileStatus, progress: 50 } : f));
            } catch {
                setFiles(prev => prev.map(f => f.id === uf.id ? { ...f, status: 'error' as FileStatus, error: 'Failed to process file' } : f));
            }
        }
    }, [files]);

    const removeFile = (id: string) => { setFiles(prev => prev.filter(f => f.id !== id)); };

    const handleSubmit = async () => {
        if (!profile || !category || !captureType) return;
        setSubmitting(true);
        setSubmitError('');
        setUploadedCount(0);

        try {
            const supabase = createClient();
            const readyFiles = files.filter(f => f.status === 'preparing' || f.status === 'compressing');
            if (readyFiles.length === 0) { setSubmitError('No valid files to upload'); setSubmitting(false); return; }

            // Create batch
            const { data: batch, error: bErr } = await supabase.from('upload_batches').insert({
                contributor_id: profile.id,
                category,
                title: `Batch ${new Date().toISOString().slice(0, 10)}`,
                status: 'submitted',
                submitted_at: new Date().toISOString(),
            }).select().single();
            if (bErr) throw bErr;

            // Upload each file
            for (let i = 0; i < readyFiles.length; i++) {
                const uf = readyFiles[i];
                const uploadFile = uf.compressedFile || uf.file;

                // Upload to storage
                setFiles(prev => prev.map(f => f.id === uf.id ? { ...f, status: 'uploading' as FileStatus, progress: 60 } : f));
                const ext = uf.file.name.split('.').pop();
                const path = `${profile.id}/${batch.id}/${uf.id}.${ext}`;
                const { error: uErr } = await supabase.storage.from('raw-pages').upload(path, uploadFile, { contentType: uploadFile.type });
                if (uErr) {
                    setFiles(prev => prev.map(f => f.id === uf.id ? { ...f, status: 'error' as FileStatus, error: uErr.message } : f));
                    continue;
                }

                setFiles(prev => prev.map(f => f.id === uf.id ? { ...f, progress: 80 } : f));

                // Save page record with auto-captured metadata
                const { error: pErr } = await supabase.from('raw_pages').insert({
                    id: uf.id,
                    batch_id: batch.id,
                    contributor_id: profile.id,
                    category,
                    original_file_path: path,
                    original_filename: uf.file.name,
                    file_size: uploadFile.size,
                    file_hash: uf.hash,
                    mime_type: uploadFile.type,
                    width: uf.width,
                    height: uf.height,
                    status: 'submitted',
                });
                if (pErr) {
                    setFiles(prev => prev.map(f => f.id === uf.id ? { ...f, status: 'error' as FileStatus, error: pErr.message } : f));
                    continue;
                }

                // Save minimal metadata (capture type only - rest filled by reviewer)
                await supabase.from('raw_page_metadata').insert({
                    page_id: uf.id,
                    capture_type: captureType,
                    language_primary: 'Khasi',
                    source_type: category,
                    document_title: uf.file.name.replace(/\.[^/.]+$/, ''),
                    quality_level: 'medium',
                    consent_given: true,
                });

                setFiles(prev => prev.map(f => f.id === uf.id ? { ...f, status: 'done' as FileStatus, progress: 100 } : f));
                setUploadedCount(prev => prev + 1);
            }

            // Audit log
            await supabase.from('audit_logs').insert({
                user_id: profile.id,
                action: 'batch_upload',
                entity_type: 'upload_batch',
                entity_id: batch.id,
                details: { category, capture_type: captureType, page_count: readyFiles.length },
            });

            clearDraft();
            setSubmitSuccess(true);
        } catch (err: unknown) {
            setSubmitError(err instanceof Error ? err.message : 'Upload failed. Your draft is saved.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!canUpload) return (
        <div className="max-w-lg mx-auto mt-20 text-center"><div className="p-8 rounded-2xl bg-white border">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-amber-500" />
            <h2 className="text-xl font-bold mb-2">Upload Not Available</h2>
            <p className="text-slate-600 mb-4">{!profile?.onboarding_completed ? 'Complete your profile first.' : profile?.status === 'pending' ? 'Account pending approval.' : 'Account suspended.'}</p>
            {!profile?.onboarding_completed && <Link href="/dashboard/complete-profile" className="text-blue-600 font-medium hover:underline">Complete Profile</Link>}
        </div></div>
    );

    if (submitSuccess) return (
        <div className="max-w-lg mx-auto mt-20 text-center animate-fade-in"><div className="p-8 rounded-2xl bg-white border">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-emerald-500" />
            <h2 className="text-2xl font-bold mb-2">Uploaded! 🎉</h2>
            <p className="text-slate-600 mb-6">{uploadedCount} page(s) submitted for review.</p>
            <div className="flex gap-3 justify-center">
                <Link href="/dashboard" className="px-6 py-2.5 rounded-xl border font-medium hover:bg-slate-50">Dashboard</Link>
                <button onClick={() => { setStep(1); setCategory(''); setCaptureType(''); setFiles([]); setSubmitSuccess(false); setUploadedCount(0); }} className="px-6 py-2.5 rounded-xl gradient-primary text-white font-medium">Upload More</button>
            </div>
        </div></div>
    );

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            {/* Progress */}
            <div className="flex items-center justify-center gap-3 mb-8">
                {[1, 2].map(s => (
                    <div key={s} className="flex items-center gap-2">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold ${step === s ? 'gradient-primary text-white' : step > s ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                            {step > s ? <CheckCircle className="w-4 h-4" /> : s}
                        </div>
                        <span className={`text-sm ${step === s ? 'font-medium' : 'text-slate-400'}`}>
                            {['Category', 'Upload & Submit'][s - 1]}
                        </span>
                        {s < 2 && <div className={`w-12 h-0.5 ${step > s ? 'bg-emerald-300' : 'bg-slate-200'}`} />}
                    </div>
                ))}
            </div>

            {/* Step 1: Category Selection */}
            {step === 1 && (
                <div>
                    <h2 className="text-2xl font-bold mb-2">Select Document Category</h2>
                    <p className="text-slate-500 mb-6">What type of Khasi document are you uploading?</p>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {DATASET_CATEGORIES.map(c => (
                            <button key={c.value} onClick={() => { setCategory(c.value); setStep(2); }}
                                className={`p-5 rounded-xl border text-left card-hover transition-all ${category === c.value ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'hover:border-blue-300'}`}>
                                <div className="font-medium">{c.label}</div>
                                <div className="text-xs text-slate-500 mt-1.5">{c.description}</div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Step 2: Upload & Submit */}
            {step === 2 && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-2xl font-bold">Upload Images</h2>
                            <p className="text-slate-500 text-sm">Category: {getCategoryLabel(category)}</p>
                        </div>
                        <button onClick={() => setStep(1)} className="text-sm text-blue-600 hover:underline flex items-center gap-1"><ArrowLeft className="w-4 h-4" />Change</button>
                    </div>

                    {/* Capture Type */}
                    <div className="bg-white rounded-2xl border p-4 mb-4">
                        <label className="block text-sm font-medium mb-2">How did you capture these images? *</label>
                        <div className="flex flex-wrap gap-2">
                            {CAPTURE_TYPES.map(ct => (
                                <button key={ct.value} onClick={() => setCaptureType(ct.value)}
                                    className={`px-4 py-2 rounded-xl border text-sm transition-all ${captureType === ct.value ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium' : 'hover:border-blue-300'}`}>
                                    {ct.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quick Tips */}
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 mb-4 flex items-start gap-2">
                        <Camera className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-blue-700"><strong>Tips:</strong> Full page, good lighting, no shadows/fingers, one page per image.</span>
                    </div>

                    {/* Drop Zone */}
                    <div onDrop={e => { e.preventDefault(); if (e.dataTransfer.files.length) handleFileAdd(e.dataTransfer.files); }}
                        onDragOver={e => e.preventDefault()}
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all">
                        <Upload className="w-10 h-10 mx-auto mb-3 text-slate-400" />
                        <p className="font-medium">Drag & drop images here</p>
                        <p className="text-sm text-slate-400 mt-1">JPG, PNG, WebP · Max 20MB each</p>
                        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple
                            onChange={e => e.target.files && handleFileAdd(e.target.files)} className="hidden" />
                    </div>

                    {/* File List with Progress */}
                    {files.length > 0 && (
                        <div className="mt-4 space-y-2">
                            {files.map(uf => (
                                <div key={uf.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${uf.status === 'error' ? 'border-red-200 bg-red-50' : uf.status === 'done' ? 'border-emerald-200 bg-emerald-50' : uf.isDuplicate ? 'border-amber-200 bg-amber-50' : 'bg-white'}`}>
                                    {uf.preview ? <img src={uf.preview} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" /> : <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0"><FileImage className="w-5 h-5 text-slate-400" /></div>}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-medium truncate">{uf.file.name}</p>
                                            {uf.status === 'done' && <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
                                            {uf.status === 'error' && <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}
                                            {(uf.status === 'compressing' || uf.status === 'uploading') && <Loader2 className="w-4 h-4 text-blue-600 animate-spin flex-shrink-0" />}
                                        </div>
                                        <p className="text-xs text-slate-500">{formatFileSize(uf.compressedFile?.size || uf.file.size)}{uf.width > 0 && ` · ${uf.width}×${uf.height}`}</p>
                                        {uf.error && <p className="text-xs text-red-600">{uf.error}</p>}
                                        {uf.isDuplicate && <p className="text-xs text-amber-600">⚠ Possible duplicate</p>}
                                        {uf.status === 'compressing' && <p className="text-xs text-blue-600"><Zap className="w-3 h-3 inline" /> Compressing...</p>}
                                        {uf.status === 'uploading' && <p className="text-xs text-blue-600">Uploading...</p>}
                                        {/* Progress Bar */}
                                        {uf.status !== 'error' && uf.status !== 'preparing' && (
                                            <div className="mt-1.5 w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                                <div className={`h-full rounded-full transition-all duration-500 ${uf.status === 'done' ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                                    style={{ width: `${uf.progress}%` }} />
                                            </div>
                                        )}
                                    </div>
                                    <button onClick={() => removeFile(uf.id)} className="p-2 text-slate-400 hover:text-red-500 flex-shrink-0" disabled={uf.status === 'uploading'}>
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Submit */}
                    {submitError && <div className="p-3 rounded-xl bg-red-50 text-red-700 text-sm mt-4 flex items-start gap-2"><XCircle className="w-5 h-5 flex-shrink-0" />{submitError}</div>}

                    <div className="flex items-center justify-between mt-6">
                        <div className="text-sm text-slate-500">
                            {validFiles.length > 0 && `${validFiles.length} file(s) ready`}
                            {doneFiles.length > 0 && ` · ${doneFiles.length} uploaded`}
                            {hasErrors && ` · some errors`}
                        </div>
                        <button onClick={handleSubmit}
                            disabled={submitting || validFiles.length === 0 || !captureType}
                            className="px-8 py-3 rounded-xl gradient-primary text-white font-semibold disabled:opacity-50 flex items-center gap-2 transition-all hover:shadow-lg">
                            {submitting ? <><Loader2 className="w-5 h-5 animate-spin" />Uploading ({uploadedCount}/{validFiles.length})</> : <><Upload className="w-4 h-4" />Submit {validFiles.length > 0 ? `${validFiles.length} file(s)` : ''}</>}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
