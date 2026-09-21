import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { logoutAction } from '@/app/actions/auth';
import { 
  Calculator, 
  FolderKanban, 
  CalendarDays, 
  Database, 
  LogOut, 
  LayoutDashboard, 
  ShieldCheck,
  HardHat,
  MapPin
} from 'lucide-react';
import MobileBottomNav from '@/components/MobileBottomNav';
import MobileTopBar from '@/components/MobileTopBar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const isAdmin = session.role === 'admin';

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 text-slate-800">
      {/* Mobile Top Header (Visible on mobile only) */}
      <MobileTopBar userName={session.name} userRole={session.role} />

      {/* Clean Light Sidebar (Desktop only) */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col no-print shrink-0 shadow-sm min-h-screen sticky top-0 h-screen">
        {/* Brand Header with Official Salsabilla Logo */}
        <div className="p-5 border-b border-slate-100 flex flex-col items-center text-center">
          <div className="w-full flex justify-center mb-2">
            <img
              src="/salsabilla-mark.png"
              alt="Salsabilla Advertising"
              className="h-12 w-auto object-contain"
            />
          </div>
          <h2 className="font-extrabold text-sm uppercase tracking-tight text-slate-900 leading-tight">
            Salsabilla Advertising
          </h2>
          <p className="text-[10px] font-bold text-rose-600 tracking-wider uppercase mt-0.5">
            Indoor • Outdoor Reklame
          </p>
        </div>

        {/* User Card */}
        <div className="px-4 py-3 m-3 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg ${isAdmin ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
              {isAdmin ? <ShieldCheck className="w-4 h-4" /> : <HardHat className="w-4 h-4" />}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold truncate text-slate-900">{session.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${isAdmin ? 'bg-rose-600' : 'bg-amber-500'}`}></span>
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                  {isAdmin ? 'Admin / Owner' : 'Bengkel / Lapangan'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1">
          <a
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black tracking-wide text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
          >
            <LayoutDashboard className="w-4 h-4 text-rose-600" />
            <span>DASHBOARD</span>
          </a>

          <a
            href="/calculator"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black tracking-wide text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
          >
            <Calculator className="w-4 h-4 text-amber-600" />
            <span>KALKULATOR PENAWARAN</span>
          </a>

          <a
            href="/projects"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black tracking-wide text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
          >
            <FolderKanban className="w-4 h-4 text-indigo-600" />
            <span>PROYEK & SPK</span>
          </a>

          <a
            href="/schedule"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black tracking-wide text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
          >
            <CalendarDays className="w-4 h-4 text-emerald-600" />
            <span>JADWAL PEMASANGAN</span>
          </a>

          {isAdmin && (
            <a
              href="/master"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black tracking-wide text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
            >
              <Database className="w-4 h-4 text-blue-600" />
              <span>MASTER DATA</span>
            </a>
          )}
        </nav>

        {/* Branch Info Footer in Sidebar */}
        <div className="px-4 py-3 border-t border-slate-100 text-[10px] text-slate-500 space-y-1">
          <div className="flex items-center gap-1 font-semibold text-slate-700">
            <MapPin className="w-3 h-3 text-rose-600" /> 3 Cabang Utama:
          </div>
          <p>• Jakarta (Meruya Selatan No. 20)</p>
          <p>• Bandung/Cimahi (Melong Raya No. 138)</p>
          <p>• Tangerang (Cipondoh)</p>
        </div>

        {/* Logout */}
        <div className="p-3 border-t border-slate-100">
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar (Logout)</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-y-auto bg-slate-50 min-h-screen">
        <div className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav isAdmin={isAdmin} />
    </div>
  );
}
