export interface ModularProductSpec {
  category: 'neon_box' | 'huruf_timbul';
  subCategory: string;
  // Dimensi
  lengthCm: number;
  heightCm: number;
  depthCm?: number;
  charCount?: number;
  text?: string;
  faces?: 1 | 2;
  shape?: 'box' | 'round' | 'custom' | 'slim_lightbox' | 'fabric';
  // Material & Spek
  materialGrade: string; // e.g. stainless_304, stainless_201, akrilik_mc, flexy_korea, flexy_jerman, kuningan, galvanis_duco
  frameHollowType?: string; // 'hollow_4x4', 'hollow_3x3', 'hollow_2x2', 'siku_3x3', 'profil_aluminium'
  // Kelistrikan
  lightingType: 'none' | 'led_standard' | 'led_ip68_waterproof' | 'backlight_halolight' | 'frontlit_led';
  // Variabel Lapangan
  floorLevel: number; // 1, 2, 3, 4+
  useScaffolding?: boolean;
  useCrane?: boolean;
  needPoleConstruction?: boolean;
  poleHeightMeter?: number;
  distanceKm?: number;
  // Margin
  targetMarginPercent: number;
}

// 1. Material Calculator
export function calculateMaterial(spec: ModularProductSpec) {
  let materialHpp = 0;
  let materialDescription = '';
  let hollowHpp = 0;
  let hollowLengthMeter = 0;

  if (spec.category === 'neon_box') {
    const rawAreaM2 = (spec.lengthCm * spec.heightCm) / 10000;
    const effectiveAreaM2 = Math.max(1.0, rawAreaM2); // minimum charge 1 m2
    const faces = spec.faces || 1;
    const perimeterMeter = (2 * (spec.lengthCm + spec.heightCm)) / 100;

    // Rangka hollow keliling & bracing
    hollowLengthMeter = perimeterMeter * 1.5;
    const hollowCostPerMeter = spec.frameHollowType === 'hollow_4x4' ? 45000 : 35000;
    hollowHpp = Math.round(hollowLengthMeter * hollowCostPerMeter);

    switch (spec.subCategory) {
      case 'neon_box_akrilik_2muka_cutting':
        materialHpp = Math.round(effectiveAreaM2 * 2 * 450000) + hollowHpp;
        materialDescription = 'Akrilik Marga Cipta 3mm + Cutting Stiker Oracal 8500 (2 Muka)';
        break;
      case 'neon_box_akrilik_2muka_uv':
        materialHpp = Math.round(effectiveAreaM2 * 2 * 550000) + hollowHpp;
        materialDescription = 'Akrilik MC 3mm + Flatbed UV Print Resolusi Tinggi (2 Muka)';
        break;
      case 'neon_box_akrilik_1muka_fasad':
        materialHpp = Math.round(effectiveAreaM2 * 450000) + hollowHpp;
        materialDescription = 'Akrilik MC 3mm Tempel Dinding/Fasad + Lis Profil Aluminium';
        break;
      case 'neon_box_flexy_jerman':
        materialHpp = Math.round(effectiveAreaM2 * 320000) + hollowHpp;
        materialDescription = 'Visual Backlite Flexy Jerman Hi-Res + Rangka Pengencang';
        break;
      case 'neon_box_flexy_korea':
        materialHpp = Math.round(effectiveAreaM2 * 220000) + hollowHpp;
        materialDescription = 'Visual Backlite Flexy Korea + Rangka Hollow Siku';
        break;
      case 'slim_lightbox_mall':
        materialHpp = Math.round(effectiveAreaM2 * 650000) + hollowHpp;
        materialDescription = 'Slim Lightbox Aluminium Snap Frame / Fabric Display';
        break;
      case 'neon_box_custom_bulat':
      default:
        materialHpp = Math.round(effectiveAreaM2 * (faces === 2 ? 1.8 : 1.0) * 480000 * 1.2) + hollowHpp;
        materialDescription = 'Neon Box Pola Kustom / Bulat Tekuk Laser';
        break;
    }

    return {
      materialHpp,
      hollowHpp,
      hollowLengthMeter: Number(hollowLengthMeter.toFixed(1)),
      areaM2: Number(effectiveAreaM2.toFixed(2)),
      materialDescription,
    };
  } else {
    // Huruf Timbul
    const cleanText = (spec.text || '').trim();
    const charCount = spec.charCount || cleanText.replace(/\s+/g, '').length || 1;
    const height = Math.max(10, spec.heightCm); // aturan min 10cm
    const depth = spec.depthCm || 4;
    const depthFactor = depth > 5 ? 1 + ((depth - 5) / 10) * 0.15 : 1.0;

    let rateCostPerCm = 4500;
    switch (spec.subCategory) {
      case 'stainless_mirror_304':
        rateCostPerCm = 7500;
        materialDescription = 'Stainless Steel 304 Mirror Kilap (Outdoor Anti Karat)';
        break;
      case 'stainless_hairline_201':
        rateCostPerCm = 5500;
        materialDescription = 'Stainless Steel 201 Hairline Doff Serat Garis';
        break;
      case 'akrilik_solid_spon':
        rateCostPerCm = 6000;
        materialDescription = 'Akrilik Solid Marga Cipta + Dudukan Spon EVA';
        break;
      case 'galvanis_duco':
        rateCostPerCm = 4200;
        materialDescription = 'Plat Galvanis Bending Las + Finishing Cat Duco Oven';
        break;
      case 'kuningan_tembaga':
        rateCostPerCm = 11000;
        materialDescription = 'Plat Kuningan / Tembaga Polished Finishing Clear';
        break;
      default:
        rateCostPerCm = 5000;
        materialDescription = 'Stainless Steel 201 Standar';
        break;
    }

    materialHpp = Math.round(height * rateCostPerCm * charCount * depthFactor);

    return {
      materialHpp,
      hollowHpp: 0,
      hollowLengthMeter: 0,
      charCount,
      heightCm: height,
      depthFactor,
      materialDescription,
    };
  }
}

// 2. Lighting Calculator
export function calculateLighting(spec: ModularProductSpec, areaOrCharCount: number) {
  if (spec.lightingType === 'none') {
    return {
      lightingHpp: 0,
      ledCount: 0,
      ledWatts: 0,
      trafoWatt: 0,
      trafoUnitCount: 0,
      trafoDescription: 'Tanpa Lampu (Non-Illuminated)',
    };
  }

  const isNeon = spec.category === 'neon_box';
  const isWaterproofIP68 = spec.lightingType === 'led_ip68_waterproof' || spec.lightingType === 'backlight_halolight';

  let ledCostPerUnit = isWaterproofIP68 ? 4000 : 2500;
  let ledWattPerUnit = isNeon ? 1.5 : 1.2;
  let ledCount = 0;

  if (isNeon) {
    const areaM2 = Math.max(1.0, areaOrCharCount);
    const faces = spec.faces || 1;
    ledCount = Math.ceil(areaM2 * faces * 45); // 45 modul/m2 per muka
  } else {
    // Huruf Timbul
    const charCount = areaOrCharCount || 1;
    const height = Math.max(10, spec.heightCm);
    const multiplier = spec.lightingType === 'frontlit_led' ? 3.0 : 2.2;
    ledCount = Math.round(height * multiplier * charCount);
  }

  const ledWatts = Number((ledCount * ledWattPerUnit).toFixed(1));
  // 25% Safety Factor untuk trafo (Trafo >= total watt / 0.80)
  const safeTrafoWatt = Math.ceil(ledWatts / 0.80);

  let trafoWatt = 100;
  let trafoCost = 110000;
  let trafoDescription = '1x Trafo 100W Outdoor Rainproof';
  let trafoUnitCount = 1;

  if (safeTrafoWatt <= 100) {
    trafoWatt = 100;
    trafoCost = 110000;
    trafoDescription = '1x Trafo 100W Rainproof 12V';
  } else if (safeTrafoWatt <= 150) {
    trafoWatt = 150;
    trafoCost = 140000;
    trafoDescription = '1x Trafo 150W Rainproof 12V';
  } else if (safeTrafoWatt <= 200) {
    trafoWatt = 200;
    trafoCost = 165000;
    trafoDescription = '1x Trafo 200W Rainproof 12V';
  } else if (safeTrafoWatt <= 300) {
    trafoWatt = 300;
    trafoCost = 210000;
    trafoDescription = '1x Trafo 300W Heavy Duty Rainproof 12V';
  } else if (safeTrafoWatt <= 400) {
    trafoWatt = 400;
    trafoCost = 250000;
    trafoDescription = '1x Trafo 400W Heavy Duty Rainproof 12V';
  } else {
    trafoUnitCount = Math.ceil(safeTrafoWatt / 400);
    trafoWatt = trafoUnitCount * 400;
    trafoCost = trafoUnitCount * 250000;
    trafoDescription = `${trafoUnitCount}x Trafo 400W Rainproof 12V (Multi-Line)`;
  }

  const ledHpp = ledCount * ledCostPerUnit;
  const cableHpp = 45000; // kabel NYM & terminal Wago cadangan
  const lightingHpp = ledHpp + trafoCost + cableHpp;

  return {
    lightingHpp,
    ledCount,
    ledWatts,
    trafoWatt,
    trafoUnitCount,
    trafoDescription,
  };
}

// 3. Construction Calculator
export function calculateConstruction(spec: ModularProductSpec) {
  let constructionHpp = 0;
  let description = 'Rangka Standar';

  if (spec.needPoleConstruction) {
    const poleHeight = spec.poleHeightMeter || 3;
    constructionHpp += poleHeight * 220000; // Tiang pipa besi medium + angkur baseplate
    description = `Tiang Pipa Besi ${poleHeight}m + Baseplate Angkur`;
  }

  if (spec.frameHollowType === 'siku_3x3') {
    constructionHpp += 75000;
    description += ' + Breket Besi Siku 3x3';
  }

  return {
    constructionHpp,
    description,
  };
}

// 4. Installation Calculator
export function calculateInstallation(spec: ModularProductSpec) {
  let installationBaseHpp = 250000; // Base rate teknisi lapangan

  // Ketinggian lantai
  let heightMultiplier = 1.0;
  if (spec.floorLevel === 2) heightMultiplier = 1.25;
  else if (spec.floorLevel === 3) heightMultiplier = 1.50;
  else if (spec.floorLevel >= 4) heightMultiplier = 1.90;

  let toolsRentHpp = 0;
  if (spec.useScaffolding) {
    toolsRentHpp += 150000; // Sewa scaffolding 2-3 set + mobilisasi
  }
  if (spec.useCrane) {
    toolsRentHpp += 2500000; // Sewa skylift / crane mini 1 shift
  }

  const installationHpp = Math.round(installationBaseHpp * heightMultiplier) + toolsRentHpp;

  return {
    installationHpp,
    heightMultiplier,
    toolsRentHpp,
  };
}

// 5. Transportation Calculator
export function calculateTransportation(spec: ModularProductSpec) {
  const distance = spec.distanceKm || 15; // default 15 km dalam kota
  const baseTransport = 100000; // Bensin armada pikap PP
  const extraPerKm = distance > 25 ? (distance - 25) * 5000 : 0;
  const transportHpp = baseTransport + extraPerKm;

  return {
    transportHpp,
    distanceKm: distance,
  };
}

// 6. Pricing Calculator (Master Modular Integrator)
export function calculatePricing(spec: ModularProductSpec) {
  const material = calculateMaterial(spec);
  const areaOrChar = spec.category === 'neon_box' ? (material as any).areaM2 : (material as any).charCount;
  const lighting = calculateLighting(spec, areaOrChar);
  const construction = calculateConstruction(spec);
  const installation = calculateInstallation(spec);
  const transport = calculateTransportation(spec);

  // Subtotal HPP Komponen
  const subtotalHpp = 
    material.materialHpp +
    lighting.lightingHpp +
    construction.constructionHpp +
    installation.installationHpp +
    transport.transportHpp;

  // Pricing dengan target margin (default 35%)
  const marginPercent = Math.max(15, spec.targetMarginPercent || 35);
  const targetMultiplier = 1 + (marginPercent / 100);
  const rawSellingPrice = subtotalHpp * targetMultiplier;

  // Pembulatan harga ke ribuan terdekat
  const finalSellingPrice = Math.ceil(rawSellingPrice / 5000) * 5000;
  const grossProfit = finalSellingPrice - subtotalHpp;
  const actualMarginPercent = Math.round((grossProfit / finalSellingPrice) * 100);

  return {
    material,
    lighting,
    construction,
    installation,
    transport,
    // Finansial
    subtotalHpp,
    finalSellingPrice,
    grossProfit,
    actualMarginPercent,
  };
}
