import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Database, Building2, Tag, Users, ShieldAlert, CheckCircle2, AlertTriangle } from 'lucide-react';
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
      orderBy: { category: 'asc' }
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

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
            <Database className="w-5 h-5" />
          </span>
          <h1 className="text-xl font-extrabold text-slate-900 uppercase">
            Master Data Cabang & Tarif Acuan
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Konfigurasi resmi kantor cabang Salsabilla Advertising, rekening bank pembayaran, dan acuan tarif HPP.
        </p>
      </div>

      {/* 1. MASTER CABANG PERUSAHAAN (BRANCH CONFIGURATION) */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-rose-600" />
            <h2 className="text-sm font-extrabold text-slate-900 uppercase">
              Konfigurasi 3 Cabang Resmi Salsabilla Advertising
            </h2>
          </div>
          <span className="text-[11px] font-bold text-slate-500">
            Terhubung Langsung ke Seluruh Template Cetak
          </span>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <p><span className="text-slate-500">Email:</span> <strong className="text-slate-800 truncate block">{b.email}</strong></p>
                  <p><span className="text-slate-500">Rekening:</span> <strong className="text-slate-800">{b.bankName} {b.bankAccount}</strong> a.n <strong className="text-slate-800">{b.bankAccountName}</strong></p>
                  <p><span className="text-slate-500">PIC Penandatangan:</span> <strong className="text-slate-800">{b.signerName}</strong></p>
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

      {/* 2. MASTER RATES (RATE CARD) */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-extrabold text-slate-900 uppercase">Tarif Acuan Bahan & Jasa (Rate Card)</h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 font-bold uppercase text-slate-500 border-b border-slate-200 text-[11px]">
              <tr>
                <th className="p-3.5">Nama Bahan / Komponen</th>
                <th className="p-3.5">Kategori</th>
                <th className="p-3.5">Satuan</th>
                <th className="p-3.5">HPP Modal</th>
                <th className="p-3.5">Tarif Jual Acuan</th>
                <th className="p-3.5">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rates.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 transition">
                  <td className="p-3.5 font-bold text-slate-900">{r.name}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-mono text-[10px] uppercase font-bold">
                      {r.category}
                    </span>
                  </td>
                  <td className="p-3.5 font-semibold text-slate-600">{r.unit}</td>
                  <td className="p-3.5 font-semibold text-slate-700">{formatRupiah(r.costPrice)}</td>
                  <td className="p-3.5 font-extrabold text-rose-600">{formatRupiah(r.sellPrice)}</td>
                  <td className="p-3.5 text-slate-500 text-[11px]">{r.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. MASTER USERS */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-extrabold text-slate-900 uppercase">Daftar Akun Pengguna & Hak Akses</h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 font-bold uppercase text-slate-500 border-b border-slate-200 text-[11px]">
              <tr>
                <th className="p-3.5">Nama Staf</th>
                <th className="p-3.5">Username</th>
                <th className="p-3.5">Peran (Role)</th>
                <th className="p-3.5">Otoritas Finansial</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition">
                  <td className="p-3.5 font-bold text-slate-900">{u.name}</td>
                  <td className="p-3.5 font-mono text-rose-600 font-bold">{u.username}</td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                      u.role === 'admin' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                      'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {u.role === 'admin' ? 'Owner / Admin' : 'Teknisi / Bengkel'}
                    </span>
                  </td>
                  <td className="p-3.5">
                    {u.role === 'admin' ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Akses Penuh (HPP, Margin, Quotation, Invoice)
                      </span>
                    ) : (
                      <span className="text-slate-400 font-medium">
                        🔒 Disensor (Hanya lihat fisik pekerjaan & SPK)
                      </span>
                    )}
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
