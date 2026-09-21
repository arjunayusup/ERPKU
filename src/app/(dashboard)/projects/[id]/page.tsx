import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { addExpenseAction } from '@/app/actions/project';
import { 
  FolderKanban, 
  Receipt, 
  Printer, 
  FileText, 
  EyeOff, 
  Plus, 
  CheckCircle2, 
  Zap, 
  Truck,
  CreditCard,
  Building2,
  ArrowLeft,
  Edit3
} from 'lucide-react';
import { SALSABILLA_BRANCHES } from '@/lib/branches';
import { getMaterialDisplayLabel, calculateLedModules, formatItemDimensions } from '@/lib/calculator-modular';
import ProjectActionsBar from './ProjectActionsBar';

export default async function ProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();
  const isAdmin = session?.role === 'admin';

  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      items: true,
      expenses: true,
      installations: true,
    }
  });

  if (!project) notFound();

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Identitas Proyek */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <a
              href="/projects"
              className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 mr-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Kembali
            </a>
            <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800 font-mono text-xs font-bold border border-slate-300">
              {project.projectNumber}
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px] uppercase border border-slate-300">
              Cabang {project.branch || 'Jakarta'}
            </span>
          </div>

          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
            project.status === 'ready_install' ? 'bg-amber-50 text-amber-800 border-amber-200' :
            project.status === 'completed' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
            project.status === 'installing' ? 'bg-indigo-50 text-indigo-800 border-indigo-200' :
            'bg-blue-50 text-blue-800 border-blue-200'
          }`}>
            {project.status === 'ready_install' ? 'Siap Pasang' : 
             project.status === 'completed' ? 'Selesai & Lunas' : 
             project.status === 'installing' ? 'Pemasangan Lapangan' : 'Pabrikasi Bengkel'}
          </span>
        </div>

        <h1 className="text-2xl font-black text-slate-900 tracking-tight">{project.title}</h1>
        <p className="text-slate-600 text-xs">
          Klien: <strong className="text-slate-900">{project.clientName}</strong> ({project.clientPhone}) • Lokasi: {project.installationAddress || 'Belum diatur'}
        </p>
      </div>

      {/* Action Bar: Tracker Progres, Atur Jadwal, & Dokumen Cetak Proporsional */}
      <ProjectActionsBar project={project} isAdmin={isAdmin} />

      {/* Financial Summary (Admin Only) */}
      {isAdmin ? (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Nilai Kontrak Klien</span>
            <div className="text-xl font-extrabold text-slate-900 mt-1">{formatRupiah(project.totalDeal)}</div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Modal Bahan (BOM)</span>
            <div className="text-xl font-extrabold text-slate-700 mt-1">{formatRupiah(project.totalHpp)}</div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Belanja Tambahan Lapangan</span>
            <div className="text-xl font-extrabold text-amber-600 mt-1">{formatRupiah(project.totalExpenses)}</div>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-sm">
            <span className="text-xs text-emerald-700 font-bold uppercase tracking-wider">Laba Bersih Riil</span>
            <div className="text-xl font-extrabold text-emerald-700 mt-1">+{formatRupiah(project.realProfit)}</div>
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
          <EyeOff className="w-4 h-4 text-slate-400" />
          <span>Informasi nilai kontrak & margin HPP disensor untuk akun teknisi bengkel.</span>
        </div>
      )}

      {/* Two Column Layout: Items Spec & Expense Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (7 cols): Items Reklame Spek */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-600" />
            Spesifikasi Unit Reklame & Kelistrikan
          </h2>

          <div className="space-y-3">
            {project.items.map((item) => {
              const ledInfo = calculateLedModules({
                category: item.itemType,
                subCategory: item.material,
                material: item.material,
                heightCm: item.heightCm || undefined,
                charCount: item.charCount || undefined,
                lightingType: item.lighting || undefined,
              });

              return (
                <div key={item.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{item.description}</h3>
                      <p className="text-slate-600 mt-0.5">
                        Bahan: <strong className="text-slate-800">{getMaterialDisplayLabel(item.material)}</strong>
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300 uppercase">
                      {item.itemType}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-slate-700">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Ukuran:</span>
                      <span className="font-bold text-slate-900">
                        {formatItemDimensions(item)}
                      </span>
                    </div>
                    {ledInfo.isIlluminated ? (
                      <>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Modul LED:</span>
                          <span className="font-bold text-slate-900">{item.ledCount || ledInfo.ledCount} Modul</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Trafo Safety:</span>
                          <span className="font-bold text-slate-900">{item.trafoWatt || ledInfo.trafoWatt}W Rainproof</span>
                        </div>
                      </>
                    ) : (
                      <div className="col-span-2">
                        <span className="text-slate-500 block text-[10px]">Sistem Lampu:</span>
                        <span className="font-semibold text-slate-700">Non-Lampu (Plat Solid / Huruf Polos)</span>
                      </div>
                    )}
                  </div>

                  {isAdmin && (
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-xs">
                      <span className="text-slate-500">Harga Penawaran Item:</span>
                      <span className="font-extrabold text-slate-900">{formatRupiah(item.sellingPrice)}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right (5 cols): Expense Tracker / Bon Belanjaan */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-600" />
            Catatan Bon Belanja Lapangan
          </h2>

          {/* Add Expense Form */}
          <form action={addExpenseAction} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <input type="hidden" name="projectId" value={project.id} />
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Nama Item Belanja</label>
              <input
                type="text"
                name="description"
                required
                placeholder="Contoh: Beli Dynabolt M10 + Lem Silikon"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Kategori</label>
                <select
                  name="category"
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-xs text-slate-900"
                >
                  <option value="material_lokal">Bahan Tambahan</option>
                  <option value="bensin">Bensin Mobil</option>
                  <option value="makan_lembur">Makan Lembur</option>
                  <option value="sewa_alat">Sewa Alat</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Nominal (Rp)</label>
                <input
                  type="number"
                  name="amount"
                  required
                  placeholder="50000"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Simpan Bon Belanjaan
            </button>
          </form>

          {/* Expense Items List */}
          <div className="space-y-2">
            {project.expenses.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">Belum ada catatan bon belanja tambahan.</p>
            ) : (
              project.expenses.map((exp) => (
                <div key={exp.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-slate-900">{exp.description}</p>
                    <p className="text-[10px] text-slate-500">{exp.date} • {exp.category}</p>
                  </div>
                  <span className="font-extrabold text-amber-700">{formatRupiah(exp.amount)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
