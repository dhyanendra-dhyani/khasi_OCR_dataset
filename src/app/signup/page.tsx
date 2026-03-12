'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, type SignupInput } from '@/lib/validations';
import { createClient } from '@/lib/supabase/client';
import { DISTRICTS_MEGHALAYA } from '@/lib/constants';
import { useState } from 'react';
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';

export default function SignupPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { register, handleSubmit, formState: { errors } } = useForm<SignupInput>({
        resolver: zodResolver(signupSchema as any),
        defaultValues: { state: 'Meghalaya' },
    });

    const onSubmit = async (data: SignupInput) => {
        setLoading(true);
        setError('');
        try {
            const supabase = createClient();
            const { error: signUpError } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    data: {
                        full_name: data.full_name,
                        phone: data.phone || '',
                        institute: data.institute,
                        district: data.district,
                        state: data.state,
                    },
                    emailRedirectTo: `${window.location.origin}/verify-email`,
                },
            });
            if (signUpError) throw signUpError;

            // Update profile with extra fields
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase.from('profiles').update({
                    full_name: data.full_name,
                    phone: data.phone || null,
                    institute: data.institute,
                    district: data.district,
                    state: data.state,
                }).eq('id', user.id);
            }

            router.push('/verify-email');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'An error occurred during signup';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-50 to-blue-50">
            <div className="w-full max-w-lg">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 mb-6">
                        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                            <span className="text-white font-bold text-xl">K</span>
                        </div>
                        <span className="font-bold text-xl">Khasi OCR</span>
                    </Link>
                    <h1 className="text-2xl font-bold">Create Your Account</h1>
                    <p className="text-slate-500 mt-1">Join as a contributor to the Khasi OCR dataset</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-xl border p-6 sm:p-8 space-y-5">
                    {error && (
                        <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
                    )}

                    <div>
                        <label className="block text-sm font-medium mb-1.5">Full Name *</label>
                        <input {...register('full_name')} className="w-full px-4 py-2.5 rounded-xl border bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm" placeholder="Enter your full name" />
                        {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5">Email Address *</label>
                        <input {...register('email')} type="email" className="w-full px-4 py-2.5 rounded-xl border bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm" placeholder="your.email@example.com" />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Password *</label>
                            <div className="relative">
                                <input {...register('password')} type={showPassword ? 'text' : 'password'} className="w-full px-4 py-2.5 rounded-xl border bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm pr-10" placeholder="Min 8 chars" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Confirm Password *</label>
                            <input {...register('confirm_password')} type="password" className="w-full px-4 py-2.5 rounded-xl border bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm" placeholder="Re-enter" />
                            {errors.confirm_password && <p className="text-red-500 text-xs mt-1">{errors.confirm_password.message}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5">Phone (optional)</label>
                        <input {...register('phone')} type="tel" className="w-full px-4 py-2.5 rounded-xl border bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm" placeholder="+91 XXXXX XXXXX" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5">College / Institute *</label>
                        <input {...register('institute')} className="w-full px-4 py-2.5 rounded-xl border bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm" placeholder="Your college or organization" />
                        {errors.institute && <p className="text-red-500 text-xs mt-1">{errors.institute.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5">District *</label>
                            <select {...register('district')} className="w-full px-4 py-2.5 rounded-xl border bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm">
                                <option value="">Select district</option>
                                {DISTRICTS_MEGHALAYA.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                            {errors.district && <p className="text-red-500 text-xs mt-1">{errors.district.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5">State</label>
                            <input {...register('state')} className="w-full px-4 py-2.5 rounded-xl border bg-slate-50 transition-all text-sm" readOnly />
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="w-full py-3 rounded-xl text-white font-semibold gradient-primary hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Create Account</span><ArrowRight className="w-4 h-4" /></>}
                    </button>

                    <p className="text-center text-sm text-slate-500">
                        Already have an account?{' '}
                        <Link href="/login" className="text-blue-600 font-medium hover:underline">Log in</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
