'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Menu, X, Bell, User, LogOut } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
    const { user, profile, signOut, isAdmin } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    return (
        <nav className="sticky top-0 z-50 glass border-b border-white/10 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
                            <span className="text-white font-bold text-lg">K</span>
                        </div>
                        <span className="font-bold text-lg hidden sm:block">Khasi OCR</span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-6">
                        {!user ? (
                            <>
                                <Link href="/#about" className="text-sm text-slate-600 hover:text-blue-600 transition-colors">About</Link>
                                <Link href="/#faq" className="text-sm text-slate-600 hover:text-blue-600 transition-colors">FAQ</Link>
                                <Link href="/login" className="text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors">Log In</Link>
                                <Link href="/signup" className="px-4 py-2 text-sm font-medium text-white rounded-lg gradient-primary hover:opacity-90 transition-opacity">
                                    Join as Contributor
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link href="/dashboard" className="text-sm text-slate-600 hover:text-blue-600 transition-colors">Dashboard</Link>
                                <Link href="/dashboard/upload" className="text-sm text-slate-600 hover:text-blue-600 transition-colors">Upload</Link>
                                {isAdmin && (
                                    <>
                                        <Link href="/dashboard/review" className="text-sm text-slate-600 hover:text-blue-600 transition-colors">Review</Link>
                                        <Link href="/dashboard/admin" className="text-sm text-slate-600 hover:text-blue-600 transition-colors">Admin</Link>
                                    </>
                                )}
                                <button className="relative p-2 text-slate-500 hover:text-blue-600 transition-colors">
                                    <Bell className="w-5 h-5" />
                                </button>
                                <div className="relative">
                                    <button
                                        onClick={() => setProfileOpen(!profileOpen)}
                                        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-semibold">
                                            {profile?.full_name?.[0] || 'U'}
                                        </div>
                                    </button>
                                    {profileOpen && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border p-2 animate-fade-in">
                                            <div className="px-3 py-2 border-b mb-1">
                                                <p className="text-sm font-medium truncate">{profile?.full_name}</p>
                                                <p className="text-xs text-slate-500 truncate">{profile?.email}</p>
                                                <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 capitalize">{profile?.role}</span>
                                            </div>
                                            <Link href="/dashboard/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-slate-50 transition-colors">
                                                <User className="w-4 h-4" /> Profile
                                            </Link>
                                            <button onClick={() => { signOut(); setProfileOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-red-50 text-red-600 transition-colors">
                                                <LogOut className="w-4 h-4" /> Sign Out
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
                        {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {menuOpen && (
                <div className="md:hidden border-t bg-white animate-slide-up">
                    <div className="px-4 py-3 space-y-2">
                        {!user ? (
                            <>
                                <Link href="/#about" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm hover:bg-slate-50">About</Link>
                                <Link href="/#faq" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm hover:bg-slate-50">FAQ</Link>
                                <Link href="/login" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm hover:bg-slate-50">Log In</Link>
                                <Link href="/signup" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-white gradient-primary text-center font-medium">Join as Contributor</Link>
                            </>
                        ) : (
                            <>
                                <div className="px-3 py-2 mb-2">
                                    <p className="font-medium">{profile?.full_name}</p>
                                    <p className="text-xs text-slate-500">{profile?.email}</p>
                                </div>
                                <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm hover:bg-slate-50">Dashboard</Link>
                                <Link href="/dashboard/upload" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm hover:bg-slate-50">Upload</Link>
                                {isAdmin && (
                                    <>
                                        <Link href="/dashboard/review" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm hover:bg-slate-50">Review</Link>
                                        <Link href="/dashboard/admin" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm hover:bg-slate-50">Admin</Link>
                                    </>
                                )}
                                <Link href="/dashboard/profile" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm hover:bg-slate-50">Profile</Link>
                                <button onClick={() => { signOut(); setMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50">Sign Out</button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
