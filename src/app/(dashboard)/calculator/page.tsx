'use client';

import { useState, useMemo, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  calculateReverseMargin,
  getMarginHealthStatus,
  distributeNegotiatedTotal,
  generateWhatsAppQuoteText,
  calculateLedModules,
  MultiItemLine
} from '@/lib/calculator-modular';
import { getAllBranches, getBranchConfig } from '@/lib/branches';
import { createQuotationAction, updateQuotationAction, getQuotationByIdAction } from '@/app/actions/quotation';
import { getMaterialRatesAction } from '@/app/actions/master';
import SearchableCombobox, { ComboboxOption } from '@/components/SearchableCombobox';
import { toast } from 'sonner';
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
  Building,
  Zap,
  Check,
  X,
  Tag,
  ArrowRight
} from 'lucide-react';

// =========================================================================
// DEFAULT MASTER MATERIAL RATES (FALLBACK INITIAL DATA)
// =========================================================================
const DEFAULT_MATERIAL_RATES: ComboboxOption[] = [
  // Huruf Timbul
  { id: 'mat-ht-1', name: 'Plat Galvanis Cat Duco (Non-Lampu)', category: 'huruf_timbul', unit: 'cm', costPrice: 5500, sellPrice: 10000, notes: 'Plat galvanis bending las finishing cat duco oven' },
  { id: 'mat-ht-2', name: 'Akrilik Solid (Non-Lampu)', category: 'huruf_timbul', unit: 'cm', costPrice: 5000, sellPrice: 10000, notes: 'Akrilik solid tebal 3mm warna standar Marga Cipta' },
  { id: 'mat-ht-3', name: 'Stainless Steel (Non-Lampu)', category: 'huruf_timbul', unit: 'cm', costPrice: 6500, sellPrice: 12000, notes: 'Stainless 201/304 finishing mirror atau hairline' },
  { id: 'mat-ht-4', name: 'Huruf Timbul Akrilik Dual Glow (Cahaya Depan & Belakang)', category: 'huruf_timbul', unit: 'cm', costPrice: 9500, sellPrice: 18000, notes: 'Akrilik solid Marga Cipta muka & siluet belakang' },
  { id: 'mat-ht-5', name: 'Huruf Timbul Stainless Biasa + LED Backlight', category: 'huruf_timbul', unit: 'cm', costPrice: 10500, sellPrice: 20000, notes: 'Badan stainless mirror/hairline + backlight LED modul IP68' },
  { id: 'mat-ht-6', name: 'Huruf Timbul Stainless Gold Titanium + LED', category: 'huruf_timbul', unit: 'cm', costPrice: 13500, sellPrice: 25000, notes: 'Plat stainless gold mirror anti karat + LED modul' },
  
  // Neon Box & Billboard
  { id: 'mat-nb-1', name: 'Neon Box Akrilik 1 Sisi', category: 'neon_box', unit: 'm2', costPrice: 1050000, sellPrice: 1900000, notes: 'Rangka hollow 2x2, visual akrilik 3mm, lampu LED tube/modul' },
  { id: 'mat-nb-2', name: 'Neon Box Akrilik 2 Sisi', category: 'neon_box', unit: 'm2', costPrice: 1550000, sellPrice: 2850000, notes: 'Rangka hollow 2x2, visual akrilik bolak-balik + lampu LED' },
  { id: 'mat-nb-3', name: 'Neon Box Bulat / Mangkokan Akrilik + LED', category: 'neon_box', unit: 'm2', costPrice: 1200000, sellPrice: 2200000, notes: 'Model mangkokan bending bulat/custom presisi' },
  { id: 'mat-nb-4', name: 'Papan Reklame Flexi Korea + Plat Galvalum', category: 'neon_box', unit: 'm2', costPrice: 550000, sellPrice: 950000, notes: 'Rangka hollow 3x3 + galvalum + flexi korea cetak UV' },
  { id: 'mat-nb-5', name: 'Rangka Billboard Raksasa Besi Siku Heavy Duty', category: 'neon_box', unit: 'm2', costPrice: 750000, sellPrice: 1350000, notes: 'Konstruksi siku 4x4 / 5x5 + pengaku angin' },

  // Background Fasad
  { id: 'mat-fs-1', name: 'ACP Seven 3mm PVDF + Rangka Hollow 4x4', category: 'fasad', unit: 'm2', costPrice: 450000, sellPrice: 750000, notes: 'Aluminium Composite Panel Seven 3mm PVDF tahan cuaca luar' },
  { id: 'mat-fs-2', name: 'Plat Galvanil Duco Oven + Rangka Hollow', category: 'fasad', unit: 'm2', costPrice: 400000, sellPrice: 650000, notes: 'Plat galvanil 0.8mm finishing cat duco oven + hollow' },
  { id: 'mat-fs-3', name: 'Kisi-kisi Hollow Galvanis 2x4', category: 'fasad', unit: 'm2', costPrice: 350000, sellPrice: 550000, notes: 'Bilah kisi hollow galvanis 2x4 finishing cat duco' },
  { id: 'mat-fs-4', name: 'Multiplek 12mm / Melamin Backwall', category: 'fasad', unit: 'm2', costPrice: 250000, sellPrice: 450000, notes: 'Multiplek 12mm melamin/HPL untuk indoor mall & ruko' },

  // Tiang & Konstruksi
  { id: 'mat-tg-1', name: 'Tiang Pipa Besi Medium 2 Inch', category: 'tiang', unit: 'm', costPrice: 105000, sellPrice: 175000, notes: 'Untuk neon box kecil <= 1m' },
  { id: 'mat-tg-2', name: 'Tiang Pipa Besi Medium 3 Inch', category: 'tiang', unit: 'm', costPrice: 150000, sellPrice: 250000, notes: 'Untuk neon box standar & plang nama ruko' },
  { id: 'mat-tg-3', name: 'Tiang Pipa Besi Medium 4 Inch', category: 'tiang', unit: 'm', costPrice: 230000, sellPrice: 375000, notes: 'Untuk plang reklame s/d 3x2m' },
  { id: 'mat-tg-4', name: 'Tiang Pipa Besi Tebal 6 Inch', category: 'tiang', unit: 'm', costPrice: 420000, sellPrice: 650000, notes: 'Untuk tiang pylon / billboard besar' },
  { id: 'mat-tg-5', name: 'Pondasi Cor Cakar Ayam + Angkur Baseplate', category: 'tiang', unit: 'titik', costPrice: 500000, sellPrice: 850000, notes: 'Galian beton K225 + dynabolt angkur' },

  // Operasional
  { id: 'mat-op-1', name: 'Sewa Scaffolding / Steger per Set', category: 'operasional', unit: 'set/hari', costPrice: 35000, sellPrice: 65000, notes: 'Main frame, catwalk, roda rem & transport bengkel' },
  { id: 'mat-op-2', name: 'Jasa Bongkar Reklame Lama', category: 'operasional', unit: 'lot', costPrice: 250000, sellPrice: 500000, notes: 'Penurunan signage lama & perapihan kabel eksisting' },
  { id: 'mat-op-3', name: 'Jasa Tarik Kabel Listrik Tambahan', category: 'operasional', unit: 'meter', costPrice: 15000, sellPrice: 25000, notes: 'Kabel NYM 2x1.5 SNI + klem pipa konduit' },
];

// Helper Anti-Error Input Angka (Default 0, Tidak Pernah NaN)
function parseSafeNumber(val: string | number, fallback = 0): number {
  if (val === '' || val === null || val === undefined) return fallback;
  const num = Number(val);
  return isNaN(num) ? fallback : num;
}


function CalculatorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit') || searchParams.get('projectId');
  const branches = getAllBranches();

  // =========================================================================
  // 1. MASTER RATES STATE (FROM DB OR FALLBACK)
  // =========================================================================
  const [masterRates, setMasterRates] = useState<ComboboxOption[]>(DEFAULT_MATERIAL_RATES);

  useEffect(() => {
    getMaterialRatesAction().then((res) => {
      if (res.success && res.data && res.data.length > 0) {
        setMasterRates(
          res.data.map((r: any) => ({
            id: r.id,
            name: r.name,
            category: r.category,
            unit: r.unit,
            costPrice: r.costPrice,
            sellPrice: r.sellPrice,
            notes: r.notes || '',
          }))
        );
      }
    });
  }, []);

  // =========================================================================
  // 2. DATA KLIEN & PROYEK (DISIMPAN DI BELAKANG LAYAR / POP-UP)
  // =========================================================================
  const [branchId, setBranchId] = useState('jakarta');
  const [projectName, setProjectName] = useState('');
  const [clientName, setClientName] = useState('');
  const [picName, setPicName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [installationAddress, setInstallationAddress] = useState('');

  // Modal Pop-Up Klien State (Hanya muncul saat klik Kirim WA / Buat SPK)
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientModalAction, setClientModalAction] = useState<'whatsapp' | 'save_project'>('save_project');

  // =========================================================================
  // 3. DAFTAR MULTI-ITEM (ARRAY DETAIL PENAWARAN)
  // =========================================================================
  const [items, setItems] = useState<MultiItemLine[]>([]);
  const [customDealPrice, setCustomDealPrice] = useState<number | null>(null);

  // =========================================================================
  // 4. INLINE ITEM FORM STATE (PARAMETER TEKNIS PRODUK)
  // =========================================================================
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const inlineFormRef = useRef<HTMLDivElement>(null);

  // Kategori Tab
  const [activeCategory, setActiveCategory] = useState<
    'huruf_timbul' | 'neon_box' | 'fasad' | 'tiang' | 'operasional'
  >('huruf_timbul');

  // Filter master rates by activeCategory
  const currentCategoryRates = useMemo(() => {
    return masterRates.filter((r) => r.category === activeCategory);
  }, [masterRates, activeCategory]);

  // Selected Material from Master
  const [selectedMaterial, setSelectedMaterial] = useState<ComboboxOption>(
    currentCategoryRates[0] || DEFAULT_MATERIAL_RATES[0]
  );

  // Auto-switch default material when category changes
  useEffect(() => {
    if (currentCategoryRates.length > 0) {
      // Pick first material if current doesn't match category
      if (selectedMaterial.category !== activeCategory) {
        setSelectedMaterial(currentCategoryRates[0]);
      }
    }
  }, [activeCategory, currentCategoryRates, selectedMaterial]);

  // Numeric Dimensions (Protected with safe parser)
  const [quantity, setQuantity] = useState<number>(1);
  const [customItemTitle, setCustomItemTitle] = useState<string>('');

  // Huruf Timbul State
  const [letterText, setLetterText] = useState<string>('');
  const [charCount, setCharCount] = useState<number>(10);
  const [letterHeightCm, setLetterHeightCm] = useState<number>(20);
  const [letterDepthCm, setLetterDepthCm] = useState<number>(4);

  // Neon Box State
  const [boxShape, setBoxShape] = useState<'kotak' | 'bulat' | 'mangkokan'>('kotak');
  const [boxText, setBoxText] = useState<string>('');
  const [boxWidthCm, setBoxWidthCm] = useState<number>(100);
  const [boxHeightCm, setBoxHeightCm] = useState<number>(100);

  // Fasad / Billboard State
  const [fasadText, setFasadText] = useState<string>('');
  const [fasadLengthCm, setFasadLengthCm] = useState<number>(300);
  const [fasadHeightCm, setFasadHeightCm] = useState<number>(120);

  // Tiang State
  const [poleHeightMeter, setPoleHeightMeter] = useState<number>(3);
  const [needPondasi, setNeedPondasi] = useState<boolean>(false);
  const [pondasiPoints, setPondasiPoints] = useState<number>(1);

  // Operasional State
  const [scaffoldingSets, setScaffoldingSets] = useState<number>(2);
  const [scaffoldingDays, setScaffoldingDays] = useState<number>(3);
  const [kabelMeters, setKabelMeters] = useState<number>(20);

  // Metode Dudukan / Konstruksi Inline
  const [mountType, setMountType] = useState<string>('Tempel Dinding Langsung (Rp 0 - Media Klien)');
  const [boardAcpLengthCm, setBoardAcpLengthCm] = useState<number>(0);
  const [boardAcpHeightCm, setBoardAcpHeightCm] = useState<number>(0);

  // Free Text Fabrications & Workshop Notes (with Quick Tag Pills)
  const [fabricationNotes, setFabricationNotes] = useState<string>('');

  // UI States
  const [hideConfidential, setHideConfidential] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProject, setIsLoadingProject] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editProjectNumber, setEditProjectNumber] = useState('');

  const activeBranch = getBranchConfig(branchId);

  // =========================================================================
  // 5. STATE REHYDRATION ON EDIT (?edit=... or ?projectId=...)
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
            p.items.map((it: any) => {
              const snap = typeof it.specSnapshot === 'string' ? JSON.parse(it.specSnapshot) : it.specSnapshot || {};
              return {
                id: it.id,
                itemType: it.itemType,
                description: it.description,
                specifications: it.specifications || '',
                dimensions: it.dimensions || (it.widthCm && it.heightCm ? `${it.widthCm} x ${it.heightCm} cm` : it.heightCm ? `Tinggi ${it.heightCm} cm` : '-'),
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
                specSnapshot: snap,
                qcStatus: it.qcStatus || 'PENDING',
                qcNotes: it.qcNotes || '',
                isMinChargeApplied: it.widthCm && it.heightCm ? (it.widthCm * it.heightCm) / 10000 < 1.0 : false,
              };
            })
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

  // Append pill tag to fabrication notes
  const handleAddQuickTag = (tagText: string) => {
    setFabricationNotes((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return tagText;
      if (trimmed.toLowerCase().includes(tagText.toLowerCase())) return trimmed;
      return `${trimmed}, ${tagText}`;
    });
  };

  // =========================================================================
  // 6. REAL-TIME CALCULATION ENGINE (MASTER DRIVEN & ZERO-SAFE)
  // =========================================================================
  const currentPreview = useMemo(() => {
    let unitHpp = 0;
    let unitSell = 0;
    let areaM2 = 0;
    let isMinCharge = false;
    let autoDesc = '';
    let autoSpecs = '';
    let ledCount = 0;
    let trafoWatt = 0;

    const rateSell = selectedMaterial.sellPrice || 0;
    const rateCost = selectedMaterial.costPrice || 0;

    if (activeCategory === 'huruf_timbul') {
      const effHeight = parseSafeNumber(letterHeightCm, 0);
      const effChars = letterText.trim() ? letterText.replace(/\s+/g, '').length : parseSafeNumber(charCount, 0);
      const depth = parseSafeNumber(letterDepthCm, 4);
      const depthFactor = depth > 5 ? 1 + ((depth - 5) / 10) * 0.15 : 1.0;

      unitSell = (effHeight > 0 && effChars > 0) ? Math.round(effHeight * rateSell * effChars * depthFactor) : 0;
      unitHpp = (effHeight > 0 && effChars > 0) ? Math.round(effHeight * rateCost * effChars * depthFactor) : 0;

      autoDesc = customItemTitle || `Huruf Timbul ${letterText ? `"${letterText.toUpperCase()}"` : selectedMaterial.name}`;
      autoSpecs = `${selectedMaterial.name} • Tinggi ${effHeight}cm (${effChars} Karakter, Tebal ${depth}cm)`;

      const led = (effHeight > 0 && effChars > 0) ? calculateLedModules({
        category: 'huruf_timbul',
        material: selectedMaterial.name,
        heightCm: effHeight,
        charCount: effChars,
      }) : { ledCount: 0, trafoWatt: 0, isIlluminated: false };
      ledCount = led.ledCount;
      trafoWatt = led.trafoWatt;

    } else if (activeCategory === 'neon_box') {
      const w = Math.max(0, parseSafeNumber(boxWidthCm, 100));
      const h = boxShape === 'bulat' ? w : Math.max(0, parseSafeNumber(boxHeightCm, 100));
      const rawArea = (w * h) / 10000;
      isMinCharge = rawArea > 0 && rawArea < 1.0;
      areaM2 = rawArea > 0 ? Math.max(1.0, rawArea) : 0;

      // Rate modifier untuk bentuk mangkokan (proses moulding/tekuk cembung)
      let multiFactor = 1.0;
      if (boxShape === 'mangkokan') multiFactor = 1.15;

      unitSell = Math.round(areaM2 * rateSell * multiFactor);
      unitHpp = Math.round(areaM2 * rateCost * multiFactor);

      const shapeLabel = boxShape === 'mangkokan' ? 'Mangkokan' : boxShape === 'bulat' ? 'Bulat' : 'Kotak';
      const cleanBoxText = boxText.trim();
      autoDesc = customItemTitle || (cleanBoxText ? `Neon Box ${shapeLabel} "${cleanBoxText.toUpperCase()}"` : `Neon Box ${shapeLabel} (${selectedMaterial.name})`);
      autoSpecs = `${selectedMaterial.name} • Dimensi ${w} x ${h} cm (${areaM2.toFixed(2)} m²)`;

      ledCount = Math.max(18, Math.ceil(areaM2 * 35));
      trafoWatt = areaM2 > 2 ? 300 : areaM2 > 1.2 ? 200 : 100;

    } else if (activeCategory === 'fasad') {
      const len = Math.max(0, parseSafeNumber(fasadLengthCm, 300));
      const h = Math.max(0, parseSafeNumber(fasadHeightCm, 120));
      const rawArea = (len * h) / 10000;
      isMinCharge = rawArea > 0 && rawArea < 1.0;
      areaM2 = rawArea > 0 ? Math.max(1.0, rawArea) : 0;

      unitSell = Math.round(areaM2 * rateSell);
      unitHpp = Math.round(areaM2 * rateCost);

      const cleanFasadText = fasadText.trim();
      autoDesc = customItemTitle || (cleanFasadText ? `Billboard Fasad "${cleanFasadText.toUpperCase()}"` : `Fasad / Billboard (${selectedMaterial.name})`);
      autoSpecs = `${selectedMaterial.name} • Dimensi ${len} x ${h} cm (${areaM2.toFixed(2)} m²)`;

    } else if (activeCategory === 'tiang') {
      const h = Math.max(0, parseSafeNumber(poleHeightMeter, 3));
      const pondasiSell = needPondasi ? parseSafeNumber(pondasiPoints, 1) * 850000 : 0;
      const pondasiHpp = needPondasi ? parseSafeNumber(pondasiPoints, 1) * 500000 : 0;
      const pondasiText = needPondasi ? ` + Cor Cakar Ayam (${pondasiPoints} Titik)` : '';

      unitSell = Math.round(h * rateSell) + pondasiSell;
      unitHpp = Math.round(h * rateCost) + pondasiHpp;

      autoDesc = customItemTitle || `Konstruksi Tiang ${selectedMaterial.name} (${h}m)${pondasiText}`;
      autoSpecs = `Pipa Besi Medium, Baseplate & Angkur Dynabolt${pondasiText}`;

    } else if (activeCategory === 'operasional') {
      if (selectedMaterial.name.toLowerCase().includes('scaffolding') || selectedMaterial.name.toLowerCase().includes('steger')) {
        const sets = Math.max(1, parseSafeNumber(scaffoldingSets, 2));
        const days = Math.max(1, parseSafeNumber(scaffoldingDays, 3));
        unitSell = sets * days * rateSell;
        unitHpp = sets * days * rateCost;
        autoDesc = customItemTitle || `Sewa Scaffolding / Steger (${sets} Set x ${days} Hari)`;
        autoSpecs = 'Main frame, catwalk, roda rem & transport antar-jemput bengkel';
      } else if (selectedMaterial.name.toLowerCase().includes('kabel')) {
        const m = Math.max(5, parseSafeNumber(kabelMeters, 20));
        unitSell = m * rateSell;
        unitHpp = m * rateCost;
        autoDesc = customItemTitle || `Jasa Tarik Kabel Listrik Tambahan (${m} Meter)`;
        autoSpecs = 'Kabel listrik NYM standar SNI + klem pelindung konduit';
      } else {
        unitSell = rateSell;
        unitHpp = rateCost;
        autoDesc = customItemTitle || selectedMaterial.name;
        autoSpecs = selectedMaterial.notes || 'Pekerjaan operasional lapangan';
      }
    }

    // Hitung tambahan biaya jika memilih Dudukan Board ACP
    let mountCost = 0;
    let mountSell = 0;
    if (mountType.includes('Board ACP')) {
      const boardW = parseSafeNumber(boardAcpLengthCm, 0);
      const boardH = parseSafeNumber(boardAcpHeightCm, 0);
      const boardArea = (boardW * boardH) / 10000;
      if (boardArea > 0) {
        mountSell = Math.round(Math.max(1.0, boardArea) * 750000);
        mountCost = Math.round(Math.max(1.0, boardArea) * 450000);
      }
    } else if (mountType.includes('Bracket Pipa')) {
      mountSell = 150000;
      mountCost = 85000;
    }

    unitSell += mountSell;
    unitHpp += mountCost;

    const qty = Math.max(1, parseSafeNumber(quantity, 1));
    const finalHpp = unitHpp * qty;
    const finalSell = unitSell * qty;
    const margin = finalSell > 0 ? Math.round(((finalSell - finalHpp) / finalSell) * 100) : 0;

    return {
      unitHpp,
      unitSell,
      finalHpp,
      finalSell,
      margin,
      areaM2,
      isMinCharge,
      description: autoDesc,
      specifications: autoSpecs,
      ledCount,
      trafoWatt,
    };
  }, [
    activeCategory,
    selectedMaterial,
    quantity,
    customItemTitle,
    letterText,
    charCount,
    letterHeightCm,
    letterDepthCm,
    boxShape,
    boxText,
    boxWidthCm,
    boxHeightCm,
    fasadText,
    fasadLengthCm,
    fasadHeightCm,
    poleHeightMeter,
    needPondasi,
    pondasiPoints,
    scaffoldingSets,
    scaffoldingDays,
    kabelMeters,
    mountType,
    boardAcpLengthCm,
    boardAcpHeightCm,
  ]);

  // =========================================================================
  // 7. MULTI-ITEM TOTALS & TWO-WAY NEGOTIATION
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
  // 8. INLINE ITEM HANDLERS (ADD / UPDATE ITEM)
  // =========================================================================
  const handleSaveInlineItem = () => {
    const qty = Math.max(1, parseSafeNumber(quantity, 1));

    // Dimension String
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
      dimString = `${qty} Unit`;
    }

    // Locked PO Snapshot
    const snapshot = {
      category: activeCategory,
      materialName: selectedMaterial.name,
      materialCost: selectedMaterial.costPrice,
      materialSell: selectedMaterial.sellPrice,
      unit: selectedMaterial.unit,
      dimensions: dimString,
      widthCm: activeCategory === 'neon_box' ? boxWidthCm : activeCategory === 'fasad' ? fasadLengthCm : undefined,
      heightCm: activeCategory === 'huruf_timbul' ? letterHeightCm : activeCategory === 'neon_box' ? boxHeightCm : activeCategory === 'fasad' ? fasadHeightCm : undefined,
      charCount: activeCategory === 'huruf_timbul' ? charCount : undefined,
      areaM2: currentPreview.areaM2 || undefined,
      isMinChargeApplied: currentPreview.isMinCharge,
      mountType,
      fabricationNotes: fabricationNotes.trim(),
      ledCount: currentPreview.ledCount || undefined,
      trafoWatt: currentPreview.trafoWatt || undefined,
      timestamp: new Date().toISOString(),
    };

    const newItemData: MultiItemLine = {
      id: editingItemId || `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      itemType: activeCategory,
      description: currentPreview.description,
      specifications: currentPreview.specifications,
      dimensions: dimString,
      textOrLabel: activeCategory === 'huruf_timbul'
        ? (letterText.trim() || undefined)
        : activeCategory === 'neon_box'
        ? (boxText.trim() || undefined)
        : activeCategory === 'fasad'
        ? (fasadText.trim() || undefined)
        : undefined,
      charCount: activeCategory === 'huruf_timbul' ? charCount : undefined,
      heightCm: activeCategory === 'huruf_timbul' ? Number(letterHeightCm) : activeCategory === 'neon_box' ? Number(boxHeightCm) : Number(fasadHeightCm),
      widthCm: activeCategory === 'neon_box' ? Number(boxWidthCm) : activeCategory === 'fasad' ? Number(fasadLengthCm) : undefined,
      material: selectedMaterial.name,
      lighting: currentPreview.ledCount > 0 ? 'frontlit' : 'none',
      quantity: qty,
      unitPrice: currentPreview.unitSell,
      sellingPrice: currentPreview.finalSell,
      unitHpp: currentPreview.unitHpp,
      hppPrice: currentPreview.finalHpp,
      specSnapshot: snapshot,
      qcStatus: 'PENDING',
      qcNotes: fabricationNotes.trim() || undefined,
      isMinChargeApplied: currentPreview.isMinCharge,
    };

    if (editingItemId) {
      setItems(items.map((it) => (it.id === editingItemId ? newItemData : it)));
      setEditingItemId(null);
      toast.success('Item penawaran berhasil diperbarui!');
    } else {
      setItems([...items, newItemData]);
      toast.success('Item ditambahkan ke penawaran!');
    }

    // Reset deal price to recalculate margin
    setCustomDealPrice(null);

    // Reset fields for quick consecutive inputs
    setCustomItemTitle('');
    setLetterText('');
    setBoxText('');
    setFasadText('');
    setFabricationNotes('');
  };

  const handleEditItemInline = (item: MultiItemLine) => {
    setEditingItemId(item.id);
    const snap = item.specSnapshot || {};

    setActiveCategory((item.itemType as any) || 'huruf_timbul');

    // Match material in master
    const matched = masterRates.find((r) => r.name === item.material || r.id === item.material);
    if (matched) {
      setSelectedMaterial(matched);
    }

    if (item.itemType === 'huruf_timbul') {
      setLetterText(item.textOrLabel || '');
      setCharCount(item.charCount || 10);
      setLetterHeightCm(item.heightCm || 20);
    } else if (item.itemType === 'neon_box') {
      setBoxText(item.textOrLabel || '');
      setBoxWidthCm(item.widthCm || 100);
      setBoxHeightCm(item.heightCm || 100);
    } else if (item.itemType === 'fasad') {
      setFasadText(item.textOrLabel || '');
      setFasadLengthCm(item.widthCm || 300);
      setFasadHeightCm(item.heightCm || 120);
    } else if (item.itemType === 'tiang') {
      setPoleHeightMeter(Math.round((item.heightCm || 300) / 100));
    }

    setCustomItemTitle(item.description);
    setQuantity(item.quantity || 1);
    setMountType(snap.mountType || 'Tempel Dinding Langsung (Rp 0 - Media Klien)');
    setFabricationNotes(snap.fabricationNotes || item.qcNotes || '');

    inlineFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleCancelInlineEdit = () => {
    setEditingItemId(null);
    setCustomItemTitle('');
    setLetterText('');
    setBoxText('');
    setFasadText('');
    setFabricationNotes('');
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter((it) => it.id !== id));
    if (editingItemId === id) handleCancelInlineEdit();
    setCustomDealPrice(null);
    toast.info('Item dihapus dari penawaran.');
  };

  // =========================================================================
  // 9. CLIENT MODAL & SUBMISSION (STAGE 2 POP-UP)
  // =========================================================================
  const handleOpenClientModal = (action: 'whatsapp' | 'save_project') => {
    if (items.length === 0) {
      toast.error('Tambahkan minimal 1 item produk terlebih dahulu.');
      return;
    }
    setClientModalAction(action);
    setIsClientModalOpen(true);
  };

  const handleConfirmClientModal = async () => {
    const cleanWhatsApp = clientPhone.trim();
    const cleanClient = clientName.trim();

    if (!cleanWhatsApp) {
      toast.error('Nomor WhatsApp Klien wajib diisi.');
      return;
    }
    if (!cleanClient) {
      toast.error('Nama Klien / Brand Usaha wajib diisi.');
      return;
    }

    const finalProjectName = projectName.trim() || `Signage - ${cleanClient}`;

    const finalItems = customDealPrice && customDealPrice > 0 && customDealPrice !== baseSubtotal
      ? distributeNegotiatedTotal(items, effectiveGrandTotal)
      : items;

    setIsSubmitting(true);
    try {
      let savedProjectId = editId;

      if (isEditMode && editId) {
        // UPDATE PROJECT
        const res = await updateQuotationAction(editId, {
          branch: branchId,
          projectName: finalProjectName,
          clientName: cleanClient,
          picName: picName.trim() || undefined,
          clientPhone: cleanWhatsApp,
          installationAddress: installationAddress.trim() || undefined,
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

        if (!res.success) {
          throw new Error(res.error || 'Gagal memperbarui proyek.');
        }
      } else {
        // CREATE NEW PROJECT
        const res = await createQuotationAction({
          branch: branchId,
          projectName: finalProjectName,
          clientName: cleanClient,
          picName: picName.trim() || undefined,
          clientPhone: cleanWhatsApp,
          installationAddress: installationAddress.trim() || undefined,
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
          savedProjectId = res.projectId;
        } else {
          throw new Error(res.error || 'Gagal menyimpan penawaran.');
        }
      }

      setIsClientModalOpen(false);
      toast.success(isEditMode ? 'Perubahan proyek berhasil disimpan!' : 'Proyek SPK berhasil dibuat!');

      if (clientModalAction === 'whatsapp') {
        const rawNumber = cleanWhatsApp.replace(/[^0-9]/g, '');
        let cleanNumber = rawNumber;
        if (rawNumber.startsWith('0')) cleanNumber = '62' + rawNumber.substring(1);
        else if (!rawNumber.startsWith('62')) cleanNumber = '62' + rawNumber;

        const message = generateWhatsAppQuoteText({
          clientName: cleanClient,
          projectName: finalProjectName,
          items,
          grandTotal: effectiveGrandTotal,
          branchId,
        });

        const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
        if (savedProjectId) {
          router.push(`/projects/${savedProjectId}`);
        }
      } else {
        // Direct redirect to project / SPK view
        if (savedProjectId) {
          router.push(`/projects/${savedProjectId}`);
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      {/* Loading bar when fetching project data */}
      {isLoadingProject && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3.5 rounded-2xl flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-amber-600 shrink-0" />
          <span className="text-xs font-bold">Memuat data proyek & merehidrasi spesifikasi teknis...</span>
        </div>
      )}

      {/* TOP BAR: HEADER & MODE BENGKEL / KLIEN */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
              <span>Hitung Estimasi & Buat SPK</span>
            </h1>
            {isEditMode ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
                Mode Edit: {editProjectNumber}
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Master Data Driven
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Hitung angka jual dan HPP instan. Selesai hitung, klik tombol aksi untuk masukkan data klien via pop-up ringkas.
          </p>
        </div>

        {/* Action Toggles: Edit Client Info & Confidential HPP */}
        <div className="flex items-center gap-2">
          {isEditMode && clientName && (
            <button
              type="button"
              onClick={() => handleOpenClientModal('save_project')}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition cursor-pointer flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-indigo-600" />
              <span>Klien: {clientName}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setHideConfidential(!hideConfidential)}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
              hideConfidential
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
            }`}
            title="Sembunyikan HPP dan Margin saat layar diperlihatkan ke Klien"
          >
            {hideConfidential ? <EyeOff className="w-4 h-4 text-rose-600" /> : <Eye className="w-4 h-4 text-slate-600" />}
            <span>{hideConfidential ? 'Mode Klien (HPP Disensor)' : 'Mode Internal Bengkel'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: INLINE DYNAMIC FORM (PARAMETER TEKNIS PRODUK) */}
      {/* ========================================================================= */}
      <div 
        ref={inlineFormRef}
        className={`rounded-2xl border transition-all duration-200 shadow-sm p-5 md:p-6 space-y-5 ${
          editingItemId 
            ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/50' 
            : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded-lg font-black text-xs flex items-center justify-center ${
              editingItemId ? 'bg-amber-500 text-white' : 'bg-rose-50 text-rose-600'
            }`}>
              1
            </span>
            <h2 className="font-extrabold text-sm text-slate-900 uppercase tracking-tight">
              {editingItemId ? '✏️ Edit Baris Item Reklame' : 'Input Parameter Teknis Produk'}
            </h2>
          </div>

          {editingItemId && (
            <button
              type="button"
              onClick={handleCancelInlineEdit}
              className="px-3 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer"
            >
              Batal Edit
            </button>
          )}
        </div>

        {/* CATEGORY SELECTOR TABS */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <button
            type="button"
            onClick={() => setActiveCategory('huruf_timbul')}
            className={`p-3 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1 ${
              activeCategory === 'huruf_timbul'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="font-extrabold text-xs">HURUF TIMBUL</span>
            <span className="text-[9px] opacity-75">Akrilik, Stainless, Galvanis</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('neon_box')}
            className={`p-3 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1 ${
              activeCategory === 'neon_box'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            <span className="font-extrabold text-xs">NEON BOX</span>
            <span className="text-[9px] opacity-75">Kotak, Bulat & Mangkokan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('fasad')}
            className={`p-3 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1 ${
              activeCategory === 'fasad'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <Building className="w-4 h-4 text-blue-400" />
            <span className="font-extrabold text-xs">FASAD & BILLBOARD</span>
            <span className="text-[9px] opacity-75">ACP, Flexi Korea, Spanduk</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('tiang')}
            className={`p-3 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1 ${
              activeCategory === 'tiang'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <Construction className="w-4 h-4 text-amber-500" />
            <span className="font-extrabold text-xs">TIANG & KONSTRUKSI</span>
            <span className="text-[9px] opacity-75">Pipa 2-6 Inch & Cakar Ayam</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('operasional')}
            className={`p-3 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1 ${
              activeCategory === 'operasional'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <Wrench className="w-4 h-4 text-emerald-400" />
            <span className="font-extrabold text-xs">OPERASIONAL</span>
            <span className="text-[9px] opacity-75">Steger, Bongkar, Kabel</span>
          </button>
        </div>

        {/* INPUT FORM CONTENT */}
        <div className="bg-slate-50/90 border border-slate-200 rounded-2xl p-4 md:p-5 space-y-4">
          
          {/* 1. MASTER MATERIAL SEARCHABLE COMBOBOX */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <SearchableCombobox
                label="Pilihan Bahan Utama (Master Data Acuan):"
                options={currentCategoryRates}
                value={selectedMaterial.id || selectedMaterial.name}
                onChange={(opt) => setSelectedMaterial(opt)}
                placeholder="Ketik untuk mencari bahan master..."
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 text-xs block mb-1.5">Jumlah Pesanan (Qty Unit):</label>
              <input
                type="number"
                min={1}
                value={quantity === 0 ? '' : quantity}
                onChange={(e) => setQuantity(Math.max(1, parseSafeNumber(e.target.value, 1)))}
                placeholder="1"
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 text-xs shadow-xs"
              />
            </div>
          </div>

          {/* 2. DYNAMIC INPUTS ACCORDING TO CATEGORY */}

          {/* A. HURUF TIMBUL */}
          {activeCategory === 'huruf_timbul' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">
                    Teks Huruf / Tulisan Signage (Auto-hitung Karakter):
                  </label>
                  <input
                    type="text"
                    value={letterText}
                    onChange={(e) => setLetterText(e.target.value)}
                    placeholder="Contoh: SALSABILLA ADVERTISING"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 font-mono font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Tinggi Huruf (cm):
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      value={letterHeightCm === 0 ? '' : letterHeightCm}
                      onChange={(e) => setLetterHeightCm(parseSafeNumber(e.target.value, 0))}
                      placeholder="20"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-xs"
                    />
                    <span className="absolute right-3.5 top-2.5 font-bold text-slate-400 text-xs">cm</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Jumlah Karakter Huruf:
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={charCount === 0 ? '' : charCount}
                    onChange={(e) => setCharCount(parseSafeNumber(e.target.value, 0))}
                    placeholder="1"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 font-bold text-slate-900 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">*Spasi tidak dihitung otomatis.</p>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Tebal Samping / Daun Huruf (cm):
                  </label>
                  <select
                    value={letterDepthCm}
                    onChange={(e) => setLetterDepthCm(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 font-bold text-slate-900 focus:outline-none"
                  >
                    <option value={3}>3 cm (Ramping)</option>
                    <option value={4}>4 cm (Standar Reklame - Rekomendasi)</option>
                    <option value={4.5}>4.5 cm (Populer Toko Roti / Retail)</option>
                    <option value={6}>6 cm (Timbul Tegas)</option>
                    <option value={10}>10 cm (Extra Deep Jumbo +15%)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* B. NEON BOX */}
          {activeCategory === 'neon_box' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">Bentuk Neon Box:</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['kotak', 'bulat', 'mangkokan'] as const).map((shape) => (
                      <button
                        key={shape}
                        type="button"
                        onClick={() => setBoxShape(shape)}
                        className={`py-2 rounded-xl border text-center font-bold capitalize transition cursor-pointer text-xs ${
                          boxShape === shape
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {shape}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">
                    Teks / Nama Merk / Logo <span className="text-slate-400 font-normal">(Opsional)</span>:
                  </label>
                  <input
                    type="text"
                    value={boxText}
                    onChange={(e) => setBoxText(e.target.value)}
                    placeholder="Contoh: ROTIO / Kopi Kenangan"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Nama merk akan otomatis tercetak di penawaran & SPK</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">
                    {boxShape === 'bulat' ? 'Diameter Lingkaran (cm):' : 'Panjang (cm):'}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={20}
                      value={boxWidthCm === 0 ? '' : boxWidthCm}
                      onChange={(e) => {
                        const val = parseSafeNumber(e.target.value, 0);
                        setBoxWidthCm(val);
                        if (boxShape === 'bulat') setBoxHeightCm(val);
                      }}
                      placeholder="100"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="absolute right-3 top-2 font-bold text-slate-400 text-xs">cm</span>
                  </div>
                </div>

                {boxShape !== 'bulat' ? (
                  <div>
                    <label className="font-bold text-slate-700 block mb-1.5">Tinggi Vertikal (cm):</label>
                    <div className="relative">
                      <input
                        type="number"
                        min={20}
                        value={boxHeightCm === 0 ? '' : boxHeightCm}
                        onChange={(e) => setBoxHeightCm(parseSafeNumber(e.target.value, 0))}
                        placeholder="100"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="absolute right-3 top-2 font-bold text-slate-400 text-xs">cm</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span>💡 <strong>Bentuk Bulat:</strong> Tinggi otomatis sama dengan diameter lingkaran ({boxWidthCm} cm).</span>
                  </div>
                )}
              </div>

              {/* Area & Minimum Charge Status */}
              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 font-semibold">Luas Riil Bersih: </span>
                  <strong className="font-extrabold text-slate-900">
                    {((boxWidthCm * (boxShape === 'bulat' ? boxWidthCm : boxHeightCm)) / 10000).toFixed(2)} m²
                  </strong>
                </div>

                {currentPreview.isMinCharge ? (
                  <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-black text-[11px] flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    Proteksi Minimum Charge 1.0 m² Aktif
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[11px] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Luas Memenuhi Syarat Normal
                  </span>
                )}
              </div>
            </div>
          )}

          {/* C. BACKGROUND FASAD & BILLBOARD */}
          {activeCategory === 'fasad' && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">
                  Teks / Nama Brand / Visual Billboard <span className="text-slate-400 font-normal">(Opsional)</span>:
                </label>
                <input
                  type="text"
                  value={fasadText}
                  onChange={(e) => setFasadText(e.target.value)}
                  placeholder="Contoh: ROTIO / Billboard Apotek Sehat"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">Nama brand / materi spanduk billboard yang terpasang</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Panjang Bentangan (cm):</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={50}
                      value={fasadLengthCm === 0 ? '' : fasadLengthCm}
                      onChange={(e) => setFasadLengthCm(parseSafeNumber(e.target.value, 0))}
                      placeholder="300"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="absolute right-3.5 top-2.5 font-bold text-slate-400 text-xs">cm</span>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tinggi Bentangan (cm):</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={50}
                      value={fasadHeightCm === 0 ? '' : fasadHeightCm}
                      onChange={(e) => setFasadHeightCm(parseSafeNumber(e.target.value, 0))}
                      placeholder="120"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="absolute right-3.5 top-2.5 font-bold text-slate-400 text-xs">cm</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* D. TIANG & KONSTRUKSI */}
          {activeCategory === 'tiang' && (
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tinggi Tiang (Meter):</label>
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    max={15}
                    value={poleHeightMeter === 0 ? '' : poleHeightMeter}
                    onChange={(e) => setPoleHeightMeter(parseSafeNumber(e.target.value, 0))}
                    placeholder="3"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 focus:outline-none"
                  />
                  <span className="absolute right-3.5 top-2.5 font-bold text-slate-400 text-xs">Meter</span>
                </div>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={needPondasi}
                    onChange={(e) => setNeedPondasi(e.target.checked)}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span>Termasuk Cor Semen Cakar Ayam + Angkur Baseplate (Rp 850.000 / Titik)</span>
                </label>

                {needPondasi && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-bold">Titik:</span>
                    <input
                      type="number"
                      min={1}
                      max={6}
                      value={pondasiPoints}
                      onChange={(e) => setPondasiPoints(Math.max(1, parseSafeNumber(e.target.value, 1)))}
                      className="w-16 bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 font-bold text-center"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* E. OPERASIONAL LAPANGAN */}
          {activeCategory === 'operasional' && (
            <div className="text-xs space-y-3">
              {selectedMaterial.name.toLowerCase().includes('scaffolding') || selectedMaterial.name.toLowerCase().includes('steger') ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Jumlah Set Steger:</label>
                    <input
                      type="number"
                      min={1}
                      value={scaffoldingSets === 0 ? '' : scaffoldingSets}
                      onChange={(e) => setScaffoldingSets(parseSafeNumber(e.target.value, 0))}
                      placeholder="2"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 font-bold text-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Durasi Sewa (Hari):</label>
                    <input
                      type="number"
                      min={1}
                      value={scaffoldingDays === 0 ? '' : scaffoldingDays}
                      onChange={(e) => setScaffoldingDays(parseSafeNumber(e.target.value, 0))}
                      placeholder="3"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 font-bold text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>
              ) : selectedMaterial.name.toLowerCase().includes('kabel') ? (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Panjang Tarik Kabel (Meter):</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={5}
                      value={kabelMeters === 0 ? '' : kabelMeters}
                      onChange={(e) => setKabelMeters(parseSafeNumber(e.target.value, 0))}
                      placeholder="20"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 font-bold text-slate-900 focus:outline-none"
                    />
                    <span className="absolute right-3.5 top-2 font-bold text-slate-400 text-xs">Meter</span>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-white border border-slate-200 rounded-xl text-slate-600">
                  Pekerjaan dihitung per 1 Lot standar bengkel.
                </div>
              )}
            </div>
          )}

          {/* 3. METODE DUDUKAN / KONSTRUKSI INLINE */}
          <div className="pt-2 border-t border-slate-200/80 space-y-2 text-xs">
            <label className="font-bold text-slate-700 block">Metode Dudukan & Penempatan:</label>
            <select
              value={mountType}
              onChange={(e) => setMountType(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 font-semibold text-slate-900 focus:outline-none"
            >
              <option value="Tempel Dinding Langsung (Rp 0 - Media Klien)">Tempel Dinding Langsung (Rp 0 - Media Klien)</option>
              <option value="Fasad / Board ACP Tambahan">Fasad / Board ACP Tambahan (Hitung Luas)</option>
              <option value="Tiang Pipa & Pondasi Cor">Tiang Pipa & Pondasi Cor</option>
              <option value="Bracket Pipa / Menjorok Siku">Bracket Pipa / Menjorok Siku (+Rp 150.000)</option>
              <option value="Gantung Kawat Seling Baja Indoor">Gantung Kawat Seling Baja Indoor (+Rp 100.000)</option>
            </select>

            {mountType.includes('Board ACP') && (
              <div className="p-3 bg-white border border-slate-200 rounded-xl grid grid-cols-2 gap-3 mt-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Panjang Board ACP (cm):</label>
                  <input
                    type="number"
                    value={boardAcpLengthCm === 0 ? '' : boardAcpLengthCm}
                    onChange={(e) => setBoardAcpLengthCm(parseSafeNumber(e.target.value, 0))}
                    placeholder="Contoh: 300"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Tinggi Board ACP (cm):</label>
                  <input
                    type="number"
                    value={boardAcpHeightCm === 0 ? '' : boardAcpHeightCm}
                    onChange={(e) => setBoardAcpHeightCm(parseSafeNumber(e.target.value, 0))}
                    placeholder="Contoh: 100"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* REAL-TIME PREVIEW & ADD ITEM BUTTON */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-700/60 shadow-md">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-black text-sm text-white tracking-tight">{currentPreview.description}</span>
              {currentPreview.isMinCharge && (
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-400 text-slate-950 uppercase">
                  Min. 1.0 m²
                </span>
              )}
            </div>
            <p className="text-[11.5px] text-slate-300 font-medium">{currentPreview.specifications}</p>

            <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
              {!hideConfidential && (
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">HPP Bengkel:</span>
                  <span className="font-mono font-bold text-slate-200">{formatRupiah(currentPreview.finalHpp)}</span>
                </div>
              )}
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Harga Jual Rekomendasi:</span>
                <span className="font-mono font-black text-emerald-400 text-base">{formatRupiah(currentPreview.finalSell)}</span>
              </div>
              {!hideConfidential && (
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Margin Estimasi:</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md font-mono font-bold text-xs bg-emerald-950/80 text-emerald-300 border border-emerald-700/60">
                    {currentPreview.margin}%
                  </span>
                </div>
              )}
              {currentPreview.ledCount > 0 && (
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Estimasi LED:</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md font-mono font-bold text-xs bg-cyan-950/80 text-cyan-300 border border-cyan-700/60">
                    {currentPreview.ledCount} Modul • {currentPreview.trafoWatt}W Trafo
                  </span>
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
              className={`px-5 py-2.5 rounded-xl text-white font-black text-xs shadow-md flex items-center gap-2 transition cursor-pointer ${
                editingItemId
                  ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'
                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
              }`}
            >
              {editingItemId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{editingItemId ? 'Simpan Perubahan Item' : 'Tambahkan ke Daftar Item'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: DAFTAR MULTI-ITEM PEKERJAAN */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 font-black text-xs flex items-center justify-center">2</span>
            <h2 className="font-extrabold text-sm text-slate-900 uppercase tracking-tight">
              Daftar Item Penawaran ({items.length} Item)
            </h2>
          </div>
          <span className="text-[11px] font-bold text-slate-500">
            Subtotal: <strong className="text-slate-900">{formatRupiah(baseSubtotal)}</strong>
          </span>
        </div>

        {items.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
            <Calculator className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-slate-600">Belum ada item yang dimasukkan ke penawaran.</p>
            <p className="text-[11px] mt-0.5">Pilih bahan master di atas dan klik &quot;Tambahkan ke Daftar Item&quot;.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="p-3 w-10 text-center">No</th>
                  <th className="p-3 min-w-[180px]">Item & Teks</th>
                  <th className="p-3 text-center min-w-[120px]">Ukuran</th>
                  <th className="p-3 min-w-[220px]">Bahan Master & Instruksi Fabrikasi</th>
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
                        <p className="font-bold text-slate-900">{it.material}</p>
                        {snap.mountType && (
                          <p className="text-slate-500 text-[10px]">Dudukan: {snap.mountType}</p>
                        )}
                        {snap.fabricationNotes && (
                          <p className="text-rose-700 font-medium italic mt-0.5 bg-rose-50/60 p-1 rounded border border-rose-100">
                            {snap.fabricationNotes}
                          </p>
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
      {/* SECTION 3: NEGO 2 ARAH & AKSI FINAL (SIMPAN / WA VIA POP-UP) */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Subtotal Standar */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Standar Sistem:</span>
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
            <p className="text-[10px] text-slate-500">
              *Ketik harga tawar klien untuk menghitung margin riil otomatis.
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
                Estimasi Laba: {formatRupiah(effectiveGrandTotal - baseHppTotal)}
              </p>
            )}
          </div>
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500">
            <span className="px-3 py-1.5 rounded-xl bg-slate-100 font-bold text-slate-800 border border-slate-200">
              {items.length} Item Penawaran
            </span>
            <span>
              Subtotal: <strong className="text-slate-800">{formatRupiah(baseSubtotal)}</strong>
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${healthStatus.badgeColor}`}>
              ● {healthStatus.label} ({realMarginPercent}%)
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-4 sm:gap-6">
            <div className="text-left sm:text-right">
              <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block">
                Total Kesepakatan:
              </span>
              <div className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${healthStatus.textColor}`}>
                {formatRupiah(effectiveGrandTotal)}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Tombol 1: Kirim WA Penawaran via Pop-up Klien */}
              <button
                type="button"
                onClick={() => handleOpenClientModal('whatsapp')}
                disabled={items.length === 0}
                className="px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>📱 Kirim WA Penawaran</span>
              </button>

              {/* Tombol 2: Buat SPK Resmi via Pop-up Klien */}
              <button
                type="button"
                onClick={() => handleOpenClientModal('save_project')}
                disabled={items.length === 0}
                className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow-lg shadow-slate-900/20 flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4 text-amber-400" />
                <span>{isEditMode ? '💾 Simpan Perubahan SPK' : '💾 Buat SPK Resmi'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STAGE 2: MODAL POP-UP RINGKAS DATA KLIEN */}
      {/* ========================================================================= */}
      {isClientModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className={`p-5 flex items-center justify-between border-b ${
              clientModalAction === 'whatsapp'
                ? 'bg-emerald-50 border-emerald-100 text-emerald-950'
                : 'bg-indigo-50 border-indigo-100 text-indigo-950'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${
                  clientModalAction === 'whatsapp' ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white'
                }`}>
                  {clientModalAction === 'whatsapp' ? <Send className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase">
                    {clientModalAction === 'whatsapp' ? 'Kirim Penawaran WhatsApp' : 'Penerbitan SPK Resmi Proyek'}
                  </h3>
                  <p className="text-[11px] opacity-75">
                    Masukkan data usaha klien untuk menyimpan proyek ke sistem.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsClientModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-black/5 text-slate-500 hover:text-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body - Ringkas & Cepat (Khusus halaman Kalkulator/Penawaran Awal) */}
            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  No. WhatsApp Klien <span className="text-rose-600">*</span>:
                </label>
                <input
                  type="tel"
                  autoFocus={!clientPhone}
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="Contoh: 081318486932 atau 6281318486932"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
                <p className="text-[10px] text-slate-500 mt-1">Nomor tujuan langsung pengiriman pesan penawaran WA</p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Nama Klien / Brand Usaha <span className="text-rose-600">*</span>:
                </label>
                <input
                  type="text"
                  autoFocus={Boolean(clientPhone && !clientName)}
                  value={clientName}
                  onChange={(e) => {
                    const val = e.target.value;
                    setClientName(val);
                    if (!projectName || projectName.startsWith('Signage - ') || projectName.startsWith('Signage ')) {
                      setProjectName(`Signage - ${val}`);
                    }
                  }}
                  placeholder="Contoh: ROTIO / Kopi Kenangan"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Nama / Judul Pekerjaan:
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder={`Contoh: Signage - ${clientName || 'ROTIO'}`}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Cabang Penanggung Jawab:</label>
                <select
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 focus:bg-white focus:outline-none"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.city})
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-[11px] text-slate-500 flex items-center gap-2">
                <span className="text-amber-500 text-sm">💡</span>
                <span>Alamat pasang lengkap, PIC, & catatan spesifikasi bengkel dapat dilengkapi di halaman detail proyek.</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsClientModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleConfirmClientModal}
                disabled={isSubmitting}
                className={`px-5 py-2.5 rounded-xl text-white font-black text-xs shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50 ${
                  clientModalAction === 'whatsapp'
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                    : 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/30'
                }`}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : clientModalAction === 'whatsapp' ? (
                  <Send className="w-4 h-4" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                <span>
                  {clientModalAction === 'whatsapp'
                    ? 'Kirim Pesan WhatsApp Sekarang'
                    : isEditMode
                    ? 'Simpan Perubahan Proyek'
                    : 'Terbitkan SPK & Buka Proyek'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
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
