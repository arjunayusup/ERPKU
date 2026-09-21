'use client';

import { useState } from 'react';
import { loginAction } from '@/app/actions/auth';
import { Shield, Lock, User as UserIcon, ArrowRight, HardHat, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const res = await loginAction(formData);
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    }
  }

  function handleQuickLogin(user: string, pass: string) {
    setUsername(user);
    setPassword(pass);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl shadow-xl p-8">
        {/* Header with Official Salsabilla Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 shadow-sm inline-block">
              <img
                src="/salsabilla-mark.png"
                alt="Salsabilla Advertising"
                className="h-14 w-auto object-contain mx-auto"
              />
            </div>
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900 uppercase">
            Salsabilla Advertising
          </h1>
          <p className="text-xs font-semibold text-rose-600 tracking-wider uppercase mt-0.5">
            Sistem ERP Operasional & Kalkulator Reklame
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Jakarta • Bandung / Cimahi • Tangerang
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Username
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white text-sm transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white text-sm transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-4 rounded-xl transition shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 mt-2 disabled:opacity-60 cursor-pointer text-sm"
          >
            {loading ? 'Memverifikasi...' : 'Masuk ke Sistem'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Access Buttons */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <p className="text-[11px] text-slate-500 font-semibold mb-2.5 text-center uppercase tracking-wider">
            Akses Cepat Pengujian (1-Klik):
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin', 'admin123')}
              className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <Shield className="w-3.5 h-3.5 text-rose-600" /> Admin / Owner
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Akses Finansial & HPP</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('bengkel', 'bengkel123')}
              className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <HardHat className="w-3.5 h-3.5 text-amber-600" /> Mandor Bengkel
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Harga Disensor</div>
            </button>
          </div>
        </div>

        {/* Official Website Reference Footer */}
        <div className="mt-6 text-center text-[11px] text-slate-400">
          Website: <a href="http://www.jasareklameneonbox.com" target="_blank" rel="noreferrer" className="text-rose-600 hover:underline font-semibold">www.jasareklameneonbox.com</a>
        </div>
      </div>
    </div>
  );
}
