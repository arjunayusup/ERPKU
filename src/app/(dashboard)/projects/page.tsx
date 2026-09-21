import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { FolderKanban, Plus, FileText, ArrowRight, EyeOff, Building2 } from 'lucide-react';

export default async function ProjectsPage() {
  const session = await getSession();
  const isAdmin = session?.role === 'admin';

  let projects: any[] = [];
  try {
    projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        expenses: true,
      }
    });
  } catch (e) {
    console.error(e);
  }

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <FolderKanban className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-extrabold text-slate-900 uppercase">
              Daftar Proyek & Pekerjaan Reklame
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Data pesanan aktif Salsabilla Advertising di seluruh cabang (Jakarta, Bandung, Tangerang).
          </p>
        </div>

        <a
          href="/calculator"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Kalkulasi Proyek Baru</span>
        </a>
      </div>

      {/* Projects Table (Clean Light) */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Nomor & Proyek</th>
                <th className="px-6 py-3.5">Klien & Lokasi</th>
                <th className="px-6 py-3.5">Status Pengerjaan</th>
                {isAdmin && <th className="px-6 py-3.5">Nilai Kontrak</th>}
                {isAdmin && <th className="px-6 py-3.5">Laba Bersih</th>}
                <th className="px-6 py-3.5 text-right">Aksi & Dokumen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projects.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4">
                    <div className="font-mono text-xs font-extrabold text-rose-600">{p.projectNumber}</div>
                    <div className="font-bold text-slate-900 text-sm mt-0.5">{p.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{p.items.length} Item Reklame Terdaftar</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{p.clientName}</div>
                    <div className="text-slate-500">{p.clientPhone}</div>
                    <div className="text-[11px] text-slate-400 truncate max-w-xs">{p.installationAddress}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      p.status === 'ready_install' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      p.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {p.status === 'ready_install' ? 'Siap Dipasang' : p.status === 'completed' ? 'Selesai & Lunas' : 'Pabrikasi'}
                    </span>
                  </td>
                  {isAdmin ? (
                    <td className="px-6 py-4 font-extrabold text-slate-900">{formatRupiah(p.totalDeal)}</td>
                  ) : (
                    <td className="px-6 py-4 text-slate-400 text-[11px]"><EyeOff className="w-3.5 h-3.5 inline mr-1" /> Disensor</td>
                  )}
                  {isAdmin ? (
                    <td className="px-6 py-4 font-extrabold text-emerald-600">+{formatRupiah(p.realProfit)}</td>
                  ) : (
                    <td className="px-6 py-4 text-slate-400 text-[11px]"><EyeOff className="w-3.5 h-3.5 inline mr-1" /> Disensor</td>
                  )}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={`/documents/${p.id}/spk`}
                        target="_blank"
                        title="Cetak SPK Bengkel (No-Price)"
                        className="p-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition"
                      >
                        <FileText className="w-4 h-4" />
                      </a>
                      <a
                        href={`/projects/${p.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold text-xs transition"
                      >
                        <span>Buka Detail</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
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
