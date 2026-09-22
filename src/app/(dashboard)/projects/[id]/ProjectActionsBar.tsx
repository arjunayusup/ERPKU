'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Calendar, 
  Clock, 
  Truck, 
  FileText, 
  CheckCircle2, 
  Edit3, 
  Printer, 
  CreditCard, 
  Zap, 
  MessageSquare, 
  Loader2, 
  X,
  Hammer,
  Building2,
  Phone
} from 'lucide-react';
import { updateProjectStatusAction, upsertInstallationScheduleAction } from '@/app/actions/project';
import { toast } from 'sonner';

interface ProjectActionsBarProps {
  project: {
    id: string;
    projectNumber: string;
    title: string;
    status: string;
    clientName: string;
    clientPhone: string;
    installationAddress?: string | null;
    branch: string;
    installations?: any[];
  };
  isAdmin: boolean;
}

const STAGES = [
  { key: 'draft', label: 'Penawaran', desc: 'Quotation Penawaran Klien', icon: FileText },
  { key: 'deal', label: 'Deal (Menunggu DP)', desc: 'Menunggu pembayaran DP', icon: CreditCard },
  { key: 'in_production', label: 'Pabrikasi', desc: 'DP diterima, proses bengkel', icon: Hammer },
  { key: 'ready_install', label: 'Siap Pasang', desc: 'Selesai QC, siap berangkat', icon: Truck },
  { key: 'completed', label: 'Selesai & Lunas', desc: 'BAST & Pelunasan tuntas', icon: CheckCircle2 },
];

export default function ProjectActionsBar({ project, isAdmin }: ProjectActionsBarProps) {
  const router = useRouter();
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(project.status || 'in_production');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Schedule Form State
  const activeSchedule = project.installations?.[0];
  const [scheduleDate, setScheduleDate] = useState(activeSchedule?.date || new Date().toISOString().split('T')[0]);
  const [scheduleTimeSlot, setScheduleTimeSlot] = useState(activeSchedule?.timeSlot || '09:00 - 14:00 (Pagi-Siang)');
  const [scheduleTeam, setScheduleTeam] = useState(activeSchedule?.teamName || 'Tim 1 (Kang Asep) - Pikap B 9147 TPA');

  // WhatsApp PIC URL
  const cleanPhone = project.clientPhone ? project.clientPhone.replace(/[^0-9]/g, '') : '';
  const waNumber = cleanPhone.startsWith('0') ? '62' + cleanPhone.substring(1) : cleanPhone;
  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    `Halo Kak ${project.clientName}, ini dari tim Salsabilla Advertising mengenai konfirmasi jadwal & pemasangan signage *${project.title}*.`
  )}`;

  // Status mapping index
  const currentStageIndex = STAGES.findIndex((s) => s.key === project.status);
  const activeIndex = currentStageIndex >= 0 ? currentStageIndex : 1;

  // Handle Save Status
  const handleSaveStatus = async () => {
    setIsSubmitting(true);
    const res = await updateProjectStatusAction(project.id, selectedStatus);
    setIsSubmitting(false);
    if (res.success) {
      toast.success('Status progres proyek berhasil diperbarui!');
      setIsStatusModalOpen(false);
      router.refresh();
    } else {
      toast.error(res.error || 'Gagal mengubah status.');
    }
  };

  // Handle Save Schedule
  const handleSaveSchedule = async () => {
    setIsSubmitting(true);
    const res = await upsertInstallationScheduleAction({
      projectId: project.id,
      date: scheduleDate,
      timeSlot: scheduleTimeSlot,
      teamName: scheduleTeam,
    });
    setIsSubmitting(false);
    if (res.success) {
      toast.success('Jadwal pemasangan berhasil disimpan!');
      setIsScheduleModalOpen(false);
      router.refresh();
    } else {
      toast.error(res.error || 'Gagal menyimpan jadwal.');
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. VISUAL PROGRESS TRACKER (STAGE STEPPER) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
              Alur Kerja & Progres Proyek
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <h2 className="text-sm font-extrabold text-slate-900">
                Tahap Sekarang: {STAGES.find((s) => s.key === project.status)?.label || 'Pabrikasi'}
              </h2>
            </div>
          </div>

          {/* Action Button: Status Update */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsStatusModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs flex items-center gap-2 transition cursor-pointer shadow-xs"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>⚡ Update Tahapan Progres</span>
            </button>
          </div>
        </div>

        {/* 5-Step Visual Stepper */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
          {STAGES.map((st, idx) => {
            const isCompleted = idx < activeIndex;
            const isCurrent = idx === activeIndex;
            const Icon = st.icon;

            return (
              <div
                key={st.key}
                className={`p-3 rounded-xl border transition ${
                  isCurrent
                    ? 'bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-500/20'
                    : isCompleted
                    ? 'bg-slate-50 border-slate-200 opacity-80'
                    : 'bg-white border-slate-100 opacity-40'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${
                      isCurrent
                        ? 'bg-indigo-600 text-white'
                        : isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isCompleted ? '✓' : idx + 1}
                  </span>
                  <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-indigo-600' : 'text-slate-500'}`} />
                </div>
                <div className="text-xs font-bold text-slate-900 leading-tight">{st.label}</div>
                <div className="text-[10px] text-slate-500 mt-0.5 truncate">{st.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. DOKUMEN RESMI & CETAK CEPAT (BARIS KHUSUS RAPI TIDAK MEPEt KE SAMPING) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
            Pusat Dokumen Resmi & Cetak Surat Kerja
          </span>
          <span className="text-[10px] text-slate-400 font-medium">Format Resmi Standar Reklame</span>
        </div>

        {/* Grid 6 Tombol Proporsional */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
          {isAdmin && (
            <a
              href={`/calculator?edit=${project.id}`}
              className="p-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 font-bold flex flex-col items-center justify-center text-center gap-1.5 transition shadow-2xs hover:shadow-xs"
            >
              <Edit3 className="w-4 h-4 text-indigo-600" />
              <span>Edit Penawaran</span>
            </a>
          )}

          <a
            href={`/documents/${project.id}/quotation`}
            target="_blank"
            className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold flex flex-col items-center justify-center text-center gap-1.5 transition shadow-2xs hover:shadow-xs"
          >
            <Printer className="w-4 h-4 text-slate-300" />
            <span>1. Quotation Resmi</span>
          </a>

          <a
            href={`/documents/${project.id}/spk`}
            target="_blank"
            className="p-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold flex flex-col items-center justify-center text-center gap-1.5 transition shadow-2xs hover:shadow-xs"
          >
            <FileText className="w-4 h-4 text-amber-700" />
            <span>2. SPK Bengkel</span>
          </a>

          <a
            href={`/documents/${project.id}/surat_jalan`}
            target="_blank"
            className="p-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-bold flex flex-col items-center justify-center text-center gap-1.5 transition shadow-2xs hover:shadow-xs"
          >
            <Truck className="w-4 h-4 text-blue-600" />
            <span>3. Surat Jalan</span>
          </a>

          <a
            href={`/documents/${project.id}/bast`}
            target="_blank"
            className="p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold flex flex-col items-center justify-center text-center gap-1.5 transition shadow-2xs hover:shadow-xs"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>4. BAST Serah Terima</span>
          </a>

          {isAdmin && (
            <a
              href={`/documents/${project.id}/invoice?termin=dp`}
              target="_blank"
              className="p-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 font-bold flex flex-col items-center justify-center text-center gap-1.5 transition shadow-2xs hover:shadow-xs"
            >
              <CreditCard className="w-4 h-4 text-purple-600" />
              <span>5. Invoice DP 50%</span>
            </a>
          )}
        </div>
      </div>

      {/* 3. KARTU JADWAL PEMASANGAN & PIC LAPANGAN */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 mt-0.5">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Penugasan Lapangan & Jadwal Pasang
              </span>
              {activeSchedule ? (
                <div className="mt-0.5 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-sm">{activeSchedule.date}</span>
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                      {activeSchedule.timeSlot}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1">
                      <Truck className="w-3 h-3" /> {activeSchedule.teamName}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Alamat Pasang: <strong className="text-slate-800">{project.installationAddress || 'Konfirmasi dengan klien'}</strong>
                  </p>
                </div>
              ) : (
                <div className="mt-0.5">
                  <p className="text-xs text-slate-500 font-medium">
                    Belum dijadwalkan secara resmi di sistem.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action: Hubungi PIC Klien via WhatsApp & Atur Jadwal */}
          <div className="flex items-center gap-2 shrink-0">
            {cleanPhone && (
              <a
                href={waLink}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat PIC Klien</span>
              </a>
            )}
            <button
              type="button"
              onClick={() => setIsScheduleModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-extrabold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span>{activeSchedule ? '🗓 Ubah Jadwal Pemasangan' : '🗓 Atur Jadwal Pemasangan'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 1: UPDATE STATUS PROGRES */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Perbarui Status Progres Proyek</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsStatusModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Pilih Tahapan Progres:</label>
              {STAGES.map((st) => (
                <label
                  key={st.key}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition text-xs ${
                    selectedStatus === st.key
                      ? 'bg-indigo-50 border-indigo-400 font-bold text-indigo-950'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="status_radio"
                      value={st.key}
                      checked={selectedStatus === st.key}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <div>{st.label}</div>
                      <div className="text-[10px] text-slate-500 font-normal">{st.desc}</div>
                    </div>
                  </div>
                  {project.status === st.key && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold">
                      Sekarang
                    </span>
                  )}
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => setIsStatusModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveStatus}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition flex items-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ATUR / UBAH JADWAL PEMASANGAN */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>Atur Jadwal Pemasangan Lapangan</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsScheduleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tanggal Pemasangan:</label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Slot Waktu Pemasangan:</label>
                <select
                  value={scheduleTimeSlot}
                  onChange={(e) => setScheduleTimeSlot(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                >
                  <option value="09:00 - 14:00 (Pagi-Siang)">09:00 - 14:00 WIB (Pagi - Siang)</option>
                  <option value="13:00 - 18:00 (Siang-Sore)">13:00 - 18:00 WIB (Siang - Sore)</option>
                  <option value="21:00 - 04:00 (Malam Mall/Ruko)">21:00 - 04:00 WIB (Malam Mall / Ruko)</option>
                  <option value="Fleksibel Sesuai Izin Gedung">Fleksibel Sesuai Izin Gedung</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tim Teknisi & Armada Mobil:</label>
                <select
                  value={scheduleTeam}
                  onChange={(e) => setScheduleTeam(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                >
                  <option value="Tim 1 (Kang Asep) - Pikap B 9147 TPA">Tim 1 (Kang Asep) — Pikap B 9147 TPA</option>
                  <option value="Tim 2 (Pak Joko) - Pikap D 8231 ZB">Tim 2 (Pak Joko) — Pikap D 8231 ZB</option>
                  <option value="Tim 3 (Kang Ujang) - Pikap B 9822 KLA">Tim 3 (Kang Ujang) — Pikap B 9822 KLA</option>
                  <option value="Tim Mandiri Lapangan (Mitra Khusus)">Tim Mandiri Lapangan (Mitra Khusus)</option>
                </select>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 space-y-1 text-[11px]">
                <div className="font-bold text-slate-800">Checklist Alat Standar Otomatis:</div>
                <p>• Scaffolding / Tangga Lipat Aluminium</p>
                <p>• Bor Hammer + Dynabolt M10 + Sealant Bening</p>
                <p>• Safety Belt / Full Body Harness K3</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => setIsScheduleModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveSchedule}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition flex items-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Simpan Jadwal</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
