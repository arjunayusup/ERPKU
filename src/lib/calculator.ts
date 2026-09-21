import { HurufTimbulInput, NeonBoxInput } from "@/types";

export function calculateHurufTimbul(input: HurufTimbulInput) {
  const cleanText = input.text.trim();
  const charCount = cleanText.replace(/\s+/g, '').length || 1;
  
  // 1. Aturan Huruf Gepeng vs Tinggi (Width Rule)
  // Jika lebar total dibagi jumlah huruf lebih besar dari tinggi, pakai acuan lebar
  const estimatedCharWidth = input.widthCm ? input.widthCm / charCount : input.heightCm * 0.8;
  const effectiveDim = Math.max(input.heightCm, estimatedCharWidth);
  
  // 2. Aturan Huruf Minimum (Min 10 cm)
  const calcDim = Math.max(10, effectiveDim);

  // 3. Faktor Tebal Spon / Kaki (Depth Factor)
  let depthFactor = 1.0;
  if (input.depthCm > 5) {
    depthFactor = 1.0 + ((input.depthCm - 5) / 10) * 0.15;
  }

  // 4. Rate Dasar Bahan HPP & Jual per cm
  let costPerCm = 5000;
  let sellPerCm = 9000;
  let materialLabel = 'Galvanis Cat Duco';

  switch (input.material) {
    case 'stainless_304':
      costPerCm = 7500;
      sellPerCm = 13500;
      materialLabel = 'Stainless Steel 304 (Anti Karat)';
      break;
    case 'stainless_201':
      costPerCm = 6000;
      sellPerCm = 11000;
      materialLabel = 'Stainless Steel 201 Hairline';
      break;
    case 'akrilik':
      costPerCm = 6500;
      sellPerCm = 12000;
      materialLabel = 'Akrilik Solid Marga Cipta';
      break;
    case 'galvanis':
    default:
      costPerCm = 4500;
      sellPerCm = 8500;
      materialLabel = 'Plat Galvanis Cat Duco Oven';
      break;
  }

  // 5. Pencahayaan & Estimasi Modul LED & Trafo
  let lightingCostPerCm = 0;
  let lightingSellPerCm = 0;
  let ledCountPerChar = 0;

  if (input.lighting === 'backlight') {
    lightingCostPerCm = 2000;
    lightingSellPerCm = 3500;
    ledCountPerChar = Math.round(calcDim * 2.2); // Rata-rata 2.2 modul per cm tinggi
  } else if (input.lighting === 'frontlit') {
    lightingCostPerCm = 3500;
    lightingSellPerCm = 6000;
    ledCountPerChar = Math.round(calcDim * 3.0);
  }

  const totalLeds = input.lighting !== 'none' ? ledCountPerChar * charCount : 0;
  const totalLedWatts = totalLeds * 1.2; // 1.2W per modul
  // Safety factor trafo: Kapasitas Trafo >= Total Watt / 0.80 (25% safety margin)
  const requiredTrafoWatts = input.lighting !== 'none' ? Math.ceil(totalLedWatts / 0.80) : 0;
  
  // Tentukan rekomendasi trafo standar pasaran (100W, 150W, 200W, 300W, 400W)
  let recommendedTrafo = 'Tanpa Trafo';
  if (requiredTrafoWatts > 0) {
    if (requiredTrafoWatts <= 100) recommendedTrafo = '1x Trafo 100W Rainproof';
    else if (requiredTrafoWatts <= 150) recommendedTrafo = '1x Trafo 150W Rainproof';
    else if (requiredTrafoWatts <= 200) recommendedTrafo = '1x Trafo 200W Rainproof';
    else if (requiredTrafoWatts <= 300) recommendedTrafo = '1x Trafo 300W Rainproof';
    else if (requiredTrafoWatts <= 400) recommendedTrafo = '1x Trafo 400W Rainproof';
    else {
      const units = Math.ceil(requiredTrafoWatts / 400);
      recommendedTrafo = `${units}x Trafo 400W Rainproof`;
    }
  }

  // 6. Faktor Ketinggian Pemasangan
  let heightCoefficient = 1.0;
  if (input.floorLevel === 2) heightCoefficient = 1.15;
  else if (input.floorLevel === 3) heightCoefficient = 1.30;
  else if (input.floorLevel >= 4) heightCoefficient = 1.50;

  // 7. Kalkulasi Total HPP & Harga Jual
  const baseHppPerChar = (calcDim * (costPerCm + lightingCostPerCm)) * depthFactor;
  const totalHpp = Math.round(baseHppPerChar * charCount * heightCoefficient);

  // Estimasi Harga Jual berdasarkan margin kustom atau rate sell
  const baseSellPerChar = (calcDim * (sellPerCm + lightingSellPerCm)) * depthFactor;
  const standardSell = Math.round(baseSellPerChar * charCount * heightCoefficient);

  // Kalkulasi harga jual dengan margin custom
  const marginMultiplier = 1 + (input.marginPercent / 100);
  const customMarginSell = Math.round(totalHpp * marginMultiplier);

  // Pakai yang paling kompetitif tapi aman
  const finalSellingPrice = Math.max(standardSell, customMarginSell);
  const finalProfit = finalSellingPrice - totalHpp;

  return {
    charCount,
    calcDim,
    materialLabel,
    totalLeds,
    totalLedWatts,
    requiredTrafoWatts,
    recommendedTrafo,
    heightCoefficient,
    // Finansial
    totalHpp,
    finalSellingPrice,
    finalProfit,
    marginActualPercent: Math.round((finalProfit / finalSellingPrice) * 100),
  };
}

export function calculateNeonBox(input: NeonBoxInput) {
  const rawAreaM2 = (input.lengthCm * input.heightCm) / 10000;
  // Minimum charge 1 m2
  const areaM2 = Math.max(1.0, rawAreaM2);
  
  // Efisiensi rangka 2 muka
  const effectiveAreaM2 = input.faces === 2 ? areaM2 * 1.85 : areaM2;

  let costPerM2 = 850000;
  let sellPerM2 = 1600000;
  let materialLabel = 'Akrilik + Stiker Cutting Oracal';

  switch (input.visualMaterial) {
    case 'akrilik_uv':
      costPerM2 = 1100000;
      sellPerM2 = 2000000;
      materialLabel = 'Akrilik Marga Cipta + Print UV Flatbed';
      break;
    case 'flexy_backlite':
      costPerM2 = 600000;
      sellPerM2 = 1200000;
      materialLabel = 'Visual Flexy Backlite Jerman';
      break;
    case 'akrilik_cutting':
    default:
      costPerM2 = 850000;
      sellPerM2 = 1600000;
      materialLabel = 'Akrilik + Stiker Cutting Oracal';
      break;
  }

  // Tambahan jika custom shape (bulat / logo meliuk)
  let shapeFactor = 1.0;
  if (input.shape === 'round') shapeFactor = 1.20;
  else if (input.shape === 'custom') shapeFactor = 1.30;

  // Modul LED Neon Box (standar 45 modul/m2 per muka)
  const totalLeds = Math.ceil(areaM2 * input.faces * 45);
  const totalLedWatts = totalLeds * 1.5; // 1.5W modul neon box
  const requiredTrafoWatts = Math.ceil(totalLedWatts / 0.80); // 25% safety factor

  let recommendedTrafo = '1x Trafo 100W Rainproof';
  if (requiredTrafoWatts <= 100) recommendedTrafo = '1x Trafo 100W Rainproof';
  else if (requiredTrafoWatts <= 200) recommendedTrafo = '1x Trafo 200W Rainproof';
  else if (requiredTrafoWatts <= 300) recommendedTrafo = '1x Trafo 300W Rainproof';
  else if (requiredTrafoWatts <= 400) recommendedTrafo = '1x Trafo 400W Rainproof';
  else {
    const units = Math.ceil(requiredTrafoWatts / 400);
    recommendedTrafo = `${units}x Trafo 400W Rainproof`;
  }

  // Faktor ketinggian
  let heightCoefficient = 1.0;
  if (input.floorLevel === 2) heightCoefficient = 1.15;
  else if (input.floorLevel >= 3) heightCoefficient = 1.35;

  const totalHpp = Math.round(effectiveAreaM2 * costPerM2 * shapeFactor * heightCoefficient);
  const standardSell = Math.round(effectiveAreaM2 * sellPerM2 * shapeFactor * heightCoefficient);

  const marginMultiplier = 1 + (input.marginPercent / 100);
  const customMarginSell = Math.round(totalHpp * marginMultiplier);
  const finalSellingPrice = Math.max(standardSell, customMarginSell);
  const finalProfit = finalSellingPrice - totalHpp;

  return {
    rawAreaM2: Number(rawAreaM2.toFixed(2)),
    areaM2: Number(areaM2.toFixed(2)),
    effectiveAreaM2: Number(effectiveAreaM2.toFixed(2)),
    materialLabel,
    totalLeds,
    totalLedWatts,
    requiredTrafoWatts,
    recommendedTrafo,
    totalHpp,
    finalSellingPrice,
    finalProfit,
    marginActualPercent: Math.round((finalProfit / finalSellingPrice) * 100),
  };
}
