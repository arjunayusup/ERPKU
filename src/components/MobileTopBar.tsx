'use client';

import { logoutAction } from '@/app/actions/auth';
import { LogOut, ShieldCheck, HardHat } from 'lucide-react';

export default function MobileTopBar({
  userName,
  userRole,
}: {
  userName: string;
  userRole: string;
}) {
  const isAdmin = userRole === 'admin';

  return (
    <div className="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shadow-xs no-print">
      <div className="flex items-center gap-2.5">
        <img
          src="/salsabilla-mark.png"
          alt="Salsabilla Logo"
          className="h-8 w-auto object-contain"
        />
        <div>
          <h1 className="text-xs font-black text-slate-900 uppercase tracking-tight leading-tight">
            Salsabilla
          </h1>
          <p className="text-[9px] font-bold text-rose-600 uppercase tracking-wider">
            Advertising ERP
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-bold">
          {isAdmin ? (
            <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
          ) : (
            <HardHat className="w-3.5 h-3.5 text-amber-600" />
          )}
          <span className="truncate max-w-[80px]">{userName.split(' ')[0]}</span>
        </div>

        <form action={logoutAction}>
          <button
            type="submit"
            title="Keluar (Logout)"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
