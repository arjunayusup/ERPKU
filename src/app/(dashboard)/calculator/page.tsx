'use client';

import { useState, useMemo, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  calculatePricing, 
  calculateReverseMargin,
  getMarginHealthStatus,
  distributeNegotiatedTotal,
  generateWhatsAppQuoteText,
  getMaterialDisplayLabel,
  calculateLedModules,
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
  FileText,
  RotateCcw,
  Loader2,
  Wrench,
  CheckSquare,
  Truck,
  ArrowRight,
  Zap,
  Info,
  Check,
  Building,
  HelpCircle
} from 'lucide-react';

function CalculatorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const branches = getAllBranches();

  // =========================================================================
  // 1. DATA KLIEN & PROYEK
  // =========================================================================
  const [branchId, setBranchId] = useState('jakarta');
  const [projectName, setProjectName] = useState('');
  const [clientName, setClientName] = useState('');
  const [picName, setPicName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [installationAddress, setInstallationAddress] = useState('');

  // =========================================================================
  // 2. DAFTAR MULTI-ITEM (TABEL PEKERJAAN)
  // =========================================================================
  const [items, setItems] = useState<MultiItemLine[]>([]);
  const [customDealPrice, setCustomDealPrice] = useState<number | null>(null);

  // =========================================================================
  // 3. 100% INLINE FORM STATE (NO MODALS / POPUPS!)
  // =========================================================================
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const inlineFormRef = useRef<HTMLDivElement>(null);

  // Kategori Utama: huruf_timbul | neon_box | fasad | tiang | operasional
  const [activeCategory, setActiveCategory] = useState<
    'huruf_timbul' | 'neon_box' | 'fasad' | 'tiang' | 'operasional'
  >('huruf_timbul');

  // Input Umum
  const [subCategory, setSubCategory] = useState('stainless_biasa_led');
  const [customItemTitle, setCustomItemTitle] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Huruf Timbul State
  const [letterText, setLetterText] = useState('');
  const [charCount, setCharCount] = useState(10);
  const [letterHeightCm, setLetterHeightCm] = useState(20);
  const [letterDepthCm, setLetterDepthCm] = useState(4);

  // Neon Box & Logo State
  const [boxShape, setBoxShape] = useState<'kotak' | 'bulat'>('kotak');
  const [boxSides, setBoxSides] = useState<'1sisi' | '2sisi'>('1sisi');
  const [boxWidthCm, setBoxWidthCm] = useState(100);
  const [boxHeightCm, setBoxHeightCm] = useState(100);

  // Fasad State
  const [fasadLengthCm, setFasadLengthCm] = useState(300);
  const [fasadHeightCm, setFasadHeightCm] = useState(120);
  const [fasadMaterial, setFasadMaterial] = useState<'acp_seven' | 'plat_galvanil' | 'kisi_hollow' | 'multiplek'>('acp_seven');

  // Tiang & Pondasi State
  const [poleType, setPoleType] = useState<'pipa_2' | 'pipa_3' | 'pipa_4' | 'pipa_6' | 'rangka_hollow'>('pipa_3');
  const [poleHeightMeter, setPoleHeightMeter] = useState(3);
  const [needPondasi, setNeedPondasi] = useState(false);
  const [pondasiPoints, setPondasiPoints] = useState(1);

  // Operasional State
  const [operasionalType, setOperasionalType] = useState<'scaffolding' | 'bongkar' | 'kabel'>('scaffolding');
  const [scaffoldingSets, setScaffoldingSets] = useState(2);
  const [scaffoldingDays, setScaffoldingDays] = useState(3);
  const [kabelMeters, setKabelMeters] = useState(20);

  // LOCKED PO SNAPSHOT FIELDS (Kebutuhan Bengkel & Rekap Mutu)
  const [stickerSpec, setStickerSpec] = useState('Oracal 8500 Translucent');
  const [paintSpec, setPaintSpec] = useState('Cat Duco Oven Standar');
  const [mountType, setMountType] = useState('Tempel Dinding Langsung (Breket Siku & Dynabolt)');
  const [poNotes, setPoNotes] = useState('');

  // UI State
  const [hideConfidential, setHideConfidential] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProject, setIsLoadingProject] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editProjectNumber, setEditProjectNumber] = useState('');

  const activeBranch = getBranchConfig(branchId);

  // =========================================================================
  // 4. REHYDRATE STATE ON EDIT (?edit=projectId)
  // =========================================================================
  useEffect(() => {
    if (editId) {
      setIsLoadingProject(true);
      getQuotationByIdAction(editId).then((res) => {
        setIsLoadingProject(false);
        if (res.success && res.project) {
          setIsEditMode(true);
          const p = res.project;
          setEditProjectNumber(p.projectNumber || '');
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
              specSnapshot: typeof it.specSnapshot === 'string' ? JSON.parse(it.specSnapshot) : it.specSnapshot,
              qcStatus: it.qcStatus || 'PENDING',
              qcNotes: it.qcNotes || '',
              isMinChargeApplied: it.widthCm && it.heightCm ? (it.widthCm * it.heightCm) / 10000 < 1.0 : false,
            }))
          );

          if (p.totalDeal && p.totalDeal !== p.subtotal) {
            setCustomDealPrice(p.totalDeal);
          }
        }
      });
    }
  }, [editId]);

  // Real-time Char Count auto-sync
  useEffect(() => {
    if (letterText.trim()) {
      const cleanChars = letterText.replace(/\s+/g, '').length;
      if (cleanChars > 0) {
        setCharCount(cleanChars);
      }
    }
  }, [letterText]);

  // =========================================================================
  // 5. REAL-TIME CALCULATION ENGINE FOR CURRENT INLINE ITEM
  // =========================================================================
  const currentPreview = useMemo(() => {
    let previewHpp = 0;
    let previewSell = 0;
    let previewAreaM2 = 0;
    let isMinCharge = false;
    let desc = '';
    let specs = '';
    let ledCount = 0;
    let trafoWatt = 0;

    if (activeCategory === 'huruf_timbul') {
      const effHeight = Math.max(10, Number(letterHeightCm) || 10);
      const effChars = letterText.trim() ? letterText.replace(/\s+/g, '').length : Number(charCount) || 1;
      const depth = Number(letterDepthCm) || 4;

      const tempSpec: ModularProductSpec = {
        category: 'huruf_timbul',
        subCategory,
        lengthCm: 0,
        heightCm: effHeight,
        depthCm: depth,
        text: letterText,
        charCount: effChars,
        lightingType: subCategory.includes('led') || subCategory.includes('glow') ? 'led_ip68_waterproof' : 'none',
        floorLevel: 1,
        targetMarginPercent: 35,
      };

      const pricing = calculatePricing(tempSpec);
      previewHpp = pricing.subtotalHpp;
      previewSell = pricing.finalSellingPrice;
      desc = customItemTitle || `Huruf Timbul ${letterText ? `"${letterText.toUpperCase()}"` : ''}`;
      specs = pricing.material.materialDescription;

      const led = calculateLedModules({
        category: 'huruf_timbul',
        subCategory,
        material: subCategory,
        heightCm: effHeight,
        charCount: effChars,
      });
      ledCount = led.ledCount;
      trafoWatt = led.trafoWatt;

    } else if (activeCategory === 'neon_box') {
      const w = Number(boxWidthCm) || 100;
      const h = boxShape === 'bulat' ? w : Number(boxHeightCm) || 100;
      const rawArea = (w * h) / 10000;
      isMinCharge = rawArea < 1.0;
      previewAreaM2 = Math.max(1.0, rawArea);

      const subKey = boxSides === '2sisi' ? 'neon_box_2sisi' : 'neon_box_1sisi';
      const tempSpec: ModularProductSpec = {
        category: 'neon_box',
        subCategory: subKey,
        lengthCm: w,
        heightCm: h,
        lightingType: 'led_ip68_waterproof',
        floorLevel: 1,
        targetMarginPercent: 35,
      };

      const pricing = calculatePricing(tempSpec);
      previewHpp = pricing.subtotalHpp;
      previewSell = pricing.finalSellingPrice;

      const shapeLabel = boxShape === 'bulat' ? 'Bulat / Round' : 'Kotak';
      const sidesLabel = boxSides === '2sisi' ? '2 Sisi Bolak-Balik' : '1 Sisi';
      desc = customItemTitle || `Neon Box Akrilik ${shapeLabel} (${sidesLabel})`;
      specs = `${pricing.material.materialDescription} • Rangka Hollow Galvanis 3x3 • Finishing Lis Aluminium`;

      ledCount = Math.max(18, Math.ceil(previewAreaM2 * 35));
      trafoWatt = previewAreaM2 > 2 ? 300 : previewAreaM2 > 1.2 ? 200 : 100;

    } else if (activeCategory === 'fasad') {
      const len = Number(fasadLengthCm) || 300;
      const h = Number(fasadHeightCm) || 120;
      const rawArea = (len * h) / 10000;
      isMinCharge = rawArea < 1.0;
      previewAreaM2 = Math.max(1.0, rawArea);

      let rateSell = 750000;
      let rateCost = 450000;
      let matTitle = 'ACP Seven 3mm PVDF + Rangka Hollow 4x4 Galvanis';

      if (fasadMaterial === 'plat_galvanil') {
        rateSell = 650000;
        rateCost = 400000;
        matTitle = 'Plat Galvanil 0.8mm Cat Duco Oven + Rangka Hollow Galvanis';
      } else if (fasadMaterial === 'kisi_hollow') {
        rateSell = 550000;
        rateCost = 350000;
        matTitle = 'Kisi-kisi Bilah Hollow Galvanis 2x4 Anti Karat';
      } else if (fasadMaterial === 'multiplek') {
        rateSell = 450000;
        rateCost = 250000;
        matTitle = 'Multiplek 12mm Finishing Melamin / HPL Indoor';
      }

      previewHpp = Math.round(previewAreaM2 * rateCost);
      previewSell = Math.round(previewAreaM2 * rateSell);
      desc = customItemTitle || `Background Fasad Reklame (${previewAreaM2.toFixed(2)} m²)`;
      specs = `${matTitle} • Dimensi ${len} x ${h} cm`;

    } else if (activeCategory === 'tiang') {
      const h = Number(poleHeightMeter) || 3;
      let rateSell = 250000;
      let rateCost = 150000;
      let label = 'Pipa Besi 3 Inch';

      if (poleType === 'pipa_2') {
        rateSell = 175000;
        rateCost = 105000;
        label = 'Pipa Besi Medium 2 Inch';
      } else if (poleType === 'pipa_4') {
        rateSell = 375000;
        rateCost = 230000;
        label = 'Pipa Besi Medium 4 Inch';
      } else if (poleType === 'pipa_6') {
        rateSell = 650000;
        rateCost = 420000;
        label = 'Pipa Besi 6 Inch Schedule';
      } else if (poleType === 'rangka_hollow') {
        rateSell = 150000;
        rateCost = 90000;
        label = 'Rangka Besi Hollow & Siku';
      }

      const pondasiSell = needPondasi ? Number(pondasiPoints || 1) * 850000 : 0;
      const pondasiHpp = needPondasi ? Number(pondasiPoints || 1) * 500000 : 0;
      const pondasiText = needPondasi ? ` + Cor Cakar Ayam (${pondasiPoints} Titik)` : '';

      previewHpp = Math.round(h * rateCost) + pondasiHpp;
      previewSell = Math.round(h * rateSell) + pondasiSell;
      desc = customItemTitle || `Konstruksi Tiang ${label} (${h}m)${pondasiText}`;
      specs = `Pipa Besi Medium Tebal, Baseplate & Baut Dynabolt${needPondasi ? `, Pengecoran Semen Beton Cakar Ayam (${pondasiPoints} Titik)` : ''}`;

    } else if (activeCategory === 'operasional') {
      if (operasionalType === 'scaffolding') {
        const sets = Number(scaffoldingSets) || 2;
        const days = Number(scaffoldingDays) || 3;
        previewSell = sets * days * 65000;
        previewHpp = sets * days * 35000;
        desc = customItemTitle || `Sewa Scaffolding / Steger Lapangan (${sets} Set x ${days} Hari)`;
        specs = 'Main Frame, Catwalk, Roda Rem & Transport Antar-Jemput Bengkel';
      } else if (operasionalType === 'bongkar') {
        previewSell = 500000;
        previewHpp = 250000;
        desc = customItemTitle || 'Jasa Bongkar Reklame Lama & Pembersihan Titik';
        specs = 'Penurunan signage lama, perapihan kabel & pembersihan dinding/titik pasang';
      } else {
        const m = Number(kabelMeters) || 20;
        previewSell = m * 25000;
        previewHpp = m * 15000;
        desc = customItemTitle || `Jasa Tarik Kabel Listrik Tambahan (${m} Meter)`;
        specs = 'Kabel Listrik NYM 2x1.5mm / 2x2.5mm Standar PLN & Klem Pipa';
      }
    }

    const qty = Number(quantity) || 1;
    const finalHpp = previewHpp * qty;
    const finalSell = previewSell * qty;
    const margin = finalSell > 0 ? Math.round(((finalSell - finalHpp) / finalSell) * 100) : 0;

    return {
      unitHpp: previewHpp,
      unitSell: previewSell,
      finalHpp,
      finalSell,
      margin,
      areaM2: previewAreaM2,
      isMinCharge,
      description: desc,
      specifications: specs,
      ledCount,
      trafoWatt,
    };
  }, [
    activeCategory,
    subCategory,
    customItemTitle,
    quantity,
    letterText,
    charCount,
    letterHeightCm,
    letterDepthCm,
    boxShape,
    boxSides,
    boxWidthCm,
    boxHeightCm,
    fasadLengthCm,
    fasadHeightCm,
    fasadMaterial,
    poleType,
    poleHeightMeter,
    needPondasi,
    pondasiPoints,
    operasionalType,
    scaffoldingSets,
    scaffoldingDays,
    kabelMeters,
  ]);

  // =========================================================================
  // 6. TOTALS & TWO-WAY NEGOTIATION
  // =========================================================================
  const baseSubtotal = useMemo(() => {
    return items.reduce((acc, it) => acc + it.sellingPrice, 0);
  }, [items]);

  const baseHppTotal = useMemo(() => {
    return items.reduce((acc, it) => acc + it.hppPrice, 0);
  }, [items]);

  const effectiveGrandTotal = useMemo(() => {
    if (customDealPrice !== null && customDealPrice > 0) {
      return customDealPrice;
    }
    return baseSubtotal;
  }, [customDealPrice, baseSubtotal]);

  const realMarginPercent = useMemo(() => {
    return calculateReverseMargin(baseHppTotal, effectiveGrandTotal);
  }, [baseHppTotal, effectiveGrandTotal]);

  const healthStatus = useMemo(() => {
    return getMarginHealthStatus(realMarginPercent);
  }, [realMarginPercent]);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  // =========================================================================
  // 7. INLINE FORM HANDLERS (ADD ITEM / UPDATE ITEM)
  // =========================================================================
  const handleSaveInlineItem = () => {
    const qty = Number(quantity) || 1;

    // Create the locked PO Snapshot
    const snapshot = {
      category: activeCategory,
      subCategory: activeCategory === 'huruf_timbul' ? subCategory : activeCategory === 'fasad' ? fasadMaterial : activeCategory === 'tiang' ? poleType : operasionalType,
      text: activeCategory === 'huruf_timbul' ? letterText : undefined,
      charCount: activeCategory === 'huruf_timbul' ? charCount : undefined,
      heightCm: activeCategory === 'huruf_timbul' ? letterHeightCm : activeCategory === 'neon_box' ? boxHeightCm : fasadHeightCm,
      widthCm: activeCategory === 'neon_box' ? boxWidthCm : fasadLengthCm,
      areaM2: currentPreview.areaM2 || undefined,
      isMinChargeApplied: currentPreview.isMinCharge,
      stickerSpec: activeCategory === 'huruf_timbul' || activeCategory === 'neon_box' ? stickerSpec : undefined,
      paintSpec: activeCategory === 'huruf_timbul' || activeCategory === 'fasad' ? paintSpec : undefined,
      mountSpec: mountType,
      ledCount: currentPreview.ledCount || undefined,
      trafoWatt: currentPreview.trafoWatt || undefined,
      poNotes: poNotes.trim() || undefined,
      timestamp: new Date().toISOString(),
    };

    let dimString = '';
    if (activeCategory === 'huruf_timbul') {
      dimString = `Tinggi ${letterHeightCm} cm (${charCount} Huruf)`;
    } else if (activeCategory === 'neon_box') {
      dimString = boxShape === 'bulat' ? `Diameter ${boxWidthCm} cm` : `${boxWidthCm} x ${boxHeightCm} cm (${currentPreview.areaM2.toFixed(2)} m²)`;
    } else if (activeCategory === 'fasad') {
      dimString = `${fasadLengthCm} x ${fasadHeightCm} cm (${currentPreview.areaM2.toFixed(2)} m²)`;
    } else if (activeCategory === 'tiang') {
      dimString = `Tinggi ${poleHeightMeter} Meter`;
    } else if (activeCategory === 'operasional') {
      dimString = operasionalType === 'scaffolding' ? `${scaffoldingSets} Set x ${scaffoldingDays} Hari` : operasionalType === 'kabel' ? `${kabelMeters} Meter` : '1 Lot';
    }

    const newItemData: MultiItemLine = {
      id: editingItemId || `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      itemType: activeCategory,
      description: currentPreview.description,
      specifications: currentPreview.specifications,
      dimensions: dimString,
      textOrLabel: activeCategory === 'huruf_timbul' ? letterText : undefined,
      charCount: activeCategory === 'huruf_timbul' ? charCount : undefined,
      heightCm: activeCategory === 'huruf_timbul' ? Number(letterHeightCm) : activeCategory === 'neon_box' ? Number(boxHeightCm) : Number(fasadHeightCm),
      widthCm: activeCategory === 'neon_box' ? Number(boxWidthCm) : activeCategory === 'fasad' ? Number(fasadLengthCm) : undefined,
      material: activeCategory === 'huruf_timbul' ? subCategory : activeCategory === 'fasad' ? fasadMaterial : activeCategory === 'tiang' ? poleType : operasionalType,
      lighting: currentPreview.ledCount > 0 ? 'frontlit' : 'none',
      quantity: qty,
      unitPrice: currentPreview.unitSell,
      sellingPrice: currentPreview.finalSell,
      unitHpp: currentPreview.unitHpp,
      hppPrice: currentPreview.finalHpp,
      specSnapshot: snapshot,
      qcStatus: 'PENDING',
      qcNotes: poNotes.trim() || undefined,
      isMinChargeApplied: currentPreview.isMinCharge,
    };

    if (editingItemId) {
      // UPDATE EXISTING ITEM IN-PLACE
      setItems(items.map((it) => (it.id === editingItemId ? newItemData : it)));
      setEditingItemId(null);
    } else {
      // APPEND NEW ITEM
      setItems([...items, newItemData]);
    }

    // Reset Custom Deal Nego to recalculate clean
    setCustomDealPrice(null);

    // Reset specific text fields for quick consecutive inputs
    setCustomItemTitle('');
    setLetterText('');
    setPoNotes('');
  };

  // LOAD ITEM INTO INLINE FORM FOR EDITING
  const handleEditItemInline = (item: MultiItemLine) => {
    setEditingItemId(item.id);
    const snap = item.specSnapshot || {};

    if (item.itemType === 'huruf_timbul') {
      setActiveCategory('huruf_timbul');
      setSubCategory(item.material || 'stainless_biasa_led');
      setLetterText(item.textOrLabel || '');
      setCharCount(item.charCount || 10);
      setLetterHeightCm(item.heightCm || 20);
      setStickerSpec(snap.stickerSpec || 'Oracal 8500 Translucent');
      setPaintSpec(snap.paintSpec || 'Cat Duco Oven Standar');
    } else if (item.itemType === 'neon_box') {
      setActiveCategory('neon_box');
      setBoxWidthCm(item.widthCm || 100);
      setBoxHeightCm(item.heightCm || 100);
      setBoxSides(item.material?.includes('2sisi') ? '2sisi' : '1sisi');
      setBoxShape(item.description.toLowerCase().includes('bulat') ? 'bulat' : 'kotak');
      setStickerSpec(snap.stickerSpec || 'Oracal 8500 Translucent');
    } else if (item.itemType === 'fasad') {
      setActiveCategory('fasad');
      setFasadLengthCm(item.widthCm || 300);
      setFasadHeightCm(item.heightCm || 120);
      setFasadMaterial((item.material as any) || 'acp_seven');
    } else if (item.itemType === 'tiang') {
      setActiveCategory('tiang');
      setPoleHeightMeter(Math.round((item.heightCm || 300) / 100));
      setPoleType((item.material as any) || 'pipa_3');
    } else if (item.itemType === 'operasional') {
      setActiveCategory('operasional');
      setOperasionalType((item.material as any) || 'scaffolding');
    }

    setCustomItemTitle(item.description);
    setQuantity(item.quantity || 1);
    setMountType(snap.mountSpec || 'Tempel Dinding Langsung (Breket Siku & Dynabolt)');
    setPoNotes(snap.poNotes || item.qcNotes || '');

    // Scroll to form smoothly
    inlineFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleCancelInlineEdit = () => {
    setEditingItemId(null);
    setCustomItemTitle('');
    setLetterText('');
    setPoNotes('');
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter((it) => it.id !== id));
    if (editingItemId === id) {
      handleCancelInlineEdit();
    }
    setCustomDealPrice(null);
  };

  // =========================================================================
  // 8. SEND WHATSAPP
  // =========================================================================
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

  // =========================================================================
  // 9. SAVE OR UPDATE QUOTATION (CALL SERVER ACTION)
  // =========================================================================
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

    const finalItems = customDealPrice && customDealPrice > 0 && customDealPrice !== baseSubtotal
      ? distributeNegotiatedTotal(items, effectiveGrandTotal)
      : items;

    setIsSubmitting(true);
    try {
      if (isEditMode && editId) {
        // MODE UPDATE (NON-DESTRUCTIVE UPDATE IN-PLACE)
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
            specSnapshot: it.specSnapshot,
            qcStatus: it.qcStatus,
            qcNotes: it.qcNotes,
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
            specSnapshot: it.specSnapshot,
            qcStatus: it.qcStatus,
            qcNotes: it.qcNotes,
          })),
        });

        if (res.success && res.projectId) {
          router.push(`/projects/${res.projectId}`);
        } else {
          setErrorMessage(res.error || 'Terjadi kesalahan saat menyimpan penawaran.');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menyimpan penawaran.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Loading Indicator when fetching existing project */}
      {isLoadingProject && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
          <span className="text-xs font-bold">Memuat data proyek & merehidrasi seluruh spesifikasi...</span>
        </div>
      )}

      {/* HEADER UTAMA */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
              <span>Hitung Estimasi & Buat SPK</span>
            </h1>
            {isEditMode ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Mode Edit Proyek: {editProjectNumber}
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Job-Order Custom Form
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kalkulator operasional bengkel: input inline tanpa modal, kunci spek stiker & cat ke SPK, proteksi min. charge 1.0 m².
          </p>
        </div>

        {/* Confidential Toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setHideConfidential(!hideConfidential)}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
              hideConfidential
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
            }`}
            title="Sembunyikan HPP dan Margin saat menunjukkan layar ke Klien"
          >
            {hideConfidential ? <EyeOff className="w-4 h-4 text-rose-600" /> : <Eye className="w-4 h-4 text-slate-600" />}
            <span>{hideConfidential ? 'Mode Klien (HPP Disensor)' : 'Mode Internal Bengkel'}</span>
          </button>
        </div>
      </div>

      {/* ERROR ALERT */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span className="text-xs font-bold">{errorMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 1: DATA KLIEN & LOKASI PROYEK */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 font-black text-xs flex items-center justify-center">1</span>
            <h2 className="font-extrabold text-sm text-slate-900 uppercase tracking-tight">Data Klien & Identitas Proyek</h2>
          </div>
          <span className="text-[11px] font-bold text-slate-400">Wajib diisi sebelum kirim WA / SPK</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {/* Cabang */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-rose-600" /> Cabang Penanggung Jawab
            </label>
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.city})
                </option>
              ))}
            </select>
          </div>

          {/* Nama Usaha Klien */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5 flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-indigo-600" /> Nama Usaha / Brand Klien *
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Contoh: Kopi Kenangan, PT Maju Bersama"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* WhatsApp Klien */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-emerald-600" /> No. WhatsApp Klien *
            </label>
            <input
              type="text"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              placeholder="Contoh: 081234567890"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Nama PIC */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-600" /> Nama PIC / Kontak Person
            </label>
            <input
              type="text"
              value={picName}
              onChange={(e) => setPicName(e.target.value)}
              placeholder="Contoh: Bpk. Hendra (Ops Manager)"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Judul Proyek */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Nama Pekerjaan / Proyek
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Contoh: Pengadaan Huruf Timbul & Fasad Ruko"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Lokasi Pemasangan */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-600" /> Alamat / Titik Pasang
            </label>
            <input
              type="text"
              value={installationAddress}
              onChange={(e) => setInstallationAddress(e.target.value)}
              placeholder="Contoh: Ruko Grand Galaxy City Blok RGA No. 12"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: 100% INLINE FORM INPUT ITEM REKLAME BARU / EDIT */}
      {/* ========================================================================= */}
      <div 
        ref={inlineFormRef}
        className={`rounded-2xl border transition-all duration-200 shadow-sm p-5 md:p-6 space-y-5 ${
          editingItemId 
            ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/50' 
            : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded-lg font-black text-xs flex items-center justify-center ${
              editingItemId ? 'bg-amber-500 text-white' : 'bg-rose-50 text-rose-600'
            }`}>
              2
            </span>
            <h2 className="font-extrabold text-sm text-slate-900 uppercase tracking-tight">
              {editingItemId ? '✏️ Edit Baris Item Reklame' : '➕ Input Item Reklame (Form Cepat Job-Order)'}
            </h2>
          </div>

          {editingItemId && (
            <button
              type="button"
              onClick={handleCancelInlineEdit}
              className="px-3 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs self-start sm:self-auto cursor-pointer"
            >
              Batalkan Edit (Kembali Input Baru)
            </button>
          )}
        </div>

        {/* CATEGORY SELECTOR TABS (HURUF TIMBUL vs NEON BOX vs FASAD vs TIANG vs OPERASIONAL) */}
        <div>
          <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-2">
            Pilih Kategori Utama:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <button
              type="button"
              onClick={() => { setActiveCategory('huruf_timbul'); setSubCategory('stainless_biasa_led'); }}
              className={`p-3 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1 ${
                activeCategory === 'huruf_timbul'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="font-extrabold text-xs">HURUF TIMBUL</span>
              <span className="text-[9.5px] opacity-80">Akrilik, Stainless, Galvanis</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveCategory('neon_box'); setSubCategory('neon_box_1sisi'); }}
              className={`p-3 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1 ${
                activeCategory === 'neon_box'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <Layers className="w-4 h-4 text-cyan-400" />
              <span className="font-extrabold text-xs">NEON BOX</span>
              <span className="text-[9.5px] opacity-80">Kotak, Bulat & Custom</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveCategory('fasad'); setSubCategory('acp_seven'); }}
              className={`p-3 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1 ${
                activeCategory === 'fasad'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <Building className="w-4 h-4 text-blue-400" />
              <span className="font-extrabold text-xs">BACKGROUND FASAD</span>
              <span className="text-[9.5px] opacity-80">ACP Seven, Plat Galvanil</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveCategory('tiang'); setSubCategory('pipa_3'); }}
              className={`p-3 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1 ${
                activeCategory === 'tiang'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <Construction className="w-4 h-4 text-amber-500" />
              <span className="font-extrabold text-xs">TIANG & KONSTRUKSI</span>
              <span className="text-[9.5px] opacity-80">Pipa 2-6 Inch & Cakar Ayam</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveCategory('operasional'); setSubCategory('scaffolding'); }}
              className={`p-3 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1 ${
                activeCategory === 'operasional'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <Wrench className="w-4 h-4 text-emerald-400" />
              <span className="font-extrabold text-xs">OPERASIONAL LAPANGAN</span>
              <span className="text-[9.5px] opacity-80">Steger, Bongkar, Kabel</span>
            </button>
          </div>
        </div>

        {/* DYNAMIC FORM FIELDS ACCORDING TO CATEGORY */}
        <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-4 md:p-5 space-y-4">
          
          {/* A. HURUF TIMBUL FORM */}
          {activeCategory === 'huruf_timbul' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                {/* Jenis Bahan & Lampu */}
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1.5">
                    Spesifikasi Bahan Huruf Timbul:
                  </label>
                  <select
                    value={subCategory}
                    onChange={(e) => setSubCategory(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="stainless_biasa_led">Huruf Timbul Stainless Biasa + Backlight LED (Rp 20.000 /cm)</option>
                    <option value="akrilik_dual_glow">Huruf Timbul Akrilik Dual Glow Nyala Depan & Belakang (Rp 18.000 /cm)</option>
                    <option value="stainless_gold_led">Huruf Timbul Stainless Gold Titanium + LED (Rp 25.000 /cm)</option>
                    <option value="galvanis_duco_off">Huruf Timbul Plat Galvanis Cat Duco Oven Non-Lampu (Rp 10.000 /cm)</option>
                    <option value="akrilik_off">Huruf Timbul Akrilik Solid Marga Cipta 3mm Non-Lampu (Rp 10.000 /cm)</option>
                    <option value="stainless_off">Huruf Timbul Stainless Steel 201/304 Non-Lampu (Rp 12.000 /cm)</option>
                  </select>
                </div>

                {/* Jumlah Qty Set */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">
                    Jumlah Pesanan (Qty Set):
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              {/* Teks, Jumlah Karakter, Tinggi cm */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1.5">
                    Teks Huruf / Tulisan Signage (Otomatis Hitung Jumlah Karakter):
                  </label>
                  <input
                    type="text"
                    value={letterText}
                    onChange={(e) => setLetterText(e.target.value)}
                    placeholder="Contoh: SALSABILLA ADVERTISING"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 font-mono font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">
                    Tinggi Huruf (cm) *min 10cm:
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={10}
                      value={letterHeightCm}
                      onChange={(e) => setLetterHeightCm(Math.max(10, Number(e.target.value)))}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                    <span className="absolute right-3 top-2.5 font-bold text-slate-400 text-xs">cm</span>
                  </div>
                </div>
              </div>

              {/* Detail Karakter & Ketebalan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">
                    Jumlah Karakter Riil Terhitung:
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={charCount}
                    onChange={(e) => setCharCount(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    *Spasi tidak dihitung. Anda dapat menyesuaikan angka ini manual jika ada logo/tanda baca khusus.
                  </p>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">
                    Tebal Samping / Ketebalan Timbul (cm):
                  </label>
                  <select
                    value={letterDepthCm}
                    onChange={(e) => setLetterDepthCm(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900 focus:outline-none"
                  >
                    <option value={3}>3 cm (Standar Ramping)</option>
                    <option value={4}>4 cm (Standar Komersial - Rekomendasi)</option>
                    <option value={5}>5 cm (Timbul Tegas)</option>
                    <option value={7}>7 cm (Extra Deep +15% Biaya Rangka)</option>
                    <option value={10}>10 cm (Jumbo Billboard +30% Biaya)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* B. NEON BOX FORM */}
          {activeCategory === 'neon_box' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                {/* Bentuk Box */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">Bentuk Neon Box:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setBoxShape('kotak')}
                      className={`py-2 rounded-xl border text-center font-bold transition cursor-pointer ${
                        boxShape === 'kotak'
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-300'
                      }`}
                    >
                      Kotak / Persegi
                    </button>
                    <button
                      type="button"
                      onClick={() => setBoxShape('bulat')}
                      className={`py-2 rounded-xl border text-center font-bold transition cursor-pointer ${
                        boxShape === 'bulat'
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-300'
                      }`}
                    >
                      Bulat / Custom
                    </button>
                  </div>
                </div>

                {/* Sisi Box */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">Jumlah Sisi Tampilan:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setBoxSides('1sisi')}
                      className={`py-2 rounded-xl border text-center font-bold transition cursor-pointer ${
                        boxSides === '1sisi'
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-300'
                      }`}
                    >
                      1 Sisi (Dinding)
                    </button>
                    <button
                      type="button"
                      onClick={() => setBoxSides('2sisi')}
                      className={`py-2 rounded-xl border text-center font-bold transition cursor-pointer ${
                        boxSides === '2sisi'
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-300'
                      }`}
                    >
                      2 Sisi (Menjorok)
                    </button>
                  </div>
                </div>

                {/* Qty Unit */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">Jumlah (Qty Unit):</label>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Ukuran Panjang x Lebar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">
                    {boxShape === 'bulat' ? 'Diameter Lingkaran (cm):' : 'Panjang / Lebar Horizontal (cm):'}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={20}
                      value={boxWidthCm}
                      onChange={(e) => {
                        const val = Math.max(20, Number(e.target.value));
                        setBoxWidthCm(val);
                        if (boxShape === 'bulat') setBoxHeightCm(val);
                      }}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 font-bold text-slate-900 focus:outline-none"
                    />
                    <span className="absolute right-3 top-2.5 font-bold text-slate-400 text-xs">cm</span>
                  </div>
                </div>

                {boxShape === 'kotak' && (
                  <div>
                    <label className="font-bold text-slate-700 block mb-1.5">
                      Tinggi / Lebar Vertikal (cm):
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={20}
                        value={boxHeightCm}
                        onChange={(e) => setBoxHeightCm(Math.max(20, Number(e.target.value)))}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 font-bold text-slate-900 focus:outline-none"
                      />
                      <span className="absolute right-3 top-2.5 font-bold text-slate-400 text-xs">cm</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Luas & Minimum Charge Alert */}
              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 font-semibold">Luas Bersih Terhitung: </span>
                  <strong className="font-extrabold text-slate-900">
                    {((boxWidthCm * (boxShape === 'bulat' ? boxWidthCm : boxHeightCm)) / 10000).toFixed(2)} m²
                  </strong>
                </div>

                {currentPreview.isMinCharge ? (
                  <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-bold text-[11px] flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    Proteksi Minimum Charge 1.0 m² Aktif
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[11px] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Luas Memenuhi Standar Tarif Normal
                  </span>
                )}
              </div>
            </div>
          )}

          {/* C. BACKGROUND FASAD FORM */}
          {activeCategory === 'fasad' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">Pilihan Material Background Fasad:</label>
                  <select
                    value={fasadMaterial}
                    onChange={(e) => setFasadMaterial(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 font-bold text-slate-900 focus:outline-none"
                  >
                    <option value="acp_seven">ACP Seven 3mm PVDF + Rangka Hollow 4x4 (Rp 750.000 /m²)</option>
                    <option value="plat_galvanil">Plat Galvanil Duco Oven + Rangka Hollow (Rp 650.000 /m²)</option>
                    <option value="kisi_hollow">Kisi-kisi Hollow Galvanis 2x4 (Rp 550.000 /m²)</option>
                    <option value="multiplek">Multiplek 12mm / Melamin Backwall Indoor (Rp 450.000 /m²)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">Jumlah Bidang Fasad:</label>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 font-bold text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">Panjang Bentangan (cm):</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={50}
                      value={fasadLengthCm}
                      onChange={(e) => setFasadLengthCm(Math.max(50, Number(e.target.value)))}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 font-bold text-slate-900 focus:outline-none"
                    />
                    <span className="absolute right-3 top-2.5 font-bold text-slate-400 text-xs">cm</span>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">Tinggi Bentangan (cm):</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={50}
                      value={fasadHeightCm}
                      onChange={(e) => setFasadHeightCm(Math.max(50, Number(e.target.value)))}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 font-bold text-slate-900 focus:outline-none"
                    />
                    <span className="absolute right-3 top-2.5 font-bold text-slate-400 text-xs">cm</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* D. TIANG & KONSTRUKSI FORM */}
          {activeCategory === 'tiang' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">Ukuran Pipa Tiang Konstruksi:</label>
                  <select
                    value={poleType}
                    onChange={(e) => setPoleType(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 font-bold text-slate-900 focus:outline-none"
                  >
                    <option value="pipa_2">Tiang Pipa Besi 2 Inch (Rp 175.000 /meter)</option>
                    <option value="pipa_3">Tiang Pipa Besi 3 Inch (Rp 250.000 /meter - Standar Pylon)</option>
                    <option value="pipa_4">Tiang Pipa Besi 4 Inch (Rp 375.000 /meter - Heavy)</option>
                    <option value="pipa_6">Tiang Pipa Besi 6 Inch Schedule (Rp 650.000 /meter - Totem)</option>
                    <option value="rangka_hollow">Rangka Besi Hollow & Siku Wall-mount (Rp 150.000 /meter)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">Tinggi Tiang (Meter):</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      max={15}
                      value={poleHeightMeter}
                      onChange={(e) => setPoleHeightMeter(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 font-bold text-slate-900 focus:outline-none"
                    />
                    <span className="absolute right-3 top-2.5 font-bold text-slate-400 text-xs">Meter</span>
                  </div>
                </div>
              </div>

              {/* Cor Cakar Ayam Toggle */}
              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={needPondasi}
                    onChange={(e) => setNeedPondasi(e.target.checked)}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span>Termasuk Pengecoran Semen & Pondasi Cakar Ayam (Rp 850.000 / Titik)</span>
                </label>

                {needPondasi && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-bold">Jumlah Titik:</span>
                    <input
                      type="number"
                      min={1}
                      max={6}
                      value={pondasiPoints}
                      onChange={(e) => setPondasiPoints(Math.max(1, Number(e.target.value)))}
                      className="w-16 bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 font-bold text-center"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* E. OPERASIONAL LAPANGAN FORM */}
          {activeCategory === 'operasional' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setOperasionalType('scaffolding')}
                  className={`p-3 rounded-xl border text-center font-bold text-xs transition cursor-pointer ${
                    operasionalType === 'scaffolding'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  Sewa Steger / Scaffolding
                </button>
                <button
                  type="button"
                  onClick={() => setOperasionalType('bongkar')}
                  className={`p-3 rounded-xl border text-center font-bold text-xs transition cursor-pointer ${
                    operasionalType === 'bongkar'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  Jasa Bongkar Reklame Lama
                </button>
                <button
                  type="button"
                  onClick={() => setOperasionalType('kabel')}
                  className={`p-3 rounded-xl border text-center font-bold text-xs transition cursor-pointer ${
                    operasionalType === 'kabel'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  Jasa Tarik Kabel Tambahan
                </button>
              </div>

              {operasionalType === 'scaffolding' && (
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1.5">Jumlah Set Steger:</label>
                    <input
                      type="number"
                      min={1}
                      value={scaffoldingSets}
                      onChange={(e) => setScaffoldingSets(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1.5">Durasi Sewa (Hari):</label>
                    <input
                      type="number"
                      min={1}
                      value={scaffoldingDays}
                      onChange={(e) => setScaffoldingDays(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {operasionalType === 'kabel' && (
                <div className="text-xs">
                  <label className="font-bold text-slate-700 block mb-1.5">Estimasi Panjang Kabel Tambahan (Meter):</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={5}
                      value={kabelMeters}
                      onChange={(e) => setKabelMeters(Math.max(5, Number(e.target.value)))}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900 focus:outline-none"
                    />
                    <span className="absolute right-3 top-2 font-bold text-slate-400 text-xs">Meter (NYM 2x1.5mm)</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TECHNICAL SPECIFICATION DETAILS (LOCKED PO SNAPSHOT FIELDS) */}
          {/* ========================================================================= */}
          <div className="pt-3 border-t border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-xs uppercase tracking-tight text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Rincian Spesifikasi PO (Dikunci ke SPK, Surat Jalan & BAST):</span>
              </span>
              <span className="text-[10px] text-slate-500 font-semibold">Bebas custom tanpa batasan</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              {/* Stiker Oracal */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Kode / Tipe Stiker Visual:</label>
                <input
                  type="text"
                  value={stickerSpec}
                  onChange={(e) => setStickerSpec(e.target.value)}
                  placeholder="Contoh: Oracal 8500-010 Translucent White"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-medium text-slate-900 focus:outline-none"
                />
              </div>

              {/* Cat Oven / Finishing */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Finishing Warna / Cat Oven:</label>
                <input
                  type="text"
                  value={paintSpec}
                  onChange={(e) => setPaintSpec(e.target.value)}
                  placeholder="Contoh: Duco Oven Hitam Glossy (RAL 9005)"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-medium text-slate-900 focus:outline-none"
                />
              </div>

              {/* Metode Dudukan / Konstruksi */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Kelengkapan Dudukan & Konstruksi:</label>
                <select
                  value={mountType}
                  onChange={(e) => setMountType(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-medium text-slate-900 focus:outline-none"
                >
                  <option value="Tempel Dinding Langsung (Breket Siku & Dynabolt)">Tempel Dinding (Dynabolt & Breket Siku)</option>
                  <option value="Pasang di Fasad ACP Ruko">Pasang di Fasad ACP Ruko (Baut Roofing & Rangka)</option>
                  <option value="Tiang Pipa Besi Pylon Outdoor">Tiang Pipa Besi Pylon Outdoor</option>
                  <option value="Breket Siku Menjorok Bolak-Balik">Breket Siku Menjorok Bolak-Balik</option>
                  <option value="Gantung Kawat Seling Baja Indoor">Gantung Kawat Seling Baja Indoor</option>
                </select>
              </div>
            </div>

            {/* Free-text PO Notes */}
            <div>
              <label className="font-bold text-slate-700 block mb-1 flex items-center justify-between">
                <span>Catatan Teknis PO Khusus Bengkel:</span>
                <span className="text-[10px] text-slate-400">Contoh: sambungan plat, seal silicone waterproof, soket rapi</span>
              </label>
              <textarea
                rows={2}
                value={poNotes}
                onChange={(e) => setPoNotes(e.target.value)}
                placeholder="Tuliskan spesifikasi detail pesanan agar workshop tidak keliru dalam perakitan..."
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>
        </div>

        {/* REAL-TIME PREVIEW BADGE & SUBMIT BUTTON */}
        <div className="bg-slate-900 text-white rounded-2xl p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-extrabold text-sm text-amber-400">{currentPreview.description}</span>
              {currentPreview.isMinCharge && (
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500 text-slate-950 uppercase">
                  Min. 1.0 m²
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-300">{currentPreview.specifications}</p>

            <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
              {!hideConfidential && (
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">HPP Bengkel:</span>
                  <span className="font-mono font-bold text-slate-200">{formatRupiah(currentPreview.finalHpp)}</span>
                </div>
              )}
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Harga Jual Standar:</span>
                <span className="font-mono font-extrabold text-white text-base">{formatRupiah(currentPreview.finalSell)}</span>
              </div>
              {!hideConfidential && (
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Margin Estimasi:</span>
                  <span className="font-mono font-bold text-emerald-400">{currentPreview.margin}%</span>
                </div>
              )}
              {currentPreview.ledCount > 0 && (
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Estimasi LED:</span>
                  <span className="font-mono font-bold text-cyan-300">{currentPreview.ledCount} Modul • {currentPreview.trafoWatt}W Trafo</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {editingItemId && (
              <button
                type="button"
                onClick={handleCancelInlineEdit}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer"
              >
                Batal
              </button>
            )}

            <button
              type="button"
              onClick={handleSaveInlineItem}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md shadow-rose-600/30 flex items-center gap-2 transition cursor-pointer"
            >
              {editingItemId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{editingItemId ? 'Simpan Perubahan Item' : '➕ Tambahkan ke Daftar Item'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 3: DAFTAR ITEM PENAWARAN (MULTI-ITEM TABLE) */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 font-black text-xs flex items-center justify-center">3</span>
            <h2 className="font-extrabold text-sm text-slate-900 uppercase tracking-tight">
              Daftar Rincian Pekerjaan Penawaran ({items.length} Item)
            </h2>
          </div>
          <span className="text-[11px] font-bold text-slate-500">
            Subtotal: <strong className="text-slate-900">{formatRupiah(baseSubtotal)}</strong>
          </span>
        </div>

        {items.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
            <Calculator className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-slate-600">Belum ada item reklame yang dimasukkan.</p>
            <p className="text-[11px] mt-0.5">Gunakan formulir inline di atas untuk menambahkan produk ke dalam penawaran.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="p-3 w-10 text-center">No</th>
                  <th className="p-3 min-w-[200px]">Deskripsi & Teks</th>
                  <th className="p-3 text-center min-w-[120px]">Ukuran</th>
                  <th className="p-3 min-w-[200px]">Spek PO & Dudukan</th>
                  {!hideConfidential && <th className="p-3 text-right">HPP</th>}
                  <th className="p-3 text-right min-w-[120px]">Harga Jual</th>
                  <th className="p-3 text-center w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((it, idx) => {
                  const snap = it.specSnapshot || {};
                  return (
                    <tr key={it.id} className="hover:bg-slate-50/70 transition">
                      <td className="p-3 text-center font-bold text-slate-400">{idx + 1}</td>
                      <td className="p-3">
                        <div className="font-extrabold text-slate-900">{it.description}</div>
                        {it.textOrLabel && (
                          <div className="font-mono text-[11px] text-indigo-700 font-bold mt-0.5">
                            &quot;{it.textOrLabel}&quot;
                          </div>
                        )}
                        <div className="text-[10.5px] text-slate-500 mt-0.5 line-clamp-1">
                          {it.specifications}
                        </div>
                      </td>

                      <td className="p-3 text-center">
                        <span className="font-black text-slate-800 text-[11.5px] block">{it.dimensions || '-'}</span>
                        {it.isMinChargeApplied && (
                          <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                            Min. 1.0 m²
                          </span>
                        )}
                      </td>

                      <td className="p-3 text-[11px] text-slate-600">
                        {snap.stickerSpec && (
                          <p><strong className="text-slate-800">Stiker:</strong> {snap.stickerSpec}</p>
                        )}
                        {snap.paintSpec && (
                          <p><strong className="text-slate-800">Cat:</strong> {snap.paintSpec}</p>
                        )}
                        {snap.mountSpec && (
                          <p><strong className="text-slate-800">Dudukan:</strong> {snap.mountSpec}</p>
                        )}
                        {snap.poNotes && (
                          <p className="text-rose-700 font-medium italic mt-0.5">Note: {snap.poNotes}</p>
                        )}
                      </td>

                      {!hideConfidential && (
                        <td className="p-3 text-right font-mono text-slate-600">
                          {formatRupiah(it.hppPrice)}
                        </td>
                      )}

                      <td className="p-3 text-right font-mono font-extrabold text-slate-900">
                        {formatRupiah(it.sellingPrice)}
                        {it.quantity > 1 && (
                          <span className="block text-[10px] text-slate-400 font-normal">
                            ({it.quantity}x @{formatRupiah(it.unitPrice)})
                          </span>
                        )}
                      </td>

                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleEditItemInline(it)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                            title="Edit Item Ini di Form Inline"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(it.id)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition cursor-pointer"
                            title="Hapus Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 4: KALKULASI DUA ARAH & NEGOSIASI HARGA DEAL */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 font-black text-xs flex items-center justify-center">4</span>
            <h2 className="font-extrabold text-sm text-slate-900 uppercase tracking-tight">
              Kalkulasi Dua Arah & Negosiasi Deal
            </h2>
          </div>
          <span className="text-[11px] font-bold text-slate-400">Proteksi Margin Riil Bengkel</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Subtotal Standar */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Standar Sistem</span>
            <div className="text-xl font-black text-slate-900">{formatRupiah(baseSubtotal)}</div>
            {!hideConfidential && (
              <p className="text-[11px] text-slate-500">
                Total HPP: <strong className="text-slate-700">{formatRupiah(baseHppTotal)}</strong>
              </p>
            )}
          </div>

          {/* Input Nego Dua Arah */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Harga Kesepakatan (Nego Klien):</span>
            <div className="relative">
              <input
                type="number"
                placeholder={String(baseSubtotal)}
                value={customDealPrice !== null ? customDealPrice : ''}
                onChange={(e) => {
                  const val = e.target.value === '' ? null : Number(e.target.value);
                  setCustomDealPrice(val);
                }}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 font-mono font-extrabold text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <p className="text-[10px] text-slate-500">
              *Ketik harga tawar klien untuk melihat margin riil otomatis.
            </p>
          </div>

          {/* Indikator Kesehatan Margin */}
          <div className={`p-4 rounded-xl border space-y-1 ${
            healthStatus.code === 'safe' ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' :
            healthStatus.code === 'warning' ? 'bg-amber-50/70 border-amber-200 text-amber-950' :
            'bg-rose-50/70 border-rose-200 text-rose-950'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold">Kesehatan Margin Proyek:</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                healthStatus.code === 'safe' ? 'bg-emerald-600 text-white' :
                healthStatus.code === 'warning' ? 'bg-amber-500 text-slate-950' :
                'bg-rose-600 text-white'
              }`}>
                {healthStatus.label}
              </span>
            </div>
            <div className="text-2xl font-black font-mono">
              {realMarginPercent}%
            </div>
            {!hideConfidential && (
              <p className="text-[11px] font-medium opacity-80">
                Estimasi Laba Kotor: {formatRupiah(effectiveGrandTotal - baseHppTotal)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 5: AKSI SIMPAN, TERBITKAN SPK & KIRIM WHATSAPP */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase font-bold text-slate-400 block">Total Final Kontrak Deal:</span>
          <div className="text-2xl font-black text-rose-600 font-mono">
            {formatRupiah(effectiveGrandTotal)}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {items.length} item pekerjaan • Cabang: {activeBranch.city}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Kirim WhatsApp */}
          <button
            type="button"
            onClick={handleSendWhatsApp}
            disabled={items.length === 0}
            className="px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>Kirim WhatsApp Ringkas</span>
          </button>

          {/* Simpan & Terbitkan SPK */}
          <button
            type="button"
            onClick={handleSaveQuotation}
            disabled={isSubmitting || items.length === 0}
            className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow-lg shadow-slate-900/20 flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4 text-amber-400" />
            )}
            <span>
              {isEditMode ? 'Simpan Perubahan & Perbarui SPK' : 'Simpan Penawaran & Terbitkan SPK'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CalculatorPage() {
  return (
    <Suspense fallback={
      <div className="p-8 text-center">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" />
      </div>
    }>
      <CalculatorContent />
    </Suspense>
  );
}
