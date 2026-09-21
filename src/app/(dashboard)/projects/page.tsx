import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { 
  FolderKanban, 
  Plus, 
  FileText, 
  ArrowRight, 
  EyeOff, 
  Phone, 
  Truck, 
  CheckCircle2, 
  MessageSquare
} from 'lucide-react';

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
    <div className="space-y-5 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 p-4 sm:p-6 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <FolderKanban className="w-5 h-5" />
            </span>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight">
              Daftar Proyek & SPK Reklame
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pantau status pabrikasi bengkel, surat jalan, dan penerbitan BAST di seluruh cabang.
          </p>
        </div>

        <a
          href="/calculator"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm shadow-rose-600/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Kalkulasi Proyek Baru</span>
        </a>
      </div>

      {/* MOBILE CARD VIEW (< md screen: No overflow, 100% thumb friendly) */}
      <div className="md:hidden space-y-3">
        {projects.map((p) => {
          const cleanPhone = p.clientPhone.replace(/[^0-9]/g, '');
          const waNumber = cleanPhone.startsWith('0') ? '62' + cleanPhone.substring(1) : cleanPhone;

          return (
            <div key={p.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
              {/* Card Header: Project Number + Status */}
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-mono text-xs font-black text-rose-600">{p.projectNumber}</span>
                  <h3 className="font-bold text-slate-900 text-sm mt-0.5 leading-snug">{p.title}</h3>
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                  p.status === 'ready_install' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                  p.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                  'bg-blue-50 text-blue-700 border border-blue-200'
                }`}>
                  {p.status === 'ready_install' ? 'Siap Pasang' : p.status === 'completed' ? 'Lunas' : 'Pabrikasi'}
                </span>
              </div>

              {/* Client & Address Info */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900">{p.clientName}</span>
                  <a
                    href={`https://wa.me/${waNumber}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>WA Klien</span>
                  </a>
                </div>
                <p className="text-[11px] text-slate-500 truncate">{p.installationAddress || 'Lokasi belum diatur'}</p>
              </div>

              {/* Financial Snapshot (Admin only) */}
              {isAdmin ? (
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Nilai Kontrak:</span>
                    <span className="font-black text-slate-900">{formatRupiah(p.totalDeal)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-emerald-600 block">Laba Bersih:</span>
                    <span className="font-black text-emerald-600">+{formatRupiah(p.realProfit)}</span>
                  </div>
                </div>
              ) : (
                <div className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-100 flex items-center gap-1">
                  <EyeOff className="w-3 h-3" /> Nominal harga disensor untuk akun teknisi.
                </div>
              )}

              {/* Quick Action Buttons for Mobile */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5">
                  <a
                    href={`/documents/${p.id}/spk`}
                    target="_blank"
                    title="Cetak SPK Bengkel"
                    className="px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold flex items-center gap-1"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>SPK</span>
                  </a>
                  <a
                    href={`/documents/${p.id}/surat_jalan`}
                    target="_blank"
                    title="Surat Jalan"
                    className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold flex items-center gap-1"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Jalan</span>
                  </a>
                  <a
                    href={`/documents/${p.id}/bast`}
                    target="_blank"
                    title="BAST Serah Terima"
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>BAST</span>
                  </a>
                </div>

                <a
                  href={`/projects/${p.id}`}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center gap-1"
                >
                  <span>Detail</span>
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* DESKTOP TABLE VIEW (>= md screen: Clean full width table) */}
      <div className="hidden md:block bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
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
              {projects.map((p) => {
                const cleanPhone = p.clientPhone.replace(/[^0-9]/g, '');
                const waNumber = cleanPhone.startsWith('0') ? '62' + cleanPhone.substring(1) : cleanPhone;

                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <div className="font-mono text-xs font-black text-rose-600">{p.projectNumber}</div>
                      <div className="font-bold text-slate-900 text-sm mt-0.5">{p.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{p.items.length} Item Reklame Terdaftar</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{p.clientName}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-slate-500">{p.clientPhone}</span>
                        <a
                          href={`https://wa.me/${waNumber}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-600 hover:text-emerald-700 text-[10px] font-bold"
                        >
                          [Chat WA]
                        </a>
                      </div>
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
                      <td className="px-6 py-4 font-black text-slate-900">{formatRupiah(p.totalDeal)}</td>
                    ) : (
                      <td className="px-6 py-4 text-slate-400 text-[11px]"><EyeOff className="w-3.5 h-3.5 inline mr-1" /> Disensor</td>
                    )}
                    {isAdmin ? (
                      <td className="px-6 py-4 font-black text-emerald-600">+{formatRupiah(p.realProfit)}</td>
                    ) : (
                      <td className="px-6 py-4 text-slate-400 text-[11px]"><EyeOff className="w-3.5 h-3.5 inline mr-1" /> Disensor</td>
                    )}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`/documents/${p.id}/spk`}
                          target="_blank"
                          title="Cetak SPK Bengkel"
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
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
