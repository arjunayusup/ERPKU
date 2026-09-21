'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CalendarDays, 
  MapPin, 
  Clock, 
  CheckSquare, 
  Truck, 
  AlertCircle,
  FileCheck,
  FileText,
  MessageSquare,
  Search,
  Share2,
  Calendar,
  CheckCircle2,
  Edit3,
  X,
  Loader2,
  Copy,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { upsertInstallationScheduleAction, updateInstallationScheduleStatusAction } from '@/app/actions/project';

interface ScheduleClientProps {
  schedules: any[];
}

const STATUS_LABELS: Record<string, { label: string; bg: string; text: string; border: string }> = {
  scheduled: { label: 'Terjadwal', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  on_the_way: { label: 'Armada OTW', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  installing: { label: 'Sedang Pasang', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  completed: { label: 'Selesai / Terpasang', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
};

export default function ScheduleClient({ schedules }: ScheduleClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'all' | 'today' | 'this_week' | 'upcoming'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingSchedule, setEditingSchedule] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [copiedBroadcast, setCopiedBroadcast] = useState(false);

  // Edit form state
  const [editDate, setEditDate] = useState('');
  const [editTimeSlot, setEditTimeSlot] = useState('');
  const [editTeam, setEditTeam] = useState('');

  // Today string YYYY-MM-DD
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  // Date 7 days from now
  const nextWeekDate = new Date();
  nextWeekDate.setDate(now.getDate() + 7);
  const nextWeekStr = `${nextWeekDate.getFullYear()}-${String(nextWeekDate.getMonth() + 1).padStart(2, '0')}-${String(nextWeekDate.getDate()).padStart(2, '0')}`;

  // Filtered schedules
  const filteredSchedules = schedules.filter((s) => {
    // Tab filter
    if (activeTab === 'today') {
      if (s.date !== todayStr) return false;
    } else if (activeTab === 'this_week') {
      if (s.date < todayStr || s.date > nextWeekStr) return false;
    } else if (activeTab === 'upcoming') {
      if (s.date < todayStr) return false;
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = s.project?.title?.toLowerCase().includes(q);
      const matchClient = s.project?.clientName?.toLowerCase().includes(q);
      const matchTeam = s.teamName?.toLowerCase().includes(q);
      const matchAddress = s.project?.installationAddress?.toLowerCase().includes(q);
      const matchNumber = s.project?.projectNumber?.toLowerCase().includes(q);
      return matchTitle || matchClient || matchTeam || matchAddress || matchNumber;
    }

    return true;
  });

  // Open Edit Modal
  const handleOpenEdit = (s: any) => {
    setEditingSchedule(s);
    setEditDate(s.date || todayStr);
    setEditTimeSlot(s.timeSlot || '09:00 - 14:00 (Pagi-Siang)');
    setEditTeam(s.teamName || 'Tim 1 (Kang Asep) - Pikap B 9147 TPA');
  };

  // Submit Edit Schedule
  const handleSaveEdit = async () => {
    if (!editingSchedule) return;
    setIsSubmitting(true);
    const res = await upsertInstallationScheduleAction({
      projectId: editingSchedule.projectId,
      date: editDate,
      timeSlot: editTimeSlot,
      teamName: editTeam,
    });
    setIsSubmitting(false);
    if (res.success) {
      setEditingSchedule(null);
      router.refresh();
    } else {
      alert(res.error || 'Gagal mengubah jadwal.');
    }
  };

  // Update Status directly
  const handleStatusChange = async (scheduleId: string, newStatus: string) => {
    setIsSubmitting(true);
    const res = await updateInstallationScheduleStatusAction(scheduleId, newStatus);
    setIsSubmitting(false);
    if (res.success) {
      router.refresh();
    } else {
      alert(res.error || 'Gagal mengubah status jadwal.');
    }
  };

  // Build WA Broadcast Text
  const buildBroadcastText = () => {
    const targetItems = filteredSchedules.length > 0 ? filteredSchedules : schedules;
    let text = `*📋 JADWAL PEMASANGAN & OPERASIONAL LAPANGAN*\n`;
    text += `*Salsabilla Advertising*\n`;
    text += `*Periode:* ${activeTab === 'today' ? 'Hari Ini (' + todayStr + ')' : activeTab === 'this_week' ? 'Minggu Ini' : 'Semua Terjadwal'}\n`;
    text += `-------------------------------------------\n\n`;

    targetItems.forEach((s, idx) => {
      let checklist: any[] = [];
      try {
        checklist = JSON.parse(s.toolsChecklist);
      } catch {
        checklist = [];
      }
      const tools = checklist.map((c) => (c.item || c.name)).filter(Boolean).slice(0, 3).join(', ');

      text += `*${idx + 1}. ${s.project?.title || 'Proyek Reklame'}*\n`;
      text += `📅 Tanggal: *${s.date}* (${s.timeSlot})\n`;
      text += `🚛 Tim Armada: *${s.teamName}*\n`;
      text += `📍 Alamat: ${s.project?.installationAddress || 'Konfirmasi klien'}\n`;
      text += `👤 PIC Klien: ${s.project?.clientName || '-'} (${s.project?.clientPhone || '-'})\n`;
      if (tools) {
        text += `🧰 Bawaan: ${tools}\n`;
      }
      text += `-------------------------------------------\n\n`;
    });

    text += `*⚠️ INSTRUKSI K3 & MUTU OPERASIONAL:*\n`;
    text += `1. Wajib cek fisik kelengkapan barang & alat sebelum armada keluar bengkel!\n`;
    text += `2. Wajib gunakan Helm Safety & Body Harness bila ketinggian di atas 2.5 meter.\n`;
    text += `3. Pastikan customer menandatangani BAST fisik/digital dan foto dokumentasi saat lampu menyala!`;

    return text;
  };

  const broadcastText = buildBroadcastText();
  const waBroadcastUrl = `https://wa.me/?text=${encodeURIComponent(broadcastText)}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(broadcastText);
    setCopiedBroadcast(true);
    setTimeout(() => setCopiedBroadcast(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* HEADER SECTION */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <CalendarDays className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-extrabold text-slate-900 uppercase">
                Jadwal Tim Pemasangan & Checklist Alat Lapangan
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Penugasan armada pikap, teknisi lapangan, dan verifikasi checklist alat kerja Salsabilla Advertising.
            </p>
          </div>

          {/* Quick WA Broadcast Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowBroadcastModal(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-xs"
            >
              <Share2 className="w-4 h-4" />
              <span>Broadcast WA ke Grup Operasional</span>
            </button>
          </div>
        </div>

        {/* STATS & FILTER TABS BAR */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Tab Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            {[
              { id: 'all', label: 'Semua Jadwal' },
              { id: 'today', label: 'Hari Ini' },
              { id: 'this_week', label: 'Minggu Ini' },
              { id: 'upcoming', label: 'Mendatang' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeTab === t.id
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari proyek, tim, alamat..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
          </div>
        </div>
      </div>

      {/* SCHEDULE CARDS LIST */}
      <div className="space-y-4">
        {filteredSchedules.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Tidak ada jadwal pemasangan yang sesuai</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Coba ganti filter tab atau tambahkan jadwal dari daftar proyek dengan menekan tombol <strong>[🗓 Jadwal]</strong> pada proyek terkait.
            </p>
          </div>
        ) : (
          filteredSchedules.map((s) => {
            let checklist: any[] = [];
            try {
              checklist = JSON.parse(s.toolsChecklist);
            } catch {
              checklist = [];
            }

            const cleanPhone = s.project?.clientPhone ? s.project.clientPhone.replace(/[^0-9]/g, '') : '';
            const waNumber = cleanPhone.startsWith('0') ? '62' + cleanPhone.substring(1) : cleanPhone;
            const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(
              `Halo Kak ${s.project?.clientName || ''}, ini dari tim teknisi Salsabilla Advertising terkait jadwal pemasangan signage *${s.project?.title || ''}*.`
            )}`;

            const currentStatus = STATUS_LABELS[s.status] || STATUS_LABELS.scheduled;

            return (
              <div key={s.id} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
                {/* Header Card: Team, Date, Time & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5" /> {s.teamName}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        Tanggal Pasang: <strong className="text-slate-900">{s.date}</strong>
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${currentStatus.bg} ${currentStatus.text} ${currentStatus.border}`}>
                        {currentStatus.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <h2 className="text-base font-extrabold text-slate-900">
                        {s.project?.title || 'Proyek Tanpa Judul'}
                      </h2>
                      <span className="text-xs font-mono text-slate-400">
                        ({s.project?.projectNumber || '-'})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {s.timeSlot}
                    </span>

                    {/* Quick Status Selector */}
                    <select
                      value={s.status || 'scheduled'}
                      onChange={(e) => handleStatusChange(s.id, e.target.value)}
                      disabled={isSubmitting}
                      className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden cursor-pointer"
                    >
                      <option value="scheduled">Terjadwal</option>
                      <option value="on_the_way">OTW Lapangan</option>
                      <option value="installing">Proses Pasang</option>
                      <option value="completed">Selesai</option>
                    </select>
                  </div>
                </div>

                {/* Location & Client Info */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-900">Alamat Pemasangan:</p>
                      <p className="text-slate-700 mt-0.5">{s.project?.installationAddress || 'Konfirmasi dengan customer / kantor'}</p>
                      <p className="text-slate-500 mt-1">
                        PIC Customer: <strong className="text-slate-900">{s.project?.clientName || '-'}</strong> ({s.project?.clientPhone || '-'})
                      </p>
                    </div>
                  </div>

                  {cleanPhone && (
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 self-start transition shadow-2xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat PIC Klien</span>
                    </a>
                  )}
                </div>

                {/* Tools Checklist Box */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-2.5">
                    <CheckSquare className="w-4 h-4 text-amber-600" />
                    Checklist Peralatan Wajib Bawa (Cek Fisik Sebelum Armada Berangkat):
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {checklist.map((item, idx) => {
                      const itemName = item.name || item.item || (typeof item === 'string' ? item : 'Alat Proyek');
                      return (
                        <label
                          key={idx}
                          className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 cursor-pointer hover:bg-slate-100 transition"
                        >
                          <input
                            type="checkbox"
                            defaultChecked={item.checked !== false}
                            className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                          />
                          <span className="font-medium">{itemName}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Footer Notice & Action Buttons (Clean 4-button row) */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-xs text-amber-800 font-medium">
                    <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Wajib gunakan helm safety & body harness jika elevasi pemasangan di Lantai 2 ke atas</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(s)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                      <span>Ubah Jadwal</span>
                    </button>

                    <a
                      href={`/documents/${s.project?.id}/surat-jalan`}
                      target="_blank"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-bold text-xs transition cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      <span>Surat Jalan</span>
                    </a>

                    <a
                      href={`/documents/${s.project?.id}/bast`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer shadow-2xs"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>Form BAST</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL 1: EDIT JADWAL PEMASANGAN */}
      {editingSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <Calendar className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Ubah Jadwal Pemasangan</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {editingSchedule.project?.title}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingSchedule(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Tanggal Pemasangan Lapangan:
                </label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Slot Waktu Pemasangan:
                </label>
                <select
                  value={editTimeSlot}
                  onChange={(e) => setEditTimeSlot(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-indigo-600 cursor-pointer"
                >
                  <option value="09:00 - 14:00 (Pagi-Siang)">09:00 - 14:00 (Pagi-Siang Normal)</option>
                  <option value="14:00 - 18:00 (Siang-Sore)">14:00 - 18:00 (Siang-Sore)</option>
                  <option value="22:00 - 04:00 (Malam Mall/Ruko)">22:00 - 04:00 (Shift Malam Mall / Ruko Tertutup)</option>
                  <option value="Full Day (09:00 - Selesai)">Full Day (Pemasangan Konstruksi Besar)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Tim Lapangan & Armada Pikap:
                </label>
                <select
                  value={editTeam}
                  onChange={(e) => setEditTeam(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-indigo-600 cursor-pointer"
                >
                  <option value="Tim 1 (Kang Asep) - Pikap B 9147 TPA">Tim 1 (Kang Asep) - Pikap B 9147 TPA</option>
                  <option value="Tim 2 (Pak Joko) - Pikap B 9821 KYZ">Tim 2 (Pak Joko) - Pikap B 9821 KYZ</option>
                  <option value="Tim Gabungan 1 & 2 (Konstruksi Tiang)">Tim Gabungan 1 & 2 (Tiang / Ukuran Besar)</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingSchedule(null)}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Simpan Jadwal</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: BROADCAST WA KE GRUP OPERASIONAL */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <Share2 className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Broadcast WhatsApp Operasional</h3>
                  <p className="text-xs text-slate-500 font-medium">Kirim format jadwal rapi ke grup WhatsApp teknisi & driver</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBroadcastModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Message Preview */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 max-h-64 overflow-y-auto font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
              {broadcastText}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={copyToClipboard}
                className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedBroadcast ? 'Tersalin di Clipboard! ✓' : 'Salin Pesan'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Tutup
                </button>
                <a
                  href={waBroadcastUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Kirim ke WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
