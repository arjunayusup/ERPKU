'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, ArrowUpRight, FolderKanban } from 'lucide-react';
import { getProjectStatusBadge } from '@/app/(dashboard)/projects/ProjectsClientList';

interface DashboardRecentProjectsProps {
  initialProjects: any[];
  isAdmin: boolean;
}

export default function DashboardRecentProjects({
  initialProjects,
  isAdmin,
}: DashboardRecentProjectsProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return initialProjects;
    const query = searchQuery.toLowerCase();
    return initialProjects.filter(
      (p) =>
        p.title?.toLowerCase().includes(query) ||
        p.projectNumber?.toLowerCase().includes(query) ||
        p.clientName?.toLowerCase().includes(query)
    );
  }, [initialProjects, searchQuery]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Table Header with Title & Search Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
            Pekerjaan Reklame Terbaru
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pesanan dan status pengerjaan bengkel
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari pekerjaan, klien, no..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <Link
            href="/projects"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 shrink-0 px-2.5 py-1.5 rounded-lg hover:bg-emerald-50 transition"
          >
            Lihat Semua <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-5 py-3.5">Pekerjaan Reklame & No. Proyek</th>
              <th className="px-5 py-3.5">Klien</th>
              <th className="px-5 py-3.5">Status</th>
              {isAdmin && <th className="px-5 py-3.5">Nilai Kontrak</th>}
              <th className="px-5 py-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredProjects.length === 0 ? (
              <tr>
                <td
                  colSpan={isAdmin ? 5 : 4}
                  className="px-5 py-8 text-center text-slate-400"
                >
                  <FolderKanban className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                  <p className="font-semibold">
                    {searchQuery ? 'Tidak ada pekerjaan yang cocok dengan pencarian.' : 'Belum ada data proyek.'}
                  </p>
                </td>
              </tr>
            ) : (
              filteredProjects.map((p) => {
                const badge = getProjectStatusBadge(p.status);
                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition">
                    {/* Satu Kolom: Nama di atas, Nomor di bawah dengan warna hijau success */}
                    <td className="px-5 py-3.5">
                      <div className="font-extrabold text-slate-900 text-sm leading-snug">
                        {p.title}
                      </div>
                      <div className="font-mono text-emerald-600 font-bold text-[11px] mt-0.5 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                        <span>{p.projectNumber}</span>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 font-semibold text-slate-700">
                      {p.clientName}
                    </td>

                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </td>

                    {isAdmin && (
                      <td className="px-5 py-3.5 font-extrabold text-slate-900 whitespace-nowrap">
                        {formatRupiah(p.totalDeal)}
                      </td>
                    )}

                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <Link
                        href={`/projects/${p.id}`}
                        className="inline-block text-[11px] font-bold px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition cursor-pointer"
                      >
                        Buka Rincian
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
