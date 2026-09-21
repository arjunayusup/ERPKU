'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  calculatePricing, 
  calculateReverseMargin,
  getMarginHealthStatus,
  distributeNegotiatedTotal,
  generateWhatsAppQuoteText,
  getMaterialDisplayLabel,
  formatItemDimensions,
  formatItemSizeClean,
  ModularProductSpec,
  MultiItemLine
} from '@/lib/calculator-modular';
import { getAllBranches, getBranchConfig } from '@/lib/branches';
import { createQuotationAction, updateQuotationAction, getQuotationByIdAction } from '@/app/actions/quotation';
import { 
  Calculator, 
  Plus, 
  Trash2, 
  Edit3, 
  Send, 
  Save, 
  MapPin, 
  Phone, 
  User, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Sparkles, 
  Layers, 
  Construction, 
  CheckCircle2, 
  AlertCircle,
  X,
  FileText,
  RotateCcw,
  Loader2
} from 'lucide-react';

function CalculatorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const branches = getAllBranches();

  // 1. HEADER TRANSAKSI (DATA KLIEN BERSIH / CLEAN-SLATE)
  const [branchId, setBranchId] = useState('jakarta');
  const [projectName, setProjectName] = useState('');
  const [clientName, setClientName] = useState('');
  const [picName, setPicName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [installationAddress, setInstallationAddress] = useState('');

  // 2. DAFTAR MULTI-ITEM (ARRAY DETAIL)
  const [items, setItems] = useState<MultiItemLine[]>([]);

  // 3. MODAL INPUT ITEM BARU
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // State Form Modal Item (Hanya 3 Kategori Utama Reklame: Huruf Timbul, Neon Box, Billboard)
  const [modalCategory, setModalCategory] = useState<'huruf_timbul' | 'neon_box' | 'papan_reklame'>('huruf_timbul');
  const [modalSubCategory, setModalSubCategory] = useState('stainless_biasa_led');
  const [modalText, setModalText] = useState('');
  const [modalCharCount, setModalCharCount] = useState(10);
  const [modalHeightCm, setModalHeightCm] = useState(20);
  const [modalLengthCm, setModalLengthCm] = useState(0);
  const [modalPoleType, setModalPoleType] = useState<'none' | 'pipa_2' | 'pipa_3' | 'pipa_4' | 'pipa_6' | 'rangka_hollow'>('none');
  const [modalPoleHeightMeter, setModalPoleHeightMeter] = useState(3);
  const [modalPondasi, setModalPondasi] = useState(false);
  const [modalPondasiPoints, setModalPondasiPoints] = useState(1);
  const [modalQuantity, setModalQuantity] = useState(1);
  const [modalCustomDesc, setModalCustomDesc] = useState('');

  // 4. NEGOSIASI DUA ARAH
  const [customDealPrice, setCustomDealPrice] = useState<number | null>(null);

  // 5. FITUR PRIVASI & STATE SIMPAN
  const [hideConfidential, setHideConfidential] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProject, setIsLoadingProject] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);

  const activeBranch = getBranchConfig(branchId);

  // Load existing project if edit param exists
  useEffect(() => {
    if (editId) {
      setIsLoadingProject(true);
      getQuotationByIdAction(editId).then((res) => {
        setIsLoadingProject(false);
        if (res.success && res.project) {
          setIsEditMode(true);
          const p = res.project;
          setProjectName(p.title || '');
          setClientName(p.clientName || '');
          setPicName(p.picName || '');
          setClientPhone(p.clientPhone || '');
          setInstallationAddress(p.installationAddress || '');
          setBranchId(p.branch || 'jakarta');
          setItems(
            p.items.map((it: any) => ({
              id: it.id,
              itemType: it.itemType,
              description: it.description,
              specifications: it.specifications || '',
              dimensions: formatItemDimensions(it),
              textOrLabel: it.textOrLabel || '',
              charCount: it.charCount || undefined,
              heightCm: it.heightCm || undefined,
              widthCm: it.widthCm || undefined,
              material: it.material,
              lighting: it.lighting || 'none',
              quantity: it.quantity,
              unitPrice: it.unitPrice,
              sellingPrice: it.sellingPrice,
              unitHpp: it.unitHpp,
              hppPrice: it.hppPrice,
            }))
          );
          if (p.totalDeal && p.totalDeal !== p.subtotal) {
            setCustomDealPrice(p.totalDeal);
          }
        }
      });
    }
  }, [editId]);

  // Hitung akumulasi dasar dari items
  const baseSubtotal = useMemo(() => {
    return items.reduce((acc, it) => acc + it.sellingPrice, 0);
  }, [items]);

  const baseHppTotal = useMemo(() => {
    return items.reduce((acc, it) => acc + it.hppPrice, 0);
  }, [items]);

  // Total deal setelah penyesuaian nego
  const effectiveGrandTotal = useMemo(() => {
    if (customDealPrice !== null && customDealPrice > 0) {
      return customDealPrice;
    }
    return baseSubtotal;
  }, [customDealPrice, baseSubtotal]);

  // Margin Riil Dua Arah
  const realMarginPercent = useMemo(() => {
    return calculateReverseMargin(baseHppTotal, effectiveGrandTotal);
  }, [baseHppTotal, effectiveGrandTotal]);

  const healthStatus = useMemo(() => {
    return getMarginHealthStatus(realMarginPercent);
  }, [realMarginPercent]);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  // Switch Sub-Category in modal
  const handleModalCategoryChange = (cat: 'huruf_timbul' | 'neon_box' | 'papan_reklame') => {
    setModalCategory(cat);
    if (cat === 'huruf_timbul') {
      setModalSubCategory('stainless_biasa_led');
    } else if (cat === 'neon_box') {
      setModalSubCategory('neon_box_2sisi');
      setModalLengthCm(100);
      setModalHeightCm(100);
    } else {
      setModalSubCategory('reklame_flexi_korea');
      setModalLengthCm(300);
      setModalHeightCm(100);
    }
  };

  // Open Modal for New Item
  const handleOpenNewItem = () => {
    setEditingItemId(null);
    setModalCategory('huruf_timbul');
    setModalSubCategory('stainless_biasa_led');
    setModalText('');
    setModalCharCount(10);
    setModalHeightCm(20);
    setModalLengthCm(0);
    setModalPoleType('none');
    setModalPoleHeightMeter(3);
    setModalPondasi(false);
    setModalPondasiPoints(1);
    setModalQuantity(1);
    setModalCustomDesc('');
    setIsModalOpen(true);
  };

  // Open Modal for Editing Item
  const handleOpenEditItem = (item: MultiItemLine) => {
    setEditingItemId(item.id);
    const cat = (item.itemType === 'tiang' ? 'papan_reklame' : (item.itemType as any)) || 'huruf_timbul';
    setModalCategory(cat);
    setModalSubCategory(item.material || 'stainless_biasa_led');
    setModalText(item.textOrLabel || '');
    setModalCharCount(item.charCount || 10);
    setModalHeightCm(item.heightCm || 20);
    setModalLengthCm(cat === 'huruf_timbul' ? (item.widthCm || 0) : (item.widthCm || 100));
    setModalPoleType('none');
    setModalPoleHeightMeter(3);
    setModalPondasi(false);
    setModalPondasiPoints(1);
    setModalQuantity(item.quantity || 1);
    setModalCustomDesc(item.description || '');
    setIsModalOpen(true);
  };

  // Simpan Item dari Modal ke Daftar
  const handleSaveItemFromModal = () => {
    const hasPole = modalPoleType !== 'none';

    // Hitung pricing untuk item ini
    const tempSpec: ModularProductSpec = {
      category: modalCategory,
      subCategory: modalSubCategory,
      lengthCm: modalCategory === 'huruf_timbul' ? 0 : Number(modalLengthCm),
      heightCm: Number(modalHeightCm),
      text: modalText,
      charCount: modalCategory === 'huruf_timbul' ? (modalText.replace(/\s+/g, '').length || Number(modalCharCount)) : undefined,
      lightingType: modalSubCategory.includes('led') ? 'led_ip68_waterproof' : 'none',
      needPoleConstruction: hasPole,
      poleType: hasPole ? modalPoleType : undefined,
      poleHeightMeter: hasPole ? Number(modalPoleHeightMeter) : undefined,
      needPondasiCakarAyam: hasPole ? modalPondasi : false,
      pondasiPoints: hasPole && modalPondasi ? Number(modalPondasiPoints) : undefined,
      floorLevel: 1,
      targetMarginPercent: 35,
    };

    const itemPricing = calculatePricing(tempSpec);

    let desc = '';
    let dims = '';
    let specs = '';

    let poleDesc = '';
    if (hasPole) {
      const poleName = modalPoleType === 'pipa_2' ? 'Tiang Pipa Besi 2"' 
        : modalPoleType === 'pipa_3' ? 'Tiang Pipa Besi 3"' 
        : modalPoleType === 'pipa_4' ? 'Tiang Pipa Besi 4"' 
        : modalPoleType === 'pipa_6' ? 'Tiang Pipa Besi 6" Schedule' 
        : 'Rangka Hollow/Siku';
      poleDesc = `Konstruksi: ${poleName} (${modalPoleHeightMeter}m)${modalPondasi ? ` + Cor Cakar Ayam (${modalPondasiPoints} Titik)` : ''}`;
    }

    if (modalCategory === 'huruf_timbul') {
      const charNum = modalText.replace(/\s+/g, '').length || modalCharCount;
      desc = modalCustomDesc || `Huruf Timbul ${modalText ? `"${modalText.toUpperCase()}"` : ''}`;
      dims = formatItemDimensions({
        itemType: 'huruf_timbul',
        heightCm: Number(modalHeightCm),
        widthCm: Number(modalLengthCm) || null,
        charCount: charNum,
        textOrLabel: modalText,
      });
      specs = itemPricing.material.materialDescription + (poleDesc ? `\n• ${poleDesc}` : '');
    } else if (modalCategory === 'neon_box') {
      desc = modalCustomDesc || (modalSubCategory === 'neon_box_2sisi' ? 'Neon Box Akrilik 2 Sisi' : 'Neon Box Akrilik 1 Sisi');
      dims = `${modalLengthCm} x ${modalHeightCm} cm (${itemPricing.material.areaM2} m²)`;
      specs = itemPricing.material.materialDescription + (poleDesc ? `\n• ${poleDesc}` : '');
    } else {
      desc = modalCustomDesc || 'Papan Reklame Flexi Korea';
      dims = `${modalLengthCm} x ${modalHeightCm} cm (${itemPricing.material.areaM2} m²)`;
      specs = itemPricing.material.materialDescription + (poleDesc ? `\n• ${poleDesc}` : '');
    }

    const unitSell = itemPricing.finalSellingPrice;
    const unitHpp = itemPricing.subtotalHpp;
    const qty = Number(modalQuantity) || 1;

    const newItem: MultiItemLine = {
      id: editingItemId || `item-${Date.now()}`,
      itemType: modalCategory,
      description: desc,
      specifications: specs,
      dimensions: dims,
      textOrLabel: modalText,
      charCount: modalCategory === 'huruf_timbul' ? (modalText.replace(/\s+/g, '').length || modalCharCount) : undefined,
      heightCm: Number(modalHeightCm),
      widthCm: modalCategory === 'huruf_timbul' ? (Number(modalLengthCm) || 0) : Number(modalLengthCm),
      material: modalSubCategory,
      lighting: modalSubCategory.includes('led') ? 'frontlit' : 'none',
      quantity: qty,
      unitPrice: unitSell,
      sellingPrice: unitSell * qty,
      unitHpp,
      hppPrice: unitHpp * qty,
    };

    if (editingItemId) {
      setItems(items.map((it) => (it.id === editingItemId ? newItem : it)));
    } else {
      setItems([...items, newItem]);
    }

    // AUTO-RESET HARGA NEGO: Agar penambahan item merefleksikan harga riil akumulasi baru
    setCustomDealPrice(null);
    setIsModalOpen(false);
  };

  // Hapus Baris Item & Auto-reset Nego
  const handleDeleteItem = (id: string) => {
    setItems(items.filter((it) => it.id !== id));
    setCustomDealPrice(null); // AUTO-RESET
  };

  // Kirim WhatsApp Ringkas
  const handleSendWhatsApp = () => {
    if (!clientName || !clientPhone) {
      alert('Silakan isi Nama Usaha Klien dan Nomor WhatsApp terlebih dahulu.');
      return;
    }

    if (items.length === 0) {
      alert('Tambahkan minimal 1 item produk terlebih dahulu.');
      return;
    }

    const rawNumber = clientPhone.replace(/[^0-9]/g, '');
    let cleanNumber = rawNumber;
    if (rawNumber.startsWith('0')) cleanNumber = '62' + rawNumber.substring(1);
    else if (!rawNumber.startsWith('62')) cleanNumber = '62' + rawNumber;

    const message = generateWhatsAppQuoteText({
      clientName,
      projectName,
      items,
      grandTotal: effectiveGrandTotal,
      branchId,
    });

    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // Simpan atau Perbarui Penawaran Resmi ke Database
  const handleSaveQuotation = async () => {
    setErrorMessage('');
    if (!clientName || !clientPhone) {
      setErrorMessage('Nama Usaha Klien dan Nomor WhatsApp wajib diisi.');
      return;
    }
    if (items.length === 0) {
      setErrorMessage('Tambahkan minimal 1 item produk sebelum menyimpan.');
      return;
    }

    // Jika ada penyesuaian harga nego lapangan, sebarkan proporsional ke unit price tanpa baris diskon terpisah
    const finalItems = customDealPrice && customDealPrice > 0 && customDealPrice !== baseSubtotal
      ? distributeNegotiatedTotal(items, effectiveGrandTotal)
      : items;

    setIsSubmitting(true);
    try {
      if (isEditMode && editId) {
        // MODE UPDATE
        const res = await updateQuotationAction(editId, {
          branch: branchId,
          projectName: projectName || `Signage - ${clientName}`,
          clientName,
          picName,
          clientPhone,
          installationAddress,
          subtotal: baseSubtotal,
          totalDeal: effectiveGrandTotal,
          totalHpp: baseHppTotal,
          items: finalItems.map((it) => ({
            itemType: it.itemType,
            description: it.description,
            specifications: it.specifications,
            textOrLabel: it.textOrLabel,
            charCount: it.charCount,
            heightCm: it.heightCm,
            widthCm: it.widthCm,
            material: it.material,
            lighting: it.lighting,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            sellingPrice: it.sellingPrice,
            unitHpp: it.unitHpp,
            hppPrice: it.hppPrice,
          })),
        });

        if (res.success) {
          router.push(`/projects/${editId}`);
        } else {
          setErrorMessage(res.error || 'Terjadi kesalahan saat memperbarui penawaran.');
        }
      } else {
        // MODE CREATE BARU
        const res = await createQuotationAction({
          branch: branchId,
          projectName: projectName || `Signage - ${clientName}`,
          clientName,
          picName,
          clientPhone,
          installationAddress,
          subtotal: baseSubtotal,
          totalDeal: effectiveGrandTotal,
          totalHpp: baseHppTotal,
          items: finalItems.map((it) => ({
            itemType: it.itemType,
            description: it.description,
            specifications: it.specifications,
            textOrLabel: it.textOrLabel,
            charCount: it.charCount,
            heightCm: it.heightCm,
            widthCm: it.widthCm,
            material: it.material,
            lighting: it.lighting,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            sellingPrice: it.sellingPrice,
            unitHpp: it.unitHpp,
            hppPrice: it.hppPrice,
          })),
        });

        if (res.success && res.projectId) {
          router.push(`/projects/${res.projectId}`);
        } else {
          setErrorMessage(res.error || 'Terjadi kesalahan saat menyimpan.');
        }
      }
    } catch (e: any) {
      setErrorMessage(e.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingProject) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm max-w-md mx-auto my-12">
        <Loader2 className="w-8 h-8 text-rose-600 animate-spin mx-auto mb-3" />
        <h2 className="font-bold text-slate-900 text-sm">Memuat Data Penawaran...</h2>
        <p className="text-xs text-slate-500 mt-1">Mengambil rincian item reklame untuk mode edit.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <Calculator className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight">
                {isEditMode ? 'Edit Penawaran Proyek (Multi-Item)' : 'Pembuat Penawaran Resmi (Multi-Item)'}
              </h1>
              {isEditMode && (
                <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                  Mode Perubahan Aktif
                </span>
              )}
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Susun multi-item reklame, hitung negosiasi dua arah, dan terbitkan penawaran resmi Salsabilla.
          </p>
        </div>

        {/* Branch Selector & Privacy Mode Toggle */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setHideConfidential(!hideConfidential)}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border ${
              hideConfidential
                ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {hideConfidential ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{hideConfidential ? 'Mode Sensor Klien (ON)' : 'Buka HPP Internal'}</span>
          </button>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-2 rounded-xl">
            <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
            <div className="text-xs">
              <span className="block text-[9px] uppercase font-bold text-slate-400">Cabang Proyek:</span>
              <select
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                className="font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    Cabang {b.city}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Form Layout: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left (7 cols): Data Klien & Daftar Multi-Item */}
        <div className="lg:col-span-7 space-y-5">
          {/* 1. Header Informasi Proyek & Klien (Clean Inputs) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <User className="w-4 h-4 text-rose-600" />
              1. Informasi Proyek & Klien
            </h2>

            <div className="space-y-3 text-xs">
              {/* Baris 1: Judul Pekerjaan Proyek (Di Atas & Dominan) */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Judul Pekerjaan Proyek <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Contoh: Pekerjaan Signage Huruf Timbul Rotio Outlet Dago"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-black text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-rose-500"
                />
              </div>

              {/* Baris 2: Nama Usaha Klien & PIC Kontak */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nama Usaha / Toko Klien <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Contoh: Kopi Kenangan / Rotio"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama PIC Kontak</label>
                  <input
                    type="text"
                    value={picName}
                    onChange={(e) => setPicName(e.target.value)}
                    placeholder="Contoh: Bu Bella"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              {/* Baris 3: WhatsApp & Alamat Pemasangan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nomor WhatsApp <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="Contoh: 081299887766"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Alamat Pemasangan Lengkap</label>
                  <input
                    type="text"
                    value={installationAddress}
                    onChange={(e) => setInstallationAddress(e.target.value)}
                    placeholder="Contoh: Jl. Dago No. 12, Bandung (Lantai 2)"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Detail Item Produk Reklame (Multi-Item List) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  2. Rincian Item Reklame ({items.length} Item)
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Bisa menambahkan banyak produk sekaligus dalam 1 dokumen penawaran.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenNewItem}
                className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Item</span>
              </button>
            </div>

            {/* List Item Table / Cards */}
            {items.length === 0 ? (
              <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-2">
                <Layers className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-600">Belum ada item reklame ditambahkan.</p>
                <p className="text-[11px] text-slate-400">
                  Klik tombol &quot;Tambah Item&quot; untuk memilih Huruf Timbul, Neon Box, atau Billboard.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/70 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-400 text-[11px]">#{idx + 1}</span>
                        <span className="font-extrabold text-slate-900 text-sm">
                          {item.description}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white border border-slate-200 text-slate-700 uppercase">
                          {item.itemType}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px]">
                        {item.dimensions ? `Ukuran: ${item.dimensions} • ` : ''}
                        Bahan: <strong className="text-slate-800">{getMaterialDisplayLabel(item.material)}</strong>
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                      <div className="text-right">
                        <span className="font-black text-slate-900 text-sm block">
                          {formatRupiah(item.sellingPrice)}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {item.quantity}x @ {formatRupiah(item.unitPrice)}
                        </span>
                        {!hideConfidential && (
                          <span className="text-[10px] text-slate-400 block">
                            (HPP: {formatRupiah(item.hppPrice)})
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditItem(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                          title="Edit Baris Item"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Hapus Baris Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right (5 cols): Kalkulasi Dua Arah & Ringkasan Dokumen */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main Financial Card (Grand Total & Reverse Margin) */}
          <div className="bg-gradient-to-br from-rose-600 to-rose-700 text-white rounded-2xl p-5 sm:p-6 shadow-md shadow-rose-600/20 space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-rose-100 uppercase tracking-wider font-bold text-[10px]">
                Grand Total Penawaran
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white font-bold text-[10px]">
                {activeBranch.city}
              </span>
            </div>

            <div className="border-t border-rose-500/60 pt-3">
              <div className="text-3xl sm:text-4xl font-black tracking-tight">
                {formatRupiah(effectiveGrandTotal)}
              </div>
              <p className="text-[11px] text-rose-100/90 mt-1">
                {items.length} item pekerjaan • Garansi resmi 1 tahun
              </p>
            </div>

            {/* Two-Way Reverse Margin Status (Internal Admin View) */}
            {!hideConfidential ? (
              <div className="p-3 bg-white/10 rounded-xl space-y-1.5 text-xs border border-white/10">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-rose-100">Total Modal HPP Dapur:</span>
                  <span className="font-extrabold text-white">{formatRupiah(baseHppTotal)}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-rose-100">Margin Laba Bersih:</span>
                  <span className="font-black text-white">
                    {realMarginPercent}% ({healthStatus.label})
                  </span>
                </div>
                <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden mt-1">
                  <div
                    className={`h-full rounded-full transition-all ${
                      healthStatus.code === 'safe' ? 'bg-emerald-400' :
                      healthStatus.code === 'warning' ? 'bg-amber-400' : 'bg-red-400'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(5, realMarginPercent))}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="p-2.5 bg-black/10 rounded-xl text-[10px] text-rose-100/80 text-center">
                🔒 Data Modal HPP dan Margin Disensor (Mode Klien Aktif)
              </div>
            )}

            {/* Quick Action Buttons */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={handleSaveQuotation}
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-rose-50 text-rose-700 font-black text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? 'Menyimpan...'
                    : isEditMode
                    ? 'Perbarui Penawaran (Simpan Perubahan)'
                    : 'Simpan Penawaran Resmi'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim Estimasi ke WhatsApp (Ringkas)</span>
              </button>
            </div>
          </div>

          {/* SIMPLIFIED NEGOTIATION / NEGO LAPANGAN (REAKTIF & PROFESSIONAL) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-black uppercase tracking-wider text-slate-800 text-[11px] block">
                Tawar-Menawar / Nego Lapangan:
              </span>
              {customDealPrice && customDealPrice > 0 && (
                <button
                  type="button"
                  onClick={() => setCustomDealPrice(null)}
                  className="text-[11px] text-rose-600 font-bold hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Reset Normal
                </button>
              )}
            </div>

            <div>
              <label className="block text-[11px] text-slate-600 mb-1">
                Ketik Harga Kesepakatan Final (Nego):
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 font-bold text-slate-400 text-xs">Rp</span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={customDealPrice || ''}
                  onChange={(e) => setCustomDealPrice(Number(e.target.value) || null)}
                  placeholder="Kosongkan jika harga normal (tanpa nego)"
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-black text-slate-900 text-sm focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            {customDealPrice && customDealPrice > 0 && (
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <div className="flex justify-between items-center">
                  <span>Harga Normal Akumulasi:</span>
                  <span className="font-bold text-slate-800">{formatRupiah(baseSubtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-rose-600 font-bold">
                  <span>Penyesuaian Nego:</span>
                  <span>{formatRupiah(customDealPrice - baseSubtotal)}</span>
                </div>
                <p className="text-[10px] text-slate-400 italic pt-0.5">
                  *Otomatis didistribusikan ke harga satuan tiap item saat disimpan, tanpa mencantumkan kata diskon di dokumen klien.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL INPUT ITEM REKLAME MODULAR */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 my-8 border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-slate-900 uppercase">
                {editingItemId ? 'Edit Baris Item' : 'Tambah Item Produk Reklame'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 3 Category Tabs: Signage Only */}
            <div className="grid grid-cols-3 gap-1.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => handleModalCategoryChange('huruf_timbul')}
                className={`py-2 px-1 rounded-xl border text-center transition ${
                  modalCategory === 'huruf_timbul'
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Huruf Timbul
              </button>
              <button
                type="button"
                onClick={() => handleModalCategoryChange('neon_box')}
                className={`py-2 px-1 rounded-xl border text-center transition ${
                  modalCategory === 'neon_box'
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Neon Box
              </button>
              <button
                type="button"
                onClick={() => handleModalCategoryChange('papan_reklame')}
                className={`py-2 px-1 rounded-xl border text-center transition ${
                  modalCategory === 'papan_reklame'
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Billboard
              </button>
            </div>

            {/* Material & Specification Dropdown */}
            <div className="text-xs">
              <label className="block font-bold text-slate-700 mb-1">Pilihan Spesifikasi & Tarif Resmi:</label>
              {modalCategory === 'huruf_timbul' && (
                <select
                  value={modalSubCategory}
                  onChange={(e) => setModalSubCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                >
                  <option value="stainless_biasa_led">Stainless Steel Biasa + Lampu LED — Rp 20.000 / cm</option>
                  <option value="stainless_gold_led">Stainless Gold Titanium + Lampu LED — Rp 25.000 / cm</option>
                  <option value="akrilik_dual_glow">Akrilik Dual Glow Depan & Belakang — Rp 18.000 / cm</option>
                  <option value="stainless_off">Stainless Steel (Tanpa Lampu) — Rp 12.000 / cm</option>
                  <option value="akrilik_off">Akrilik Solid (Tanpa Lampu) — Rp 10.000 / cm</option>
                  <option value="galvanis_duco_off">Galvanis Cat Duco (Tanpa Lampu) — Rp 10.000 / cm</option>
                </select>
              )}

              {modalCategory === 'neon_box' && (
                <select
                  value={modalSubCategory}
                  onChange={(e) => setModalSubCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                >
                  <option value="neon_box_2sisi">Neon Box 2 Sisi Akrilik + Lampu TL — Rp 2.850.000 / m²</option>
                  <option value="neon_box_1sisi">Neon Box 1 Sisi Akrilik + Lampu TL — Rp 1.900.000 / m²</option>
                </select>
              )}

              {modalCategory === 'papan_reklame' && (
                <select
                  value={modalSubCategory}
                  onChange={(e) => setModalSubCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                >
                  <option value="reklame_flexi_korea">Papan Reklame Hollow 3x3 + Flexi Korea — Rp 950.000 / m²</option>
                  <option value="billboard_heavy_duty">Rangka Billboard Besi Siku Heavy Duty — Rp 1.350.000 / m²</option>
                </select>
              )}
            </div>

            {/* Dimension Inputs per Category */}
            {modalCategory === 'huruf_timbul' && (
              <div className="space-y-2.5 text-xs">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Teks / Kata Huruf Timbul:</label>
                  <input
                    type="text"
                    value={modalText}
                    onChange={(e) => {
                      setModalText(e.target.value);
                      const clean = e.target.value.replace(/\s+/g, '');
                      setModalCharCount(clean.length || 1);
                    }}
                    placeholder="Contoh: KOPI KENANGAN"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-black text-slate-900 uppercase"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Tinggi Huruf (cm) *:</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={modalHeightCm}
                      onChange={(e) => setModalHeightCm(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                    />
                    <span className="text-[10px] text-slate-400 block mt-0.5">Dihitung tarif per cm</span>
                  </div>
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Jumlah Huruf *:</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={modalCharCount}
                      onChange={(e) => setModalCharCount(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                    />
                    <span className="text-[10px] text-slate-400 block mt-0.5">Otomatis dari teks di atas</span>
                  </div>
                </div>
                <div>
                  <label className="block font-medium text-slate-500 mb-1">
                    Estimasi Bentang Dinding Lapangan (cm) <span className="font-normal text-slate-400">[Opsional]</span>:
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={modalLengthCm || ''}
                    onChange={(e) => setModalLengthCm(Number(e.target.value))}
                    placeholder="Contoh: 300 (bentangan dinding)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 text-xs"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    *Hanya catatan bentangan fisik dinding lokasi (opsional), tidak dihitung sebagai ukuran tinggi per huruf.
                  </span>
                </div>
              </div>
            )}

            {(modalCategory === 'neon_box' || modalCategory === 'papan_reklame') && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Panjang (cm):</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={modalLengthCm}
                    onChange={(e) => setModalLengthCm(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Tinggi / Lebar (cm):</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={modalHeightCm}
                    onChange={(e) => setModalHeightCm(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                  />
                </div>
              </div>
            )}

            {/* Opsi Konstruksi Tiang & Pondasi Dropdown (Bukan Tab) */}
            <div className="space-y-2 text-xs pt-3 border-t border-slate-200">
              <label className="block font-bold text-slate-800 mb-1">
                Konstruksi Tiang & Pondasi (Opsional):
              </label>
              <select
                value={modalPoleType}
                onChange={(e) => setModalPoleType(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
              >
                <option value="none">Tanpa Tiang (Pasang di Dinding / Fasad)</option>
                <option value="pipa_3">Tiang Pipa Besi 3 Inch (+ Rp 250.000 / meter)</option>
                <option value="pipa_2">Tiang Pipa Besi 2 Inch (+ Rp 175.000 / meter)</option>
                <option value="pipa_4">Tiang Pipa Besi 4 Inch (+ Rp 375.000 / meter)</option>
                <option value="pipa_6">Tiang Pipa Besi 6 Inch Schedule (+ Rp 650.000 / meter)</option>
                <option value="rangka_hollow">Rangka Besi Hollow & Siku (+ Rp 150.000 / meter)</option>
              </select>

              {modalPoleType !== 'none' && (
                <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-200 space-y-2.5 mt-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tinggi Tiang (Meter):</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={modalPoleHeightMeter}
                      onChange={(e) => setModalPoleHeightMeter(Number(e.target.value))}
                      min={1}
                      max={20}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                    />
                  </div>
                  <div className="pt-1">
                    <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={modalPondasi}
                        onChange={(e) => setModalPondasi(e.target.checked)}
                        className="rounded text-rose-600 w-4 h-4"
                      />
                      <span>+ Cor Pondasi Cakar Ayam</span>
                    </label>
                    {modalPondasi && (
                      <div className="mt-2 pl-6">
                        <label className="block text-[11px] text-slate-600 mb-1">Jumlah Titik Cakar Ayam:</label>
                        <input
                          type="number"
                          value={modalPondasiPoints}
                          onChange={(e) => setModalPondasiPoints(Number(e.target.value))}
                          min={1}
                          max={6}
                          className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold text-slate-900"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block font-medium text-slate-600 mb-1">Jumlah Unit (Qty):</label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={modalQuantity}
                  onChange={(e) => setModalQuantity(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">Keterangan Khusus (Opsional):</label>
                <input
                  type="text"
                  value={modalCustomDesc}
                  onChange={(e) => setModalCustomDesc(e.target.value)}
                  placeholder="Keterangan tambahan"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                />
              </div>
            </div>

            {/* Modal Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveItemFromModal}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                {editingItemId ? 'Simpan Perubahan Item' : 'Masukkan ke Daftar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Sticky Mobile Bar (Thumb-Friendly) */}
      <div className="md:hidden fixed bottom-14 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 shadow-lg flex items-center justify-between gap-3">
        <div>
          <span className="text-[9px] uppercase font-bold text-slate-500 block">Total ({items.length} Item):</span>
          <span className="text-base font-black text-rose-600">{formatRupiah(effectiveGrandTotal)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleSendWhatsApp}
            className="py-2.5 px-3 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center gap-1 shadow-xs active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span>WA</span>
          </button>
          <button
            type="button"
            onClick={handleSaveQuotation}
            disabled={isSubmitting}
            className="py-2.5 px-3 rounded-xl bg-rose-600 text-white font-black text-xs flex items-center gap-1 shadow-xs active:scale-95 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isEditMode ? 'Update' : 'Simpan'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CalculatorPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm max-w-md mx-auto my-12">
          <Loader2 className="w-8 h-8 text-rose-600 animate-spin mx-auto mb-3" />
          <h2 className="font-bold text-slate-900 text-sm">Memuat Kalkulator...</h2>
        </div>
      }
    >
      <CalculatorContent />
    </Suspense>
  );
}
