export interface ModularProductSpec {
  category: 'huruf_timbul' | 'neon_box' | 'papan_reklame';
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
  poleType?: 'pipa_2' | 'pipa_3' | 'pipa_4' | 'pipa_6';
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
  useCrane?: boolean;
  distanceKm?: number;
  // Margin
  targetMarginPercent: number;
}

// 1. Material & Basic Unit Calculator (Official Salsabilla Rates)
export function calculateMaterial(spec: ModularProductSpec) {
  let materialHpp = 0;
  let materialSell = 0;
  let materialDescription = '';
  let areaM2 = 0;

  if (spec.category === 'huruf_timbul') {
    const cleanText = (spec.text || '').trim();
    const charCount = spec.charCount || cleanText.replace(/\s+/g, '').length || 1;
    const height = Math.max(10, spec.heightCm); // min 10cm
    const depth = spec.depthCm || 4;
    const depthFactor = depth > 5 ? 1 + ((depth - 5) / 10) * 0.15 : 1.0;

    let sellRatePerCm = 10000;
    let costRatePerCm = 5000;

    switch (spec.subCategory) {
      case 'galvanis_duco_off':
        sellRatePerCm = 10000;
        costRatePerCm = 5000;
        materialDescription = 'Plat Galvanis Bending Las Finishing Cat Duco (Non-Lampu)';
        break;
      case 'akrilik_off':
        sellRatePerCm = 10000;
        costRatePerCm = 5000;
        materialDescription = 'Akrilik Solid Marga Cipta 3mm (Non-Lampu)';
        break;
      case 'stainless_off':
        sellRatePerCm = 12000;
        costRatePerCm = 6500;
        materialDescription = 'Stainless Steel 201/304 Mirror/Hairline (Non-Lampu)';
        break;
      case 'akrilik_dual_glow':
        sellRatePerCm = 18000;
        costRatePerCm = 9500;
        materialDescription = 'Akrilik Dual Glow (Cahaya Depan & Siluet Belakang LED)';
        break;
      case 'stainless_biasa_led':
        sellRatePerCm = 20000;
        costRatePerCm = 10500;
        materialDescription = 'Stainless Steel Biasa + Backlight Lampu LED';
        break;
      case 'stainless_gold_led':
      default:
        sellRatePerCm = 25000;
        costRatePerCm = 13500;
        materialDescription = 'Stainless Steel Gold Titanium Mirror + Lampu LED';
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
    };
  } else if (spec.category === 'neon_box') {
    const rawArea = (spec.lengthCm * spec.heightCm) / 10000;
    areaM2 = Math.max(1.0, rawArea); // min order 1 m2

    let sellRatePerM2 = 1900000;
    let costRatePerM2 = 1050000;

    switch (spec.subCategory) {
      case 'neon_box_1sisi':
        sellRatePerM2 = 1900000;
        costRatePerM2 = 1050000;
        materialDescription = 'Neon Box 1 Sisi Hollow 2x2, Akrilik, Lampu TL/LED Tube (Tanpa Tiang)';
        break;
      case 'neon_box_2sisi':
      default:
        sellRatePerM2 = 2850000;
        costRatePerM2 = 1550000;
        materialDescription = 'Neon Box 2 Sisi Hollow 2x2, Akrilik Bolak-Balik, Lampu TL (Tanpa Tiang)';
        break;
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
  } else {
    // Papan Reklame / Billboard
    const rawArea = (spec.lengthCm * spec.heightCm) / 10000;
    areaM2 = Math.max(1.0, rawArea);

    let sellRatePerM2 = 950000;
    let costRatePerM2 = 520000;

    if (spec.subCategory === 'billboard_heavy_duty') {
      sellRatePerM2 = 1350000;
      costRatePerM2 = 750000;
      materialDescription = 'Rangka Billboard Siku Heavy Duty + Pengaku Angin (Tanpa Tiang)';
    } else {
      sellRatePerM2 = 950000;
      costRatePerM2 = 520000;
      materialDescription = 'Papan Reklame Rangka Hollow 3x3, Plat Galvalum, Flexi Korea Hi-Res (Tanpa Tiang)';
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

  if (spec.needPoleConstruction) {
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
    }

    poleHpp = Math.round(height * rateCostPerM);
    poleSell = Math.round(height * rateSellPerM);
    poleDesc = `Tiang Pipa Besi ${sizeLabel} (${height} Meter)`;
  }

  let pondasiHpp = 0;
  let pondasiSell = 0;
  let pondasiDesc = '';
  if (spec.needPondasiCakarAyam) {
    const points = spec.pondasiPoints || 1;
    pondasiHpp = points * 500000;
    pondasiSell = points * 850000;
    pondasiDesc = `Pondasi Cor Cakar Ayam + Baseplate (${points} Titik)`;
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

  // Cutting Sticker
  if (spec.stickerType && spec.stickerType !== 'none') {
    const area = spec.stickerAreaM2 || 1.0;
    const rateSell = spec.stickerType === 'oracal_8500' ? 350000 : 250000;
    const rateCost = spec.stickerType === 'oracal_8500' ? 195000 : 135000;
    addonHpp += Math.round(area * rateCost);
    addonSell += Math.round(area * rateSell);
    addonDesc += `Cutting Sticker ${spec.stickerType === 'oracal_8500' ? 'Oracal 8500 Translucent' : 'Oracal 651'} (${area}m2); `;
  }

  // Spotlight
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
    addonDesc: addonDesc.trim() || 'Standar (Tanpa Add-on Khusus)',
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
  if (spec.useCrane) {
    toolsRentHpp += 2500000;
    toolsRentSell += 3500000;
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

// 6. Master Modular Pricing Integrator
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

  // Selling price based on official Salsabilla catalog rates
  const rawSellingPrice =
    material.materialSell +
    construction.constructionSell +
    addons.addonSell +
    installation.installationSell +
    transport.transportSell;

  // Round up to nearest 5.000
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

// 7. Instant WhatsApp Message Generator (100% Free via wa.me)
export function generateWhatsAppQuoteText({
  clientName,
  spec,
  pricing,
  branchCity,
}: {
  clientName: string;
  spec: ModularProductSpec;
  pricing: ReturnType<typeof calculatePricing>;
  branchCity: string;
}) {
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  let specDetails = '';
  if (spec.category === 'huruf_timbul') {
    const textLabel = spec.text ? `"${spec.text}"` : `${pricing.material.charCount} Karakter`;
    specDetails = `• Produk: Huruf Timbul (${pricing.material.materialDescription})\n• Teks/Brand: ${textLabel}\n• Tinggi: ${spec.heightCm} cm (${pricing.material.charCount} Huruf)`;
  } else if (spec.category === 'neon_box') {
    specDetails = `• Produk: ${pricing.material.materialDescription}\n• Dimensi: ${spec.lengthCm} x ${spec.heightCm} cm (Luas ${pricing.material.areaM2} m²)`;
  } else {
    specDetails = `• Produk: ${pricing.material.materialDescription}\n• Dimensi: ${spec.lengthCm} x ${spec.heightCm} cm (Luas ${pricing.material.areaM2} m²)`;
  }

  if (spec.needPoleConstruction) {
    specDetails += `\n• Konstruksi: ${pricing.construction.poleDesc}`;
  }
  if (spec.needPondasiCakarAyam) {
    specDetails += `\n• Pondasi: ${pricing.construction.pondasiDesc}`;
  }

  const message = 
`Halo Kak ${clientName || 'Bapak/Ibu'}, salam hangat dari *Salsabilla Advertising* cabang ${branchCity} 🙏

Terima kasih telah menghubungi kami. Berikut rincian estimasi penawaran harga untuk pesanan signage Anda:

📋 *Spesifikasi Pekerjaan:*
${specDetails}
• Pemasangan: Area ${branchCity} (Lantai ${spec.floorLevel})
• Garansi Resmi: 1 Tahun (Lampu LED & Trafo)

💰 *Total Estimasi Penawaran:*
*${formatRupiah(pricing.finalSellingPrice)}*

🏦 *Rekening Resmi Pembayaran DP:*
BCA: *0860533036*
A.n: *JUJU ABDUL ROHIM*

📍 *Workshop Resmi Kami:*
• Jakarta: Jl. Hayam Wuruk No. 127
• Bandung/Cimahi: Jl. Melong Raya No. 138
• Tangerang: Jl. Raya Serpong KM 7

Apakah ukuran dan spesifikasinya sudah sesuai kebutuhan, Kak? Jika ada yang ingin disesuaikan atau ingin jadwal survey lokasi, kami siap membantu! 😊`;

  return message;
}
