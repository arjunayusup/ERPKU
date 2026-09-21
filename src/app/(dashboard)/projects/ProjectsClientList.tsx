'use client';

import { useState, useMemo } from 'react';
import { 
  FolderKanban, 
  Plus, 
  FileText, 
  ArrowRight, 
  EyeOff, 
  Phone, 
  Truck, 
  CheckCircle2, 
  MessageSquare,
  Trash2,
  RotateCcw,
  Search,
  Filter,
  Edit3
} from 'lucide-react';
import { deleteQuotationAction, restoreQuotationAction } from '@/app/actions/quotation';

interface ProjectsClientListProps {
  initialProjects: any[];
  isAdmin: boolean;
}

export default function ProjectsClientList({
  initialProjects,
  isAdmin,
}: ProjectsClientListProps) {
  const [activeTab, setActiveTab] = useState<'active' | 'trash'>('active');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  // Filter projects by tab, branch, and search query
  const filteredProjects = useMemo(() => {
    return initialProjects.filter((p) => {
      // 1. Tab filter (Active vs Trash)
      const isDeleted = p.deletedAt !== null;
      if (activeTab === 'active' && isDeleted) return false;
      if (activeTab === 'trash' && !isDeleted) return false;

      // 2. Branch filter
      if (selectedBranch !== 'all' && p.branch !== selectedBranch) return false;

      // 3. Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesClient = p.clientName?.toLowerCase().includes(query);
        const matchesTitle = p.title?.toLowerCase().includes(query);
        const matchesNumber = p.projectNumber?.toLowerCase().includes(query);
        const matchesPhone = p.clientPhone?.toLowerCase().includes(query);
        if (!matchesClient && !matchesTitle && !matchesNumber && !matchesPhone) {
          return false;
        }
      }

      return true;
    });
  }, [initialProjects, activeTab, selectedBranch, searchQuery]);

  const activeCount = initialProjects.filter((p) => p.deletedAt === null).length;
  const trashCount = initialProjects.filter((p) => p.deletedAt !== null).length;

  return (
    <div className="space-y-5">
      {/* Filter & Action Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        {/* Active vs Trash Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('active')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeTab === 'active'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Proyek Aktif ({activeCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('trash')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 ${
              activeTab === 'trash'
                ? 'bg-white text-rose-700 shadow-xs'
                : 'text-slate-500 hover:text-rose-600'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Sampah ({trashCount})</span>
          </button>
        </div>

        {/* Branch Filter & Search Input */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Branch Filter */}
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 font-bold text-slate-700 focus:outline-none"
          >
            <option value="all">Semua Cabang</option>
            <option value="jakarta">Jakarta</option>
            <option value="bandung">Bandung</option>
            <option value="tangerang">Tangerang</option>
          </select>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari klien / nomor..."
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>
      </div>

      {/* No Results Fallback */}
      {filteredProjects.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-xs">
          <FolderKanban className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="font-bold text-slate-600">Tidak ada data penawaran yang sesuai.</p>
        </div>
      )}

      {/* MOBILE CARD VIEW (< md screen) */}
      <div className="md:hidden space-y-3">
        {filteredProjects.map((p) => {
          const cleanPhone = p.clientPhone ? p.clientPhone.replace(/[^0-9]/g, '') : '';
          const waNumber = cleanPhone.startsWith('0') ? '62' + cleanPhone.substring(1) : cleanPhone;

          return (
            <div key={p.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
              {/* Card Header: Project Number + Status */}
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-black text-rose-600">{p.projectNumber}</span>
                    <span className="px-2 py-0.2 rounded font-bold text-[9px] bg-slate-100 text-slate-600 uppercase">
                      {p.branch || 'jakarta'}
                    </span>
                  </div>
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
                  {cleanPhone && (
                    <a
                      href={`https://wa.me/${waNumber}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>WA</span>
                    </a>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 truncate">{p.installationAddress || 'Lokasi belum diatur'}</p>
              </div>

              {/* Financial Snapshot (Admin only) */}
              {isAdmin ? (
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Deal:</span>
                    <span className="font-black text-slate-900">{formatRupiah(p.totalDeal)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-emerald-600 block">Laba Bersih:</span>
                    <span className="font-black text-emerald-600">+{formatRupiah(p.realProfit)}</span>
                  </div>
                </div>
              ) : (
                <div className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-100 flex items-center gap-1">
                  <EyeOff className="w-3 h-3" /> Nominal harga disensor.
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
                {activeTab === 'active' ? (
                  <>
                    <div className="flex items-center gap-1.5">
                      <a
                        href={`/documents/${p.id}/quotation`}
                        target="_blank"
                        title="Surat Penawaran"
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-800 border border-slate-300 text-[11px] font-bold"
                      >
                        Quo
                      </a>
                      <a
                        href={`/documents/${p.id}/spk`}
                        target="_blank"
                        title="SPK Bengkel"
                        className="px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold"
                      >
                        SPK
                      </a>
                      <a
                        href={`/documents/${p.id}/bast`}
                        target="_blank"
                        title="BAST Serah Terima"
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold"
                      >
                        BAST
                      </a>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isAdmin && (
                        <a
                          href={`/calculator?edit=${p.id}`}
                          className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center gap-1"
                          title="Edit Penawaran"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </a>
                      )}
                      <a
                        href={`/projects/${p.id}`}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center gap-1"
                      >
                        <span>Detail</span>
                        <ArrowRight className="w-3 h-3" />
                      </a>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={async () => {
                            if (confirm(`Pindahkan penawaran ${p.projectNumber} ke tempat sampah?`)) {
                              await deleteQuotationAction(p.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Hapus Penawaran (Soft Delete)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="w-full flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 italic">Terhapus di tempat sampah</span>
                    <button
                      type="button"
                      onClick={async () => {
                        await restoreQuotationAction(p.id);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Pulihkan / Restore</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* DESKTOP TABLE VIEW (>= md screen) */}
      <div className="hidden md:block bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Nomor & Proyek</th>
                <th className="px-6 py-3.5">Klien & Lokasi</th>
                <th className="px-6 py-3.5">Cabang</th>
                <th className="px-6 py-3.5">Status</th>
                {isAdmin && <th className="px-6 py-3.5">Total Deal</th>}
                {isAdmin && <th className="px-6 py-3.5">Laba Bersih</th>}
                <th className="px-6 py-3.5 text-right">Aksi & Dokumen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProjects.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4">
                    <div className="font-mono text-xs font-black text-rose-600">{p.projectNumber}</div>
                    <div className="font-bold text-slate-900 text-sm mt-0.5">{p.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{p.items?.length || 0} Item Reklame</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{p.clientName}</div>
                    <div className="text-slate-500">{p.clientPhone}</div>
                    <div className="text-[11px] text-slate-400 truncate max-w-xs">{p.installationAddress}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-md font-bold text-[10px] bg-slate-100 text-slate-700 uppercase">
                      {p.branch || 'jakarta'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      p.status === 'ready_install' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      p.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {p.status === 'ready_install' ? 'Siap Pasang' : p.status === 'completed' ? 'Lunas' : 'Pabrikasi'}
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
                      {activeTab === 'active' ? (
                        <>
                          <a
                            href={`/documents/${p.id}/quotation`}
                            target="_blank"
                            title="Lihat Surat Penawaran"
                            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                          >
                            <FileText className="w-4 h-4" />
                          </a>
                          {isAdmin && (
                            <a
                              href={`/calculator?edit=${p.id}`}
                              title="Edit Penawaran Proyek"
                              className="p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition"
                            >
                              <Edit3 className="w-4 h-4" />
                            </a>
                          )}
                          <a
                            href={`/projects/${p.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
                          >
                            <span>Detail</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </a>
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={async () => {
                                if (confirm(`Pindahkan penawaran ${p.projectNumber} ke tempat sampah?`)) {
                                  await deleteQuotationAction(p.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                              title="Hapus (Soft Delete)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={async () => {
                            await restoreQuotationAction(p.id);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Pulihkan</span>
                        </button>
                      )}
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
