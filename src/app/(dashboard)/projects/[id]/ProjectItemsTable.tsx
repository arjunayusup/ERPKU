'use client';

import { useState } from 'react';
import { 
  Zap, 
  Wrench, 
  Tag, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  FileEdit,
  Layers,
  ChevronRight
} from 'lucide-react';
import { getMaterialDisplayLabel, calculateLedModules, formatItemDimensions } from '@/lib/calculator-modular';
import ItemFabricationModal from './ItemFabricationModal';

interface ProjectItemsTableProps {
  items: any[];
  projectId: string;
  isAdmin: boolean;
}

export default function ProjectItemsTable({ items, projectId, isAdmin }: ProjectItemsTableProps) {
  const [selectedItemForModal, setSelectedItemForModal] = useState<any | null>(null);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-600" />
            Spesifikasi Unit Reklame & Kelistrikan
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar unit, bahan master, dan instruksi fabrikasi bengkel ({items.length} Unit)
          </p>
        </div>
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-xs">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3.5 w-10 text-center">No</th>
              <th className="px-4 py-3.5 min-w-[200px]">Deskripsi Unit</th>
              <th className="px-4 py-3.5 min-w-[160px]">Bahan Master</th>
              <th className="px-4 py-3.5 min-w-[120px] text-center">Ukuran</th>
              <th className="px-4 py-3.5 min-w-[150px]">Penerangan (LED)</th>
              <th className="px-4 py-3.5 min-w-[240px]">Instruksi Fabrikasi & QC</th>
              {isAdmin && <th className="px-4 py-3.5 text-right min-w-[110px]">Harga Jual</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item, idx) => {
              const snap = typeof item.specSnapshot === 'string'
                ? JSON.parse(item.specSnapshot)
                : (item.specSnapshot || {});

              const ledInfo = calculateLedModules({
                category: item.itemType,
                subCategory: item.material,
                material: item.material,
                heightCm: item.heightCm || undefined,
                charCount: item.charCount || undefined,
                lightingType: item.lighting || undefined,
              });

              const hasFabNote = Boolean(snap.fabricationNotes || item.qcNotes);
              const hasPoLed = Boolean(snap.poLedCount || item.ledCount);

              return (
                <tr key={item.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-4 py-3.5 text-center font-bold text-slate-400">
                    {idx + 1}
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="font-extrabold text-slate-900 text-[12.5px]">
                      {item.description}
                    </div>
                    {item.textOrLabel && (
                      <div className="font-mono text-indigo-700 font-bold text-[11px] mt-0.5">
                        &quot;{item.textOrLabel}&quot;
                      </div>
                    )}
                    <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                      {item.specifications || '-'}
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <span className="font-bold text-slate-900 block">
                      {getMaterialDisplayLabel(item.material)}
                    </span>
                    <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-slate-100 text-slate-600 uppercase border border-slate-200">
                      {item.itemType}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 text-center">
                    <span className="font-black text-slate-900 text-xs block font-mono">
                      {formatItemDimensions(item)}
                    </span>
                    {item.quantity > 1 && (
                      <span className="text-[10px] text-slate-400 font-semibold">
                        Qty: {item.quantity}x
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3.5">
                    {ledInfo.isIlluminated ? (
                      <div className="space-y-0.5">
                        <span className="font-bold text-amber-600 block text-xs">
                          ⚡ {hasPoLed ? `${snap.poLedCount || item.ledCount} Modul` : `${ledInfo.ledCount} Modul`}
                        </span>
                        <span className="text-[10.5px] text-slate-600 block">
                          Trafo: {snap.poTrafoType || (item.trafoWatt ? `${item.trafoWatt}W` : `${ledInfo.trafoWatt}W`)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400 font-medium text-[11px]">
                        Non-Lampu
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="space-y-2">
                      {hasFabNote ? (
                        <div className="bg-amber-50/80 border border-amber-200 text-amber-950 p-2 rounded-xl text-[11px] leading-snug">
                          <span className="font-extrabold uppercase text-[9.5px] text-amber-800 block">
                            Catatan Bengkel:
                          </span>
                          <p className="font-medium italic mt-0.5">{snap.fabricationNotes || item.qcNotes}</p>
                        </div>
                      ) : (
                        <p className="text-[10.5px] text-slate-400 italic">
                          Belum ada instruksi fabrikasi.
                        </p>
                      )}

                      <button
                        type="button"
                        onClick={() => setSelectedItemForModal(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-[11px] border border-indigo-200 transition cursor-pointer shadow-2xs"
                      >
                        <Wrench className="w-3 h-3 text-indigo-600" />
                        <span>{hasFabNote ? '✏️ Ubah Instruksi & QC' : '➕ Tambah Instruksi & QC'}</span>
                      </button>
                    </div>
                  </td>

                  {isAdmin && (
                    <td className="px-4 py-3.5 text-right font-mono font-extrabold text-slate-900">
                      {formatRupiah(item.sellingPrice)}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Fabrication Modal */}
      {selectedItemForModal && (
        <ItemFabricationModal
          isOpen={Boolean(selectedItemForModal)}
          onClose={() => setSelectedItemForModal(null)}
          item={selectedItemForModal}
          projectId={projectId}
        />
      )}
    </div>
  );
}
