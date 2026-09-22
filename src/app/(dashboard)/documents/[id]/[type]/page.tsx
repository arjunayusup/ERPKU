import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import UniversalPrintHeader from '@/components/UniversalPrintHeader';
import PrintButton from './PrintButton';
import { getBranchConfig, getAllBranches } from '@/lib/branches';
import { getMaterialDisplayLabel, calculateLedModules, formatItemSizeClean } from '@/lib/calculator-modular';

export default async function DocumentPage({
  params,
  searchParams,
}: {
  params: { id: string; type: string };
  searchParams?: { branch?: string; termin?: string };
}) {
  const session = await getSession();
  const isAdmin = session?.role === 'admin';

  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      items: true,
      installations: true,
      expenses: true,
    },
  });

  if (!project) notFound();

  // Branch Config
  const branchId = searchParams?.branch || 'jakarta';
  const branch = getBranchConfig(branchId);
  const branches = getAllBranches();

  // Proteksi jika akun bengkel mencoba buka Quotation atau Invoice
  const isFinancialDoc = params.type === 'quotation' || params.type === 'invoice';
  if (isFinancialDoc && !isAdmin) {
    return (
      <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl max-w-md mx-auto my-12 shadow-md">
        <ShieldCheck className="w-12 h-12 text-rose-600 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">Akses Dibatasi</h2>
        <p className="text-xs text-slate-500 mt-1">
          Dokumen finansial penawaran dan invoice hanya dapat diakses oleh Akun Owner / Admin Salsabilla Advertising.
        </p>
      </div>
    );
  }

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const docType = params.type; // 'quotation', 'spk', 'surat_jalan', 'bast', 'invoice'

  let docTitle = 'DOKUMEN RESMI';
  if (docType === 'quotation') docTitle = 'SURAT PENAWARAN';
  else if (docType === 'spk') docTitle = 'SPK BENGKEL / WORK ORDER';
  else if (docType === 'surat_jalan') docTitle = 'SURAT JALAN PENGIRIMAN';
  else if (docType === 'bast') docTitle = 'BERITA ACARA SERAH TERIMA';
  else if (docType === 'invoice') docTitle = 'INVOICE TERMIN';

  const displayDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Termin calculation
  const terminType = searchParams?.termin || 'dp'; // 'dp' (50%) or 'pelunasan' (50%)
  const isDP = terminType === 'dp';
  const invoiceAmount = project.totalDeal * 0.5;

  // Smart Dynamic File Name
  // Format: [DOKUMEN] - [ITEM_SPEK] - [CLIENT_NAME] - Salsabilla
  const firstItem = project.items[0];
  const sizeTag = firstItem?.itemType === 'huruf_timbul'
    ? (firstItem.heightCm ? `T${firstItem.heightCm}cm` : '')
    : (firstItem?.heightCm && firstItem?.widthCm ? `${firstItem.heightCm}x${firstItem.widthCm}cm` : firstItem?.heightCm ? `T${firstItem.heightCm}cm` : '');
  const itemSummary = firstItem 
    ? `${firstItem.description.replace(/[^a-zA-Z0-9 ]/g, '')} ${sizeTag}`.trim()
    : project.title.replace(/[^a-zA-Z0-9 ]/g, '').substring(0, 30);
  const cleanClient = project.clientName.replace(/[^a-zA-Z0-9 ]/g, '').trim();
  
  let docPrefix = 'DOKUMEN';
  if (docType === 'quotation') docPrefix = 'PENAWARAN';
  else if (docType === 'spk') docPrefix = 'SPK-BENGKEL';
  else if (docType === 'surat_jalan') docPrefix = 'SURAT-JALAN';
  else if (docType === 'bast') docPrefix = 'BAST-SERAH-TERIMA';
  else if (docType === 'invoice') docPrefix = isDP ? 'INVOICE-DP-50%' : 'INVOICE-PELUNASAN';

  const suggestedFileName = `${docPrefix} - ${itemSummary} - ${cleanClient} - Salsabilla`;
  const documentNumber = `${docType.toUpperCase()}-${project.projectNumber.replace('PRJ-', '')}`;

  return (
    <div className="space-y-6">
      {/* Top Action Bar (Hidden during Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print max-w-4xl mx-auto bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <a
          href={`/projects/${project.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Detail Proyek
        </a>

        {/* Branch Switcher for Document */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-semibold text-slate-500">Cabang:</label>
            <div className="inline-flex rounded-lg border border-slate-300 p-0.5 bg-slate-50 text-xs">
              {branches.map((b) => (
                <a
                  key={b.id}
                  href={`/documents/${project.id}/${docType}?branch=${b.id}${searchParams?.termin ? `&termin=${searchParams.termin}` : ''}`}
                  className={`px-2.5 py-1 rounded-md font-bold transition ${
                    b.id === branch.id
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {b.city}
                </a>
              ))}
            </div>
          </div>

          <PrintButton
            suggestedFileName={suggestedFileName}
            clientPhone={project.clientPhone}
            clientName={project.clientName}
            docTitle={docTitle}
            documentNumber={documentNumber}
          />
        </div>
      </div>

      {/* A4 Document Canvas */}
      <div className="max-w-4xl mx-auto bg-white text-slate-900 p-10 md:p-12 shadow-xl border border-slate-200 print:border-none print:shadow-none print:p-0 min-h-[297mm]">
        {/* Universal Print Header with Salsabilla Logo & Dynamic Branch Data */}
        <UniversalPrintHeader
          branchId={branch.id}
          documentTitle={docTitle}
          documentNumber={`${docType.toUpperCase()}-${project.projectNumber.replace('PRJ-', '')}`}
          dateStr={displayDate}
        />

        {/* ========================================================================= */}
        {/* 1. SURAT PENAWARAN (QUOTATION) - EXACT REPLICA OF OFFICIAL SALSABILLA FORMAT */}
        {/* ========================================================================= */}
        {docType === 'quotation' && (
          <div className="space-y-5 text-xs leading-relaxed text-slate-800">
            {/* Tujuan Surat */}
            <div className="space-y-0.5">
              <p className="font-bold text-slate-900">Kepada Yth.</p>
              <p className="font-extrabold text-sm text-slate-900">{project.clientName}</p>
              <p className="text-slate-700">Di Tempat</p>
            </div>

            {/* Pembuka */}
            <div className="space-y-1">
              <p className="font-semibold text-slate-900">Dengan Hormat,</p>
              <p className="text-slate-700">
                Menindaklanjuti permintaan Bapak/Ibu berkenaan dengan pekerjaan Signage, berikut kami ajukan penawaran harga dengan rincian sebagai berikut:
              </p>
            </div>

            {/* Official Table: No | Description | Size | Specification | Qty | Unit Price | Total Price */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-900">
                <thead className="bg-slate-100 text-slate-900 uppercase font-bold border-b border-slate-900">
                  <tr>
                    <th className="p-2.5 border-r border-slate-900 w-10 text-center">No</th>
                    <th className="p-2.5 border-r border-slate-900">Description</th>
                    <th className="p-2.5 border-r border-slate-900 text-center">Size</th>
                    <th className="p-2.5 border-r border-slate-900">Specification</th>
                    <th className="p-2.5 border-r border-slate-900 w-12 text-center">Qty</th>
                    <th className="p-2.5 border-r border-slate-900 text-right">Unit Price</th>
                    <th className="p-2.5 text-right">Total Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-400">
                  {project.items.map((item, idx) => {
                    const qty = item.quantity || 1;
                    const unitPrice = item.unitPrice || (item.sellingPrice / qty);

                    return (
                      <tr key={item.id}>
                        <td className="p-2.5 border-r border-slate-900 text-center font-bold">{idx + 1}</td>
                        <td className="p-2.5 border-r border-slate-900 font-bold text-slate-900">
                          {item.description}
                          {item.itemType === 'huruf_timbul' && item.textOrLabel && (
                            <span className="block font-mono text-slate-800 text-[10px] mt-0.5 font-semibold">
                              Teks: &quot;{item.textOrLabel}&quot;
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 border-r border-slate-900 text-center font-medium">
                          <span className="font-bold text-slate-900">{formatItemSizeClean(item)}</span>
                        </td>
                        <td className="p-2.5 border-r border-slate-900 text-[11px] text-slate-700">
                          <p>• {item.specifications || getMaterialDisplayLabel(item.material)}</p>
                          {item.lighting && item.lighting !== 'none' && (
                            <p>• Sistem Penerangan: {item.lighting === 'frontlit' ? 'LED Frontlit' : 'LED Backlight Siluet'}</p>
                          )}
                        </td>
                        <td className="p-2.5 border-r border-slate-900 text-center font-bold">{qty}</td>
                        <td className="p-2.5 border-r border-slate-900 text-right font-semibold">
                          {formatRupiah(unitPrice)}
                        </td>
                        <td className="p-2.5 text-right font-extrabold text-slate-900">
                          {formatRupiah(item.sellingPrice)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  {project.discountValue > 0 ? (
                    <>
                      <tr className="bg-slate-50 font-bold border-t border-slate-900 text-slate-800">
                        <td colSpan={6} className="p-2.5 border-r border-slate-900 text-right uppercase tracking-wider">
                          Sub Total
                        </td>
                        <td className="p-2.5 text-right">
                          {formatRupiah(project.subtotal || project.totalDeal)}
                        </td>
                      </tr>
                      <tr className="bg-slate-50 font-bold text-slate-700 border-t border-slate-300">
                        <td colSpan={6} className="p-2 border-r border-slate-900 text-right uppercase text-[11px]">
                          {project.discountNote || 'Diskon Khusus Proyek'}
                        </td>
                        <td className="p-2 text-right text-[11px]">
                          - {formatRupiah(project.discountValue)}
                        </td>
                      </tr>
                      <tr className="bg-slate-100 font-extrabold border-t-2 border-slate-900 text-slate-900">
                        <td colSpan={6} className="p-2.5 border-r border-slate-900 text-right uppercase tracking-wider">
                          Total Penawaran Akhir
                        </td>
                        <td className="p-2.5 text-right text-sm">
                          {formatRupiah(project.totalDeal)}
                        </td>
                      </tr>
                    </>
                  ) : (
                    <tr className="bg-slate-100 font-extrabold border-t-2 border-slate-900 text-slate-900">
                      <td colSpan={6} className="p-2.5 border-r border-slate-900 text-right uppercase tracking-wider">
                        Total Penawaran
                      </td>
                      <td className="p-2.5 text-right text-sm">
                        {formatRupiah(project.totalDeal)}
                      </td>
                    </tr>
                  )}
                </tfoot>
              </table>
            </div>

            {/* Term and Condition (Dynamic per Cabang & Editable) */}
            <div className="pt-2 space-y-1.5 text-xs text-slate-800">
              <p className="font-extrabold text-slate-900 uppercase tracking-wide">Term and Condition:</p>
              <ul className="list-disc pl-5 space-y-0.5 text-slate-700">
                {branch.defaultTerms.map((term, i) => (
                  <li key={i}>{term}</li>
                ))}
                <li>
                  Pembayaran ditransfer via rek <strong className="text-slate-900">{branch.bankName}: {branch.bankAccount}</strong> a.n <strong className="text-slate-900">{branch.bankAccountName}</strong>.
                </li>
              </ul>
            </div>

            {/* Penutup */}
            <p className="text-slate-700 pt-1">
              Demikian surat penawaran harga kami ajukan, atas perhatian dan kerjasamanya kami ucapkan terima kasih.
            </p>

            {/* Signature Area (Tanda Tangan Asli Pak Juju) */}
            <div className="pt-4 flex justify-end">
              <div className="text-center w-56">
                <p className="text-slate-800 font-semibold">{branch.city}, {displayDate}</p>
                <p className="text-slate-800 font-bold mb-1">Hormat Kami,</p>
                <div className="h-20 flex items-center justify-center my-1">
                  <img
                    src={branch.signatureImage}
                    alt="Tanda Tangan Juju Abdul Rohim"
                    className="h-16 w-auto object-contain"
                  />
                </div>
                <p className="font-extrabold text-slate-900 border-t border-slate-800 pt-1">
                  ({branch.signerName})
                </p>
                <p className="text-[10px] text-slate-500">{branch.name}</p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. SPK BENGKEL / WORK ORDER (NO-PRICE) */}
        {/* ========================================================================= */}
        {docType === 'spk' && (
          <div className="space-y-6 text-xs text-slate-800">
            {/* Header Metadata */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-300">
              <div>
                <p className="text-slate-500 font-bold uppercase text-[10px]">Nama Pemesan & Proyek:</p>
                <p className="font-extrabold text-sm text-slate-900">{project.clientName} ({project.clientPhone})</p>
                <p className="font-medium text-slate-700 mt-0.5">{project.title}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Lokasi: {project.installationAddress || '-'}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-500 font-bold uppercase text-[10px]">Informasi Produksi:</p>
                <p className="font-bold text-slate-900">Cabang: <span className="font-extrabold text-slate-900">{branch.name}</span></p>
                <p className="text-slate-700 mt-0.5">Target Selesai: <strong className="text-slate-900">12 Hari Kerja</strong></p>
                <p className="text-slate-700 font-bold text-[10px] mt-1 uppercase tracking-wider">
                  ⚠️ DOKUMEN BENGKEL / WORK ORDER (NO-PRICE)
                </p>
              </div>
            </div>

            {/* Technical BOM Table */}
            <div>
              <h3 className="font-extrabold text-slate-900 uppercase text-xs mb-2">
                Daftar Kebutuhan Material & Spesifikasi Bengkel (BOM):
              </h3>
              <table className="w-full text-left text-xs border border-slate-900">
                <thead className="bg-slate-100 text-slate-900 uppercase font-bold border-b border-slate-900">
                  <tr>
                    <th className="p-2.5 border-r border-slate-900 w-10 text-center">No</th>
                    <th className="p-2.5 border-r border-slate-900">Item & Teks Huruf</th>
                    <th className="p-2.5 border-r border-slate-900 text-center">Ukuran Bersih (P x L x T)</th>
                    <th className="p-2.5 border-r border-slate-900">Spesifikasi Bahan & Finishing</th>
                    <th className="p-2.5 text-center">Kelistrikan (LED & Trafo)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-400">
                  {project.items.map((item, idx) => {
                    const ledInfo = calculateLedModules({
                      category: item.itemType,
                      subCategory: item.material,
                      material: item.material,
                      heightCm: item.heightCm || undefined,
                      charCount: item.charCount || undefined,
                      lightingType: item.lighting || undefined,
                    });

                    return (
                      <tr key={item.id}>
                        <td className="p-2.5 border-r border-slate-900 text-center font-bold">{idx + 1}</td>
                        <td className="p-2.5 border-r border-slate-900 font-bold text-slate-900">
                          {item.description}
                          {item.itemType === 'huruf_timbul' && item.textOrLabel && (
                            <div className="font-mono text-slate-900 font-bold text-[11px] mt-0.5">
                              Teks: &quot;{item.textOrLabel}&quot;
                            </div>
                          )}
                        </td>
                        <td className="p-2.5 border-r border-slate-900 text-center font-bold">
                          <span className="font-black text-slate-900 text-xs">{formatItemSizeClean(item)}</span>
                        </td>
                        <td className="p-2.5 border-r border-slate-900 text-[11px] text-slate-700">
                          <p className="font-semibold text-slate-900">{getMaterialDisplayLabel(item.material)}</p>
                          <p className="text-slate-500 text-[10px]">Rangka: Hollow 4x4 Galvanis / Lis Profil</p>
                        </td>
                        <td className="p-2.5 text-center font-semibold text-slate-800">
                          {ledInfo.isIlluminated ? (
                            <>
                              <p className="font-bold text-slate-900">{item.ledCount || ledInfo.ledCount} Modul LED</p>
                              <p className="text-[10px] text-slate-600">Trafo: {item.trafoWatt || ledInfo.trafoWatt}W Rainproof</p>
                            </>
                          ) : (
                            <>
                              <p className="font-bold text-slate-600">Non-Lampu</p>
                              <p className="text-[10px] text-slate-400">Tanpa LED / Trafo</p>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* KARTU KENDALI MUTU & VERIFIKASI SPEK PO (LOCKED PO SNAPSHOT) */}
            <div className="border-2 border-slate-900 rounded-lg p-4 bg-white space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-slate-900 pb-2">
                <div>
                  <h4 className="font-black text-slate-900 text-xs uppercase tracking-tight">
                    KARTU KENDALI MUTU & VERIFIKASI SPEK PO (WORKSHOP QC)
                  </h4>
                  <p className="text-[10px] text-slate-600">
                    Pemeriksaan fisik wajib sebelum penutupan cover dan serah terima ke tim instalasi / ekspedisi.
                  </p>
                </div>
                <div className="px-3 py-1 bg-amber-100 border-2 border-amber-600 text-amber-950 font-black text-[11px] rounded tracking-wide uppercase text-center">
                  ⚠️ WAJIB HITUNG ULANG FISIK SEBELUM TUTUP BOX
                </div>
              </div>

              {/* Rincian Spek Terkunci per Item dari Snapshot */}
              <div className="space-y-2">
                {project.items.map((it, i) => {
                  const snap = typeof it.specSnapshot === 'string' ? JSON.parse(it.specSnapshot) : (it.specSnapshot || {});
                  const noteText = snap.fabricationNotes || snap.poNotes || it.qcNotes;
                  return (
                    <div key={it.id} className="p-3 bg-slate-50 border border-slate-300 rounded text-[11px] space-y-1.5">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                        <div>
                          <span className="text-[9.5px] text-slate-500 font-bold block uppercase">Item #{i + 1}:</span>
                          <p className="font-extrabold text-slate-900">{it.description}</p>
                          <p className="text-indigo-700 font-mono font-bold text-[10.5px]">
                            {snap.dimensions || formatItemSizeClean(it)}
                          </p>
                        </div>
                        <div>
                          <span className="text-[9.5px] text-slate-500 font-bold block uppercase">Bahan Utama & Dudukan:</span>
                          <p className="font-bold text-slate-900">{snap.materialName || getMaterialDisplayLabel(it.material)}</p>
                          <p className="text-slate-600 text-[10px]">{snap.mountType || snap.mountSpec || 'Tempel Dinding Langsung'}</p>
                        </div>
                        <div>
                          <span className="text-[9.5px] text-slate-500 font-bold block uppercase">LED & Trafo (Fisik):</span>
                          {it.ledCount || snap.poLedCount || snap.ledCount ? (
                            <div className="space-y-0.5">
                              <span className="font-extrabold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300 text-[10px] inline-block">
                                ⚡ {snap.poLedCount || it.ledCount || snap.ledCount} Pcs LED {snap.poTrafoType ? `(${snap.poTrafoType})` : ''} — WAJIB HITUNG ULANG
                              </span>
                              <p className="text-slate-600 text-[10px]">
                                Trafo: {snap.poTrafoType || (it.trafoWatt || snap.trafoWatt ? `Trafo ${it.trafoWatt || snap.trafoWatt}W Rainproof` : 'Standar Rainproof')}
                              </p>
                            </div>
                          ) : (
                            <span className="font-bold text-slate-500">Non-Lampu</span>
                          )}
                        </div>
                        <div>
                          <span className="text-[9.5px] text-slate-500 font-bold block uppercase">Visual / Stiker / Cat:</span>
                          <p className="font-semibold text-slate-800">{snap.stickerSpec || 'Standar Workshop'}</p>
                          <p className="text-slate-600 text-[10px]">{snap.paintSpec || '-'}</p>
                        </div>
                      </div>

                      {noteText && (
                        <div className="bg-amber-50/90 border border-amber-200 rounded p-2.5 text-slate-800 text-[11px] leading-snug">
                          <span className="font-extrabold text-amber-900 uppercase text-[10px] block">Instruksi Khusus Fabrikasi Bengkel:</span>
                          <p className="font-medium mt-0.5 whitespace-pre-wrap">{noteText}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Checklist Kendali Mutu Bengkel */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 pt-2 text-[10.5px]">
                <div className="p-2 border border-slate-300 rounded bg-white flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-slate-800 rounded flex items-center justify-center font-bold text-[9px]">[ ]</span>
                  <span>1. Verifikasi Ejaan Teks PO</span>
                </div>
                <div className="p-2 border border-slate-300 rounded bg-white flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-slate-800 rounded flex items-center justify-center font-bold text-[9px]">[ ]</span>
                  <span>2. Pengukuran Dimensi Bersih & Daun</span>
                </div>
                <div className="p-2 border border-slate-300 rounded bg-white flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-slate-800 rounded flex items-center justify-center font-bold text-[9px]">[ ]</span>
                  <span>3. Fisik Cat Rata & Stiker Rapi</span>
                </div>
                <div className="p-2 border border-slate-300 rounded bg-white flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-slate-800 rounded flex items-center justify-center font-bold text-[9px]">[ ]</span>
                  <span>4. Uji Nyala Lampu 12 Jam (Burn-In)</span>
                </div>
                <div className="p-2 border border-slate-300 rounded bg-white flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-slate-800 rounded flex items-center justify-center font-bold text-[9px]">[ ]</span>
                  <span>5. Seal Silicone Waterproof Rapat</span>
                </div>
                <div className="p-2 border border-slate-300 rounded bg-white flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-slate-800 rounded flex items-center justify-center font-bold text-[9px]">[ ]</span>
                  <span>6. Dynabolt & Breket Cadangan</span>
                </div>
              </div>

              {/* Baris Paraf QC */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-300 text-[10px] text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">Diperiksa oleh Mandor Bengkel:</span>
                  <span className="font-mono text-slate-500">(...........................................) Tgl: ...../.....</span>
                </div>
                <div className="flex items-center gap-2 text-right justify-end">
                  <span className="font-bold text-slate-900">Disetujui Kepala Gudang / QC:</span>
                  <span className="font-mono text-slate-500">(...........................................) Tgl: ...../.....</span>
                </div>
              </div>
            </div>

            {/* Simple Wiring Diagram & Technical Notes */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3.5 border border-slate-300 rounded-lg bg-slate-50">
                <h4 className="font-bold text-slate-900 text-[11px] uppercase mb-1.5">Diagram Wiring Kelistrikan LED:</h4>
                <div className="bg-white border border-slate-300 p-2.5 rounded text-[10px] text-slate-700 space-y-1 font-mono">
                  <p className="font-bold text-slate-900">[PLN 220V] ──► [MCB 6A / Timer]</p>
                  <p className="pl-14">│</p>
                  <p className="font-bold text-slate-900">               ▼</p>
                  <p className="font-bold text-slate-900">      [TRAFO 12V RAINPROOF]</p>
                  <p className="pl-14">│</p>
                  <p className="font-bold text-slate-800">      ├─► Jalur 1 (Max 50 Modul LED Paralel)</p>
                  <p className="font-bold text-slate-800">      └─► Jalur 2 (Max 50 Modul LED Paralel)</p>
                </div>
                <p className="text-[9.5px] text-slate-500 mt-1">
                  *Wajib pasang paralel tiap 50 modul untuk mencegah voltage drop redup di ujung.
                </p>
              </div>

              <div className="p-3.5 border border-slate-300 rounded-lg bg-slate-50 space-y-1">
                <h4 className="font-bold text-slate-900 text-[11px] uppercase mb-1">Catatan Khusus Teknisi Bengkel:</h4>
                <ul className="list-disc pl-4 text-[10.5px] text-slate-700 space-y-0.5">
                  <li>Lakukan <strong>Burn-In Test</strong> menyala nonstop 12 jam sebelum dipacking peti kayu.</li>
                  <li>Pastikan seal silicone neutral rapat di sisi atas untuk mencegah air hujan masuk ke modul LED.</li>
                  <li>Dynabolt dan breket siku wajib disiapkan 1 set cadangan untuk tim instalasi lapangan.</li>
                </ul>
              </div>
            </div>

            {/* Signature Area Bengkel */}
            <div className="grid grid-cols-2 gap-8 text-center pt-6 border-t border-slate-300">
              <div>
                <p className="font-semibold text-slate-600 mb-14">Dibuat Oleh (Admin / Estimator),</p>
                <p className="font-bold text-slate-900 uppercase">SALSABILLA ADVERTISING</p>
                <p className="text-[10px] text-slate-500">Divisi Teknis & Gambar Kerja</p>
              </div>
              <div>
                <p className="font-semibold text-slate-600 mb-14">Diterima Oleh (Kepala Bengkel),</p>
                <p className="font-bold text-slate-900 uppercase">(...................................................)</p>
                <p className="text-[10px] text-slate-500">Mandor / Workshop Head</p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. SURAT JALAN PENGIRIMAN */}
        {/* ========================================================================= */}
        {docType === 'surat_jalan' && (
          <div className="space-y-6 text-xs text-slate-800">
            {/* Header Surat Jalan */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-300">
              <div>
                <p className="text-slate-500 font-bold uppercase text-[10px]">Tujuan Pengiriman / Customer:</p>
                <p className="font-extrabold text-sm text-slate-900">{project.clientName}</p>
                <p className="text-slate-700">{project.clientPhone}</p>
                <p className="text-[11px] text-slate-600 mt-1">Alamat Tujuan: {project.installationAddress || 'Sesuai kesepakatan'}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-500 font-bold uppercase text-[10px]">Armada & Pengemudi:</p>
                <p className="font-bold text-slate-900">Kendaraan: <span className="font-mono font-bold text-slate-900">Mobil Pikap Gran Max</span></p>
                <p className="text-slate-700">No. Polisi: <strong className="text-slate-900">B 9147 TPA</strong></p>
                <p className="text-slate-700">Pengemudi: <strong className="text-slate-900">Kang Asep / Tim Ekspedisi</strong></p>
              </div>
            </div>

            {/* Table Barang */}
            <div>
              <h3 className="font-extrabold text-slate-900 uppercase text-xs mb-2">Daftar Muatan & Unit Signage:</h3>
              <table className="w-full text-left text-xs border border-slate-900">
                <thead className="bg-slate-100 text-slate-900 uppercase font-bold border-b border-slate-900">
                  <tr>
                    <th className="p-2.5 border-r border-slate-900 w-10 text-center">No</th>
                    <th className="p-2.5 border-r border-slate-900">Nama Barang / Unit Signage</th>
                    <th className="p-2.5 border-r border-slate-900 text-center">Ukuran</th>
                    <th className="p-2.5 border-r border-slate-900 text-center w-16">Qty</th>
                    <th className="p-2.5">Kelengkapan & Aksesoris Terbawa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-400">
                  {project.items.map((item, idx) => (
                    <tr key={item.id}>
                      <td className="p-2.5 border-r border-slate-900 text-center font-bold">{idx + 1}</td>
                      <td className="p-2.5 border-r border-slate-900 font-bold text-slate-900">{item.description}</td>
                      <td className="p-2.5 border-r border-slate-900 text-center font-medium">
                        <span>{formatItemSizeClean(item)}</span>
                      </td>
                      <td className="p-2.5 border-r border-slate-900 text-center font-bold">1 Unit</td>
                      <td className="p-2.5 text-[11px] text-slate-700">
                        Trafo Rainproof ({item.trafoWatt || 100}W), Dinabolt M10 (12 pcs), Breket Siku
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td className="p-2.5 border-r border-slate-900 text-center font-bold">{project.items.length + 1}</td>
                    <td className="p-2.5 border-r border-slate-900 font-bold text-slate-900">Aksesoris Tambahan & Kabel</td>
                    <td className="p-2.5 border-r border-slate-900 text-center">-</td>
                    <td className="p-2.5 border-r border-slate-900 text-center font-bold">1 Set</td>
                    <td className="p-2.5 text-[11px] text-slate-700">Kabel NYM 2x1.5 (25m), Sealant Silikon Bening, Steker Listrik</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* KARTU KENDALI MUTU & VERIFIKASI PENGIRIMAN */}
            <div className="border border-slate-900 rounded-lg p-3 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-900 text-xs uppercase">
                  VERIFIKASI FISIK & KELENGKAPAN SEBELUM BERANGKAT (QC SURAT JALAN)
                </span>
                <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  ⚠️ CEK FISIK SEBELUM NAIK PIKAP
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10.5px]">
                <div className="p-1.5 bg-white border border-slate-300 rounded flex items-center gap-1.5">
                  <span className="font-bold text-slate-800">[✓]</span> Unit Bebas Baret/Pecah
                </div>
                <div className="p-1.5 bg-white border border-slate-300 rounded flex items-center gap-1.5">
                  <span className="font-bold text-slate-800">[✓]</span> Packing Peti / Buble Wrap
                </div>
                <div className="p-1.5 bg-white border border-slate-300 rounded flex items-center gap-1.5">
                  <span className="font-bold text-slate-800">[✓]</span> Trafo Rainproof Terbawa
                </div>
                <div className="p-1.5 bg-white border border-slate-300 rounded flex items-center gap-1.5">
                  <span className="font-bold text-slate-800">[✓]</span> Breket & Dynabolt Lengkap
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-600 italic">
              *Barang telah diperiksa dalam kondisi lengkap, fisik mulus, dan siap untuk dipasang di lokasi.
            </p>

            {/* 3 Kolom Tanda Tangan: Pengirim | Pengemudi | Penerima */}
            <div className="grid grid-cols-3 gap-4 text-center pt-8 border-t border-slate-300 text-xs">
              <div>
                <p className="font-semibold text-slate-600 mb-16">Pengirim (Gudang/Bengkel),</p>
                <p className="font-bold text-slate-900 uppercase">SALSABILLA ADV</p>
                <p className="text-[10px] text-slate-500">Stempel & TTD</p>
              </div>
              <div>
                <p className="font-semibold text-slate-600 mb-16">Pengemudi (Sopir),</p>
                <p className="font-bold text-slate-900 uppercase">(...................................)</p>
                <p className="text-[10px] text-slate-500">Nama Terang & HP</p>
              </div>
              <div>
                <p className="font-semibold text-slate-600 mb-16">Penerima (Klien / PIC Lokasi),</p>
                <p className="font-bold text-slate-900 uppercase">({project.clientName})</p>
                <p className="text-[10px] text-slate-500">Tanda Tangan Penerima</p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. BAST (BERITA ACARA SERAH TERIMA) */}
        {/* ========================================================================= */}
        {docType === 'bast' && (
          <div className="space-y-6 text-xs text-slate-800 leading-relaxed">
            <div className="p-4 bg-slate-50 border border-slate-300 rounded-lg space-y-1">
              <p>Pada hari ini, <strong className="text-slate-900">{displayDate}</strong>, telah dilakukan serah terima penyelesaian pekerjaan reklame antara:</p>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="font-bold text-slate-900">Pihak Pertama (Pelaksana):</p>
                  <p className="font-semibold text-slate-900">{branch.name}</p>
                  <p className="text-slate-600">{branch.address}</p>
                </div>
                <div>
                  <p className="font-bold text-slate-900">Pihak Kedua (Pemesan/Klien):</p>
                  <p className="font-semibold text-slate-900">{project.clientName}</p>
                  <p className="text-slate-600">Lokasi: {project.installationAddress || '-'}</p>
                </div>
              </div>
            </div>

            {/* Checklist Serah Terima & Verifikasi Spek PO */}
            <div>
              <h3 className="font-extrabold text-slate-900 uppercase text-xs mb-2">Checklist Pemeriksaan Lapangan & Verifikasi Spek PO:</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded border border-slate-300 bg-white flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">✓</span>
                  <span><strong>Kesesuaian Spek PO:</strong> Warna stiker Oracal & finishing cat oven presisi</span>
                </div>
                <div className="p-2.5 rounded border border-slate-300 bg-white flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">✓</span>
                  <span><strong>Kekuatan Struktur:</strong> Dynabolt & breket terpasang kokoh pada dinding/fasad</span>
                </div>
                <div className="p-2.5 rounded border border-slate-300 bg-white flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">✓</span>
                  <span><strong>Uji Nyala Lampu:</strong> Seluruh modul LED menyala terang & arus trafo stabil</span>
                </div>
                <div className="p-2.5 rounded border border-slate-300 bg-white flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">✓</span>
                  <span><strong>Garansi & Kebersihan:</strong> Kartu garansi 1 tahun diserahkan & area kerja bersih</span>
                </div>
              </div>
            </div>

            {/* Pernyataan Legal */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded text-slate-700 leading-normal">
              <p className="font-bold text-slate-900 mb-0.5">Pernyataan:</p>
              Pihak Kedua telah memeriksa dan menyatakan bahwa seluruh pekerjaan telah selesai dengan baik dan diterima 
              sesuai pesanan. Dengan ditandatanganinya Berita Acara ini, masa garansi 1 (satu) tahun mulai berlaku dan penagihan sisa pembayaran dinyatakan sah.
            </div>

            {/* Dua Kolom TTD: Teknisi & Customer */}
            <div className="grid grid-cols-2 gap-12 text-center pt-8 border-t border-slate-300">
              <div>
                <p className="font-semibold text-slate-600 mb-16">Pihak Pertama (Pelaksana Pekerjaan),</p>
                <p className="font-bold text-slate-900 uppercase">SALSABILLA ADVERTISING</p>
                <p className="text-[10px] text-slate-500">Teknisi / Pengawas Lapangan</p>
              </div>
              <div>
                <p className="font-semibold text-slate-600 mb-16">Pihak Kedua (Pemesan / Customer),</p>
                <p className="font-bold text-slate-900 uppercase">{project.clientName}</p>
                <p className="text-[10px] text-slate-500">Tanda Tangan Penerima</p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 5. INVOICE TERMIN */}
        {/* ========================================================================= */}
        {docType === 'invoice' && (
          <div className="space-y-6 text-xs text-slate-800">
            {/* Metadata Invoice */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-300">
              <div>
                <p className="text-slate-500 font-bold uppercase text-[10px]">Ditagihkan Kepada:</p>
                <p className="font-extrabold text-sm text-slate-900">{project.clientName}</p>
                <p className="text-slate-700">{project.clientPhone}</p>
                <p className="text-slate-600 mt-0.5">{project.installationAddress || '-'}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-500 font-bold uppercase text-[10px]">Referensi Dokumen:</p>
                <p className="text-slate-700">No. Quotation: <strong className="text-slate-900">Q-{project.projectNumber.replace('PRJ-', '')}</strong></p>
                <p className="text-slate-700">No. SPK: <strong className="text-slate-900">SPK-{project.projectNumber.replace('PRJ-', '')}</strong></p>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded font-extrabold text-[10px] bg-slate-900 text-white uppercase">
                  {isDP ? 'TERMIN 1: UANG MUKA (DP 50%)' : 'TERMIN 2: PELUNASAN (50%)'}
                </span>
              </div>
            </div>

            {/* Table Rincian Tagihan */}
            <table className="w-full text-left text-xs border border-slate-900">
              <thead className="bg-slate-100 text-slate-900 uppercase font-bold border-b border-slate-900">
                <tr>
                  <th className="p-3 border-r border-slate-900">Deskripsi Tagihan Pekerjaan</th>
                  <th className="p-3 border-r border-slate-900 text-right w-36">Total Kontrak</th>
                  <th className="p-3 border-r border-slate-900 text-right w-32">Persentase</th>
                  <th className="p-3 text-right w-36">Jumlah Tagihan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-400">
                <tr>
                  <td className="p-3 border-r border-slate-900">
                    <p className="font-bold text-slate-900">{project.title}</p>
                    <p className="text-slate-600 text-[11px] mt-0.5">
                      {isDP ? 'Pembayaran Uang Muka (DP) 50% untuk memulai pabrikasi bengkel.' : 'Pelunasan 50% setelah serah terima pekerjaan (BAST).'}
                    </p>
                  </td>
                  <td className="p-3 border-r border-slate-900 text-right font-semibold">
                    {formatRupiah(project.totalDeal)}
                  </td>
                  <td className="p-3 border-r border-slate-900 text-right font-bold text-slate-900">
                    50%
                  </td>
                  <td className="p-3 text-right font-extrabold text-slate-900 text-sm">
                    {formatRupiah(invoiceAmount)}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-extrabold border-t-2 border-slate-900 text-slate-900">
                  <td colSpan={3} className="p-3 border-r border-slate-900 text-right uppercase">
                    Total Tagihan Saat Ini
                  </td>
                  <td className="p-3 text-right text-base font-black text-slate-900">
                    {formatRupiah(invoiceAmount)}
                  </td>
                </tr>
              </tfoot>
            </table>

            {/* Instruksi Transfer Bank Resmi Cabang */}
            <div className="p-4 bg-slate-50 border border-slate-300 rounded-lg space-y-1">
              <p className="font-extrabold text-slate-900 uppercase tracking-wide">Instruksi Pembayaran Transfer:</p>
              <p className="text-slate-700">Pembayaran dapat ditransfer ke rekening resmi:</p>
              <div className="font-mono text-xs pt-1 space-y-0.5">
                <p>Bank: <strong className="text-slate-900 font-sans">{branch.bankName}</strong></p>
                <p>No. Rekening: <strong className="text-slate-900 font-mono text-sm font-bold">{branch.bankAccount}</strong></p>
                <p>Atas Nama: <strong className="text-slate-900 font-sans">{branch.bankAccountName}</strong></p>
              </div>
              <p className="text-[10.5px] text-slate-500 pt-1">
                *Harap kirimkan bukti transfer via WhatsApp ke <strong>{branch.whatsapp.split('/')[0]}</strong> untuk verifikasi instan bagian Finance.
              </p>
            </div>

            {/* Signature Area */}
            <div className="pt-4 flex justify-end">
              <div className="text-center w-56">
                <p className="text-slate-800 font-semibold">{branch.city}, {displayDate}</p>
                <p className="text-slate-800 font-bold mb-1">Hormat Kami,</p>
                <div className="h-16 flex items-center justify-center my-1">
                  <img
                    src={branch.signatureImage}
                    alt="Tanda Tangan Juju Abdul Rohim"
                    className="h-14 w-auto object-contain"
                  />
                </div>
                <p className="font-extrabold text-slate-900 border-t border-slate-800 pt-1">
                  ({branch.signerName})
                </p>
                <p className="text-[10px] text-slate-500">{branch.name}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
