'use client';

import { useAuth } from '@/contexts/auth-context';
import { createClient } from '@/lib/supabase/client';
import { DISTRICTS_MEGHALAYA } from '@/lib/constants';
import { useState } from 'react';
import { Loader2, Save, User } from 'lucide-react';

export default function ProfilePage() {
    const { profile, refreshProfile } = useAuth();
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [form, setForm] = useState({
        full_name: profile?.full_name || '',
        phone: profile?.phone || '',
        institute: profile?.institute || '',
        district: profile?.district || '',
        state: profile?.state || 'Meghalaya',
    });

    const handleSave = async () => {
        setSaving(true); setSuccess(false);
        try {
            const supabase = createClient();
            await supabase.from('profiles').update(form).eq('id', profile!.id);
            await refreshProfile();
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) { console.error(err); alert('Failed to save'); }
        setSaving(false);
    };

    if (!profile) return null;

    return (
        <div className="max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">My Profile</h1>
            <div className="bg-white rounded-2xl border p-6 space-y-5">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-white text-2xl font-bold">{profile.full_name[0]}</div>
                    <div>
                        <p className="font-semibold text-lg">{profile.full_name}</p>
                        <p className="text-sm text-slate-500">{profile.email}</p>
                        <div className="flex gap-2 mt-1">
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 capitalize">{profile.role}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${profile.status === 'active' ? 'bg-emerald-100 text-emerald-700' : profile.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>{profile.status}</span>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Full Name</label>
                    <input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} className="w-full px-3 py-2 rounded-xl border bg-slate-50 text-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 rounded-xl border bg-slate-50 text-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Institute</label>
                    <input value={form.institute} onChange={e => setForm({ ...form, institute: e.target.value })} className="w-full px-3 py-2 rounded-xl border bg-slate-50 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">District</label>
                        <select value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} className="w-full px-3 py-2 rounded-xl border bg-slate-50 text-sm">
                            <option value="">Select</option>
                            {DISTRICTS_MEGHALAYA.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">State</label>
                        <input value={form.state} readOnly className="w-full px-3 py-2 rounded-xl border bg-slate-50 text-sm" />
                    </div>
                </div>

                <button onClick={handleSave} disabled={saving} className="w-full py-2.5 rounded-xl gradient-primary text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : success ? <><Save className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Changes</>}
                </button>
            </div>
        </div>
    );
}
