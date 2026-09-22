'use client';

import { useState } from 'react';
import { 
  Building2, 
  Tag, 
  Users, 
  UserCheck, 
  Plus, 
  Trash2, 
  Edit3, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  HardHat, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Layers, 
  Construction, 
  X,
  Database,
  Truck,
  Wrench,
  Clock,
  Compass,
  Zap,
  CheckSquare
} from 'lucide-react';
import { 
  createMaterialRateAction, 
  updateMaterialRateAction, 
  deleteMaterialRateAction,
  createClientAction,
  updateClientAction,
  deleteClientAction,
  createTeamMemberAction,
  updateTeamMemberAction,
  deleteTeamMemberAction,
  toggleTeamMemberStatusAction
} from '@/app/actions/master';
import { SALSABILLA_BRANCHES } from '@/lib/branches';

interface MasterHubClientProps {
  initialRates: any[];
  initialClients: any[];
  initialUsers: any[];
  initialTeamMembers: any[];
}

export default function MasterHubClient({
  initialRates,
  initialClients,
  initialUsers,
  initialTeamMembers = [],
}: MasterHubClientProps) {
  const [activeTab, setActiveTab] = useState<'clients' | 'rates' | 'branches' | 'users' | 'teams'>('clients');

  // Rate Modal State
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<any | null>(null);

  // Client Modal State
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any | null>(null);

  // Team Member Modal State
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingTeamMember, setEditingTeamMember] = useState<any | null>(null);

  const branches = Object.values(SALSABILLA_BRANCHES);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  // Group rates
  const hurufTimbulRates = initialRates.filter((r) => r.category === 'huruf_timbul');
  const neonAndReklameRates = initialRates.filter((r) => r.category === 'neon_box' || r.category === 'reklame');
  const fasadRates = initialRates.filter((r) => r.category === 'fasad');
  const tiangRates = initialRates.filter((r) => r.category === 'tiang');
  const operasionalRates = initialRates.filter((r) => r.category === 'operasional');
  const logoRates = initialRates.filter((r) => r.category === 'logo');
  const aksesorisRates = initialRates.filter((r) => r.category === 'aksesoris' || r.category === 'led' || r.category === 'trafo');

  const ROLE_LABELS: Record<string, { label: string; badge: string }> = {
    LEAD_INSTALLER: { label: 'Lead Installer (PJ)', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    TECHNICIAN: { label: 'Teknisi Signage & LED', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
    DRIVER: { label: 'Driver & Armada Pikap', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    WELDER: { label: 'Tukang Las & Konstruksi', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
    HELPER: { label: 'Helper / Pembantu Umum', badge: 'bg-slate-100 text-slate-700 border-slate-200' },
  };

  return (
    <div className="space-y-6">
      {/* 5 Dedicated Master Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-white border border-slate-200 rounded-2xl shadow-xs overflow-x-auto text-xs font-bold no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('clients')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition cursor-pointer shrink-0 ${
            activeTab === 'clients'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>1. Master Pelanggan ({initialClients.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rates')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition cursor-pointer shrink-0 ${
            activeTab === 'rates'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>2. Tarif Bahan & HPP ({initialRates.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('teams')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition cursor-pointer shrink-0 ${
            activeTab === 'teams'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <HardHat className="w-4 h-4 text-amber-400" />
          <span>3. Tim Teknisi Lapangan ({initialTeamMembers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('branches')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition cursor-pointer shrink-0 ${
            activeTab === 'branches'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>4. Cabang & Rekening</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition cursor-pointer shrink-0 ${
            activeTab === 'users'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>5. Akun Staf</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MASTER PELANGGAN (CLIENTS DIRECTORY) */}
      {/* ========================================================================= */}
      {activeTab === 'clients' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden space-y-4 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-black uppercase tracking-tight text-slate-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-indigo-600" />
                Direktori Pelanggan Salsabilla Advertising
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Data klien otomatis tersimpan saat Anda membuat penawaran baru.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingClient(null);
                setIsClientModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Pelanggan</span>
            </button>
          </div>

          {/* Client Cards Grid */}
          {initialClients.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Belum ada pelanggan terdaftar.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {initialClients.map((c) => {
                const cleanPhone = c.phone.replace(/[^0-9]/g, '');
                const waNumber = cleanPhone.startsWith('0') ? '62' + cleanPhone.substring(1) : cleanPhone;

                return (
                  <div key={c.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between text-xs space-y-3">
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-sm">{c.name}</h3>
                          {c.picName && (
                            <p className="text-slate-600 font-medium text-[11px] mt-0.5">
                              PIC: <strong className="text-slate-800">{c.picName}</strong>
                            </p>
                          )}
                        </div>
                        <span className="px-2 py-0.5 rounded-full font-mono font-bold text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {c.projects?.length || 0} Proyek
                        </span>
                      </div>

                      <div className="mt-2 space-y-1 text-slate-600 text-[11px]">
                        <p className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <a
                            href={`https://wa.me/${waNumber}`}
                            target="_blank"
                            rel="noreferrer"
                            className="font-mono text-emerald-700 hover:underline font-bold"
                          >
                            {c.phone}
                          </a>
                        </p>
                        {c.address && (
                          <p className="flex items-start gap-1.5 text-slate-500">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                            <span className="truncate">{c.address}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                      <a
                        href={`/calculator?client=${c.id}`}
                        className="font-bold text-slate-900 hover:underline text-[11px]"
                      >
                        + Buat Penawaran
                      </a>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingClient(c);
                            setIsClientModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200/50 transition"
                          title="Edit Data"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <form
                          action={async () => {
                            if (confirm(`Hapus pelanggan "${c.name}"?`)) {
                              await deleteClientAction(c.id);
                            }
                          }}
                        >
                          <button
                            type="submit"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Hapus Pelanggan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MASTER TARIF BAHAN & HPP */}
      {/* ========================================================================= */}
      {activeTab === 'rates' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden space-y-6 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-black uppercase tracking-tight text-slate-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-amber-600" />
                Tarif Acuan & HPP Modal Bengkel (Live Supabase DB)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Admin dapat mengubah harga jual dan modal HPP sendiri kapan saja tanpa bantuan programmer.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingRate(null);
                setIsRateModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Bahan / Tarif Baru</span>
            </button>
          </div>

          {/* Section A: Huruf Timbul */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-black text-indigo-700 uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              A. Huruf Timbul (Hitungan per cm tinggi/huruf)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {hurufTimbulRates.map((r) => (
                <div key={r.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between text-xs space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-900 leading-snug">{r.name}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">{r.notes}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingRate(r);
                        setIsRateModalOpen(true);
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-800"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="pt-2 border-t border-slate-200/80 flex items-baseline justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">HPP Modal:</span>
                      <span className="font-semibold text-slate-600 text-[11px]">{formatRupiah(r.costPrice)}/cm</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] uppercase font-bold text-indigo-600 block">Tarif Jual:</span>
                      <span className="font-black text-slate-900 text-sm">{formatRupiah(r.sellPrice)}/cm</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section B: Neon Box & Reklame */}
          <div className="space-y-2.5 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-black text-indigo-600 uppercase flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              B. Neon Box & Papan Reklame (Hitungan per m²)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {neonAndReklameRates.map((r) => (
                <div key={r.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between text-xs space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-900 leading-snug">{r.name}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">{r.notes}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingRate(r);
                        setIsRateModalOpen(true);
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-800"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="pt-2 border-t border-slate-200/80 flex items-baseline justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">HPP Modal:</span>
                      <span className="font-semibold text-slate-600 text-[11px]">{formatRupiah(r.costPrice)}/m²</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] uppercase font-bold text-indigo-600 block">Tarif Jual:</span>
                      <span className="font-black text-slate-900 text-sm">{formatRupiah(r.sellPrice)}/m²</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section C: Background Fasad & Papan (Add-on) */}
          <div className="space-y-2.5 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-black text-emerald-700 uppercase flex items-center gap-1.5">
              <Construction className="w-3.5 h-3.5" />
              C. Background Fasad & Papan Reklame (Hitungan per m²)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {fasadRates.map((r) => (
                <div key={r.id} className="p-3.5 rounded-xl border border-slate-200 bg-emerald-50/30 flex flex-col justify-between text-xs space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-900 leading-snug">{r.name}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">{r.notes}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingRate(r);
                        setIsRateModalOpen(true);
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-800"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="pt-2 border-t border-slate-200/80 flex items-baseline justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">HPP Modal:</span>
                      <span className="font-semibold text-slate-600 text-[11px]">{formatRupiah(r.costPrice)}/{r.unit}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] uppercase font-bold text-emerald-700 block">Tarif Jual:</span>
                      <span className="font-black text-slate-900 text-sm">{formatRupiah(r.sellPrice)}/{r.unit}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section D: Tiang & Pondasi */}
          <div className="space-y-2.5 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-black text-blue-700 uppercase flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              D. Konstruksi Tiang Pipa & Pondasi Cor
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {tiangRates.map((r) => (
                <div key={r.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between text-xs space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-900 leading-snug">{r.name}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">{r.notes}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingRate(r);
                        setIsRateModalOpen(true);
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-800"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="pt-2 border-t border-slate-200/80 flex items-baseline justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">HPP Modal:</span>
                      <span className="font-semibold text-slate-600 text-[11px]">{formatRupiah(r.costPrice)}/{r.unit}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] uppercase font-bold text-blue-700 block">Tarif Jual:</span>
                      <span className="font-black text-slate-900 text-sm">{formatRupiah(r.sellPrice)}/{r.unit}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section E: Operasional Lapangan & Logo */}
          <div className="space-y-2.5 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-black text-amber-700 uppercase flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5" />
              E. Operasional Khusus Lapangan & Logo 3D
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {[...operasionalRates, ...logoRates].map((r) => (
                <div key={r.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between text-xs space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 inline-block mb-1">
                        {r.category === 'operasional' ? 'Jasa Operasional' : 'Logo 3D'}
                      </span>
                      <h4 className="font-bold text-slate-900 leading-snug">{r.name}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">{r.notes}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingRate(r);
                        setIsRateModalOpen(true);
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-800"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="pt-2 border-t border-slate-200/80 flex items-baseline justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">HPP Modal:</span>
                      <span className="font-semibold text-slate-600 text-[11px]">{formatRupiah(r.costPrice)}/{r.unit}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] uppercase font-bold text-amber-700 block">Tarif Jual:</span>
                      <span className="font-black text-slate-900 text-sm">{formatRupiah(r.sellPrice)}/{r.unit}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MASTER TIM TEKNISI LAPANGAN (NEW) */}
      {/* ========================================================================= */}
      {activeTab === 'teams' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden space-y-4 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-black uppercase tracking-tight text-slate-900 flex items-center gap-2">
                <HardHat className="w-4 h-4 text-amber-600" />
                Direktori Personil & Tim Teknisi Lapangan Salsabilla
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Data teknisi ini terhubung langsung ke modal penugasan jadwal pemasangan dan broadcast WhatsApp operasional.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingTeamMember(null);
                setIsTeamModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Personil</span>
            </button>
          </div>

          {initialTeamMembers.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Belum ada data teknisi terdaftar. Klik tombol Tambah Personil di atas.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {initialTeamMembers.map((m) => {
                const cleanPhone = m.phone ? m.phone.replace(/[^0-9]/g, '') : '';
                const waNumber = cleanPhone.startsWith('0') ? '62' + cleanPhone.substring(1) : cleanPhone;
                const roleConfig = ROLE_LABELS[m.role] || { label: m.role, badge: 'bg-slate-100 text-slate-700 border-slate-200' };

                return (
                  <div key={m.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between text-xs space-y-3">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-sm">{m.name}</h3>
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border mt-1 ${roleConfig.badge}`}>
                            {roleConfig.label}
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          m.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-200 text-slate-600'
                        }`}>
                          {m.status === 'ACTIVE' ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </div>

                      <p className="text-slate-600 text-[11px] mt-2 leading-relaxed">
                        {m.notes || 'Personil teknisi lapangan Salsabilla'}
                      </p>

                      <div className="mt-2 pt-2 border-t border-slate-200/80">
                        <a
                          href={`https://wa.me/${waNumber}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-emerald-700 hover:underline font-bold flex items-center gap-1 text-[11px]"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{m.phone}</span>
                        </a>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                      <form action={async () => { await toggleTeamMemberStatusAction(m.id); }}>
                        <button
                          type="submit"
                          className="text-[10px] font-bold text-slate-600 hover:text-slate-900 underline cursor-pointer"
                        >
                          {m.status === 'ACTIVE' ? 'Set Nonaktif' : 'Set Aktif'}
                        </button>
                      </form>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingTeamMember(m);
                            setIsTeamModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200/50 transition cursor-pointer"
                          title="Edit Personil"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <form
                          action={async () => {
                            if (confirm(`Hapus personil "${m.name}"?`)) {
                              await deleteTeamMemberAction(m.id);
                            }
                          }}
                        >
                          <button
                            type="submit"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Hapus Personil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: MASTER CABANG & REKENING BANK */}
      {/* ========================================================================= */}
      {activeTab === 'branches' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden p-4 sm:p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-black uppercase tracking-tight text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              Konfigurasi 3 Kantor Cabang Resmi Salsabilla
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Alamat ini terhubung langsung ke kop surat, surat jalan, dan pesan WhatsApp sesuai cabang terpilih.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {branches.map((b) => (
              <div key={b.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between text-xs space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-extrabold text-slate-900 text-sm">{b.name}</h3>
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-100 text-slate-700 border border-slate-200">
                      {b.code}
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-[11px] mt-1">{b.address}</p>

                  <div className="mt-3 pt-2 border-t border-slate-200 space-y-1 text-[11px]">
                    <p><span className="text-slate-500">Phone/WA:</span> <strong className="text-slate-800">{b.whatsapp}</strong></p>
                    <p><span className="text-slate-500">Rekening:</span> <strong className="text-slate-800">{b.bankName} {b.bankAccount}</strong> a.n <strong className="text-slate-800">{b.bankAccountName}</strong></p>
                    <p><span className="text-slate-500">PIC Penandatangan:</span> <strong className="text-slate-800">{b.signerName}</strong></p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: MASTER AKUN STAF */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden p-4 sm:p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-black uppercase tracking-tight text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              Daftar Staf & Otoritas Sensor Keuangan
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {initialUsers.map((u) => (
              <div key={u.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between text-xs space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-900">{u.name}</h4>
                    <p className="text-slate-500 font-mono text-[11px]">User: {u.username}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                    u.role === 'admin' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {u.role === 'admin' ? 'Owner / Admin' : 'Teknisi Bengkel'}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200/80 text-[11px]">
                  {u.role === 'admin' ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Akses Penuh (HPP, Margin, Quotation, Invoice)
                    </span>
                  ) : (
                    <span className="text-slate-500">🔒 Nominal Harga Disensor (Hanya lihat SPK)</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL EDIT / TAMBAH MATERIAL RATE */}
      {/* ========================================================================= */}
      {isRateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-sm uppercase">
                {editingRate ? 'Edit Tarif Acuan Bahan' : 'Tambah Bahan Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setIsRateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              action={async (formData) => {
                if (editingRate) {
                  await updateMaterialRateAction(editingRate.id, formData);
                } else {
                  await createMaterialRateAction(formData);
                }
                setIsRateModalOpen(false);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Bahan / Item</label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={editingRate?.name || ''}
                  placeholder="Contoh: ACP Seven 3mm PVDF"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori</label>
                  <select
                    name="category"
                    defaultValue={editingRate?.category || 'huruf_timbul'}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 font-bold text-slate-900"
                  >
                    <option value="huruf_timbul">Huruf Timbul</option>
                    <option value="neon_box">Neon Box</option>
                    <option value="reklame">Papan Reklame</option>
                    <option value="fasad">Background Fasad</option>
                    <option value="tiang">Tiang / Pondasi</option>
                    <option value="operasional">Jasa Operasional</option>
                    <option value="logo">Logo 3D</option>
                    <option value="aksesoris">Aksesoris / LED / Trafo</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Satuan Hitung</label>
                  <select
                    name="unit"
                    defaultValue={editingRate?.unit || 'cm'}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 font-bold text-slate-900"
                  >
                    <option value="cm">Per cm (Huruf)</option>
                    <option value="m2">Per m² (Luas)</option>
                    <option value="m">Per meter (Tiang)</option>
                    <option value="pcs">Per pcs (Unit)</option>
                    <option value="titik">Per titik (Pondasi)</option>
                    <option value="set/hari">Per set/hari (Steger)</option>
                    <option value="lot">Per lot (Bongkar)</option>
                    <option value="cm2">Per cm² (Logo)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">HPP Modal (Rp)</label>
                  <input
                    type="number"
                    name="costPrice"
                    required
                    defaultValue={editingRate?.costPrice || 0}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tarif Jual Acuan (Rp)</label>
                  <input
                    type="number"
                    name="sellPrice"
                    required
                    defaultValue={editingRate?.sellPrice || 0}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-indigo-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Keterangan Spesifikasi</label>
                <input
                  type="text"
                  name="notes"
                  defaultValue={editingRate?.notes || ''}
                  placeholder="Catatan teknis bahan"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRateModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  Simpan Tarif
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL EDIT / TAMBAH PELANGGAN */}
      {/* ========================================================================= */}
      {isClientModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-sm uppercase">
                {editingClient ? 'Edit Data Pelanggan' : 'Tambah Pelanggan Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setIsClientModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              action={async (formData) => {
                if (editingClient) {
                  await updateClientAction(editingClient.id, formData);
                } else {
                  await createClientAction(formData);
                }
                setIsClientModalOpen(false);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Usaha / Toko / Klien</label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={editingClient?.name || ''}
                  placeholder="Contoh: Kopi Kenangan"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama PIC Kontak</label>
                  <input
                    type="text"
                    name="picName"
                    defaultValue={editingClient?.picName || ''}
                    placeholder="Contoh: Bu Bella"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">No. WhatsApp</label>
                  <input
                    type="text"
                    name="phone"
                    required
                    defaultValue={editingClient?.phone || ''}
                    placeholder="081299887766"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Alamat Kantor / Pasang</label>
                <input
                  type="text"
                  name="address"
                  defaultValue={editingClient?.address || ''}
                  placeholder="Alamat lengkap lokasi pasang"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsClientModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-xs cursor-pointer"
                >
                  Simpan Pelanggan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL EDIT / TAMBAH TIM MEMBER */}
      {/* ========================================================================= */}
      {isTeamModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-sm uppercase">
                {editingTeamMember ? 'Edit Data Personil Teknisi' : 'Tambah Personil Lapangan Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setIsTeamModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              action={async (formData) => {
                if (editingTeamMember) {
                  await updateTeamMemberAction(editingTeamMember.id, formData);
                } else {
                  await createTeamMemberAction(formData);
                }
                setIsTeamModalOpen(false);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap / Panggilan</label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={editingTeamMember?.name || ''}
                  placeholder="Contoh: Kang Asep / Pak Joko"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Peran / Role</label>
                  <select
                    name="role"
                    defaultValue={editingTeamMember?.role || 'TECHNICIAN'}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 font-bold text-slate-900"
                  >
                    <option value="LEAD_INSTALLER">Lead Installer (PJ)</option>
                    <option value="TECHNICIAN">Teknisi Signage & LED</option>
                    <option value="DRIVER">Driver & Logistik</option>
                    <option value="WELDER">Tukang Las & Besi</option>
                    <option value="HELPER">Helper Lapangan</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nomor WhatsApp</label>
                  <input
                    type="text"
                    name="phone"
                    required
                    defaultValue={editingTeamMember?.phone || ''}
                    placeholder="081234567890"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan Keahlian / Armada</label>
                <input
                  type="text"
                  name="notes"
                  defaultValue={editingTeamMember?.notes || ''}
                  placeholder="Contoh: Driver pikap B 9147 TPA / Ahli kelistrikan high volt"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                />
              </div>

              {editingTeamMember && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Keaktifan</label>
                  <select
                    name="status"
                    defaultValue={editingTeamMember?.status || 'ACTIVE'}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 font-bold text-slate-900"
                  >
                    <option value="ACTIVE">Aktif (Bisa Ditugaskan)</option>
                    <option value="INACTIVE">Nonaktif (Cuti / Keluar)</option>
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTeamModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-xs cursor-pointer"
                >
                  Simpan Personil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
