import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Database, Building2, Tag, Users, CheckCircle2, AlertTriangle, Layers, Construction, Sparkles } from 'lucide-react';
import { SALSABILLA_BRANCHES } from '@/lib/branches';

export default async function MasterDataPage() {
  const session = await getSession();
  if (session?.role !== 'admin') {
    notFound();
  }

  let rates: any[] = [];
  let users: any[] = [];

  try {
    rates = await prisma.materialRate.findMany({
      orderBy: { id: 'asc' }
    });
    users = await prisma.user.findMany({
      orderBy: { role: 'asc' }
    });
  } catch (e) {
    console.error(e);
  }

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const branches = Object.values(SALSABILLA_BRANCHES);

  // Group rates by business category
  const hurufTimbulRates = rates.filter((r) => r.category === 'huruf_timbul');
  const neonAndReklameRates = rates.filter((r) => r.category === 'neon_box' || r.category === 'reklame');
  const tiangRates = rates.filter((r) => r.category === 'tiang');
  const aksesorisRates = rates.filter((r) => r.category === 'aksesoris' || r.category === 'led' || r.category === 'trafo');

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 p-4 sm:p-6 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
            <Database className="w-5 h-5" />
          </span>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight">
            Master Data & Tarif Resmi Salsabilla
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Daftar harga acuan jual & modal HPP resmi 2026, data 3 cabang operasional, dan hak akses staf.
        </p>
      </div>

      {/* 1. MASTER CABANG PERUSAHAAN (BRANCH CONFIGURATION) */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-rose-600" />
            <h2 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-tight">
              3 Kantor Cabang Resmi Salsabilla Advertising
            </h2>
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-500">
            Terhubung ke Kop Surat & TTD Digital
          </span>
        </div>

        <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-3 gap-3">
          {branches.map((b) => (
            <div key={b.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between text-xs space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-extrabold text-slate-900 text-sm">{b.name}</h3>
                  <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-rose-50 text-rose-700 border border-rose-200">
                    {b.code}
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px] mt-1">{b.address}</p>

                <div className="mt-3 pt-2 border-t border-slate-200 space-y-1 text-[11px]">
                  <p><span className="text-slate-500">Phone/WA:</span> <strong className="text-slate-800">{b.whatsapp}</strong></p>
                  <p><span className="text-slate-500">Rekening:</span> <strong className="text-slate-800">{b.bankName} {b.bankAccount}</strong> a.n <strong className="text-slate-800">{b.bankAccountName}</strong></p>
                  <p><span className="text-slate-500">PIC Cabang:</span> <strong className="text-slate-800">{b.signerName}</strong></p>
                </div>
              </div>

              {b.notes && (
                <div className="p-2 rounded bg-amber-50 border border-amber-200 text-[10px] text-amber-800 flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span>{b.notes}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 2. MASTER RATES (RATE CARD) - Categorized & Mobile Responsive */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-amber-600" />
            <h2 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-tight">
              Tarif Acuan Resmi Salsabilla (Rate Card 2026)
            </h2>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            Database Aktif
          </span>
        </div>

        {/* Responsive Rate Card Component Helper */}
        <div className="p-4 sm:p-5 space-y-6">
          {/* Section A: Huruf Timbul */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-black text-slate-900 uppercase flex items-center gap-1.5 text-rose-600">
              <Sparkles className="w-3.5 h-3.5" />
              A. Huruf Timbul (Hitungan per cm tinggi/huruf)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {hurufTimbulRates.map((r) => (
                <div key={r.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between text-xs space-y-2">
                  <div>
                    <h4 className="font-bold text-slate-900 leading-snug">{r.name}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">{r.notes}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-200/80 flex items-baseline justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">HPP Modal:</span>
                      <span className="font-semibold text-slate-600 text-[11px]">{formatRupiah(r.costPrice)}/cm</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] uppercase font-bold text-rose-500 block">Tarif Jual:</span>
                      <span className="font-black text-rose-600 text-sm">{formatRupiah(r.sellPrice)}/cm</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section B: Neon Box & Reklame */}
          <div className="space-y-2.5 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-black text-slate-900 uppercase flex items-center gap-1.5 text-indigo-600">
              <Layers className="w-3.5 h-3.5" />
              B. Neon Box & Papan Reklame (Hitungan per m²)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {neonAndReklameRates.map((r) => (
                <div key={r.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between text-xs space-y-2">
                  <div>
                    <h4 className="font-bold text-slate-900 leading-snug">{r.name}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">{r.notes}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-200/80 flex items-baseline justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">HPP Modal:</span>
                      <span className="font-semibold text-slate-600 text-[11px]">{formatRupiah(r.costPrice)}/m²</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] uppercase font-bold text-indigo-500 block">Tarif Jual:</span>
                      <span className="font-black text-indigo-600 text-sm">{formatRupiah(r.sellPrice)}/m²</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section C: Tiang & Pondasi */}
          <div className="space-y-2.5 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-black text-slate-900 uppercase flex items-center gap-1.5 text-amber-700">
              <Construction className="w-3.5 h-3.5" />
              C. Tiang Konstruksi & Pondasi Cakar Ayam (Add-on)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {tiangRates.map((r) => (
                <div key={r.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between text-xs space-y-2">
                  <div>
                    <h4 className="font-bold text-slate-900 leading-snug">{r.name}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">{r.notes}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-200/80 flex items-baseline justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">HPP:</span>
                      <span className="font-semibold text-slate-600 text-[11px]">{formatRupiah(r.costPrice)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] uppercase font-bold text-amber-600 block">Tarif Jual:</span>
                      <span className="font-black text-amber-700 text-sm">{formatRupiah(r.sellPrice)}/{r.unit}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section D: Stiker & Aksesoris */}
          <div className="space-y-2.5 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-black text-slate-900 uppercase flex items-center gap-1.5 text-emerald-700">
              <Sparkles className="w-3.5 h-3.5" />
              D. Cutting Sticker, Lampu Sorot & Komponen Kelistrikan
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {aksesorisRates.map((r) => (
                <div key={r.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between text-xs space-y-2">
                  <div>
                    <h4 className="font-bold text-slate-900 leading-snug">{r.name}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">{r.notes}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-200/80 flex items-baseline justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">HPP:</span>
                      <span className="font-semibold text-slate-600 text-[11px]">{formatRupiah(r.costPrice)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] uppercase font-bold text-emerald-600 block">Tarif Jual:</span>
                      <span className="font-black text-emerald-700 text-sm">{formatRupiah(r.sellPrice)}/{r.unit}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. MASTER USERS */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            <h2 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-tight">
              Akun Pengguna & Hak Akses Sensor
            </h2>
          </div>
        </div>

        <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {users.map((u) => (
            <div key={u.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between text-xs space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-slate-900">{u.name}</h4>
                  <p className="text-slate-500 font-mono text-[11px]">User: {u.username}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                  u.role === 'admin' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {u.role === 'admin' ? 'Owner / Admin' : 'Teknisi Bengkel'}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200/80 text-[11px]">
                {u.role === 'admin' ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Akses Penuh (HPP, Quotation, Invoice)
                  </span>
                ) : (
                  <span className="text-slate-500">🔒 Nominal Harga Disensor (Hanya lihat SPK)</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
