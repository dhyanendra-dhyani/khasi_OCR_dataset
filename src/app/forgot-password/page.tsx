'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/validations';
import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';
import { ArrowLeft, Loader2, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordInput>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data: ForgotPasswordInput) => {
        setLoading(true);
        setError('');
        try {
            const supabase = createClient();
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(data.email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });
            if (resetError) throw resetError;
            setSent(true);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="w-full max-w-md text-center bg-white rounded-2xl shadow-xl border p-8">
                    <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold mb-3">Reset Link Sent</h1>
                    <p className="text-slate-600 mb-6">Check your email for a password reset link.</p>
                    <Link href="/login" className="inline-flex items-center gap-2 text-blue-600 font-medium hover:underline">
                        <ArrowLeft className="w-4 h-4" /> Back to login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-50 to-blue-50">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold">Reset Password</h1>
                    <p className="text-slate-500 mt-1">Enter your email to get a reset link</p>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-xl border p-6 sm:p-8 space-y-5">
                    {error && <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>}
                    <div>
                        <label className="block text-sm font-medium mb-1.5">Email Address</label>
                        <input {...register('email')} type="email" className="w-full px-4 py-2.5 rounded-xl border bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all text-sm" placeholder="your.email@example.com" />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                    </div>
                    <button type="submit" disabled={loading} className="w-full py-3 rounded-xl text-white font-semibold gradient-primary hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset Link'}
                    </button>
                    <p className="text-center">
                        <Link href="/login" className="text-sm text-blue-600 font-medium hover:underline">Back to login</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
