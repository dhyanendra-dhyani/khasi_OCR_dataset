'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileCompletionSchema, type ProfileCompletionInput } from '@/lib/validations';
import { createClient } from '@/lib/supabase/client';
import { DISTRICTS_MEGHALAYA } from '@/lib/constants';
import { useState, useEffect } from 'react';
import { Loader2, CheckCircle, User } from 'lucide-react';

export default function CompleteProfilePage() {
    const router = useRouter();
    const { profile, refreshProfile, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { register, handleSubmit, formState: { errors }, reset } = useForm<ProfileCompletionInput>({
        resolver: zodResolver(profileCompletionSchema as any),
    });

    useEffect(() => {
        if (profile) {
            if (profile.onboarding_completed) {
                router.push('/dashboard');
                return;
            }
            reset({
                full_name: profile.full_name || '',
                phone: profile.phone || '',
                institute: profile.institute || '',
                district: profile.district || '',
                state: profile.state || 'Meghalaya',
                preferred_language: profile.preferred_language || 'English',
            });
        }
    }, [profile, reset, router]);

    const onSubmit = async (data: ProfileCompletionInput) => {
        setLoading(true);
        setError('');
        try {
            const supabase = createClient();
            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    full_name: data.full_name,
                    phone: data.phone || null,
                    institute: data.institute,
                    district: data.district,
                    state: data.state,
                    preferred_language: data.preferred_language,
                    onboarding_completed: true,
                })
                .eq('id', profile!.id);
            if (updateError) throw updateError;
            await refreshProfile();
            router.push('/dashboard');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-50 to-blue-50">
            <div className="w-full max-w-lg">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                        <User className="w-8 h-8 text-blue-600" />
                    </div>
                    <h1 className="text-2xl font-bold">Complete Your Profile</h1>
                    <p className="text-slate-500 mt-1">Fill in your details to start contributing</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-xl border p-6 sm:p-8 space-y-5">
                    {error && <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>}

                    <div className="p-4 rounded-xl bg-blue-50 text-blue-700 text-sm flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                            <strong>Almost there!</strong> Complete your profile to start uploading Khasi documents. Your account will be reviewed by an admin before activation.
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5">Full Name *</label>
                        <input {...register('full_name')} className="w-full px-4 py-2.5 rounded-xl border bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all text-sm" />
                        {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5">Phone (optional)</label>
                        <input {...register('phone')} type="tel" className="w-full px-4 py-2.5 rounded-xl border bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all text-sm" placeholder="+91 XXXXX XXXXX" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5">College / Institute *</label>
                        <input {...register('institute')} className="w-full px-4 py-2.5 rounded-xl border bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all text-sm" />
                        {errors.institute && <p className="text-red-500 text-xs mt-1">{errors.institute.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5">District *</label>
                            <select {...register('district')} className="w-full px-4 py-2.5 rounded-xl border bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all text-sm">
                                <option value="">Select</option>
                                {DISTRICTS_MEGHALAYA.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                            {errors.district && <p className="text-red-500 text-xs mt-1">{errors.district.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5">State</label>
                            <input {...register('state')} className="w-full px-4 py-2.5 rounded-xl border bg-slate-50 text-sm" readOnly />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5">Preferred Language</label>
                        <select {...register('preferred_language')} className="w-full px-4 py-2.5 rounded-xl border bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all text-sm">
                            <option value="English">English</option>
                            <option value="Khasi">Khasi</option>
                        </select>
                    </div>

                    <button type="submit" disabled={loading} className="w-full py-3 rounded-xl text-white font-semibold gradient-primary hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Complete Profile & Continue'}
                    </button>
                </form>
            </div>
        </div>
    );
}
