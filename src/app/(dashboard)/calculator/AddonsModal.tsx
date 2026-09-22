'use client';

import { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Construction, 
  Compass, 
  Wrench, 
  CheckSquare, 
  ShieldCheck, 
  Layers, 
  ArrowRight,
  Plus
} from 'lucide-react';
import { MultiItemLine } from '@/lib/calculator-modular';

interface AddonsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyAddons: (newItems: MultiItemLine[]) => void;
  materialRates?: any[];
}

export default function AddonsModal({
  isOpen,
  onClose,
  onApplyAddons,
  materialRates = [],
}: AddonsModalProps) {
  // 1. Logo State
  const [enableLogo, setEnableLogo] = useState(false);
  const [logoDesc, setLogoDesc] = useState('Logo / Emblem Timbul 3D');
  const [logoWidthCm, setLogoWidthCm] = useState(80);
  const [logoHeightCm, setLogoHeightCm] = useState(80);
  const [logoSpec, setLogoSpec] = useState<'akrilik_led' | 'stainless_backlight' | 'non_lampu'>('akrilik_led');
  const [logoQty, setLogoQty] = useState(1);

  // 2. Fasad State
  const [enableFasad, setEnableFasad] = useState(false);
  const [fasadLengthCm, setFasadLengthCm] = useState(400);
  const [fasadHeightCm, setFasadHeightCm] = useState(150);
  const [fasadMaterialKey, setFasadMaterialKey] = useState('acp_seven');
  const [includeHollow, setIncludeHollow] = useState(true);

  // 3. Tiang & Pondasi State
  const [enableTiang, setEnableTiang] = useState(false);
  const [tiangType, setTiangType] = useState<'pipa_3' | 'pipa_2' | 'pipa_4' | 'pipa_6'>('pipa_4');
  const [tiangHeightMeter, setTiangHeightMeter] = useState(4);
  const [enablePondasi, setEnablePondasi] = useState(true);
  const [pondasiPoints, setPondasiPoints] = useState(1);

  // 4. Operasional State
  const [enableScaffolding, setEnableScaffolding] = useState(false);
  const [scaffoldingSets, setScaffoldingSets] = useState(2);
  const [scaffoldingDays, setScaffoldingDays] = useState(3);

  const [enableBongkar, setEnableBongkar] = useState(false);
  const [enableTarikKabel, setEnableTarikKabel] = useState(false);
  const [kabelMeter, setKabelMeter] = useState(20);

  if (!isOpen) return null;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  // Dynamic Rate Resolver with Fallback
  const getRate = (category: string, keyword: string, fallbackSell: number, fallbackCost: number) => {
    const found = materialRates.find(
      (r) => r.category === category && r.name.toLowerCase().includes(keyword.toLowerCase())
    );
    if (found) {
      return { sell: found.sellPrice, cost: found.costPrice, name: found.name };
    }
    return { sell: fallbackSell, cost: fallbackCost, name: keyword };
  };

  // --- 1. CALCULATE LOGO ---
  const logoAreaCm2 = (Number(logoWidthCm) || 0) * (Number(logoHeightCm) || 0);
  let logoSellRate = 70;
  let logoCostRate = 35;
  let logoMaterialName = 'Akrilik Laser Cut + Visual Oracal + LED Frontlit IP68';
  let logoLighting = 'frontlit';

  if (logoSpec === 'stainless_backlight') {
    const r = getRate('logo', 'Stainless', 85, 45);
    logoSellRate = r.sell;
    logoCostRate = r.cost;
    logoMaterialName = 'Stainless Steel 201 Mirror 3D + Backlight LED Modul';
    logoLighting = 'backlight';
  } else if (logoSpec === 'non_lampu') {
    logoSellRate = 45;
    logoCostRate = 22;
    logoMaterialName = 'Akrilik Solid Marga Cipta 3mm (Tanpa Lampu)';
    logoLighting = 'none';
  } else {
    const r = getRate('logo', 'Akrilik', 70, 35);
    logoSellRate = r.sell;
    logoCostRate = r.cost;
  }

  const logoUnitSell = Math.max(350000, Math.round(logoAreaCm2 * logoSellRate));
  const logoUnitCost = Math.max(180000, Math.round(logoAreaCm2 * logoCostRate));
  const logoTotalSell = logoUnitSell * (Number(logoQty) || 1);

  // --- 2. CALCULATE FASAD ---
  const fasadAreaM2 = Math.max(0.5, ((Number(fasadLengthCm) || 0) * (Number(fasadHeightCm) || 0)) / 10000);
  let fasadSellPerM2 = 750000;
  let fasadCostPerM2 = 450000;
  let fasadMaterialTitle = 'ACP Seven 3mm PVDF + Rangka Hollow 4x4 Galvanis';

  if (fasadMaterialKey === 'plat_galvanil') {
    const r = getRate('fasad', 'Galvanil', 650000, 400000);
    fasadSellPerM2 = r.sell;
    fasadCostPerM2 = r.cost;
    fasadMaterialTitle = 'Plat Galvanil 0.8mm Cat Duco Oven + Rangka Hollow Galvanis';
  } else if (fasadMaterialKey === 'kisi_hollow') {
    const r = getRate('fasad', 'Kisi', 550000, 350000);
    fasadSellPerM2 = r.sell;
    fasadCostPerM2 = r.cost;
    fasadMaterialTitle = 'Kisi-kisi Bilah Hollow Galvanis 2x4 Anti Karat';
  } else if (fasadMaterialKey === 'multiplek') {
    const r = getRate('fasad', 'Multiplek', 450000, 250000);
    fasadSellPerM2 = r.sell;
    fasadCostPerM2 = r.cost;
    fasadMaterialTitle = 'Multiplek 12mm Finishing Melamin / HPL Indoor';
  } else {
    const r = getRate('fasad', 'ACP', 750000, 450000);
    fasadSellPerM2 = r.sell;
    fasadCostPerM2 = r.cost;
  }

  const fasadTotalSell = Math.round(fasadAreaM2 * fasadSellPerM2);
  const fasadTotalCost = Math.round(fasadAreaM2 * fasadCostPerM2);

  // --- 3. CALCULATE TIANG & PONDASI ---
  let tiangSellPerM = 375000;
  let tiangCostPerM = 230000;
  let tiangLabel = 'Pipa Besi Medium 4 Inch';

  if (tiangType === 'pipa_2') {
    const r = getRate('tiang', '2 Inch', 175000, 105000);
    tiangSellPerM = r.sell;
    tiangCostPerM = r.cost;
    tiangLabel = 'Pipa Besi Medium 2 Inch';
  } else if (tiangType === 'pipa_3') {
    const r = getRate('tiang', '3 Inch', 250000, 150000);
    tiangSellPerM = r.sell;
    tiangCostPerM = r.cost;
    tiangLabel = 'Pipa Besi Medium 3 Inch';
  } else if (tiangType === 'pipa_6') {
    const r = getRate('tiang', '6 Inch', 650000, 420000);
    tiangSellPerM = r.sell;
    tiangCostPerM = r.cost;
    tiangLabel = 'Pipa Besi Tebal 6 Inch Schedule';
  } else {
    const r = getRate('tiang', '4 Inch', 375000, 230000);
    tiangSellPerM = r.sell;
    tiangCostPerM = r.cost;
  }

  const pondasiRate = getRate('tiang', 'Pondasi', 850000, 500000);
  const tiangOnlySell = Math.round((Number(tiangHeightMeter) || 1) * tiangSellPerM);
  const tiangOnlyCost = Math.round((Number(tiangHeightMeter) || 1) * tiangCostPerM);
  const pondasiTotalSell = enablePondasi ? (Number(pondasiPoints) || 1) * pondasiRate.sell : 0;
  const pondasiTotalCost = enablePondasi ? (Number(pondasiPoints) || 1) * pondasiRate.cost : 0;
  const tiangTotalSell = tiangOnlySell + pondasiTotalSell;
  const tiangTotalCost = tiangOnlyCost + pondasiTotalCost;

  // --- 4. CALCULATE OPERASIONAL ---
  const stegerRate = getRate('operasional', 'Scaffolding', 65000, 35000);
  const stegerTotalSell = enableScaffolding ? (Number(scaffoldingSets) || 1) * (Number(scaffoldingDays) || 1) * stegerRate.sell : 0;
  const stegerTotalCost = enableScaffolding ? (Number(scaffoldingSets) || 1) * (Number(scaffoldingDays) || 1) * stegerRate.cost : 0;

  const bongkarRate = getRate('operasional', 'Bongkar', 500000, 250000);
  const bongkarTotalSell = enableBongkar ? bongkarRate.sell : 0;
  const bongkarTotalCost = enableBongkar ? bongkarRate.cost : 0;

  const kabelRate = getRate('operasional', 'Kabel', 25000, 15000);
  const kabelTotalSell = enableTarikKabel ? (Number(kabelMeter) || 1) * kabelRate.sell : 0;
  const kabelTotalCost = enableTarikKabel ? (Number(kabelMeter) || 1) * kabelRate.cost : 0;

  // TOTAL ACCUMULATED ADDONS
  const grandAddonsSell = 
    (enableLogo ? logoTotalSell : 0) +
    (enableFasad ? fasadTotalSell : 0) +
    (enableTiang ? tiangTotalSell : 0) +
    stegerTotalSell +
    bongkarTotalSell +
    kabelTotalSell;

  // HANDLE APPLY
  const handleApply = () => {
    const createdItems: MultiItemLine[] = [];
    const timestamp = Date.now();

    // 1. Logo
    if (enableLogo) {
      createdItems.push({
        id: `addon-logo-${timestamp}`,
        itemType: 'logo',
        description: logoDesc || 'Logo / Emblem Timbul 3D',
        specifications: `${logoMaterialName} • Dimensi ${logoWidthCm} x ${logoHeightCm} cm`,
        dimensions: `${logoWidthCm} x ${logoHeightCm} cm`,
        heightCm: Number(logoHeightCm),
        widthCm: Number(logoWidthCm),
        charCount: 1,
        material: logoSpec,
        lighting: logoLighting,
        quantity: Number(logoQty) || 1,
        unitPrice: logoUnitSell,
        sellingPrice: logoTotalSell,
        unitHpp: logoUnitCost,
        hppPrice: logoUnitCost * (Number(logoQty) || 1),
      });
    }

    // 2. Fasad
    if (enableFasad) {
      createdItems.push({
        id: `addon-fasad-${timestamp}`,
        itemType: 'fasad',
        description: `Background Fasad Reklame (${fasadAreaM2.toFixed(2)} m²)`,
        specifications: `${fasadMaterialTitle} • Dimensi ${fasadLengthCm} x ${fasadHeightCm} cm${includeHollow ? ' • Termasuk rangka pengaku hollow' : ''}`,
        dimensions: `${fasadLengthCm} x ${fasadHeightCm} cm`,
        heightCm: Number(fasadHeightCm),
        widthCm: Number(fasadLengthCm),
        material: fasadMaterialKey,
        lighting: 'none',
        quantity: 1,
        unitPrice: fasadTotalSell,
        sellingPrice: fasadTotalSell,
        unitHpp: fasadTotalCost,
        hppPrice: fasadTotalCost,
      });
    }

    // 3. Tiang & Pondasi
    if (enableTiang) {
      const pondasiText = enablePondasi ? ` + Cor Cakar Bebek Angkur (${pondasiPoints} Titik)` : '';
      createdItems.push({
        id: `addon-tiang-${timestamp}`,
        itemType: 'tiang',
        description: `Konstruksi Tiang ${tiangLabel} (${tiangHeightMeter}m)${pondasiText}`,
        specifications: `Pipa Besi Medium Tebal, Baseplate 10mm, Baut Dynabolt Angkur M16${enablePondasi ? `, Galian & Pengecoran Semen Beton K-225 (${pondasiPoints} Titik)` : ''}`,
        dimensions: `Pipa ${tiangHeightMeter} Meter`,
        heightCm: Number(tiangHeightMeter) * 100,
        widthCm: undefined,
        material: tiangType,
        lighting: 'none',
        quantity: 1,
        unitPrice: tiangTotalSell,
        sellingPrice: tiangTotalSell,
        unitHpp: tiangTotalCost,
        hppPrice: tiangTotalCost,
      });
    }

    // 4. Operasional: Steger
    if (enableScaffolding) {
      createdItems.push({
        id: `addon-steger-${timestamp}`,
        itemType: 'operasional',
        description: `Sewa Scaffolding / Steger Lapangan (${scaffoldingSets} Set x ${scaffoldingDays} Hari)`,
        specifications: 'Main Frame, Cross Brace, Catwalk Injak, Roda Rem & Transport Antar-Jemput Bengkel',
        dimensions: `${scaffoldingSets} Set x ${scaffoldingDays} Hari`,
        material: 'scaffolding',
        lighting: 'none',
        quantity: 1,
        unitPrice: stegerTotalSell,
        sellingPrice: stegerTotalSell,
        unitHpp: stegerTotalCost,
        hppPrice: stegerTotalCost,
      });
    }

    // 4. Operasional: Bongkar
    if (enableBongkar) {
      createdItems.push({
        id: `addon-bongkar-${timestamp}`,
        itemType: 'operasional',
        description: 'Jasa Bongkar Reklame Lama & Pembersihan Titik',
        specifications: 'Penurunan signage lama, perapihan instalasi kabel eksisting & pembersihan area pasang',
        dimensions: '1 Lot',
        material: 'bongkar',
        lighting: 'none',
        quantity: 1,
        unitPrice: bongkarTotalSell,
        sellingPrice: bongkarTotalSell,
        unitHpp: bongkarTotalCost,
        hppPrice: bongkarTotalCost,
      });
    }

    // 4. Operasional: Tarik Kabel
    if (enableTarikKabel) {
      createdItems.push({
        id: `addon-kabel-${timestamp}`,
        itemType: 'operasional',
        description: `Jasa Tarik Kabel Listrik & Trafo Tambahan (${kabelMeter} Meter)`,
        specifications: 'Kabel NYM 2x1.5 SNI, Pipa Konduit Pelindung, Klem & Steker Saklar Otomatis',
        dimensions: `${kabelMeter} Meter`,
        material: 'tarik_kabel',
        lighting: 'none',
        quantity: 1,
        unitPrice: kabelTotalSell,
        sellingPrice: kabelTotalSell,
        unitHpp: kabelTotalCost,
        hppPrice: kabelTotalCost,
      });
    }

    if (createdItems.length === 0) {
      alert('Centang minimal salah satu Add-on terlebih dahulu.');
      return;
    }

    onApplyAddons(createdItems);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 my-8 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Layers className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 uppercase">
                Modal Add-Ons Media, Logo & Struktur Pendukung
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Pilih media pendukung huruf timbul. Setiap add-on otomatis masuk sebagai baris item mandiri.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 max-h-[68vh] overflow-y-auto pr-1">
          {/* 1. SEKSI LOGO / EMBLEM TIMBUL */}
          <div className={`p-4 rounded-xl border transition ${enableLogo ? 'bg-indigo-50/40 border-indigo-300 ring-1 ring-indigo-500/20' : 'bg-slate-50 border-slate-200'}`}>
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={enableLogo}
                  onChange={(e) => setEnableLogo(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <div>
                  <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    1. Logo / Emblem Timbul (3D)
                  </span>
                  <span className="text-[11px] text-slate-500 block">Dihitung proporsi luasan (bukan rumus per huruf)</span>
                </div>
              </div>
              {enableLogo && (
                <span className="font-black text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  + {formatRupiah(logoTotalSell)}
                </span>
              )}
            </label>

            {enableLogo && (
              <div className="mt-3.5 pt-3 border-t border-indigo-100 space-y-3 text-xs">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Nama / Deskripsi Logo:</label>
                  <input
                    type="text"
                    value={logoDesc}
                    onChange={(e) => setLogoDesc(e.target.value)}
                    placeholder="Contoh: Logo Kopi Kenangan / Sayap Garuda"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="font-medium text-slate-700 block mb-1">Panjang (cm):</label>
                    <input
                      type="number"
                      value={logoWidthCm}
                      onChange={(e) => setLogoWidthCm(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-slate-700 block mb-1">Tinggi (cm):</label>
                    <input
                      type="number"
                      value={logoHeightCm}
                      onChange={(e) => setLogoHeightCm(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-slate-700 block mb-1">Jumlah (Qty):</label>
                    <input
                      type="number"
                      value={logoQty}
                      onChange={(e) => setLogoQty(Number(e.target.value))}
                      min={1}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-medium text-slate-700 block mb-1">Pilihan Bahan & Tipe Lampu:</label>
                  <select
                    value={logoSpec}
                    onChange={(e) => setLogoSpec(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900 cursor-pointer"
                  >
                    <option value="akrilik_led">Akrilik Laser Cut + Nyala Depan LED Modul IP68</option>
                    <option value="stainless_backlight">Stainless Steel Mirror 3D + Siluet Backlight LED</option>
                    <option value="non_lampu">Akrilik Solid Solid 3D (Non-Lampu)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* 2. SEKSI FASAD / BACKGROUND PAPAN */}
          <div className={`p-4 rounded-xl border transition ${enableFasad ? 'bg-emerald-50/40 border-emerald-300 ring-1 ring-emerald-500/20' : 'bg-slate-50 border-slate-200'}`}>
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={enableFasad}
                  onChange={(e) => setEnableFasad(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <div>
                  <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <Construction className="w-3.5 h-3.5 text-emerald-600" />
                    2. Background / Fasad Papan Reklame
                  </span>
                  <span className="text-[11px] text-slate-500 block">Papan penutup dinding atau rangka belakang huruf</span>
                </div>
              </div>
              {enableFasad && (
                <span className="font-black text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  + {formatRupiah(fasadTotalSell)}
                </span>
              )}
            </label>

            {enableFasad && (
              <div className="mt-3.5 pt-3 border-t border-emerald-100 space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="font-medium text-slate-700 block mb-1">Panjang Bentang (cm):</label>
                    <input
                      type="number"
                      value={fasadLengthCm}
                      onChange={(e) => setFasadLengthCm(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-medium text-slate-700 block mb-1">Tinggi Bidang (cm):</label>
                    <input
                      type="number"
                      value={fasadHeightCm}
                      onChange={(e) => setFasadHeightCm(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 text-[11px] font-bold text-emerald-900 border border-emerald-200">
                  <span>Luas Bidang Fasad:</span>
                  <span>{fasadAreaM2.toFixed(2)} m² ({fasadLengthCm} x {fasadHeightCm} cm)</span>
                </div>

                <div>
                  <label className="font-medium text-slate-700 block mb-1">Bahan Fasad (Tarif Live Master):</label>
                  <select
                    value={fasadMaterialKey}
                    onChange={(e) => setFasadMaterialKey(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900 cursor-pointer"
                  >
                    <option value="acp_seven">ACP Seven 3mm PVDF Outdoor — Rp 750.000 / m²</option>
                    <option value="plat_galvanil">Plat Galvanil 0.8mm Cat Duco Oven — Rp 650.000 / m²</option>
                    <option value="kisi_hollow">Kisi-kisi Hollow Galvanis 2x4 — Rp 550.000 / m²</option>
                    <option value="multiplek">Multiplek 12mm / Melamin Backwall — Rp 450.000 / m²</option>
                  </select>
                </div>

                <label className="flex items-center gap-2 font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeHollow}
                    onChange={(e) => setIncludeHollow(e.target.checked)}
                    className="rounded text-emerald-600 w-4 h-4"
                  />
                  <span>Termasuk Konstruksi Rangka Besi Hollow 4x4 Galvanis Anti Karat</span>
                </label>
              </div>
            )}
          </div>

          {/* 3. SEKSI TIANG & PONDASI LAPANGAN */}
          <div className={`p-4 rounded-xl border transition ${enableTiang ? 'bg-blue-50/40 border-blue-300 ring-1 ring-blue-500/20' : 'bg-slate-50 border-slate-200'}`}>
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={enableTiang}
                  onChange={(e) => setEnableTiang(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <div>
                  <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-blue-600" />
                    3. Tiang & Pondasi Pylon Lapangan
                  </span>
                  <span className="text-[11px] text-slate-500 block">Untuk plang berdiri / totem pylon di luar gedung</span>
                </div>
              </div>
              {enableTiang && (
                <span className="font-black text-xs text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  + {formatRupiah(tiangTotalSell)}
                </span>
              )}
            </label>

            {enableTiang && (
              <div className="mt-3.5 pt-3 border-t border-blue-100 space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="font-medium text-slate-700 block mb-1">Ukuran Pipa Tiang:</label>
                    <select
                      value={tiangType}
                      onChange={(e) => setTiangType(e.target.value as any)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900 cursor-pointer"
                    >
                      <option value="pipa_4">Pipa Besi Medium 4 Inch (+ Rp 375.000/m)</option>
                      <option value="pipa_3">Pipa Besi Medium 3 Inch (+ Rp 250.000/m)</option>
                      <option value="pipa_2">Pipa Besi Medium 2 Inch (+ Rp 175.000/m)</option>
                      <option value="pipa_6">Pipa Besi Tebal 6 Inch Schedule (+ Rp 650.000/m)</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-medium text-slate-700 block mb-1">Tinggi Tiang (Meter):</label>
                    <input
                      type="number"
                      value={tiangHeightMeter}
                      onChange={(e) => setTiangHeightMeter(Number(e.target.value))}
                      min={1}
                      max={20}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 space-y-2">
                  <label className="flex items-center gap-2 font-bold text-slate-900 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enablePondasi}
                      onChange={(e) => setEnablePondasi(e.target.checked)}
                      className="rounded text-blue-600 w-4 h-4"
                    />
                    <span>Termasuk Cor Beton Galian Cakar Bebek + Angkur Baseplate (+ Rp 850.000 / Titik)</span>
                  </label>

                  {enablePondasi && (
                    <div className="pl-6 flex items-center gap-2">
                      <label className="text-[11px] text-slate-600 font-medium">Jumlah Titik Cor:</label>
                      <input
                        type="number"
                        value={pondasiPoints}
                        onChange={(e) => setPondasiPoints(Number(e.target.value))}
                        min={1}
                        max={6}
                        className="w-20 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-900"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 4. SEKSI OPERASIONAL KHUSUS */}
          <div className="p-4 rounded-xl border bg-slate-50 border-slate-200 space-y-3 text-xs">
            <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-amber-600" />
              4. Jasa & Operasional Khusus Lapangan (Opsional)
            </span>

            {/* A. Sewa Steger */}
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="flex items-center gap-2 font-medium text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableScaffolding}
                  onChange={(e) => setEnableScaffolding(e.target.checked)}
                  className="rounded text-amber-600 w-4 h-4"
                />
                <div>
                  <span className="font-bold text-slate-900">Sewa Scaffolding / Steger</span>
                  <span className="text-[11px] text-slate-500 block">Rp 65.000 / set / hari (Lengkap catwalk & roda)</span>
                </div>
              </label>

              {enableScaffolding && (
                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="number"
                    value={scaffoldingSets}
                    onChange={(e) => setScaffoldingSets(Number(e.target.value))}
                    min={1}
                    className="w-16 bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold text-center"
                    placeholder="Set"
                  />
                  <span className="text-[10px] text-slate-500">Set x</span>
                  <input
                    type="number"
                    value={scaffoldingDays}
                    onChange={(e) => setScaffoldingDays(Number(e.target.value))}
                    min={1}
                    className="w-16 bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold text-center"
                    placeholder="Hari"
                  />
                  <span className="text-[10px] text-slate-500">Hari</span>
                  <span className="font-black text-amber-700 ml-1">{formatRupiah(stegerTotalSell)}</span>
                </div>
              )}
            </div>

            {/* B. Bongkar Plang Lama */}
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-2">
              <label className="flex items-center gap-2 font-medium text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableBongkar}
                  onChange={(e) => setEnableBongkar(e.target.checked)}
                  className="rounded text-amber-600 w-4 h-4"
                />
                <div>
                  <span className="font-bold text-slate-900">Jasa Bongkar Reklame Lama</span>
                  <span className="text-[11px] text-slate-500 block">Penurunan plang & pembersihan area</span>
                </div>
              </label>
              {enableBongkar && (
                <span className="font-black text-amber-700 text-xs">+{formatRupiah(bongkarTotalSell)}</span>
              )}
            </div>

            {/* C. Tarik Kabel Listrik */}
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="flex items-center gap-2 font-medium text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableTarikKabel}
                  onChange={(e) => setEnableTarikKabel(e.target.checked)}
                  className="rounded text-amber-600 w-4 h-4"
                />
                <div>
                  <span className="font-bold text-slate-900">Jasa Tarik Kabel Tambahan</span>
                  <span className="text-[11px] text-slate-500 block">Kabel NYM 2x1.5 SNI + Pipa Konduit (Rp 25.000/m)</span>
                </div>
              </label>

              {enableTarikKabel && (
                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="number"
                    value={kabelMeter}
                    onChange={(e) => setKabelMeter(Number(e.target.value))}
                    min={5}
                    className="w-20 bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold text-center"
                  />
                  <span className="text-[10px] text-slate-500">Meter =</span>
                  <span className="font-black text-amber-700">{formatRupiah(kabelTotalSell)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Accumulation & Actions */}
        <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Subtotal Item Add-ons Baru:</span>
            <span className="text-lg font-black text-slate-900">{formatRupiah(grandAddonsSell)}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>+ Terapkan Semua Add-ons ke Proyek</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
