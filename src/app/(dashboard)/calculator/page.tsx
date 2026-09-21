'use client';

import { useState, useMemo } from 'react';
import { calculatePricing, ModularProductSpec } from '@/lib/calculator-modular';
import { getAllBranches, getBranchConfig } from '@/lib/branches';
import { 
  Calculator, 
  Zap, 
  ShieldCheck, 
  Layers, 
  CheckCircle2, 
  MapPin, 
  Truck, 
  HardHat, 
  ArrowRight,
  Info
} from 'lucide-react';

export default function CalculatorPage() {
  // Multi-Cabang Selector
  const branches = getAllBranches();
  const [selectedBranchId, setSelectedBranchId] = useState('jakarta');
  const activeBranch = getBranchConfig(selectedBranchId);

  // Cascading Dropdown Categories
  const [category, setCategory] = useState<'neon_box' | 'huruf_timbul'>('neon_box');
  const [subCategory, setSubCategory] = useState<string>('neon_box_akrilik_2muka_cutting');

  // Spesifikasi Dimensi & Teks
  const [lengthCm, setLengthCm] = useState(150);
  const [heightCm, setHeightCm] = useState(80);
  const [depthCm, setDepthCm] = useState(4);
  const [faces, setFaces] = useState<1 | 2>(2);
  const [text, setText] = useState('KOSE OUTDOOR');
  const [charCount, setCharCount] = useState(11);

  // Material & Kelistrikan
  const [frameHollowType, setFrameHollowType] = useState('hollow_4x4');
  const [lightingType, setLightingType] = useState<any>('led_ip68_waterproof');

  // Variabel Lapangan
  const [floorLevel, setFloorLevel] = useState(1);
  const [useScaffolding, setUseScaffolding] = useState(false);
  const [useCrane, setUseCrane] = useState(false);
  const [needPoleConstruction, setNeedPoleConstruction] = useState(false);
  const [poleHeightMeter, setPoleHeightMeter] = useState(3);
  const [distanceKm, setDistanceKm] = useState(15);

  // Target Margin
  const [targetMarginPercent, setTargetMarginPercent] = useState(35);

  // Otomatis sesuaikan sub-kategori saat kategori induk berubah
  const handleCategoryChange = (newCategory: 'neon_box' | 'huruf_timbul') => {
    setCategory(newCategory);
    if (newCategory === 'neon_box') {
      setSubCategory('neon_box_akrilik_2muka_cutting');
      setFaces(2);
    } else {
      setSubCategory('stainless_mirror_304');
      setLightingType('backlight_halolight');
    }
  };

  // Kalkulasi Real-Time
  const spec: ModularProductSpec = useMemo(() => {
    return {
      category,
      subCategory,
      lengthCm: Number(lengthCm),
      heightCm: Number(heightCm),
      depthCm: Number(depthCm),
      charCount: category === 'huruf_timbul' ? (text.replace(/\s+/g, '').length || Number(charCount)) : undefined,
      text,
      faces,
      materialGrade: subCategory,
      frameHollowType,
      lightingType,
      floorLevel: Number(floorLevel),
      useScaffolding,
      useCrane,
      needPoleConstruction,
      poleHeightMeter: Number(poleHeightMeter),
      distanceKm: Number(distanceKm),
      targetMarginPercent: Number(targetMarginPercent),
    };
  }, [
    category, subCategory, lengthCm, heightCm, depthCm, text, charCount, 
    faces, frameHollowType, lightingType, floorLevel, useScaffolding, 
    useCrane, needPoleConstruction, poleHeightMeter, distanceKm, targetMarginPercent
  ]);

  const pricing = useMemo(() => calculatePricing(spec), [spec]);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header with Branch Selector */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <Calculator className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-extrabold text-slate-900 uppercase">
              Kalkulator Teknis & Estimator HPP Reklame
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Hitung breakdown biaya material, lampu, konstruksi, instalasi, dan transport secara modular.
          </p>
        </div>

        {/* Branch Selector */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
          <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
          <div className="text-xs">
            <span className="block text-[10px] uppercase font-bold text-slate-400">Cabang Proyek:</span>
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Form Inputs (7 cols) and Results (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Cascading Dropdowns & Dynamic Form */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
          {/* Cascading Dropdown 1: Kategori Utama */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                1. Kategori Produk Utama
              </label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="neon_box">Kategori 1 — Neon Box</option>
                <option value="huruf_timbul">Kategori 2 — Huruf Timbul / Channel Letters</option>
              </select>
            </div>

            {/* Cascading Dropdown 2: Sub-Kategori */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                2. Sub-Kategori Produk Spesifik
              </label>
              {category === 'neon_box' ? (
                <select
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="neon_box_akrilik_2muka_cutting">Neon Box Akrilik 2 Muka — Cutting Sticker Oracal</option>
                  <option value="neon_box_akrilik_2muka_uv">Neon Box Akrilik 2 Muka — Print UV Resolusi Tinggi</option>
                  <option value="neon_box_akrilik_1muka_fasad">Neon Box Akrilik 1 Muka — Tempel Dinding / Fasad</option>
                  <option value="neon_box_flexy_jerman">Neon Box Backlite Flexy — Jerman Hi-Res</option>
                  <option value="neon_box_flexy_korea">Neon Box Backlite Flexy — Korea Ekonomis</option>
                  <option value="neon_box_custom_bulat">Neon Box Custom Pola / Bulat (Tekuk Laser)</option>
                  <option value="slim_lightbox_mall">Slim Lightbox / Fabric Display Mall</option>
                </select>
              ) : (
                <select
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="stainless_mirror_304">Stainless Steel 304 Mirror Kilap (Outdoor Anti Karat)</option>
                  <option value="stainless_hairline_201">Stainless Steel 201 Hairline Doff</option>
                  <option value="akrilik_solid_spon">Akrilik Solid Marga Cipta + Dudukan Spon EVA</option>
                  <option value="galvanis_duco">Galvanis Bending Las Finishing Cat Duco Oven</option>
                  <option value="kuningan_tembaga">Kuningan / Tembaga Polished Clear</option>
                </select>
              )}
            </div>
          </div>

          {/* Dynamic Inputs Based on Category */}
          {category === 'neon_box' ? (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-rose-600" />
                Spesifikasi Dimensi & Konstruksi Neon Box
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Panjang (cm)</label>
                  <input
                    type="number"
                    value={lengthCm}
                    onChange={(e) => setLengthCm(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Tinggi / Lebar (cm)</label>
                  <input
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Jumlah Muka</label>
                  <select
                    value={faces}
                    onChange={(e) => setFaces(Number(e.target.value) as any)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-bold text-slate-900"
                  >
                    <option value="1">1 Muka (Fasad Tembok)</option>
                    <option value="2">2 Muka (Bolak-Balik)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Pilihan Rangka / Frame</label>
                  <select
                    value={frameHollowType}
                    onChange={(e) => setFrameHollowType(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-medium text-slate-900"
                  >
                    <option value="hollow_4x4">Besi Hollow 4x4 cm Galvanis (Standar Kuat)</option>
                    <option value="hollow_3x3">Besi Hollow 3x3 cm Galvanis</option>
                    <option value="siku_3x3">Rangka Siku 3x3 + Breket Gantung</option>
                    <option value="profil_aluminium">Profil Aluminium Snap Frame</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-600 mb-1">Jenis Lampu LED</label>
                  <select
                    value={lightingType}
                    onChange={(e) => setLightingType(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-medium text-slate-900"
                  >
                    <option value="led_ip68_waterproof">LED Modul Injeksi IP68 Waterproof (Samsung / Epistar)</option>
                    <option value="led_standard">LED Modul Standard SMD</option>
                    <option value="none">Tanpa Lampu (Non-Illuminated)</option>
                  </select>
                </div>
              </div>
            </div>
          ) : (
            // Huruf Timbul Dynamic Inputs
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-rose-600" />
                Spesifikasi Karakter & Cahaya Huruf Timbul
              </h3>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Teks / Kata Brand</label>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Contoh: KOSE OUTDOOR"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 font-extrabold text-sm text-slate-900"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Jumlah Karakter Terhitung: <strong className="text-slate-800">{text.replace(/\s+/g, '').length} Huruf</strong> (Tanpa Spasi)
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Tinggi Huruf (cm)</label>
                  <input
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Tebal Kaki / Depth (cm)</label>
                  <input
                    type="number"
                    value={depthCm}
                    onChange={(e) => setDepthCm(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Sistem Cahaya</label>
                  <select
                    value={lightingType}
                    onChange={(e) => setLightingType(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-bold text-slate-900"
                  >
                    <option value="backlight_halolight">Backlight / Halolight (Siluet Mewah)</option>
                    <option value="frontlit_led">Frontlit (Muka Akrilik Nyala Terang)</option>
                    <option value="none">Tanpa Lampu (Non-LED)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Variabel Lapangan & Transportasi */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
            <h3 className="font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <HardHat className="w-4 h-4 text-amber-600" />
              Variabel Lapangan, Alat Bantu & Jarak Transport
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-600 mb-1">Elevasi Lantai Pasang</label>
                <select
                  value={floorLevel}
                  onChange={(e) => setFloorLevel(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-medium text-slate-900"
                >
                  <option value="1">Lantai 1 / Ground (Normal)</option>
                  <option value="2">Lantai 2 (+25% Risiko)</option>
                  <option value="3">Lantai 3 (+50% Risiko)</option>
                  <option value="4">Lantai 4+ (High-Risk Façade)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Jarak Tempuh PP (KM)</label>
                <input
                  type="number"
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Target Margin Profit (%)</label>
                <input
                  type="number"
                  value={targetMarginPercent}
                  onChange={(e) => setTargetMarginPercent(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-bold text-rose-600"
                />
              </div>
            </div>

            {/* Checkbox Alat Berat & Tiang */}
            <div className="pt-2 flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={useScaffolding}
                  onChange={(e) => setUseScaffolding(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                />
                <span>Sewa Scaffolding (2-3 Set)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={useCrane}
                  onChange={(e) => setUseCrane(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                />
                <span>Sewa Skylift / Crane Mini</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={needPoleConstruction}
                  onChange={(e) => setNeedPoleConstruction(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                />
                <span>Konstruksi Tiang Pipa (Pylon)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Side: Modular Breakdown Results (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Modular Breakdown Card (Clean Light) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center justify-between">
              <span>Breakdown Biaya Modular (HPP)</span>
              <span className="text-[10px] font-bold text-slate-500">Cabang {activeBranch.city}</span>
            </h2>

            <div className="space-y-2 text-xs divide-y divide-slate-100">
              <div className="flex justify-between py-1.5">
                <span className="text-slate-600">1. Biaya Bahan & Hollow:</span>
                <span className="font-bold text-slate-900">{formatRupiah(pricing.material.materialHpp)}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-600">2. Modul LED & Trafo:</span>
                <span className="font-bold text-slate-900">{formatRupiah(pricing.lighting.lightingHpp)}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-600">3. Konstruksi & Tiang:</span>
                <span className="font-bold text-slate-900">{formatRupiah(pricing.construction.constructionHpp)}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-600">4. Jasa Pasang & Elevasi:</span>
                <span className="font-bold text-slate-900">{formatRupiah(pricing.installation.installationHpp)}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-600">5. Transportasi Armada:</span>
                <span className="font-bold text-slate-900">{formatRupiah(pricing.transport.transportHpp)}</span>
              </div>
            </div>

            {/* Subtotal Modal HPP */}
            <div className="pt-2 border-t-2 border-slate-200 flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700 uppercase">Total HPP Modal:</span>
              <span className="text-sm font-extrabold text-slate-900">{formatRupiah(pricing.subtotalHpp)}</span>
            </div>
          </div>

          {/* Technical Electrical Info Box (Bengkel View) */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 text-xs space-y-2">
            <h3 className="font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5 text-[11px]">
              <Zap className="w-4 h-4 text-amber-600" />
              Spesifikasi Kelistrikan (Safety Factor 25%)
            </h3>
            <div className="grid grid-cols-2 gap-2 text-slate-700">
              <div>
                <span className="text-[10px] text-slate-500 block">Kebutuhan LED:</span>
                <span className="font-bold text-slate-900">{pricing.lighting.ledCount} Modul</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Konsumsi Daya:</span>
                <span className="font-bold text-slate-900">{pricing.lighting.ledWatts} Watt</span>
              </div>
              <div className="col-span-2 pt-1 border-t border-amber-200/60">
                <span className="text-[10px] text-slate-500 block">Rekomendasi Power Supply:</span>
                <span className="font-bold text-amber-800">{pricing.lighting.trafoDescription}</span>
              </div>
            </div>
          </div>

          {/* Official Selling Price (Quotation Suggestion) */}
          <div className="bg-gradient-to-br from-rose-600 to-rose-700 text-white rounded-2xl p-5 shadow-lg shadow-rose-600/20 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-rose-100 uppercase tracking-wider font-semibold text-[10px]">
                Target Profit Margin ({targetMarginPercent}%):
              </span>
              <span className="font-bold text-rose-100">+{formatRupiah(pricing.grossProfit)}</span>
            </div>

            <div className="pt-2 border-t border-rose-500/60">
              <span className="text-[11px] uppercase tracking-wider font-bold text-rose-100 block">
                Total Harga Jual Penawaran:
              </span>
              <div className="text-3xl font-extrabold tracking-tight mt-0.5">
                {formatRupiah(pricing.finalSellingPrice)}
              </div>
              <p className="text-[11px] text-rose-100/90 mt-1">
                Sudah termasuk jasa instalasi cabang {activeBranch.city} & garansi 1 tahun.
              </p>
            </div>

            <div className="pt-2">
              <a
                href={`/projects`}
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-rose-50 text-rose-700 font-extrabold text-xs transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <span>Gunakan untuk Proyek & Penawaran</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
