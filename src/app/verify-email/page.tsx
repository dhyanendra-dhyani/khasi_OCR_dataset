'use client';

import Link from 'next/link';
import { Mail, ArrowLeft } from 'lucide-react';

export default function VerifyEmailPage() {
    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-50 to-blue-50">
            <div className="w-full max-w-md text-center">
                <div className="bg-white rounded-2xl shadow-xl border p-8 sm:p-10">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-6">
                        <Mail className="w-8 h-8 text-blue-600" />
                    </div>
                    <h1 className="text-2xl font-bold mb-3">Check Your Email</h1>
                    <p className="text-slate-600 mb-6 leading-relaxed">
                        We&apos;ve sent a verification link to your email address. Please click the link to verify your account before you can start uploading datasets.
                    </p>
                    <div className="p-4 rounded-xl bg-amber-50 text-amber-700 text-sm mb-6">
                        <strong>Note:</strong> Check your spam/junk folder if you don&apos;t see the email within a few minutes.
                    </div>
                    <Link href="/login" className="inline-flex items-center gap-2 text-blue-600 font-medium hover:underline">
                        <ArrowLeft className="w-4 h-4" /> Back to login
                    </Link>
                </div>
            </div>
        </div>
    );
}
