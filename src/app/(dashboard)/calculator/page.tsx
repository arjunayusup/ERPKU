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
  Loader2,
  Wrench,
  CheckSquare,
  Truck
} from 'lucide-react';

function CalculatorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const branches = getAllBranches();

  // 1. HEADER TRANSAKSI (DATA KLIEN)
  const [branchId, setBranchId] = useState('jakarta');
  const [projectName, setProjectName] = useState('');
  const [clientName, setClientName] = useState('');
  const [picName, setPicName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [installationAddress, setInstallationAddress] = useState('');

  // 2. DAFTAR MULTI-ITEM (ARRAY DETAIL)
  const [items, setItems] = useState<MultiItemLine[]>([]);

  // 3. UNIFIED MODAL STATE (INPUT ITEM BARU / EDIT ITEM)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Kategori Modal: huruf_timbul, neon_box, papan_reklame, logo, fasad, tiang, operasional
  const [modalCategory, setModalCategory] = useState<
    'huruf_timbul' | 'neon_box' | 'papan_reklame' | 'logo' | 'fasad' | 'tiang' | 'operasional'
  >('huruf_timbul');

  // Input Umum / Huruf Timbul / Neon Box / Billboard
  const [modalSubCategory, setModalSubCategory] = useState('stainless_biasa_led');
  const [modalText, setModalText] = useState('');
  const [modalCharCount, setModalCharCount] = useState(10);
  const [modalHeightCm, setModalHeightCm] = useState(20);
  const [modalLengthCm, setModalLengthCm] = useState(0);
  const [modalQuantity, setModalQuantity] = useState(1);
  const [modalCustomDesc, setModalCustomDesc] = useState('');

  // Input Khusus: Logo 3D
  const [modalLogoDesc, setModalLogoDesc] = useState('Logo / Emblem Timbul 3D');
  const [modalLogoWidth, setModalLogoWidth] = useState(80);
  const [modalLogoHeight, setModalLogoHeight] = useState(80);
  const [modalLogoSpec, setModalLogoSpec] = useState<'akrilik_led' | 'stainless_backlight' | 'non_lampu'>('akrilik_led');
  const [modalLogoQty, setModalLogoQty] = useState(1);

  // Input Khusus: Fasad ACP
  const [modalFasadDesc, setModalFasadDesc] = useState('Background Fasad ACP Seven');
  const [modalFasadLength, setModalFasadLength] = useState(300);
  const [modalFasadHeight, setModalFasadHeight] = useState(120);
  const [modalFasadMaterial, setModalFasadMaterial] = useState<'acp_seven' | 'plat_galvanil' | 'kisi_hollow' | 'multiplek'>('acp_seven');

  // Input Khusus: Konstruksi Tiang & Pondasi
  const [modalPoleType, setModalPoleType] = useState<'none' | 'pipa_2' | 'pipa_3' | 'pipa_4' | 'pipa_6' | 'rangka_hollow'>('none');
  const [modalPoleHeightMeter, setModalPoleHeightMeter] = useState(3);
  const [modalPondasi, setModalPondasi] = useState(false);
  const [modalPondasiPoints, setModalPondasiPoints] = useState(1);

  // Input Khusus: Operasional
  const [modalOperasionalType, setModalOperasionalType] = useState<'scaffolding' | 'bongkar' | 'kabel'>('scaffolding');
  const [modalScaffoldingSets, setModalScaffoldingSets] = useState(2);
  const [modalScaffoldingDays, setModalScaffoldingDays] = useState(3);
  const [modalKabelMeter, setModalKabelMeter] = useState(20);

  // 3b. QUICK PACKAGE ADD-ONS (HANYA AKTIF SAAT MEMBUAT HURUF TIMBUL BARU)
  const [pkgIncludeLogo, setPkgIncludeLogo] = useState(false);
  const [pkgLogoDesc, setPkgLogoDesc] = useState('Logo / Emblem Timbul 3D');
  const [pkgLogoWidth, setPkgLogoWidth] = useState(80);
  const [pkgLogoHeight, setPkgLogoHeight] = useState(80);
  const [pkgLogoSpec, setPkgLogoSpec] = useState<'akrilik_led' | 'stainless_backlight' | 'non_lampu'>('akrilik_led');
  const [pkgLogoQty, setPkgLogoQty] = useState(1);

  const [pkgIncludeFasad, setPkgIncludeFasad] = useState(false);
  const [pkgFasadLength, setPkgFasadLength] = useState(400);
  const [pkgFasadHeight, setPkgFasadHeight] = useState(150);
  const [pkgFasadMaterial, setPkgFasadMaterial] = useState<'acp_seven' | 'plat_galvanil' | 'kisi_hollow' | 'multiplek'>('acp_seven');

  const [pkgIncludeOperasional, setPkgIncludeOperasional] = useState(false);
  const [pkgEnableScaffolding, setPkgEnableScaffolding] = useState(false);
  const [pkgScaffoldingSets, setPkgScaffoldingSets] = useState(2);
  const [pkgScaffoldingDays, setPkgScaffoldingDays] = useState(3);
  const [pkgEnableBongkar, setPkgEnableBongkar] = useState(false);
  const [pkgEnableTarikKabel, setPkgEnableTarikKabel] = useState(false);
  const [pkgKabelMeter, setPkgKabelMeter] = useState(20);

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

  // Akumulasi dasar dari items
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

  // Helper kalkulator Logo
  const calculateLogoItem = (width: number, height: number, spec: string, qty: number, desc: string): MultiItemLine => {
    const area = width * height;
    let rateSell = 70;
    let rateCost = 35;
    let specName = 'Logo Akrilik Laser Cut 3D + Visual Oracal + LED Frontlit';
    let lighting = 'frontlit';

    if (spec === 'stainless_backlight') {
      rateSell = 85;
      rateCost = 45;
      specName = 'Logo Stainless Steel 3D + Backlight LED Modul';
      lighting = 'backlight';
    } else if (spec === 'non_lampu') {
      rateSell = 45;
      rateCost = 22;
      specName = 'Logo Akrilik Solid Marga Cipta 3mm (Tanpa Lampu)';
      lighting = 'none';
    }

    const unitSell = Math.max(350000, Math.round(area * rateSell));
    const unitHpp = Math.max(180000, Math.round(area * rateCost));
    const count = Number(qty) || 1;

    return {
      id: `logo-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      itemType: 'logo',
      description: desc || 'Logo / Emblem Timbul 3D',
      specifications: `${specName} • Dimensi ${width} x ${height} cm`,
      dimensions: `${width} x ${height} cm`,
      heightCm: height,
      widthCm: width,
      charCount: 1,
      material: spec,
      lighting,
      quantity: count,
      unitPrice: unitSell,
      sellingPrice: unitSell * count,
      unitHpp,
      hppPrice: unitHpp * count,
    };
  };

  // Helper kalkulator Fasad
  const calculateFasadItem = (length: number, height: number, matKey: string, desc?: string): MultiItemLine => {
    const areaM2 = Math.max(0.5, (length * height) / 10000);
    let sellPerM2 = 750000;
    let costPerM2 = 450000;
    let title = 'ACP Seven 3mm PVDF + Rangka Hollow 4x4 Galvanis';

    if (matKey === 'plat_galvanil') {
      sellPerM2 = 650000;
      costPerM2 = 400000;
      title = 'Plat Galvanil 0.8mm Cat Duco Oven + Rangka Hollow Galvanis';
    } else if (matKey === 'kisi_hollow') {
      sellPerM2 = 550000;
      costPerM2 = 350000;
      title = 'Kisi-kisi Bilah Hollow Galvanis 2x4 Anti Karat';
    } else if (matKey === 'multiplek') {
      sellPerM2 = 450000;
      costPerM2 = 250000;
      title = 'Multiplek 12mm Finishing Melamin / HPL Indoor';
    }

    const totalSell = Math.round(areaM2 * sellPerM2);
    const totalCost = Math.round(areaM2 * costPerM2);

    return {
      id: `fasad-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      itemType: 'fasad',
      description: desc || `Background Fasad Reklame (${areaM2.toFixed(2)} m²)`,
      specifications: `${title} • Dimensi ${length} x ${height} cm`,
      dimensions: `${length} x ${height} cm`,
      heightCm: height,
      widthCm: length,
      material: matKey,
      lighting: 'none',
      quantity: 1,
      unitPrice: totalSell,
      sellingPrice: totalSell,
      unitHpp: totalCost,
      hppPrice: totalCost,
    };
  };

  // Helper kalkulator Tiang
  const calculateTiangItem = (poleType: string, heightMeter: number, withPondasi: boolean, points: number): MultiItemLine => {
    const h = heightMeter || 3;
    let sellPerM = 250000;
    let costPerM = 150000;
    let label = 'Pipa Besi 3 Inch';

    if (poleType === 'pipa_2') {
      sellPerM = 175000;
      costPerM = 105000;
      label = 'Pipa Besi Medium 2 Inch';
    } else if (poleType === 'pipa_4') {
      sellPerM = 375000;
      costPerM = 230000;
      label = 'Pipa Besi Medium 4 Inch';
    } else if (poleType === 'pipa_6') {
      sellPerM = 650000;
      costPerM = 420000;
      label = 'Pipa Besi 6 Inch Schedule';
    } else if (poleType === 'rangka_hollow') {
      sellPerM = 150000;
      costPerM = 90000;
      label = 'Rangka Besi Hollow & Siku';
    }

    const pondasiSell = withPondasi ? points * 850000 : 0;
    const pondasiHpp = withPondasi ? points * 500000 : 0;
    const pondasiText = withPondasi ? ` + Cor Cakar Ayam (${points} Titik)` : '';

    const totalSell = Math.round(h * sellPerM) + pondasiSell;
    const totalCost = Math.round(h * costPerM) + pondasiHpp;

    return {
      id: `tiang-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      itemType: 'tiang',
      description: `Konstruksi Tiang ${label} (${h}m)${pondasiText}`,
      specifications: `Pipa Besi Medium Tebal, Baseplate & Baut Dynabolt${withPondasi ? `, Pengecoran Semen Beton Cakar Ayam (${points} Titik)` : ''}`,
      dimensions: `Tinggi ${h} Meter`,
      heightCm: h * 100,
      widthCm: undefined,
      material: poleType,
      lighting: 'none',
      quantity: 1,
      unitPrice: totalSell,
      sellingPrice: totalSell,
      unitHpp: totalCost,
      hppPrice: totalCost,
    };
  };

  // Open Modal for New Item / Package
  const handleOpenNewItem = () => {
    setEditingItemId(null);
    setModalCategory('huruf_timbul');
    setModalSubCategory('stainless_biasa_led');
    setModalText('');
    setModalCharCount(10);
    setModalHeightCm(20);
    setModalLengthCm(0);
    setModalQuantity(1);
    setModalCustomDesc('');

    // Reset Package options
    setPkgIncludeLogo(false);
    setPkgLogoDesc('Logo / Emblem Timbul 3D');
    setPkgLogoWidth(80);
    setPkgLogoHeight(80);
    setPkgLogoSpec('akrilik_led');
    setPkgLogoQty(1);

    setPkgIncludeFasad(false);
    setPkgFasadLength(400);
    setPkgFasadHeight(150);
    setPkgFasadMaterial('acp_seven');

    setModalPoleType('none');
    setModalPoleHeightMeter(3);
    setModalPondasi(false);
    setModalPondasiPoints(1);

    setPkgIncludeOperasional(false);
    setPkgEnableScaffolding(false);
    setPkgScaffoldingSets(2);
    setPkgScaffoldingDays(3);
    setPkgEnableBongkar(false);
    setPkgEnableTarikKabel(false);
    setPkgKabelMeter(20);

    setIsModalOpen(true);
  };

  // Open Modal for Editing Item (SMART RECOGNITION)
  const handleOpenEditItem = (item: MultiItemLine) => {
    setEditingItemId(item.id);
    const cat = item.itemType as any;
    setModalCategory(cat || 'huruf_timbul');

    if (cat === 'logo') {
      setModalLogoDesc(item.description || 'Logo / Emblem Timbul 3D');
      setModalLogoWidth(item.widthCm || 80);
      setModalLogoHeight(item.heightCm || 80);
      setModalLogoSpec((item.material as any) || 'akrilik_led');
      setModalLogoQty(item.quantity || 1);
    } else if (cat === 'fasad') {
      setModalFasadDesc(item.description || 'Background Fasad Reklame');
      setModalFasadLength(item.widthCm || 300);
      setModalFasadHeight(item.heightCm || 120);
      setModalFasadMaterial((item.material as any) || 'acp_seven');
    } else if (cat === 'tiang') {
      const pType = (item.material as any) || 'pipa_3';
      setModalPoleType(pType);
      setModalPoleHeightMeter(item.heightCm ? Math.round(item.heightCm / 100) : 3);
      setModalPondasi(item.description.includes('Cakar') || item.description.includes('Pondasi') || item.specifications.includes('Cakar'));
    } else if (cat === 'operasional') {
      const opMat = item.material || 'scaffolding';
      setModalOperasionalType(opMat as any);
      if (opMat === 'kabel') {
        const mMatch = item.description.match(/(\d+)\s*Meter/i);
        setModalKabelMeter(mMatch ? Number(mMatch[1]) : 20);
      }
    } else if (cat === 'neon_box') {
      setModalSubCategory(item.material || 'neon_box_2sisi');
      setModalLengthCm(item.widthCm || 100);
      setModalHeightCm(item.heightCm || 100);
    } else if (cat === 'papan_reklame') {
      setModalSubCategory(item.material || 'reklame_flexi_korea');
      setModalLengthCm(item.widthCm || 300);
      setModalHeightCm(item.heightCm || 100);
    } else {
      // huruf_timbul
      setModalSubCategory(item.material || 'stainless_biasa_led');
      setModalText(item.textOrLabel || '');
      setModalCharCount(item.charCount || 10);
      setModalHeightCm(item.heightCm || 20);
    }

    setModalQuantity(item.quantity || 1);
    setModalCustomDesc(item.description || '');
    setIsModalOpen(true);
  };

  // Simpan Item atau Paket ke Daftar
  const handleSaveItemFromModal = () => {
    // -------------------------------------------------------------
    // KASUS 1: MODE EDIT (Hanya memperbarui 1 baris item yang diedit)
    // -------------------------------------------------------------
    if (editingItemId) {
      const existing = items.find((it) => it.id === editingItemId);
      if (!existing) return;

      let updatedItem: MultiItemLine = { ...existing };

      if (modalCategory === 'logo') {
        const calculated = calculateLogoItem(
          Number(modalLogoWidth) || 80,
          Number(modalLogoHeight) || 80,
          modalLogoSpec,
          Number(modalLogoQty) || 1,
          modalCustomDesc || modalLogoDesc
        );
        updatedItem = { ...calculated, id: editingItemId };
      } else if (modalCategory === 'fasad') {
        const calculated = calculateFasadItem(
          Number(modalFasadLength) || 300,
          Number(modalFasadHeight) || 120,
          modalFasadMaterial,
          modalCustomDesc || modalFasadDesc
        );
        updatedItem = { ...calculated, id: editingItemId };
      } else if (modalCategory === 'tiang') {
        const calculated = calculateTiangItem(
          modalPoleType,
          Number(modalPoleHeightMeter) || 3,
          modalPondasi,
          Number(modalPondasiPoints) || 1
        );
        updatedItem = { ...calculated, id: editingItemId };
      } else if (modalCategory === 'operasional') {
        if (modalOperasionalType === 'scaffolding') {
          const sets = Number(modalScaffoldingSets) || 2;
          const days = Number(modalScaffoldingDays) || 3;
          const sell = sets * days * 65000;
          const cost = sets * days * 35000;
          updatedItem = {
            ...existing,
            description: `Sewa Scaffolding / Steger Lapangan (${sets} Set x ${days} Hari)`,
            specifications: 'Main Frame, Catwalk, Roda Rem & Transport Antar-Jemput Bengkel',
            dimensions: `${sets} Set x ${days} Hari`,
            material: 'scaffolding',
            unitPrice: sell,
            sellingPrice: sell,
            unitHpp: cost,
            hppPrice: cost,
          };
        } else if (modalOperasionalType === 'bongkar') {
          updatedItem = {
            ...existing,
            description: 'Jasa Bongkar Reklame Lama & Pembersihan Titik',
            specifications: 'Penurunan signage lama & perapihan instalasi kabel eksisting',
            dimensions: '1 Lot',
            material: 'bongkar',
            unitPrice: 500000,
            sellingPrice: 500000,
            unitHpp: 250000,
            hppPrice: 250000,
          };
        } else {
          const m = Number(modalKabelMeter) || 20;
          const sell = m * 25000;
          const cost = m * 15000;
          updatedItem = {
            ...existing,
            description: `Jasa Tarik Kabel Listrik Tambahan (${m} Meter)`,
            specifications: 'Kabel Listrik NYM 2x1.5mm / 2x2.5mm Standar PLN & Klem',
            dimensions: `${m} Meter`,
            material: 'kabel',
            unitPrice: sell,
            sellingPrice: sell,
            unitHpp: cost,
            hppPrice: cost,
          };
        }
      } else if (modalCategory === 'huruf_timbul') {
        const charNum = modalText.replace(/\s+/g, '').length || modalCharCount;
        const tempSpec: ModularProductSpec = {
          category: 'huruf_timbul',
          subCategory: modalSubCategory,
          lengthCm: 0,
          heightCm: Number(modalHeightCm),
          text: modalText,
          charCount: charNum,
          lightingType: modalSubCategory.includes('led') ? 'led_ip68_waterproof' : 'none',
          floorLevel: 1,
          targetMarginPercent: 35,
        };
        const pricing = calculatePricing(tempSpec);
        const qty = Number(modalQuantity) || 1;
        updatedItem = {
          ...existing,
          description: modalCustomDesc || `Huruf Timbul ${modalText ? `"${modalText.toUpperCase()}"` : ''}`,
          specifications: pricing.material.materialDescription,
          dimensions: formatItemDimensions({
            itemType: 'huruf_timbul',
            heightCm: Number(modalHeightCm),
            charCount: charNum,
            textOrLabel: modalText,
          }),
          textOrLabel: modalText,
          charCount: charNum,
          heightCm: Number(modalHeightCm),
          material: modalSubCategory,
          lighting: modalSubCategory.includes('led') ? 'frontlit' : 'none',
          quantity: qty,
          unitPrice: pricing.finalSellingPrice,
          sellingPrice: pricing.finalSellingPrice * qty,
          unitHpp: pricing.subtotalHpp,
          hppPrice: pricing.subtotalHpp * qty,
        };
      } else {
        // neon_box atau papan_reklame
        const tempSpec: ModularProductSpec = {
          category: modalCategory,
          subCategory: modalSubCategory,
          lengthCm: Number(modalLengthCm),
          heightCm: Number(modalHeightCm),
          lightingType: modalSubCategory.includes('led') || modalCategory === 'neon_box' ? 'led_ip68_waterproof' : 'none',
          floorLevel: 1,
          targetMarginPercent: 35,
        };
        const pricing = calculatePricing(tempSpec);
        const qty = Number(modalQuantity) || 1;
        updatedItem = {
          ...existing,
          description: modalCustomDesc || (modalCategory === 'neon_box' ? 'Neon Box Akrilik' : 'Papan Reklame Flexi Korea'),
          specifications: pricing.material.materialDescription,
          dimensions: `${modalLengthCm} x ${modalHeightCm} cm (${pricing.material.areaM2} m²)`,
          heightCm: Number(modalHeightCm),
          widthCm: Number(modalLengthCm),
          material: modalSubCategory,
          quantity: qty,
          unitPrice: pricing.finalSellingPrice,
          sellingPrice: pricing.finalSellingPrice * qty,
          unitHpp: pricing.subtotalHpp,
          hppPrice: pricing.subtotalHpp * qty,
        };
      }

      setItems(items.map((it) => (it.id === editingItemId ? updatedItem : it)));
      setCustomDealPrice(null);
      setIsModalOpen(false);
      return;
    }

    // -------------------------------------------------------------
    // KASUS 2: MODE TAMBAH BARU (Mendukung All-in-One Package Builder)
    // -------------------------------------------------------------
    const newItemsToAdd: MultiItemLine[] = [];

    if (modalCategory === 'huruf_timbul') {
      const charNum = modalText.replace(/\s+/g, '').length || modalCharCount;
      const tempSpec: ModularProductSpec = {
        category: 'huruf_timbul',
        subCategory: modalSubCategory,
        lengthCm: 0,
        heightCm: Number(modalHeightCm),
        text: modalText,
        charCount: charNum,
        lightingType: modalSubCategory.includes('led') ? 'led_ip68_waterproof' : 'none',
        floorLevel: 1,
        targetMarginPercent: 35,
      };
      const pricing = calculatePricing(tempSpec);
      const qty = Number(modalQuantity) || 1;

      newItemsToAdd.push({
        id: `ht-${Date.now()}`,
        itemType: 'huruf_timbul',
        description: modalCustomDesc || `Huruf Timbul ${modalText ? `"${modalText.toUpperCase()}"` : ''}`,
        specifications: pricing.material.materialDescription,
        dimensions: formatItemDimensions({
          itemType: 'huruf_timbul',
          heightCm: Number(modalHeightCm),
          charCount: charNum,
          textOrLabel: modalText,
        }),
        textOrLabel: modalText,
        charCount: charNum,
        heightCm: Number(modalHeightCm),
        widthCm: undefined,
        material: modalSubCategory,
        lighting: modalSubCategory.includes('led') ? 'frontlit' : 'none',
        quantity: qty,
        unitPrice: pricing.finalSellingPrice,
        sellingPrice: pricing.finalSellingPrice * qty,
        unitHpp: pricing.subtotalHpp,
        hppPrice: pricing.subtotalHpp * qty,
      });

      // Quick Add-on 1: Logo 3D
      if (pkgIncludeLogo) {
        newItemsToAdd.push(
          calculateLogoItem(
            Number(pkgLogoWidth) || 80,
            Number(pkgLogoHeight) || 80,
            pkgLogoSpec,
            Number(pkgLogoQty) || 1,
            pkgLogoDesc
          )
        );
      }

      // Quick Add-on 2: Background Fasad ACP
      if (pkgIncludeFasad) {
        newItemsToAdd.push(
          calculateFasadItem(
            Number(pkgFasadLength) || 400,
            Number(pkgFasadHeight) || 150,
            pkgFasadMaterial
          )
        );
      }

      // Quick Add-on 3: Konstruksi Tiang & Pondasi
      if (modalPoleType !== 'none') {
        newItemsToAdd.push(
          calculateTiangItem(
            modalPoleType,
            Number(modalPoleHeightMeter) || 3,
            modalPondasi,
            Number(modalPondasiPoints) || 1
          )
        );
      }

      // Quick Add-on 4: Operasional
      if (pkgIncludeOperasional) {
        if (pkgEnableScaffolding) {
          const sets = Number(pkgScaffoldingSets) || 2;
          const days = Number(pkgScaffoldingDays) || 3;
          const sell = sets * days * 65000;
          const cost = sets * days * 35000;
          newItemsToAdd.push({
            id: `steger-${Date.now()}`,
            itemType: 'operasional',
            description: `Sewa Scaffolding / Steger Lapangan (${sets} Set x ${days} Hari)`,
            specifications: 'Main Frame, Catwalk, Roda Rem & Transport Antar-Jemput Bengkel',
            dimensions: `${sets} Set x ${days} Hari`,
            material: 'scaffolding',
            lighting: 'none',
            quantity: 1,
            unitPrice: sell,
            sellingPrice: sell,
            unitHpp: cost,
            hppPrice: cost,
          });
        }
        if (pkgEnableBongkar) {
          newItemsToAdd.push({
            id: `bongkar-${Date.now()}`,
            itemType: 'operasional',
            description: 'Jasa Bongkar Reklame Lama & Pembersihan Titik',
            specifications: 'Penurunan signage lama & perapihan instalasi kabel eksisting',
            dimensions: '1 Lot',
            material: 'bongkar',
            lighting: 'none',
            quantity: 1,
            unitPrice: 500000,
            sellingPrice: 500000,
            unitHpp: 250000,
            hppPrice: 250000,
          });
        }
        if (pkgEnableTarikKabel) {
          const m = Number(pkgKabelMeter) || 20;
          const sell = m * 25000;
          const cost = m * 15000;
          newItemsToAdd.push({
            id: `kabel-${Date.now()}`,
            itemType: 'operasional',
            description: `Jasa Tarik Kabel Listrik Tambahan (${m} Meter)`,
            specifications: 'Kabel Listrik NYM 2x1.5mm / 2x2.5mm Standar PLN & Klem',
            dimensions: `${m} Meter`,
            material: 'kabel',
            lighting: 'none',
            quantity: 1,
            unitPrice: sell,
            sellingPrice: sell,
            unitHpp: cost,
            hppPrice: cost,
          });
        }
      }
    } else if (modalCategory === 'logo') {
      newItemsToAdd.push(
        calculateLogoItem(
          Number(modalLogoWidth) || 80,
          Number(modalLogoHeight) || 80,
          modalLogoSpec,
          Number(modalLogoQty) || 1,
          modalCustomDesc || modalLogoDesc
        )
      );
    } else if (modalCategory === 'fasad') {
      newItemsToAdd.push(
        calculateFasadItem(
          Number(modalFasadLength) || 300,
          Number(modalFasadHeight) || 120,
          modalFasadMaterial,
          modalCustomDesc || modalFasadDesc
        )
      );
    } else if (modalCategory === 'tiang') {
      newItemsToAdd.push(
        calculateTiangItem(
          modalPoleType,
          Number(modalPoleHeightMeter) || 3,
          modalPondasi,
          Number(modalPondasiPoints) || 1
        )
      );
    } else if (modalCategory === 'operasional') {
      if (modalOperasionalType === 'scaffolding') {
        const sets = Number(modalScaffoldingSets) || 2;
        const days = Number(modalScaffoldingDays) || 3;
        const sell = sets * days * 65000;
        const cost = sets * days * 35000;
        newItemsToAdd.push({
          id: `op-steger-${Date.now()}`,
          itemType: 'operasional',
          description: `Sewa Scaffolding / Steger Lapangan (${sets} Set x ${days} Hari)`,
          specifications: 'Main Frame, Catwalk, Roda Rem & Transport Antar-Jemput Bengkel',
          dimensions: `${sets} Set x ${days} Hari`,
          material: 'scaffolding',
          lighting: 'none',
          quantity: 1,
          unitPrice: sell,
          sellingPrice: sell,
          unitHpp: cost,
          hppPrice: cost,
        });
      } else if (modalOperasionalType === 'bongkar') {
        newItemsToAdd.push({
          id: `op-bongkar-${Date.now()}`,
          itemType: 'operasional',
          description: 'Jasa Bongkar Reklame Lama & Pembersihan Titik',
          specifications: 'Penurunan signage lama & perapihan instalasi kabel eksisting',
          dimensions: '1 Lot',
          material: 'bongkar',
          lighting: 'none',
          quantity: 1,
          unitPrice: 500000,
          sellingPrice: 500000,
          unitHpp: 250000,
          hppPrice: 250000,
        });
      } else {
        const m = Number(modalKabelMeter) || 20;
        const sell = m * 25000;
        const cost = m * 15000;
        newItemsToAdd.push({
          id: `op-kabel-${Date.now()}`,
          itemType: 'operasional',
          description: `Jasa Tarik Kabel Listrik Tambahan (${m} Meter)`,
          specifications: 'Kabel Listrik NYM 2x1.5mm / 2x2.5mm Standar PLN & Klem',
          dimensions: `${m} Meter`,
          material: 'kabel',
          lighting: 'none',
          quantity: 1,
          unitPrice: sell,
          sellingPrice: sell,
          unitHpp: cost,
          hppPrice: cost,
        });
      }
    } else {
      // neon_box atau papan_reklame
      const tempSpec: ModularProductSpec = {
        category: modalCategory,
        subCategory: modalSubCategory,
        lengthCm: Number(modalLengthCm),
        heightCm: Number(modalHeightCm),
        lightingType: modalSubCategory.includes('led') || modalCategory === 'neon_box' ? 'led_ip68_waterproof' : 'none',
        floorLevel: 1,
        targetMarginPercent: 35,
      };
      const pricing = calculatePricing(tempSpec);
      const qty = Number(modalQuantity) || 1;
      newItemsToAdd.push({
        id: `${modalCategory}-${Date.now()}`,
        itemType: modalCategory,
        description: modalCustomDesc || (modalCategory === 'neon_box' ? 'Neon Box Akrilik' : 'Papan Reklame Flexi Korea'),
        specifications: pricing.material.materialDescription,
        dimensions: `${modalLengthCm} x ${modalHeightCm} cm (${pricing.material.areaM2} m²)`,
        heightCm: Number(modalHeightCm),
        widthCm: Number(modalLengthCm),
        material: modalSubCategory,
        quantity: qty,
        unitPrice: pricing.finalSellingPrice,
        sellingPrice: pricing.finalSellingPrice * qty,
        unitHpp: pricing.subtotalHpp,
        hppPrice: pricing.subtotalHpp * qty,
      });

      if (modalPoleType !== 'none') {
        newItemsToAdd.push(
          calculateTiangItem(
            modalPoleType,
            Number(modalPoleHeightMeter) || 3,
            modalPondasi,
            Number(modalPondasiPoints) || 1
          )
        );
      }
    }

    setItems([...items, ...newItemsToAdd]);
    setCustomDealPrice(null); // Reset tawar menawar
    setIsModalOpen(false);
  };

  // Hapus Baris Item & Auto-reset Nego
  const handleDeleteItem = (id: string) => {
    setItems(items.filter((it) => it.id !== id));
    setCustomDealPrice(null);
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
          {/* 1. Header Informasi Proyek & Klien */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <User className="w-4 h-4 text-rose-600" />
              1. Informasi Proyek & Klien
            </h2>

            <div className="space-y-3 text-xs">
              {/* Judul Pekerjaan */}
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

              {/* Nama Usaha & PIC */}
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

              {/* WhatsApp & Alamat */}
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
                  Daftar spesifikasi resmi reklame dan komponen penunjang proyek.
                </p>
              </div>

              {/* SATU TOMBOL UTAMA TUNGGAL (TIDAK DUA TOMBOL LAGI) */}
              <button
                type="button"
                onClick={handleOpenNewItem}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>+ Tambah Item / Paket Reklame</span>
              </button>
            </div>

            {/* List Item Table / Cards */}
            {items.length === 0 ? (
              <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-2">
                <Layers className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-600">Belum ada item reklame ditambahkan.</p>
                <p className="text-[11px] text-slate-400">
                  Klik tombol <strong>&quot;+ Tambah Item / Paket Reklame&quot;</strong> di atas untuk memasukkan pesanan klien.
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

          {/* SIMPLIFIED NEGOTIATION / NEGO LAPANGAN */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-black uppercase tracking-wider text-slate-800 text-[11px] block">
                Tawar-Menawar / Nego Lapangan:
              </span>
              {customDealPrice && customDealPrice > 0 && (
                <button
                  type="button"
                  onClick={() => setCustomDealPrice(null)}
                  className="text-[11px] text-rose-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
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

      {/* ========================================================================= */}
      {/* UNIFIED MODAL: ALL-IN-ONE SIGNAGE PACKAGE BUILDER & SMART ITEM EDITOR     */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl space-y-4 my-8 border border-slate-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono text-indigo-700 font-black">
                  {editingItemId ? 'MODE PERUBAHAN BARIS ITEM' : 'PAKET REKLAME TERPADU'}
                </span>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 uppercase flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-rose-600" />
                  <span>{editingItemId ? 'Edit Baris Item' : 'Tambah Item / Paket Reklame'}</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* TAB SELECTOR KATEGORI (JIKA EDIT, TAMPILKAN SEBAGAI BADGE STATUS) */}
            {editingItemId ? (
              <div className="p-2.5 rounded-xl bg-slate-100 text-xs font-bold text-slate-800 flex items-center gap-2">
                <span className="px-2 py-0.5 bg-slate-900 text-white rounded text-[10px] uppercase">
                  Kategori: {modalCategory.replace('_', ' ')}
                </span>
                <span className="text-slate-500 font-medium">
                  Mengedit item baris secara spesifik tanpa merusak format data.
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 text-[11px] font-bold">
                {[
                  { key: 'huruf_timbul', label: 'Huruf & Paket' },
                  { key: 'neon_box', label: 'Neon Box' },
                  { key: 'papan_reklame', label: 'Billboard' },
                  { key: 'logo', label: 'Logo 3D' },
                  { key: 'fasad', label: 'Fasad ACP' },
                  { key: 'tiang', label: 'Tiang / Ops' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setModalCategory(tab.key as any)}
                    className={`py-2 px-1 rounded-xl border text-center transition cursor-pointer ${
                      modalCategory === tab.key
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            {/* MODAL BODY PER KATEGORI */}
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1 text-xs">
              {/* ------------------------------------------------------------------ */}
              {/* KATEGORI 1: HURUF TIMBUL (BISA DENGAN CHECKLIST PAKET LENGKAP)    */}
              {/* ------------------------------------------------------------------ */}
              {modalCategory === 'huruf_timbul' && (
                <div className="space-y-3.5">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Pilihan Bahan & Spesifikasi Resmi:
                    </label>
                    <select
                      value={modalSubCategory}
                      onChange={(e) => setModalSubCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900 cursor-pointer"
                    >
                      <option value="stainless_biasa_led">Stainless Steel Biasa + Lampu LED — Rp 20.000 / cm</option>
                      <option value="stainless_gold_led">Stainless Gold Titanium + Lampu LED — Rp 25.000 / cm</option>
                      <option value="akrilik_dual_glow">Akrilik Dual Glow Depan & Belakang — Rp 18.000 / cm</option>
                      <option value="stainless_off">Stainless Steel (Tanpa Lampu) — Rp 12.000 / cm</option>
                      <option value="akrilik_off">Akrilik Solid (Tanpa Lampu) — Rp 10.000 / cm</option>
                      <option value="galvanis_duco_off">Galvanis Cat Duco (Tanpa Lampu) — Rp 10.000 / cm</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Teks / Tulisan Huruf Timbul:</label>
                    <input
                      type="text"
                      value={modalText}
                      onChange={(e) => {
                        setModalText(e.target.value);
                        const clean = e.target.value.replace(/\s+/g, '');
                        setModalCharCount(clean.length || 1);
                      }}
                      placeholder="Contoh: KOPI KENANGAN / ROTIO"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-black text-slate-900 uppercase"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
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

                  {/* KELENGKAPAN PAKET REKLAME TERPADU (HANYA AKTIF SAAT TAMBAH BARU) */}
                  {!editingItemId && (
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3 mt-4">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <span className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-amber-500" />
                          Kelengkapan Paket (Sekali Input Masuk Semua):
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">Centang jika satu paket</span>
                      </div>

                      {/* 1. Paket Logo 3D */}
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={pkgIncludeLogo}
                            onChange={(e) => setPkgIncludeLogo(e.target.checked)}
                            className="rounded text-indigo-600 w-4 h-4"
                          />
                          <span>+ Sertakan Logo / Emblem Toko 3D</span>
                        </label>

                        {pkgIncludeLogo && (
                          <div className="p-3 bg-white rounded-xl border border-indigo-200 space-y-2.5">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">Nama / Deskripsi Logo:</label>
                              <input
                                type="text"
                                value={pkgLogoDesc}
                                onChange={(e) => setPkgLogoDesc(e.target.value)}
                                placeholder="Contoh: Logo Kopi Kenangan / Icon Toko"
                                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-900"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">Panjang (cm):</label>
                                <input
                                  type="number"
                                  value={pkgLogoWidth}
                                  onChange={(e) => setPkgLogoWidth(Number(e.target.value))}
                                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold text-slate-900"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">Tinggi (cm):</label>
                                <input
                                  type="number"
                                  value={pkgLogoHeight}
                                  onChange={(e) => setPkgLogoHeight(Number(e.target.value))}
                                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold text-slate-900"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">Bahan Logo Resmi:</label>
                              <select
                                value={pkgLogoSpec}
                                onChange={(e) => setPkgLogoSpec(e.target.value as any)}
                                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold text-slate-900"
                              >
                                <option value="akrilik_led">Akrilik Laser Cut 3D + Visual Oracal + LED Frontlit (Rp 70/cm²)</option>
                                <option value="stainless_backlight">Stainless Steel 3D + Backlight LED Modul (Rp 85/cm²)</option>
                                <option value="non_lampu">Akrilik Solid Marga Cipta 3mm Tanpa Lampu (Rp 45/cm²)</option>
                              </select>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 2. Paket Background Fasad ACP */}
                      <div className="space-y-2 pt-2 border-t border-slate-200">
                        <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={pkgIncludeFasad}
                            onChange={(e) => setPkgIncludeFasad(e.target.checked)}
                            className="rounded text-indigo-600 w-4 h-4"
                          />
                          <span>+ Pasang di Background Fasad ACP / Rangka</span>
                        </label>

                        {pkgIncludeFasad && (
                          <div className="p-3 bg-white rounded-xl border border-indigo-200 space-y-2.5">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">Panjang Fasad (cm):</label>
                                <input
                                  type="number"
                                  value={pkgFasadLength}
                                  onChange={(e) => setPkgFasadLength(Number(e.target.value))}
                                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold text-slate-900"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">Tinggi Fasad (cm):</label>
                                <input
                                  type="number"
                                  value={pkgFasadHeight}
                                  onChange={(e) => setPkgFasadHeight(Number(e.target.value))}
                                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold text-slate-900"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">Bahan Fasad Resmi:</label>
                              <select
                                value={pkgFasadMaterial}
                                onChange={(e) => setPkgFasadMaterial(e.target.value as any)}
                                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold text-slate-900"
                              >
                                <option value="acp_seven">ACP Seven 3mm PVDF + Rangka Hollow 4x4 (Rp 750.000 / m²)</option>
                                <option value="plat_galvanil">Plat Galvanil Duco Oven + Rangka Hollow (Rp 650.000 / m²)</option>
                                <option value="kisi_hollow">Kisi-kisi Bilah Hollow Galvanis 2x4 (Rp 550.000 / m²)</option>
                                <option value="multiplek">Multiplek 12mm Finishing Melamin/HPL (Rp 450.000 / m²)</option>
                              </select>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 3. Paket Konstruksi Tiang & Pondasi */}
                      <div className="space-y-2 pt-2 border-t border-slate-200">
                        <label className="block font-bold text-slate-800 mb-1">
                          Konstruksi Tiang & Pondasi:
                        </label>
                        <select
                          value={modalPoleType}
                          onChange={(e) => setModalPoleType(e.target.value as any)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900 cursor-pointer"
                        >
                          <option value="none">Tanpa Tiang (Pasang di Dinding / Fasad Tembok)</option>
                          <option value="pipa_3">Tiang Pipa Besi 3 Inch (+ Rp 250.000 / meter)</option>
                          <option value="pipa_2">Tiang Pipa Besi 2 Inch (+ Rp 175.000 / meter)</option>
                          <option value="pipa_4">Tiang Pipa Besi 4 Inch (+ Rp 375.000 / meter)</option>
                          <option value="pipa_6">Tiang Pipa Besi 6 Inch Schedule (+ Rp 650.000 / meter)</option>
                          <option value="rangka_hollow">Rangka Besi Hollow & Siku (+ Rp 150.000 / meter)</option>
                        </select>

                        {modalPoleType !== 'none' && (
                          <div className="p-3 bg-white rounded-xl border border-indigo-200 space-y-2.5">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">Tinggi Tiang (Meter):</label>
                              <input
                                type="number"
                                value={modalPoleHeightMeter}
                                onChange={(e) => setModalPoleHeightMeter(Number(e.target.value))}
                                min={1}
                                max={20}
                                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold text-slate-900"
                              />
                            </div>
                            <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={modalPondasi}
                                onChange={(e) => setModalPondasi(e.target.checked)}
                                className="rounded text-indigo-600 w-4 h-4"
                              />
                              <span>+ Cor Pondasi Cakar Ayam (+ Rp 850.000 / titik)</span>
                            </label>
                          </div>
                        )}
                      </div>

                      {/* 4. Paket Operasional Tambahan */}
                      <div className="space-y-2 pt-2 border-t border-slate-200">
                        <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={pkgIncludeOperasional}
                            onChange={(e) => setPkgIncludeOperasional(e.target.checked)}
                            className="rounded text-indigo-600 w-4 h-4"
                          />
                          <span>+ Tambah Biaya Operasional Lapangan (Steger / Bongkar / Kabel)</span>
                        </label>

                        {pkgIncludeOperasional && (
                          <div className="p-3 bg-white rounded-xl border border-indigo-200 space-y-2">
                            <label className="flex items-center gap-2 font-medium text-slate-800 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={pkgEnableScaffolding}
                                onChange={(e) => setPkgEnableScaffolding(e.target.checked)}
                                className="rounded text-indigo-600 w-3.5 h-3.5"
                              />
                              <span>Sewa Scaffolding ({pkgScaffoldingSets} Set x {pkgScaffoldingDays} Hari)</span>
                            </label>
                            <label className="flex items-center gap-2 font-medium text-slate-800 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={pkgEnableBongkar}
                                onChange={(e) => setPkgEnableBongkar(e.target.checked)}
                                className="rounded text-indigo-600 w-3.5 h-3.5"
                              />
                              <span>Jasa Bongkar Reklame Lama (Rp 500.000)</span>
                            </label>
                            <label className="flex items-center gap-2 font-medium text-slate-800 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={pkgEnableTarikKabel}
                                onChange={(e) => setPkgEnableTarikKabel(e.target.checked)}
                                className="rounded text-indigo-600 w-3.5 h-3.5"
                              />
                              <span>Jasa Tarik Kabel Tambahan ({pkgKabelMeter} Meter)</span>
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ------------------------------------------------------------------ */}
              {/* KATEGORI 2: LOGO / EMBLEM 3D                                       */}
              {/* ------------------------------------------------------------------ */}
              {modalCategory === 'logo' && (
                <div className="space-y-3.5">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nama / Deskripsi Logo:</label>
                    <input
                      type="text"
                      value={modalLogoDesc}
                      onChange={(e) => setModalLogoDesc(e.target.value)}
                      placeholder="Contoh: Logo Toko Bulat 3D"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Panjang (cm):</label>
                      <input
                        type="number"
                        value={modalLogoWidth}
                        onChange={(e) => setModalLogoWidth(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Tinggi (cm):</label>
                      <input
                        type="number"
                        value={modalLogoHeight}
                        onChange={(e) => setModalLogoHeight(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Pilihan Bahan Logo Resmi:</label>
                    <select
                      value={modalLogoSpec}
                      onChange={(e) => setModalLogoSpec(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900 cursor-pointer"
                    >
                      <option value="akrilik_led">Akrilik Laser Cut 3D + Visual Oracal + LED Frontlit (Rp 70/cm²)</option>
                      <option value="stainless_backlight">Stainless Steel 3D + Backlight LED Modul (Rp 85/cm²)</option>
                      <option value="non_lampu">Akrilik Solid Marga Cipta 3mm Tanpa Lampu (Rp 45/cm²)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Jumlah Logo (Unit/Pcs):</label>
                    <input
                      type="number"
                      value={modalLogoQty}
                      onChange={(e) => setModalLogoQty(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                    />
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------------ */}
              {/* KATEGORI 3: FASAD ACP                                              */}
              {/* ------------------------------------------------------------------ */}
              {modalCategory === 'fasad' && (
                <div className="space-y-3.5">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Deskripsi Fasad:</label>
                    <input
                      type="text"
                      value={modalFasadDesc}
                      onChange={(e) => setModalFasadDesc(e.target.value)}
                      placeholder="Contoh: Background Fasad ACP Seven"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Panjang Fasad (cm):</label>
                      <input
                        type="number"
                        value={modalFasadLength}
                        onChange={(e) => setModalFasadLength(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Tinggi Fasad (cm):</label>
                      <input
                        type="number"
                        value={modalFasadHeight}
                        onChange={(e) => setModalFasadHeight(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Bahan Fasad Resmi:</label>
                    <select
                      value={modalFasadMaterial}
                      onChange={(e) => setModalFasadMaterial(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900 cursor-pointer"
                    >
                      <option value="acp_seven">ACP Seven 3mm PVDF + Rangka Hollow 4x4 (Rp 750.000 / m²)</option>
                      <option value="plat_galvanil">Plat Galvanil Duco Oven + Rangka Hollow (Rp 650.000 / m²)</option>
                      <option value="kisi_hollow">Kisi-kisi Bilah Hollow Galvanis 2x4 (Rp 550.000 / m²)</option>
                      <option value="multiplek">Multiplek 12mm Finishing Melamin/HPL (Rp 450.000 / m²)</option>
                    </select>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-100 font-bold text-slate-700">
                    Estimasi Luas: {((modalFasadLength * modalFasadHeight) / 10000).toFixed(2)} m²
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------------ */}
              {/* KATEGORI 4: TIANG & PONDASI                                        */}
              {/* ------------------------------------------------------------------ */}
              {modalCategory === 'tiang' && (
                <div className="space-y-3.5">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Pilihan Pipa Tiang:</label>
                    <select
                      value={modalPoleType === 'none' ? 'pipa_3' : modalPoleType}
                      onChange={(e) => setModalPoleType(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900 cursor-pointer"
                    >
                      <option value="pipa_3">Tiang Pipa Besi 3 Inch (Rp 250.000 / meter)</option>
                      <option value="pipa_2">Tiang Pipa Besi 2 Inch (Rp 175.000 / meter)</option>
                      <option value="pipa_4">Tiang Pipa Besi 4 Inch (Rp 375.000 / meter)</option>
                      <option value="pipa_6">Tiang Pipa Besi 6 Inch Schedule (Rp 650.000 / meter)</option>
                      <option value="rangka_hollow">Rangka Besi Hollow & Siku (Rp 150.000 / meter)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tinggi Tiang (Meter):</label>
                    <input
                      type="number"
                      value={modalPoleHeightMeter}
                      onChange={(e) => setModalPoleHeightMeter(Number(e.target.value))}
                      min={1}
                      max={20}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                    />
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={modalPondasi}
                        onChange={(e) => setModalPondasi(e.target.checked)}
                        className="rounded text-indigo-600 w-4 h-4"
                      />
                      <span>+ Cor Pondasi Cakar Ayam (+ Rp 850.000 / titik)</span>
                    </label>
                    {modalPondasi && (
                      <div className="pl-6">
                        <label className="block text-[11px] text-slate-600 mb-1">Jumlah Titik Cor:</label>
                        <input
                          type="number"
                          value={modalPondasiPoints}
                          onChange={(e) => setModalPondasiPoints(Number(e.target.value))}
                          min={1}
                          max={6}
                          className="w-24 bg-white border border-slate-300 rounded-lg px-2.5 py-1 font-bold text-slate-900"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------------ */}
              {/* KATEGORI 5: OPERASIONAL LAPANGAN                                   */}
              {/* ------------------------------------------------------------------ */}
              {modalCategory === 'operasional' && (
                <div className="space-y-3.5">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Jenis Pekerjaan Operasional:</label>
                    <select
                      value={modalOperasionalType}
                      onChange={(e) => setModalOperasionalType(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900 cursor-pointer"
                    >
                      <option value="scaffolding">Sewa Scaffolding / Steger Lapangan</option>
                      <option value="bongkar">Jasa Bongkar Reklame Lama & Pembersihan Titik</option>
                      <option value="kabel">Jasa Tarik Kabel Listrik Tambahan</option>
                    </select>
                  </div>

                  {modalOperasionalType === 'scaffolding' && (
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Jumlah Set Steger:</label>
                        <input
                          type="number"
                          value={modalScaffoldingSets}
                          onChange={(e) => setModalScaffoldingSets(Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Lama Sewa (Hari):</label>
                        <input
                          type="number"
                          value={modalScaffoldingDays}
                          onChange={(e) => setModalScaffoldingDays(Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                        />
                      </div>
                    </div>
                  )}

                  {modalOperasionalType === 'kabel' && (
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Panjang Kabel (Meter):</label>
                      <input
                        type="number"
                        value={modalKabelMeter}
                        onChange={(e) => setModalKabelMeter(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* ------------------------------------------------------------------ */}
              {/* KATEGORI 6: NEON BOX & BILLBOARD                                   */}
              {/* ------------------------------------------------------------------ */}
              {(modalCategory === 'neon_box' || modalCategory === 'papan_reklame') && (
                <div className="space-y-3.5">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Pilihan Bahan Resmi:</label>
                    {modalCategory === 'neon_box' ? (
                      <select
                        value={modalSubCategory}
                        onChange={(e) => setModalSubCategory(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900 cursor-pointer"
                      >
                        <option value="neon_box_2sisi">Neon Box 2 Sisi Akrilik + Lampu TL — Rp 2.850.000 / m²</option>
                        <option value="neon_box_1sisi">Neon Box 1 Sisi Akrilik + Lampu TL — Rp 1.900.000 / m²</option>
                      </select>
                    ) : (
                      <select
                        value={modalSubCategory}
                        onChange={(e) => setModalSubCategory(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900 cursor-pointer"
                      >
                        <option value="reklame_flexi_korea">Papan Reklame Hollow 3x3 + Flexi Korea — Rp 950.000 / m²</option>
                        <option value="billboard_heavy_duty">Rangka Billboard Besi Siku Heavy Duty — Rp 1.350.000 / m²</option>
                      </select>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block font-medium text-slate-600 mb-1">Panjang (cm):</label>
                      <input
                        type="number"
                        value={modalLengthCm}
                        onChange={(e) => setModalLengthCm(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-slate-600 mb-1">Tinggi (cm):</label>
                      <input
                        type="number"
                        value={modalHeightCm}
                        onChange={(e) => setModalHeightCm(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveItemFromModal}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs cursor-pointer transition flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{editingItemId ? 'Simpan Perubahan Item' : 'Masukkan ke Penawaran'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Sticky Mobile Bar */}
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
