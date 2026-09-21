import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { 
  CalendarDays, 
  MapPin, 
  Clock, 
  CheckSquare, 
  Truck, 
  AlertCircle,
  FileCheck
} from 'lucide-react';

export default async function SchedulePage() {
  const session = await getSession();

  let schedules: any[] = [];
  try {
    schedules = await prisma.installationSchedule.findMany({
      include: {
        project: true,
      },
      orderBy: { date: 'asc' },
    });
  } catch (e) {
    console.error(e);
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
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

      {/* Schedule Cards */}
      <div className="space-y-4">
        {schedules.map((s) => {
          let checklist: any[] = [];
          try {
            checklist = JSON.parse(s.toolsChecklist);
          } catch {
            checklist = [];
          }

          return (
            <div key={s.id} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5" /> {s.teamName}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">Tanggal Pasang: <strong>{s.date}</strong></span>
                  </div>
                  <h2 className="text-base font-extrabold text-slate-900 mt-1.5">{s.project.title}</h2>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {s.timeSlot}
                  </span>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-2.5 text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <MapPin className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">Alamat Pemasangan:</p>
                  <p className="text-slate-600 mt-0.5">{s.project.installationAddress || 'Konfirmasi dengan customer'}</p>
                  <p className="text-slate-500 mt-0.5">PIC Customer: <strong className="text-slate-800">{s.project.clientName}</strong> ({s.project.clientPhone})</p>
                </div>
              </div>

              {/* Tools Checklist Box */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-2.5">
                  <CheckSquare className="w-4 h-4 text-amber-600" />
                  Checklist Peralatan Wajib Bawa (Cek Fisik Sebelum Armada Berangkat):
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {checklist.map((item, idx) => (
                    <label
                      key={idx}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 cursor-pointer hover:bg-slate-100 transition"
                    >
                      <input
                        type="checkbox"
                        defaultChecked={item.checked}
                        className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                      />
                      <span className="font-medium">{item.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs text-amber-700 font-semibold">
                  <AlertCircle className="w-4 h-4" />
                  <span>Wajib menggunakan helm safety & body harness jika elevasi pemasangan di Lantai 2 ke atas</span>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`/documents/${s.project.id}/bast`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer shadow-sm"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>Buka Form BAST Serah Terima</span>
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
