'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@/lib/validations';
import { createClient } from '@/lib/supabase/client';
import { useState, Suspense } from 'react';
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || '/dashboard';
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginInput) => {
        setLoading(true);
        setError('');
        try {
            const supabase = createClient();
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
            });
            if (signInError) throw signInError;
            router.push(redirect);
            router.refresh();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Invalid email or password';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-50 to-blue-50">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 mb-6">
                        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                            <span className="text-white font-bold text-xl">K</span>
                        </div>
                        <span className="font-bold text-xl">Khasi OCR</span>
                    </Link>
                    <h1 className="text-2xl font-bold">Welcome Back</h1>
                    <p className="text-slate-500 mt-1">Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-xl border p-6 sm:p-8 space-y-5">
                    {error && (
                        <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
                    )}

                    <div>
                        <label className="block text-sm font-medium mb-1.5">Email Address</label>
                        <input {...register('email')} type="email" className="w-full px-4 py-2.5 rounded-xl border bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm" placeholder="your.email@example.com" autoComplete="email" />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-sm font-medium">Password</label>
                            <Link href="/forgot-password" className="text-xs text-blue-600 hover:underline">Forgot password?</Link>
                        </div>
                        <div className="relative">
                            <input {...register('password')} type={showPassword ? 'text' : 'password'} className="w-full px-4 py-2.5 rounded-xl border bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm pr-10" placeholder="Enter your password" autoComplete="current-password" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                    </div>

                    <button type="submit" disabled={loading} className="w-full py-3 rounded-xl text-white font-semibold gradient-primary hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>}
                    </button>

                    <p className="text-center text-sm text-slate-500">
                        Don&apos;t have an account?{' '}
                        <Link href="/signup" className="text-blue-600 font-medium hover:underline">Sign up</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>}>
            <LoginForm />
        </Suspense>
    );
}
