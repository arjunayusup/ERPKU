import { getBranchConfig } from './branches';

export interface ModularProductSpec {
  category: 'huruf_timbul' | 'neon_box' | 'papan_reklame' | 'tiang' | 'custom';
  subCategory: string;
  // Dimensi
  lengthCm: number;
  heightCm: number;
  depthCm?: number;
  charCount?: number;
  text?: string;
  faces?: 1 | 2;
  // Kelistrikan
  lightingType: 'none' | 'led_standard' | 'led_ip68_waterproof' | 'backlight_halolight' | 'frontlit_led';
  // Konstruksi Tiang & Pondasi (Add-on)
  needPoleConstruction?: boolean;
  poleType?: 'pipa_2' | 'pipa_3' | 'pipa_4' | 'pipa_6' | 'rangka_hollow';
  poleHeightMeter?: number;
  needPondasiCakarAyam?: boolean;
  pondasiPoints?: number;
  // Cutting Sticker (Add-on)
  stickerType?: 'none' | 'oracal_651' | 'oracal_8500';
  stickerAreaM2?: number;
  // Lampu Sorot (Billboard/Reklame)
  spotlightWatt?: 0 | 50 | 100;
  spotlightCount?: number;
  // Variabel Lapangan
  floorLevel: number; // 1, 2, 3, 4+
  useScaffolding?: boolean;
  distanceKm?: number;
  // Margin
  targetMarginPercent: number;
}

export interface MultiItemLine {
  id: string;
  itemType: string;
  description: string;
  specifications: string;
  dimensions?: string;
  textOrLabel?: string;
  charCount?: number;
  heightCm?: number;
  widthCm?: number;
  material: string;
  lighting?: string;
  quantity: number;
  unitPrice: number;
  sellingPrice: number;
  unitHpp: number;
  hppPrice: number;
  specSnapshot?: any;
  qcStatus?: string;
  qcNotes?: string;
  isMinChargeApplied?: boolean;
}

// 1. Material & Basic Unit Calculator (Official Salsabilla Rates)
export function calculateMaterial(spec: ModularProductSpec) {
  let materialHpp = 0;
  let materialSell = 0;
  let materialDescription = '';
  let areaM2 = 0;
  let isMinChargeApplied = false;
  let rawArea = 0;

  if (spec.category === 'huruf_timbul') {
    const cleanText = (spec.text || '').trim();
    const charCount = spec.charCount || cleanText.replace(/\s+/g, '').length || 1;
    const height = Math.max(10, spec.heightCm); // min 10cm
    const depth = spec.depthCm || 4;
    const depthFactor = depth > 5 ? 1 + ((depth - 5) / 10) * 0.15 : 1.0;

    let sellRatePerCm = 10000;
    let costRatePerCm = 5500;

    switch (spec.subCategory) {
      case 'galvanis_duco_off':
        sellRatePerCm = 10000;
        costRatePerCm = 5500;
        materialDescription = 'Plat Galvanis Cat Duco (Non-Lampu)';
        break;
      case 'akrilik_off':
        sellRatePerCm = 10000;
        costRatePerCm = 5000;
        materialDescription = 'Akrilik Solid Marga Cipta 3mm (Non-Lampu)';
        break;
      case 'stainless_off':
        sellRatePerCm = 12000;
        costRatePerCm = 6500;
        materialDescription = 'Stainless Steel 201/304 (Non-Lampu)';
        break;
      case 'akrilik_dual_glow':
        sellRatePerCm = 18000;
        costRatePerCm = 9500;
        materialDescription = 'Akrilik Dual Glow (Cahaya Depan & Belakang LED)';
        break;
      case 'stainless_biasa_led':
        sellRatePerCm = 20000;
        costRatePerCm = 10500;
        materialDescription = 'Stainless Steel Biasa + Backlight LED';
        break;
      case 'stainless_gold_led':
      default:
        sellRatePerCm = 25000;
        costRatePerCm = 13500;
        materialDescription = 'Stainless Steel Gold Titanium + Lampu LED';
        break;
    }

    materialHpp = Math.round(height * costRatePerCm * charCount * depthFactor);
    materialSell = Math.round(height * sellRatePerCm * charCount * depthFactor);

    return {
      materialHpp,
      materialSell,
      charCount,
      heightCm: height,
      depthFactor,
      materialDescription,
      areaM2: 0,
      isMinChargeApplied: false,
      rawArea: 0,
    };
  } else if (spec.category === 'neon_box') {
    rawArea = (spec.lengthCm * spec.heightCm) / 10000;
    isMinChargeApplied = rawArea > 0 && rawArea < 1.0;
    areaM2 = Math.max(1.0, rawArea); // min charge 1.0 m2

    let sellRatePerM2 = 1900000;
    let costRatePerM2 = 1050000;

    switch (spec.subCategory) {
      case 'neon_box_1sisi':
        sellRatePerM2 = 1900000;
        costRatePerM2 = 1050000;
        materialDescription = 'Neon Box 1 Sisi Akrilik + Lampu TL/LED';
        break;
      case 'neon_box_2sisi':
      default:
        sellRatePerM2 = 2850000;
        costRatePerM2 = 1550000;
        materialDescription = 'Neon Box 2 Sisi Akrilik Bolak-Balik + Lampu TL/LED';
        break;
    }

    materialHpp = Math.round(areaM2 * costRatePerM2);
    materialSell = Math.round(areaM2 * sellRatePerM2);

    return {
      materialHpp,
      materialSell,
      areaM2: Number(areaM2.toFixed(2)),
      rawArea: Number(rawArea.toFixed(2)),
      isMinChargeApplied,
      materialDescription,
      charCount: 0,
      heightCm: spec.heightCm,
      depthFactor: 1,
    };
  } else if (spec.category === 'tiang') {
    // Standalone Tiang & Konstruksi Line Item
    const heightM = spec.poleHeightMeter || 3;
    let sellPerM = 250000;
    let costPerM = 150000;
    let sizeLabel = '3 Inch';

    switch (spec.subCategory) {
      case 'tiang_pipa_2':
        sellPerM = 175000;
        costPerM = 105000;
        sizeLabel = 'Pipa Besi 2 Inch';
        break;
      case 'tiang_pipa_3':
        sellPerM = 250000;
        costPerM = 150000;
        sizeLabel = 'Pipa Besi 3 Inch';
        break;
      case 'tiang_pipa_4':
        sellPerM = 375000;
        costPerM = 230000;
        sizeLabel = 'Pipa Besi 4 Inch';
        break;
      case 'tiang_pipa_6':
        sellPerM = 650000;
        costPerM = 420000;
        sizeLabel = 'Pipa Besi 6 Inch Schedule';
        break;
      case 'rangka_hollow':
      default:
        sellPerM = 150000;
        costPerM = 90000;
        sizeLabel = 'Rangka Besi Hollow & Siku';
        break;
    }

    let pondasiSell = 0;
    let pondasiHpp = 0;
    let pondasiDesc = '';
    if (spec.needPondasiCakarAyam) {
      const points = spec.pondasiPoints || 1;
      pondasiHpp = points * 500000;
      pondasiSell = points * 850000;
      pondasiDesc = ` + Cor Cakar Ayam (${points} Titik)`;
    }

    materialHpp = Math.round(heightM * costPerM) + pondasiHpp;
    materialSell = Math.round(heightM * sellPerM) + pondasiSell;
    materialDescription = `Konstruksi ${sizeLabel} (${heightM}m)${pondasiDesc}`;

    return {
      materialHpp,
      materialSell,
      areaM2: 0,
      materialDescription,
      charCount: 0,
      heightCm: heightM * 100,
      depthFactor: 1,
    };
  } else {
    // Papan Reklame / Billboard
    const rawArea = (spec.lengthCm * spec.heightCm) / 10000;
    areaM2 = Math.max(1.0, rawArea);

    let sellRatePerM2 = 950000;
    let costRatePerM2 = 550000;

    if (spec.subCategory === 'billboard_heavy_duty') {
      sellRatePerM2 = 1350000;
      costRatePerM2 = 750000;
      materialDescription = 'Rangka Billboard Siku Heavy Duty';
    } else {
      sellRatePerM2 = 950000;
      costRatePerM2 = 550000;
      materialDescription = 'Papan Reklame Flexi Korea + Plat Galvalum';
    }

    materialHpp = Math.round(areaM2 * costRatePerM2);
    materialSell = Math.round(areaM2 * sellRatePerM2);

    return {
      materialHpp,
      materialSell,
      areaM2: Number(areaM2.toFixed(2)),
      materialDescription,
      charCount: 0,
      heightCm: spec.heightCm,
      depthFactor: 1,
    };
  }
}

// 2. Construction & Pole Calculator (Tiang Pipa & Pondasi)
export function calculateConstruction(spec: ModularProductSpec) {
  let poleHpp = 0;
  let poleSell = 0;
  let poleDesc = 'Tanpa Tiang (Dinding/Fasad)';

  // Jika produk utamanya adalah Tiang, jangan hitung add-on tiang lagi (mencegah double count)
  if (spec.category !== 'tiang' && spec.needPoleConstruction) {
    const height = spec.poleHeightMeter || 3;
    let rateSellPerM = 250000;
    let rateCostPerM = 150000;
    let sizeLabel = '3 Inch';

    switch (spec.poleType) {
      case 'pipa_2':
        rateSellPerM = 175000;
        rateCostPerM = 105000;
        sizeLabel = '2 Inch';
        break;
      case 'pipa_3':
        rateSellPerM = 250000;
        rateCostPerM = 150000;
        sizeLabel = '3 Inch';
        break;
      case 'pipa_4':
        rateSellPerM = 375000;
        rateCostPerM = 230000;
        sizeLabel = '4 Inch';
        break;
      case 'pipa_6':
        rateSellPerM = 650000;
        rateCostPerM = 420000;
        sizeLabel = '6 Inch Schedule';
        break;
      case 'rangka_hollow':
      default:
        rateSellPerM = 150000;
        rateCostPerM = 90000;
        sizeLabel = 'Rangka Besi Hollow & Siku';
        break;
    }

    poleHpp = Math.round(height * rateCostPerM);
    poleSell = Math.round(height * rateSellPerM);
    poleDesc = `Tiang Pipa Besi ${sizeLabel} (${height}m)`;
  }

  let pondasiHpp = 0;
  let pondasiSell = 0;
  let pondasiDesc = '';
  if (spec.needPondasiCakarAyam) {
    const points = spec.pondasiPoints || 1;
    pondasiHpp = points * 500000;
    pondasiSell = points * 850000;
    pondasiDesc = `Pondasi Cor Cakar Ayam (${points} Titik)`;
  }

  const constructionHpp = poleHpp + pondasiHpp;
  const constructionSell = poleSell + pondasiSell;

  return {
    constructionHpp,
    constructionSell,
    poleDesc,
    pondasiDesc,
  };
}

// 3. Add-on Finishing & Spotlight Calculator
export function calculateAddons(spec: ModularProductSpec) {
  let addonHpp = 0;
  let addonSell = 0;
  let addonDesc = '';

  if (spec.stickerType && spec.stickerType !== 'none') {
    const area = spec.stickerAreaM2 || 1.0;
    const rateSell = spec.stickerType === 'oracal_8500' ? 350000 : 250000;
    const rateCost = spec.stickerType === 'oracal_8500' ? 195000 : 135000;
    addonHpp += Math.round(area * rateCost);
    addonSell += Math.round(area * rateSell);
    addonDesc += `Cutting Sticker ${spec.stickerType === 'oracal_8500' ? 'Oracal 8500' : 'Oracal 651'} (${area}m2); `;
  }

  if (spec.spotlightWatt && spec.spotlightWatt > 0 && spec.spotlightCount) {
    const rateSell = spec.spotlightWatt === 100 ? 450000 : 275000;
    const rateCost = spec.spotlightWatt === 100 ? 260000 : 155000;
    addonHpp += spec.spotlightCount * rateCost;
    addonSell += spec.spotlightCount * rateSell;
    addonDesc += `${spec.spotlightCount}x Lampu Sorot LED ${spec.spotlightWatt}W; `;
  }

  return {
    addonHpp,
    addonSell,
    addonDesc: addonDesc.trim() || 'Standar',
  };
}

// 4. Installation & Elevation Calculator
export function calculateInstallation(spec: ModularProductSpec) {
  let installationBaseHpp = 250000;
  let heightMultiplier = 1.0;
  if (spec.floorLevel === 2) heightMultiplier = 1.25;
  else if (spec.floorLevel === 3) heightMultiplier = 1.50;
  else if (spec.floorLevel >= 4) heightMultiplier = 1.90;

  let toolsRentHpp = 0;
  let toolsRentSell = 0;
  if (spec.useScaffolding) {
    toolsRentHpp += 150000;
    toolsRentSell += 250000;
  }

  const installationHpp = Math.round(installationBaseHpp * heightMultiplier) + toolsRentHpp;
  const installationSell = Math.round(installationBaseHpp * 1.6 * heightMultiplier) + toolsRentSell;

  return {
    installationHpp,
    installationSell,
    toolsRentHpp,
  };
}

// 5. Transportation Calculator
export function calculateTransportation(spec: ModularProductSpec) {
  const distance = spec.distanceKm || 15;
  const baseTransport = 100000;
  const extraPerKm = distance > 25 ? (distance - 25) * 5000 : 0;
  const transportHpp = baseTransport + extraPerKm;
  const transportSell = Math.round(transportHpp * 1.35);

  return {
    transportHpp,
    transportSell,
    distanceKm: distance,
  };
}

// 6. Master Single-Item Calculator
export function calculatePricing(spec: ModularProductSpec) {
  const material = calculateMaterial(spec);
  const construction = calculateConstruction(spec);
  const addons = calculateAddons(spec);
  const installation = calculateInstallation(spec);
  const transport = calculateTransportation(spec);

  const subtotalHpp =
    material.materialHpp +
    construction.constructionHpp +
    addons.addonHpp +
    installation.installationHpp +
    transport.transportHpp;

  const rawSellingPrice =
    material.materialSell +
    construction.constructionSell +
    addons.addonSell +
    installation.installationSell +
    transport.transportSell;

  const finalSellingPrice = Math.ceil(rawSellingPrice / 5000) * 5000;
  const grossProfit = finalSellingPrice - subtotalHpp;
  const actualMarginPercent = Math.round((grossProfit / finalSellingPrice) * 100);

  return {
    material,
    construction,
    addons,
    installation,
    transport,
    subtotalHpp,
    finalSellingPrice,
    grossProfit,
    actualMarginPercent,
  };
}

// =========================================================================
// 7. TWO-WAY PRICING & REVERSE MARGIN ENGINE
// =========================================================================

// Hitung harga normal dari margin
export function calculateForwardPrice(totalHpp: number, marginPercent: number): number {
  if (totalHpp <= 0) return 0;
  const raw = totalHpp * (1 + marginPercent / 100);
  return Math.ceil(raw / 5000) * 5000;
}

// Hitung margin riil dari harga kesepakatan nego (Reverse Calculation)
export function calculateReverseMargin(totalHpp: number, negotiatedPrice: number): number {
  if (negotiatedPrice <= 0 || totalHpp <= 0) return 0;
  const profit = negotiatedPrice - totalHpp;
  return Math.round((profit / negotiatedPrice) * 100);
}

// Visual Health Indicator (Hijau Emerald, Kuning Amber, Merah Rose)
export function getMarginHealthStatus(marginPercent: number) {
  if (marginPercent >= 35) {
    return { label: 'Untung Sehat', color: 'emerald', code: 'safe', textColor: 'text-emerald-600', badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  }
  if (marginPercent >= 20) {
    return { label: 'Waspada / Tipis', color: 'amber', code: 'warning', textColor: 'text-amber-500', badgeColor: 'bg-amber-50 text-amber-700 border-amber-200' };
  }
  return { label: 'Bahaya', color: 'rose', code: 'danger', textColor: 'text-rose-600', badgeColor: 'bg-rose-50 text-rose-700 border-rose-200' };
}

// Distribusi penyesuaian harga nego ke multi-item secara proporsional
export function distributeNegotiatedTotal(items: MultiItemLine[], targetTotal: number): MultiItemLine[] {
  const currentTotal = items.reduce((sum, it) => sum + it.sellingPrice, 0);
  if (currentTotal <= 0 || items.length === 0) return items;

  const ratio = targetTotal / currentTotal;
  let distributedSum = 0;

  return items.map((item, idx) => {
    if (idx === items.length - 1) {
      // Item terakhir menampung selisih pembulatan agar grand total tepat 100%
      const remainingPrice = targetTotal - distributedSum;
      const unitPrice = Math.max(1000, Math.round(remainingPrice / item.quantity));
      return {
        ...item,
        unitPrice,
        sellingPrice: remainingPrice,
      };
    }

    const rawNewItemTotal = item.sellingPrice * ratio;
    const roundedTotal = Math.round(rawNewItemTotal / 5000) * 5000;
    distributedSum += roundedTotal;
    const unitPrice = Math.max(1000, Math.round(roundedTotal / item.quantity));

    return {
      ...item,
      unitPrice,
      sellingPrice: roundedTotal,
    };
  });
}

// =========================================================================
// 8. HIGH-CONVERTING WHATSAPP QUOTE GENERATOR (CONCISE & DYNAMIC BRANCH)
// =========================================================================

export function generateWhatsAppQuoteText({
  clientName,
  projectName,
  items,
  grandTotal,
  branchId,
}: {
  clientName: string;
  projectName?: string;
  items: MultiItemLine[];
  grandTotal: number;
  branchId: string;
}) {
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const branch = getBranchConfig(branchId);

  // Buat rincian item ringkas
  const itemLines = items.map((it, idx) => {
    const qtyStr = it.quantity > 1 ? ` (${it.quantity}x)` : '';
    const dimStr = it.dimensions ? ` - ${it.dimensions}` : '';
    return `${idx + 1}. *${it.description}*${dimStr}${qtyStr} = ${formatRupiah(it.sellingPrice)}`;
  }).join('\n');

  // Format pesan ringkas (5-7 baris, ramah, tidak agresif minta DP)
  const message =
`Halo Kak *${clientName || 'Bapak/Ibu'}*, salam dari *Salsabilla Advertising* 👋

Berikut estimasi penawaran harga untuk pesanan *${projectName || 'Signage'}*:

📋 *Rincian Pekerjaan:*
${itemLines}

💰 *Total Penawaran:* *${formatRupiah(grandTotal)}*
*(Sudah termasuk perakitan, uji kelistrikan & garansi resmi 1 tahun)*

📍 *Workshop:* ${branch.address}

Kira-kira ukurannya sudah pas Kak? Kalau butuh survey lokasi gratis atau konsultasi desain, tim kami siap bantu ya! 😊`;

  return message;
}

// =========================================================================
// 9. CLEAN INDONESIAN MATERIAL LABELS (NO RAW SLUGS)
// =========================================================================

export function getMaterialDisplayLabel(slugOrName?: string | null): string {
  if (!slugOrName) return 'Standar Bengkel Reklame';
  const map: Record<string, string> = {
    // Huruf Timbul
    stainless_biasa_led: 'Huruf Timbul Stainless Steel + LED Backlight',
    stainless_gold_led: 'Huruf Timbul Stainless Steel Gold Titanium + LED',
    stainless_off: 'Huruf Timbul Stainless Steel 201/304 (Non-Lampu)',
    galvanis_duco_off: 'Huruf Timbul Plat Galvanis Cat Duco (Non-Lampu)',
    akrilik_off: 'Huruf Timbul Akrilik Solid Marga Cipta (Non-Lampu)',
    akrilik_dual_glow: 'Huruf Timbul Akrilik Dual Glow (Frontlit + Backlight)',
    // Neon Box & Billboard
    neon_box_1sisi: 'Neon Box Akrilik 1 Sisi + Lampu TL/LED',
    neon_box_2sisi: 'Neon Box Akrilik 2 Sisi Bolak-Balik + Lampu TL/LED',
    reklame_flexi_korea: 'Papan Reklame Hollow 3x3 + Galvalum + Flexi Korea',
    billboard_heavy_duty: 'Rangka Billboard Siku Heavy Duty',
    // Logo 3D
    akrilik_led: 'Logo Akrilik Laser Cut 3D + Visual Oracal + LED Frontlit',
    stainless_backlight: 'Logo Stainless Steel 3D + Backlight LED Modul',
    non_lampu: 'Logo Akrilik Solid Marga Cipta 3mm (Tanpa Lampu)',
    // Background Fasad
    acp_seven: 'Background Fasad ACP Seven 3mm PVDF + Rangka Hollow',
    plat_galvanil: 'Background Fasad Plat Galvanil Duco Oven + Rangka Hollow',
    kisi_hollow: 'Background Fasad Kisi-kisi Hollow Galvanis 2x4',
    multiplek: 'Background Fasad Multiplek 12mm Finishing HPL/Melamin',
    // Tiang & Rangka
    tiang_pipa_2: 'Tiang Pipa Besi 2 Inch',
    tiang_pipa_3: 'Tiang Pipa Besi 3 Inch',
    tiang_pipa_4: 'Tiang Pipa Besi 4 Inch',
    tiang_pipa_6: 'Tiang Pipa Besi 6 Inch Schedule',
    pipa_2: 'Tiang Pipa Besi 2 Inch',
    pipa_3: 'Tiang Pipa Besi 3 Inch',
    pipa_4: 'Tiang Pipa Besi 4 Inch',
    pipa_6: 'Tiang Pipa Besi 6 Inch Schedule',
    rangka_hollow: 'Rangka Besi Hollow & Siku',
    // Operasional
    scaffolding: 'Sewa Scaffolding / Steger Lapangan',
    bongkar: 'Jasa Bongkar Reklame Lama & Pembersihan',
    kabel: 'Jasa Tarik Kabel Listrik Tambahan',
  };
  return map[slugOrName] || slugOrName;
}

// =========================================================================
// 10. REALISTIC LED MODULE ESTIMATOR
// =========================================================================

export function calculateLedModules(spec: {
  category?: string;
  subCategory?: string;
  heightCm?: number;
  charCount?: number;
  lightingType?: string;
  material?: string;
}): { ledCount: number; trafoWatt: number; isIlluminated: boolean } {
  const textToCheck = `${spec.subCategory || ''} ${spec.material || ''} ${spec.lightingType || ''}`.toLowerCase();
  const isIlluminated =
    textToCheck.includes('led') ||
    textToCheck.includes('glow') ||
    textToCheck.includes('neon') ||
    textToCheck.includes('frontlit') ||
    textToCheck.includes('backlight') ||
    (spec.lightingType && spec.lightingType !== 'none');

  if (!isIlluminated) {
    return { ledCount: 0, trafoWatt: 0, isIlluminated: false };
  }

  const height = spec.heightCm || 20;
  const count = spec.charCount || 1;
  const ledCount = Math.max(12, Math.ceil(height * count * 1.5));
  const estimatedWatt = ledCount * 1.5 * 1.3;
  let trafoWatt = 100;
  if (estimatedWatt > 300) trafoWatt = 400;
  else if (estimatedWatt > 150) trafoWatt = 300;
  else if (estimatedWatt > 80) trafoWatt = 200;
  else trafoWatt = 100;

  return { ledCount, trafoWatt, isIlluminated: true };
}

// =========================================================================
// 11. SIZE FORMATTERS (HURUF TIMBUL VS NEON BOX / BILLBOARD)
// =========================================================================

export function formatItemSizeClean(item: {
  itemType?: string | null;
  heightCm?: number | null;
  widthCm?: number | null;
  charCount?: number | null;
  textOrLabel?: string | null;
}): string {
  if (item.itemType === 'huruf_timbul') {
    const chars = item.charCount || item.textOrLabel?.replace(/\s+/g, '').length || '';
    const charPart = chars ? ` (${chars} Huruf)` : '';
    return `Tinggi ${item.heightCm || 0} cm${charPart}`;
  }
  if (item.heightCm && item.widthCm) {
    return `${item.heightCm} x ${item.widthCm} cm`;
  }
  return item.heightCm ? `Tinggi ${item.heightCm} cm` : '-';
}

export function formatItemDimensions(item: {
  itemType?: string | null;
  heightCm?: number | null;
  widthCm?: number | null;
  charCount?: number | null;
  textOrLabel?: string | null;
}): string {
  if (item.itemType === 'huruf_timbul') {
    const chars = item.charCount || item.textOrLabel?.replace(/\s+/g, '').length || '';
    const charPart = chars ? ` (${chars} Huruf)` : '';
    return `Tinggi ${item.heightCm || 0} cm${charPart}`;
  }
  if (item.heightCm && item.widthCm) {
    return `${item.heightCm} x ${item.widthCm} cm`;
  }
  return item.heightCm ? `Tinggi ${item.heightCm} cm` : '-';
}

