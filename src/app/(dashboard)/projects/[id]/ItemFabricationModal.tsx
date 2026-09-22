'use client';

import { useState } from 'react';
import { Tag, Wrench, X, Check, Loader2, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import { updateItemFabricationSpecAction } from '@/app/actions/project';
import { toast } from 'sonner';

interface ItemFabricationModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id: string;
    description: string;
    material: string;
    specifications?: string | null;
    ledCount?: number | null;
    trafoWatt?: number | null;
    specSnapshot?: any;
    qcNotes?: string | null;
  };
  projectId: string;
}

const FABRICATION_QUICK_TAGS = [
  { label: '+ Daun Stainless 10cm', text: 'daun stainless mirror 10cm' },
  { label: '+ Daun ACP 6cm', text: 'daun ACP 6cm' },
  { label: '+ Daun 4.5cm', text: 'daun 4.5cm' },
  { label: '+ Rangka Hollow 2x2', text: 'rangka hollow 2x2cm' },
  { label: '+ Rangka Hollow 2x4', text: 'rangka hollow 2x4cm' },
  { label: '+ Plat Belakang Cat Putih', text: 'belakang plat galvanis cat putih rapih' },
  { label: '+ Lampu 4000K LED Bar', text: 'lampu 4000K led bar' },
  { label: '+ Stiker 3M Putih', text: 'depan stiker 3M putih' },
  { label: '+ LED Samsung IP68', text: 'LED modul Samsung IP68 waterproof' },
  { label: '+ Tanpa Lampu', text: 'tidak pakai lampu' },
  { label: '+ Board ACP', text: 'board hollow 2x2 dibungkus ACP' },
  { label: '+ Bracket Pipa', text: 'bracket pipa' },
];

export default function ItemFabricationModal({
  isOpen,
  onClose,
  item,
  projectId,
}: ItemFabricationModalProps) {
  const snap = typeof item.specSnapshot === 'string'
    ? JSON.parse(item.specSnapshot)
    : (item.specSnapshot || {});

  const [notes, setNotes] = useState<string>(
    snap.fabricationNotes || item.qcNotes || ''
  );
  const [poLedCount, setPoLedCount] = useState<number | ''>(
    snap.poLedCount || item.ledCount || ''
  );
  const [poTrafoType, setPoTrafoType] = useState<string>(
    snap.poTrafoType || (item.trafoWatt ? `${item.trafoWatt}W Rainproof` : '')
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAddTag = (tagText: string) => {
    setNotes((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return tagText;
      if (trimmed.toLowerCase().includes(tagText.toLowerCase())) return trimmed;
      return `${trimmed}, ${tagText}`;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await updateItemFabricationSpecAction({
        itemId: item.id,
        projectId,
        fabricationNotes: notes,
        poLedCount: poLedCount === '' ? undefined : Number(poLedCount),
        poTrafoType: poTrafoType.trim() || undefined,
      });

      if (res.success) {
        toast.success('Instruksi fabrikasi berhasil disimpan ke SPK & QC Gudang!');
        onClose();
      } else {
        toast.error(res.error || 'Gagal menyimpan instruksi.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500 text-slate-950">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm uppercase tracking-tight">
                Instruksi Fabrikasi & QC SPK
              </h3>
              <p className="text-[11px] text-slate-300 truncate max-w-xs">
                {item.description}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Quick Tag Pills */}
          <div>
            <label className="font-extrabold text-slate-800 uppercase tracking-wider block mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-indigo-600" />
                Quick-Tag Pills (Klik Cepat):
              </span>
              <span className="text-[10.5px] font-normal text-slate-400">Klik untuk menambah</span>
            </label>
            <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-xl">
              {FABRICATION_QUICK_TAGS.map((pill, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAddTag(pill.text)}
                  className="px-2.5 py-1 rounded-lg text-[10.5px] font-bold bg-white hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 text-slate-700 border border-slate-200 shadow-2xs transition cursor-pointer"
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Textarea Free Text Instruksi Fabrikasi */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Catatan Spesifikasi Fabrikasi Bebas:
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Belakang plat cat putih, daun stainless 10cm, rangka hollow 2x2 supaya teu malehoy, depan stiker 3M..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-xs text-xs"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              *Teks ini tersimpan utuh di <code>specSnapshot</code> dan dicetak persis apa adanya di SPK Bengkel & Kartu Kendali Mutu.
            </p>
          </div>

          {/* Kolom Khusus PO Korporat (Opsional) */}
          <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3">
            <div className="flex items-center gap-1.5 text-amber-900 font-extrabold uppercase text-[10.5px]">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Verifikasi PO Resmi Korporat (Opsional):</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Jumlah LED Resmi PO (pcs):
                </label>
                <input
                  type="number"
                  min={0}
                  value={poLedCount}
                  onChange={(e) => setPoLedCount(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Contoh: 224"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Tipe Trafo / Power Supply:
                </label>
                <input
                  type="text"
                  value={poTrafoType}
                  onChange={(e) => setPoTrafoType(e.target.value)}
                  placeholder="Contoh: 200W Rainproof / Samsung"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer transition"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow-md shadow-slate-900/20 flex items-center gap-2 cursor-pointer transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
              ) : (
                <Check className="w-4 h-4 text-amber-400" />
              )}
              <span>Simpan Instruksi & QC</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
