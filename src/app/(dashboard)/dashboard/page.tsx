import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { 
  FolderKanban, 
  TrendingUp, 
  Receipt, 
  ArrowUpRight, 
  Calculator,
  EyeOff,
  MapPin,
  Building2,
  Plus
} from 'lucide-react';
import { SALSABILLA_BRANCHES } from '@/lib/branches';

export default async function DashboardPage() {
  const session = await getSession();
  const isAdmin = session?.role === 'admin';

  let projects: any[] = [];
  try {
    projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        items: true,
        expenses: true,
      }
    });
  } catch (e) {
    console.error(e);
  }

  const totalProjects = projects.length;
  const totalOmset = projects.reduce((acc, p) => acc + p.totalDeal, 0);
  const totalExpenses = projects.reduce((acc, p) => acc + p.totalExpenses, 0);
  const totalProfit = projects.reduce((acc, p) => acc + p.realProfit, 0);

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Salsabilla Advertising */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl shrink-0">
            <img
              src="/salsabilla-mark.png"
              alt="Salsabilla Advertising"
              className="h-10 w-auto object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900 uppercase">Salsabilla Advertising</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                ERP Operasional
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Selamat datang kembali, <span className="font-bold text-slate-800">{session?.name}</span>. Pusat data operasional & kalkulasi reklame komersial.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <a
            href="/calculator"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition cursor-pointer"
          >
            <Calculator className="w-4 h-4" />
            <span>Kalkulator Produk</span>
          </a>

          <a
            href="/projects"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
          >
            <FolderKanban className="w-4 h-4" />
            <span>Daftar Proyek</span>
          </a>
        </div>
      </div>

      {/* KPI Cards (Clean Light) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Proyek */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Proyek Aktif</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900">{totalProjects}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Semua cabang</p>
          </div>
        </div>

        {/* Total Omset */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Nilai Kontrak</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            {isAdmin ? (
              <div className="text-2xl font-extrabold text-slate-900">{formatRupiah(totalOmset)}</div>
            ) : (
              <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium py-1">
                <EyeOff className="w-3.5 h-3.5" />
                <span>Disensor (Admin Only)</span>
              </div>
            )}
            <p className="text-[11px] text-slate-500 mt-0.5">Disetujui klien</p>
          </div>
        </div>

        {/* Belanja Lapangan */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Biaya Lapangan & Bon</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            {isAdmin ? (
              <div className="text-2xl font-extrabold text-amber-600">{formatRupiah(totalExpenses)}</div>
            ) : (
              <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium py-1">
                <EyeOff className="w-3.5 h-3.5" />
                <span>Disensor (Admin Only)</span>
              </div>
            )}
            <p className="text-[11px] text-slate-500 mt-0.5">Baut, bensin, lembur</p>
          </div>
        </div>

        {/* Laba Bersih Riil */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Laba Bersih Riil</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            {isAdmin ? (
              <div className="text-2xl font-extrabold text-emerald-600">{formatRupiah(totalProfit)}</div>
            ) : (
              <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium py-1">
                <EyeOff className="w-3.5 h-3.5" />
                <span>Disensor (Admin Only)</span>
              </div>
            )}
            <p className="text-[11px] text-slate-500 mt-0.5">Profit bersih setelah modal</p>
          </div>
        </div>
      </div>

      {/* 3 Cabang Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.values(SALSABILLA_BRANCHES).map((branch) => (
          <div key={branch.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-extrabold text-slate-900 uppercase flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-rose-600" /> {branch.name}
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                {branch.code}
              </span>
            </div>
            <p className="text-slate-600 leading-snug line-clamp-2">{branch.address}</p>
            <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
              <span>WA: <strong className="text-slate-700">{branch.whatsapp.split('/')[0]}</strong></span>
              <span>Rek: <strong className="text-slate-700">{branch.bankName} {branch.bankAccount}</strong></span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Projects Table (Clean Light) */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">Pekerjaan Reklame Terbaru</h2>
            <p className="text-xs text-slate-500 mt-0.5">Pesanan dan status pengerjaan bengkel</p>
          </div>
          <a
            href="/projects"
            className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
          >
            Lihat Semua <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">No. Proyek</th>
                <th className="px-6 py-3">Nama Pekerjaan</th>
                <th className="px-6 py-3">Klien</th>
                <th className="px-6 py-3">Status</th>
                {isAdmin && <th className="px-6 py-3">Nilai Kontrak</th>}
                <th className="px-6 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projects.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-3.5 font-mono font-bold text-rose-600">{p.projectNumber}</td>
                  <td className="px-6 py-3.5 font-semibold text-slate-900">{p.title}</td>
                  <td className="px-6 py-3.5 text-slate-600">{p.clientName}</td>
                  <td className="px-6 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      p.status === 'ready_install' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      p.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {p.status === 'ready_install' ? 'Siap Dipasang' : p.status === 'completed' ? 'Selesai & Lunas' : 'Pabrikasi'}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-3.5 font-bold text-slate-900">{formatRupiah(p.totalDeal)}</td>
                  )}
                  <td className="px-6 py-3.5 text-right">
                    <a
                      href={`/projects/${p.id}`}
                      className="inline-block text-[11px] font-bold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition"
                    >
                      Buka Rincian
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
