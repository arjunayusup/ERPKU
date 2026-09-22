'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  Edit3,
  Loader2,
  AlertTriangle, 
  Calendar, 
  Zap, 
  X,
  HardHat,
  Wrench,
  ShieldCheck,
  CheckSquare
} from 'lucide-react';
import { 
  deleteQuotationAction, 
  restoreQuotationAction, 
  hardDeleteQuotationAction, 
  emptyTrashAction 
} from '@/app/actions/quotation';
import { updateProjectStatusAction, upsertInstallationScheduleAction } from '@/app/actions/project';
import { getRecommendedToolsForProject, ToolItem } from '@/lib/tools-checklist';

interface ProjectsClientListProps {
  initialProjects: any[];
  isAdmin: boolean;
  teamMembers?: any[];
}

export default function ProjectsClientList({
  initialProjects,
  isAdmin,
  teamMembers = [],
}: ProjectsClientListProps) {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>(initialProjects);
  const [activeTab, setActiveTab] = useState<'active' | 'trash'>('active');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  // Quick Action Modal States (Status & Schedule)
  const [schedulingProject, setSchedulingProject] = useState<any | null>(null);
  const [updatingStatusProject, setUpdatingStatusProject] = useState<any | null>(null);
  const [modalSelectedStatus, setModalSelectedStatus] = useState('in_production');
  const [modalDate, setModalDate] = useState(new Date().toISOString().split('T')[0]);
  const [modalTimeSlot, setModalTimeSlot] = useState('09:00 - 14:00 (Pagi-Siang)');
  const [modalLeadId, setModalLeadId] = useState('');
  const [modalSelectedTechIds, setModalSelectedTechIds] = useState<string[]>([]);
  const [modalDriverId, setModalDriverId] = useState('');
  const [modalArmadaPlate, setModalArmadaPlate] = useState('Pikap Gran Max B 9147 TPA');
  const [modalTools, setModalTools] = useState<ToolItem[]>([]);

  const openScheduleModal = (p: any) => {
    setSchedulingProject(p);
    const existing = p.installations?.[0];
    setModalDate(existing?.date || new Date().toISOString().split('T')[0]);
    setModalTimeSlot(existing?.timeSlot || '09:00 - 14:00 (Pagi-Siang)');

    // Parse tools or generate smart recommendations
    let tools: ToolItem[] = [];
    if (existing?.toolsChecklist) {
      try {
        const parsed = JSON.parse(existing.toolsChecklist);
        if (Array.isArray(parsed) && parsed.length > 0) {
          tools = parsed.map((item: any) => ({
            name: item.name || item.item || String(item),
            category: item.category || 'konstruksi',
            checked: item.checked !== false,
            isMandatory: item.isMandatory || false,
            reason: item.reason || '',
          }));
        }
      } catch {}
    }
    if (tools.length === 0) {
      tools = getRecommendedToolsForProject(p.items || []);
    }
    setModalTools(tools);

    // Parse assigned members or pick defaults
    const leads = teamMembers.filter((m) => m.role === 'LEAD_INSTALLER');
    const defaultLead = leads[0]?.id || teamMembers[0]?.id || '';
    const drivers = teamMembers.filter((m) => m.role === 'DRIVER');
    const defaultDriver = drivers[0]?.id || '';

    setModalLeadId(defaultLead);
    setModalDriverId(defaultDriver);
    const technicians = teamMembers.filter((m) => m.role === 'TECHNICIAN' || m.role === 'WELDER' || m.role === 'HELPER');
    setModalSelectedTechIds(technicians.slice(0, 2).map((t) => t.id));
  };

  const openStatusModal = (p: any) => {
    setUpdatingStatusProject(p);
    setModalSelectedStatus(p.status || 'in_production');
  };

  const handleSaveModalStatus = async () => {
    if (!updatingStatusProject) return;
    setIsProcessing('modal_status');
    const res = await updateProjectStatusAction(updatingStatusProject.id, modalSelectedStatus);
    setIsProcessing(null);
    if (res.success) {
      setProjects((prev) =>
        prev.map((p) => (p.id === updatingStatusProject.id ? { ...p, status: modalSelectedStatus } : p))
      );
      setUpdatingStatusProject(null);
      router.refresh();
    } else {
      alert(res.error || 'Gagal mengubah status.');
    }
  };

  const handleSaveModalSchedule = async () => {
    if (!schedulingProject) return;
    setIsProcessing('modal_schedule');

    const leadObj = teamMembers.find((m) => m.id === modalLeadId);
    const driverObj = teamMembers.find((m) => m.id === modalDriverId);
    const techObjs = teamMembers.filter((m) => modalSelectedTechIds.includes(m.id));

    const assigned = [
      ...(leadObj ? [{ id: leadObj.id, name: leadObj.name, role: 'LEAD_INSTALLER', phone: leadObj.phone }] : []),
      ...techObjs.map((t) => ({ id: t.id, name: t.name, role: t.role, phone: t.phone })),
      ...(driverObj ? [{ id: driverObj.id, name: driverObj.name, role: 'DRIVER', phone: driverObj.phone }] : []),
    ];

    const teamSummaryParts: string[] = [];
    if (leadObj) teamSummaryParts.push(`${leadObj.name} (Lead)`);
    if (techObjs.length > 0) teamSummaryParts.push(techObjs.map((t) => t.name).join(', '));
    if (driverObj) teamSummaryParts.push(`Driver: ${driverObj.name}`);
    const teamSummary = teamSummaryParts.join(' + ') || 'Tim Lapangan Salsabilla';
    const finalTeamName = `${teamSummary} - ${modalArmadaPlate}`;

    const res = await upsertInstallationScheduleAction({
      projectId: schedulingProject.id,
      date: modalDate,
      timeSlot: modalTimeSlot,
      teamName: finalTeamName,
      assignedMembers: assigned,
      toolsChecklist: modalTools,
    });
    setIsProcessing(null);
    if (res.success) {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === schedulingProject.id
            ? {
                ...p,
                status: p.status === 'draft' || p.status === 'in_production' ? 'ready_install' : p.status,
                installations: [{ 
                  date: modalDate, 
                  timeSlot: modalTimeSlot, 
                  teamName: finalTeamName,
                  toolsChecklist: JSON.stringify(modalTools),
                  assignedMembers: JSON.stringify(assigned),
                }],
              }
            : p
        )
      );
      setSchedulingProject(null);
      router.refresh();
    } else {
      alert(res.error || 'Gagal menyimpan jadwal.');
    }
  };


  useEffect(() => {
    setProjects(initialProjects);
  }, [initialProjects]);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  // 1. Soft Delete (Pindah ke Sampah)
  const handleSoftDelete = async (id: string, projectNumber: string) => {
    if (!confirm(`Pindahkan penawaran ${projectNumber} ke tempat sampah?`)) return;
    setIsProcessing(id);
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, deletedAt: new Date().toISOString() } : p)));
    const res = await deleteQuotationAction(id);
    setIsProcessing(null);
    if (!res.success) {
      alert(res.error || 'Gagal memindahkan penawaran ke tempat sampah.');
    }
    router.refresh();
  };

  // 2. Restore (Pulihkan dari Sampah)
  const handleRestore = async (id: string) => {
    setIsProcessing(id);
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, deletedAt: null } : p)));
    const res = await restoreQuotationAction(id);
    setIsProcessing(null);
    if (!res.success) {
      alert(res.error || 'Gagal memulihkan proyek.');
    }
    router.refresh();
  };

  // 3. Hard Delete (Hapus Permanen dari Database)
  const handleHardDelete = async (id: string, projectNumber: string, title: string) => {
    const confirmed = confirm(
      `⚠️ PERINGATAN HAPUS PERMANEN!\n\nProyek "${projectNumber} - ${title}" akan DIHAPUS BENERAN dari database beserta seluruh item reklame, pengeluaran & jadwal pasangnya.\n\nData yang dihapus TIDAK BISA DIKEMBALIKAN LAGI.\n\nApakah Anda yakin ingin menghapus permanen?`
    );
    if (!confirmed) return;

    setIsProcessing(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    const res = await hardDeleteQuotationAction(id);
    setIsProcessing(null);
    if (!res.success) {
      alert(res.error || 'Gagal menghapus proyek secara permanen.');
    }
    router.refresh();
  };

  // 4. Empty Trash (Kosongkan Semua Data Sampah)
  const handleEmptyTrash = async () => {
    if (trashCount === 0) return;
    const confirmed = confirm(
      `⚠️ PERINGATAN KOSONGKAN TEMPAT SAMPAH!\n\nSeluruh ${trashCount} proyek di tempat sampah akan DIHAPUS PERMANEN secara total dari database.\n\nSemua data item reklame dan riwayatnya akan hilang selamanya dan TIDAK BISA DIKEMBALIKAN.\n\nApakah Anda yakin ingin mengosongkan tempat sampah?`
    );
    if (!confirmed) return;

    setIsProcessing('empty_trash');
    setProjects((prev) => prev.filter((p) => p.deletedAt === null));
    const res = await emptyTrashAction();
    setIsProcessing(null);
    if (!res.success) {
      alert(res.error || 'Gagal mengosongkan tempat sampah.');
    }
    router.refresh();
  };

  // Filter projects by tab, branch, and search query
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
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
  }, [projects, activeTab, selectedBranch, searchQuery]);

  const activeCount = projects.filter((p) => p.deletedAt === null).length;
  const trashCount = projects.filter((p) => p.deletedAt !== null).length;

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

        {/* Right Controls: Branch Filter, Search & Kosongkan Sampah */}
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

          {/* Tombol Kosongkan Sampah (Muncul khusus saat di tab Sampah jika ada isinya) */}
          {activeTab === 'trash' && trashCount > 0 && isAdmin && (
            <button
              type="button"
              onClick={handleEmptyTrash}
              disabled={isProcessing === 'empty_trash'}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs disabled:opacity-50"
              title="Hapus seluruh proyek di sampah secara permanen"
            >
              {isProcessing === 'empty_trash' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              <span>Kosongkan Sampah ({trashCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* No Results Fallback */}
      {filteredProjects.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-xs">
          <FolderKanban className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="font-bold text-slate-600">
            {activeTab === 'trash'
              ? 'Tempat sampah kosong. Tidak ada proyek yang terhapus.'
              : 'Tidak ada data penawaran yang sesuai.'}
          </p>
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
                      <button
                        type="button"
                        onClick={() => openStatusModal(p)}
                        className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                        title="Update Status Progres"
                      >
                        <Zap className="w-3 h-3 text-amber-600" />
                        <span>Status</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => openScheduleModal(p)}
                        className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                        title="Atur Jadwal Pemasangan"
                      >
                        <Calendar className="w-3 h-3 text-indigo-600" />
                        <span>Jadwal</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isAdmin && (
                        <a
                          href={`/calculator?edit=${p.id}`}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-bold flex items-center gap-1"
                          title="Edit Penawaran"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <a
                        href={`/projects/${p.id}`}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center gap-1"
                      >
                        <span>Detail</span>
                        <ArrowRight className="w-3 h-3" />
                      </a>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => handleSoftDelete(p.id, p.projectNumber)}
                          disabled={isProcessing === p.id}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer disabled:opacity-50"
                          title="Pindahkan ke Tempat Sampah"
                        >
                          {isProcessing === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1">
                    <span className="text-[11px] text-slate-400 italic flex items-center gap-1">
                      <Trash2 className="w-3 h-3 text-slate-400" /> Terhapus di tempat sampah
                    </span>
                    <div className="flex items-center gap-1.5 justify-end">
                      <button
                        type="button"
                        onClick={() => handleRestore(p.id)}
                        disabled={isProcessing === p.id}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition cursor-pointer disabled:opacity-50"
                      >
                        {isProcessing === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                        <span>Pulihkan</span>
                      </button>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => handleHardDelete(p.id, p.projectNumber, p.title)}
                          disabled={isProcessing === p.id}
                          className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1 transition cursor-pointer disabled:opacity-50"
                          title="Hapus Permanen dari Database"
                        >
                          {isProcessing === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                          <span>Hapus Permanen</span>
                        </button>
                      )}
                    </div>
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
                <th className="px-5 py-3.5 min-w-[300px] max-w-[450px]">Nomor & Proyek</th>
                <th className="px-5 py-3.5 min-w-[300px] max-w-[450px]">Klien & Lokasi</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Cabang</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Status</th>
                {isAdmin && <th className="px-4 py-3.5 whitespace-nowrap">Total Deal</th>}
                {isAdmin && <th className="px-4 py-3.5 whitespace-nowrap">Laba Bersih</th>}
                <th className="px-5 py-3.5 whitespace-nowrap text-right">Aksi & Dokumen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProjects.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition">
                  <td className="px-5 py-4 min-w-[300px] max-w-[450px] break-words">
                    <div className="font-mono text-xs font-black text-indigo-700">{p.projectNumber}</div>
                    <div className="font-bold text-slate-900 text-sm mt-0.5 leading-snug break-words">{p.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{p.items?.length || 0} Item Reklame</div>
                  </td>
                  <td className="px-5 py-4 min-w-[300px] max-w-[450px] break-words">
                    <div className="font-bold text-slate-900">{p.clientName}</div>
                    <div className="text-slate-500 text-[11px]">{p.clientPhone}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 break-words line-clamp-2">{p.installationAddress || '-'}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 rounded-md font-bold text-[10px] bg-slate-100 text-slate-700 uppercase">
                      {p.branch || 'jakarta'}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      p.status === 'ready_install' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      p.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {p.status === 'ready_install' ? 'Siap Pasang' : p.status === 'completed' ? 'Lunas' : 'Pabrikasi'}
                    </span>
                  </td>
                  {isAdmin ? (
                    <td className="px-4 py-4 whitespace-nowrap font-black text-slate-900">{formatRupiah(p.totalDeal)}</td>
                  ) : (
                    <td className="px-4 py-4 whitespace-nowrap text-slate-400 text-[11px]"><EyeOff className="w-3.5 h-3.5 inline mr-1" /> Disensor</td>
                  )}
                  {isAdmin ? (
                    <td className="px-4 py-4 whitespace-nowrap font-black text-emerald-600">+{formatRupiah(p.realProfit)}</td>
                  ) : (
                    <td className="px-4 py-4 whitespace-nowrap text-slate-400 text-[11px]"><EyeOff className="w-3.5 h-3.5 inline mr-1" /> Disensor</td>
                  )}
                  <td className="px-5 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1.5">

                      {activeTab === 'active' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => openStatusModal(p)}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                            title="Update Status Progres"
                          >
                            <Zap className="w-3.5 h-3.5 text-amber-600" />
                            <span>Status</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => openScheduleModal(p)}
                            className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                            title="Atur Jadwal Pemasangan"
                          >
                            <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Jadwal</span>
                          </button>

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
                              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition"
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
                              onClick={() => handleSoftDelete(p.id, p.projectNumber)}
                              disabled={isProcessing === p.id}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer disabled:opacity-50"
                              title="Pindahkan ke Tempat Sampah"
                            >
                              {isProcessing === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            </button>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleRestore(p.id)}
                            disabled={isProcessing === p.id}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition cursor-pointer disabled:opacity-50"
                            title="Pulihkan ke Proyek Aktif"
                          >
                            {isProcessing === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                            <span>Pulihkan</span>
                          </button>
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => handleHardDelete(p.id, p.projectNumber, p.title)}
                              disabled={isProcessing === p.id}
                              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1 transition cursor-pointer disabled:opacity-50"
                              title="Hapus Permanen Dari Database"
                            >
                              {isProcessing === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                              <span>Hapus Permanen</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: UPDATE STATUS CEPAT */}
      {updatingStatusProject && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono text-slate-400 font-bold">{updatingStatusProject.projectNumber}</span>
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Update Status Progres</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setUpdatingStatusProject(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { key: 'draft', label: 'Penawaran', desc: 'Draft penawaran klien' },
                { key: 'in_production', label: 'Pabrikasi Bengkel', desc: 'Pengerjaan frame, huruf & lampu di workshop' },
                { key: 'ready_install', label: 'Siap Pasang', desc: 'Produk sudah selesai QC & siap diberangkatkan' },
                { key: 'installing', label: 'Pemasangan Lapangan', desc: 'Tim sedang pasang di lokasi klien' },
                { key: 'completed', label: 'Selesai & Lunas', desc: 'Pekerjaan beres, serah terima BAST & pelunasan' },
              ].map((st) => (
                <label
                  key={st.key}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                    modalSelectedStatus === st.key
                      ? 'bg-amber-50 border-amber-400 font-bold text-amber-950'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="status_choice"
                      value={st.key}
                      checked={modalSelectedStatus === st.key}
                      onChange={(e) => setModalSelectedStatus(e.target.value)}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <div>
                      <div>{st.label}</div>
                      <div className="text-[10px] text-slate-500 font-normal">{st.desc}</div>
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => setUpdatingStatusProject(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveModalStatus}
                disabled={isProcessing === 'modal_status'}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition flex items-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                {isProcessing === 'modal_status' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Simpan Status</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ATUR JADWAL CEPAT DENGAN MASTER KARYAWAN & CHECKLIST K3 */}
      {schedulingProject && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-6 space-y-4 shadow-2xl border border-slate-200 my-8">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono text-indigo-700 font-black">{schedulingProject.projectNumber}</span>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span>Atur Jadwal Pemasangan & Penugasan Tim</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSchedulingProject(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs max-h-[70vh] overflow-y-auto pr-1">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 space-y-0.5">
                <span className="font-bold text-slate-900 block text-xs">{schedulingProject.title}</span>
                <span className="text-[11px] text-slate-500 block">
                  Klien: <strong>{schedulingProject.clientName}</strong> ({schedulingProject.clientPhone})
                </span>
                <span className="text-[11px] text-slate-500 block truncate">
                  Lokasi: {schedulingProject.installationAddress || 'Konfirmasi dengan kantor'}
                </span>
              </div>

              {/* Tanggal & Slot Waktu */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal Pasang Lapangan:</label>
                  <input
                    type="date"
                    value={modalDate}
                    onChange={(e) => setModalDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Slot Waktu:</label>
                  <select
                    value={modalTimeSlot}
                    onChange={(e) => setModalTimeSlot(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900 cursor-pointer"
                  >
                    <option value="09:00 - 14:00 (Pagi-Siang)">09:00 - 14:00 WIB (Pagi - Siang)</option>
                    <option value="13:00 - 18:00 (Siang-Sore)">13:00 - 18:00 WIB (Siang - Sore)</option>
                    <option value="21:00 - 04:00 (Malam Mall/Ruko)">21:00 - 04:00 WIB (Malam Mall / Ruko)</option>
                    <option value="Full Day (09:00 - Selesai)">Full Day (Konstruksi Besar / Tiang Pylon)</option>
                  </select>
                </div>
              </div>

              {/* PENUGASAN PERSONIL BERBASIS MASTER KARYAWAN */}
              <div className="p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-200 space-y-3">
                <span className="font-bold text-xs text-indigo-950 flex items-center gap-1.5">
                  <HardHat className="w-4 h-4 text-indigo-700" />
                  Penugasan Tim Lapangan (Dari Master Karyawan)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Lead Installer (Penanggung Jawab):</label>
                    <select
                      value={modalLeadId}
                      onChange={(e) => setModalLeadId(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900 cursor-pointer"
                    >
                      {teamMembers.length === 0 && <option value="">Belum ada personil di master data</option>}
                      {teamMembers.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.role === 'LEAD_INSTALLER' ? 'Lead' : m.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Driver & Logistik Armada:</label>
                    <select
                      value={modalDriverId}
                      onChange={(e) => setModalDriverId(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900 cursor-pointer"
                    >
                      {teamMembers.length === 0 && <option value="">Belum ada personil di master data</option>}
                      {teamMembers.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.role})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pilih Anggota Teknisi Tambahan:</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 p-2 bg-white rounded-xl border border-slate-200">
                    {teamMembers.filter((m) => m.id !== modalLeadId).map((m) => {
                      const isChecked = modalSelectedTechIds.includes(m.id);
                      return (
                        <label key={m.id} className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs cursor-pointer hover:bg-slate-100">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) setModalSelectedTechIds([...modalSelectedTechIds, m.id]);
                              else setModalSelectedTechIds(modalSelectedTechIds.filter((id) => id !== m.id));
                            }}
                            className="rounded text-indigo-600 w-3.5 h-3.5"
                          />
                          <span className="truncate font-medium text-slate-800">{m.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Armada Pikap / Plat Nomor:</label>
                  <input
                    type="text"
                    value={modalArmadaPlate}
                    onChange={(e) => setModalArmadaPlate(e.target.value)}
                    placeholder="Contoh: Pikap Gran Max B 9147 TPA"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                  />
                </div>
              </div>

              {/* CHECKLIST K3 & ALAT KERJA CERDAS */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-amber-600" />
                    <span>Checklist Kesiapan Alat Kerja & Standar APD:</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">Rekomendasi otomatis</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  {modalTools.map((t, idx) => (
                    <label
                      key={idx}
                      className={`flex items-start gap-2 p-2 rounded-lg border text-xs cursor-pointer transition ${
                        t.checked ? 'bg-white border-slate-300' : 'bg-slate-100/60 border-slate-200 opacity-60'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={t.checked}
                        onChange={(e) => {
                          const updated = [...modalTools];
                          updated[idx].checked = e.target.checked;
                          setModalTools(updated);
                        }}
                        className="rounded text-indigo-600 w-3.5 h-3.5 mt-0.5 shrink-0"
                      />
                      <div className="leading-tight">
                        <span className="font-bold text-slate-900 block">{t.name}</span>
                        {t.reason && <span className="text-[10px] text-amber-700 font-medium block mt-0.5">{t.reason}</span>}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => setSchedulingProject(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveModalSchedule}
                disabled={isProcessing === 'modal_schedule'}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {isProcessing === 'modal_schedule' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Simpan Jadwal & Tugaskan Tim</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


