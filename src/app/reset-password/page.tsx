'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/validations';
import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';
import { Loader2, CheckCircle, Eye, EyeOff } from 'lucide-react';

export default function ResetPasswordPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordInput>({
        resolver: zodResolver(resetPasswordSchema),
    });

    const onSubmit = async (data: ResetPasswordInput) => {
        setLoading(true);
        setError('');
        try {
            const supabase = createClient();
            const { error: updateError } = await supabase.auth.updateUser({ password: data.password });
            if (updateError) throw updateError;
            setSuccess(true);
            setTimeout(() => router.push('/login'), 2000);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="text-center bg-white rounded-2xl shadow-xl border p-8 max-w-md">
                    <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold mb-3">Password Updated!</h1>
                    <p className="text-slate-600">Redirecting to login...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-50 to-blue-50">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold">Set New Password</h1>
                    <p className="text-slate-500 mt-1">Choose a strong new password</p>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-xl border p-6 sm:p-8 space-y-5">
                    {error && <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>}
                    <div>
                        <label className="block text-sm font-medium mb-1.5">New Password</label>
                        <div className="relative">
                            <input {...register('password')} type={showPassword ? 'text' : 'password'} className="w-full px-4 py-2.5 rounded-xl border bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all text-sm pr-10" placeholder="Min 8 chars, uppercase, lowercase, number" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5">Confirm New Password</label>
                        <input {...register('confirm_password')} type="password" className="w-full px-4 py-2.5 rounded-xl border bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all text-sm" placeholder="Re-enter password" />
                        {errors.confirm_password && <p className="text-red-500 text-xs mt-1">{errors.confirm_password.message}</p>}
                    </div>
                    <button type="submit" disabled={loading} className="w-full py-3 rounded-xl text-white font-semibold gradient-primary hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Password'}
                    </button>
                    <p className="text-center">
                        <Link href="/login" className="text-sm text-blue-600 font-medium hover:underline">Back to login</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
