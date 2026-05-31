'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { X, Loader2 } from 'lucide-react';

export default function AuthModal() {
  const { user, logout, isAuthModalOpen, authModalTab, closeAuthModal, login, register, openAuthModal } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'BUYER' | 'OWNER' | 'AGENT'>('BUYER');
  
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isAuthModalOpen) return null;

  if (user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-100 animate-in fade-in zoom-in duration-200">
          
          {/* Close Button */}
          <button 
            onClick={closeAuthModal} 
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="text-center py-4 space-y-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white">Owner Account Required</h3>
            <p className="text-sm text-slate-400">
              You are currently signed in as a <strong className="text-indigo-400">Buyer</strong>. To list properties, please sign out and sign in or register with an Owner or Agent account.
            </p>
            
            <div className="pt-4 flex flex-col gap-2">
              <button
                onClick={async () => {
                  await logout();
                  openAuthModal('register');
                }}
                className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-500 py-2.5 text-sm font-semibold text-white shadow-lg active:scale-[0.98] transition-all cursor-pointer"
              >
                Sign Out & Register Owner Account
              </button>
              <button
                onClick={closeAuthModal}
                className="w-full rounded-lg bg-slate-950 border border-slate-800 py-2.5 text-sm font-semibold text-slate-400 hover:text-slate-300 transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      if (authModalTab === 'login') {
        await login({ email, password });
      } else {
        await register({ name, email, password, role });
      }
      // Reset form
      setName('');
      setEmail('');
      setPassword('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-100 animate-in fade-in zoom-in duration-200">
        
        {/* Close Button */}
        <button 
          onClick={closeAuthModal} 
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Tab Headers */}
        <div className="flex border-b border-slate-800 mb-6">
          <button
            onClick={() => { openAuthModal('login'); setErrorMsg(''); }}
            className={`flex-1 pb-3 text-center font-semibold text-lg border-b-2 transition-all ${
              authModalTab === 'login'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { openAuthModal('register'); setErrorMsg(''); }}
            className={`flex-1 pb-3 text-center font-semibold text-lg border-b-2 transition-all ${
              authModalTab === 'register'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mb-4 rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-sm text-rose-400">
            {errorMsg}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {authModalTab === 'register' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter Your Name"
                className="w-full rounded-lg bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full rounded-lg bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          {authModalTab === 'register' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                I want to:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('BUYER')}
                  className={`rounded-lg py-2 text-xs font-semibold border transition-all ${
                    role === 'BUYER'
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/10'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300'
                  }`}
                >
                  Buy/Rent
                </button>
                <button
                  type="button"
                  onClick={() => setRole('OWNER')}
                  className={`rounded-lg py-2 text-xs font-semibold border transition-all ${
                    role === 'OWNER'
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/10'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300'
                  }`}
                >
                  Sell/Rent out
                </button>
                <button
                  type="button"
                  onClick={() => setRole('AGENT')}
                  className={`rounded-lg py-2 text-xs font-semibold border transition-all ${
                    role === 'AGENT'
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/10'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300'
                  }`}
                >
                  Agent listings
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none mt-6"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : authModalTab === 'login' ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
