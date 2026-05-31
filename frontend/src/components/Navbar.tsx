'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Home, Search, LayoutDashboard, LogOut, User } from 'lucide-react';

export default function Navbar() {
  const { user, openAuthModal, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-1.5 font-bold text-xl tracking-tight text-white group">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Home className="h-4.5 w-4.5" />
              </span>
              <span className="gradient-text font-extrabold">AuraEstate</span>
            </Link>
          </div>

          {/* Nav Items */}
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              href="/search" 
              className="flex items-center gap-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              <Search className="h-4 w-4" />
              Find Properties
            </Link>

            {user && (user.role === 'OWNER' || user.role === 'AGENT') ? (
              <Link 
                href="/dashboard" 
                className="flex items-center gap-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                <LayoutDashboard className="h-4 w-4" />
                Owner Dashboard
              </Link>
            ) : (
              <button
                onClick={() => openAuthModal('register')}
                className="flex items-center gap-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                List Property
              </button>
            )}
          </nav>

          {/* User Section */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-semibold text-slate-200">{user.name}</span>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    {user.role}
                  </span>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                  <User className="h-4 w-4" />
                </div>
                <button
                  onClick={logout}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-all"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuthModal('login')}
                  className="text-sm font-semibold text-slate-300 hover:text-white px-3 py-2 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuthModal('register')}
                  className="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-600/10 active:scale-[0.98] transition-all"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
