'use client';

import { useState, useMemo } from 'react';
import { 
  calculatePricing, 
  generateWhatsAppQuoteText, 
  ModularProductSpec 
} from '@/lib/calculator-modular';
import { getAllBranches, getBranchConfig } from '@/lib/branches';
import { 
  Calculator, 
  Layers, 
  Send, 
  MapPin, 
  HardHat, 
  ArrowRight,
  Sparkles,
  Phone,
  User,
  ShieldCheck,
  CheckCircle2,
  Construction
} from 'lucide-react';

export default function CalculatorPage() {
  // Multi-Cabang Selector
  const branches = getAllBranches();
  const [selectedBranchId, setSelectedBranchId] = useState('jakarta');
  const activeBranch = getBranchConfig(selectedBranchId);

  // Prospek Klien (Untuk Tombol WhatsApp Instan)
  const [clientName, setClientName] = useState('Ibu Bella (Kopi Kenangan)');
  const [clientPhone, setClientPhone] = useState('081299887766');

  // Kategori Utama Salsabilla
  const [category, setCategory] = useState<'huruf_timbul' | 'neon_box' | 'papan_reklame'>('huruf_timbul');
  const [subCategory, setSubCategory] = useState<string>('stainless_biasa_led');

  // Dimensi & Teks
  const [text, setText] = useState('KOPI KENANGAN');
  const [charCount, setCharCount] = useState(12);
  const [heightCm, setHeightCm] = useState(25);
  const [lengthCm, setLengthCm] = useState(150);
  const [depthCm, setDepthCm] = useState(4);

  // Konstruksi Tiang & Pondasi (Add-on)
  const [needPole, setNeedPole] = useState(false);
  const [poleType, setPoleType] = useState<'pipa_2' | 'pipa_3' | 'pipa_4' | 'pipa_6'>('pipa_3');
  const [poleHeightMeter, setPoleHeightMeter] = useState(3);
  const [needPondasi, setNeedPondasi] = useState(false);
  const [pondasiPoints, setPondasiPoints] = useState(1);

  // Finishing & Aksesoris (Add-on)
  const [stickerType, setStickerType] = useState<'none' | 'oracal_651' | 'oracal_8500'>('none');
  const [stickerAreaM2, setStickerAreaM2] = useState(1);
  const [spotlightWatt, setSpotlightWatt] = useState<0 | 50 | 100>(0);
  const [spotlightCount, setSpotlightCount] = useState(2);

  // Variabel Lapangan
  const [floorLevel, setFloorLevel] = useState(1);
  const [useScaffolding, setUseScaffolding] = useState(false);
  const [distanceKm, setDistanceKm] = useState(15);
  const [targetMarginPercent, setTargetMarginPercent] = useState(35);

  // Switch category defaults
  const handleCategoryTab = (cat: 'huruf_timbul' | 'neon_box' | 'papan_reklame') => {
    setCategory(cat);
    if (cat === 'huruf_timbul') {
      setSubCategory('stainless_biasa_led');
    } else if (cat === 'neon_box') {
      setSubCategory('neon_box_2sisi');
      setLengthCm(100);
      setHeightCm(100);
    } else {
      setSubCategory('reklame_flexi_korea');
      setLengthCm(300);
      setHeightCm(100);
    }
  };

  // Spec Object
  const spec: ModularProductSpec = useMemo(() => {
    return {
      category,
      subCategory,
      lengthCm: Number(lengthCm),
      heightCm: Number(heightCm),
      depthCm: Number(depthCm),
      charCount: category === 'huruf_timbul' ? (text.replace(/\s+/g, '').length || Number(charCount)) : undefined,
      text,
      lightingType: category === 'huruf_timbul' && subCategory.includes('led') ? 'led_ip68_waterproof' : 'none',
      needPoleConstruction: needPole,
      poleType,
      poleHeightMeter: Number(poleHeightMeter),
      needPondasiCakarAyam: needPondasi,
      pondasiPoints: Number(pondasiPoints),
      stickerType,
      stickerAreaM2: Number(stickerAreaM2),
      spotlightWatt,
      spotlightCount: Number(spotlightCount),
      floorLevel: Number(floorLevel),
      useScaffolding,
      distanceKm: Number(distanceKm),
      targetMarginPercent: Number(targetMarginPercent),
    };
  }, [
    category, subCategory, lengthCm, heightCm, depthCm, text, charCount,
    needPole, poleType, poleHeightMeter, needPondasi, pondasiPoints,
    stickerType, stickerAreaM2, spotlightWatt, spotlightCount,
    floorLevel, useScaffolding, distanceKm, targetMarginPercent
  ]);

  const pricing = useMemo(() => calculatePricing(spec), [spec]);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  // WhatsApp Link Handler
  const handleOpenWhatsApp = () => {
    const rawNumber = clientPhone.replace(/[^0-9]/g, '');
    let cleanNumber = rawNumber;
    if (rawNumber.startsWith('0')) {
      cleanNumber = '62' + rawNumber.substring(1);
    } else if (!rawNumber.startsWith('62')) {
      cleanNumber = '62' + rawNumber;
    }

    const message = generateWhatsAppQuoteText({
      clientName: clientName || 'Bapak/Ibu',
      spec,
      pricing,
      branchCity: activeBranch.city,
    });

    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <Calculator className="w-5 h-5" />
            </span>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight">
              Kalkulator Cepat & Kirim WA 60 Detik
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Hitung harga resmi Salsabilla Advertising dan kirim estimasi ke chat klien secara instan & gratis.
          </p>
        </div>

        {/* Branch Selector */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-2 rounded-xl self-start md:self-auto">
          <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
          <div className="text-xs">
            <span className="block text-[9px] uppercase font-bold text-slate-400">Pilih Cabang:</span>
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="bg-transparent font-extrabold text-slate-900 focus:outline-none cursor-pointer text-xs"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.city})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Form (7 cols) and Sticky Results (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Form: Mobile-first touch-friendly inputs */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs space-y-5">
          {/* Quick Client Info Box */}
          <div className="p-3.5 bg-rose-50/50 border border-rose-100 rounded-xl space-y-2">
            <span className="text-[10px] font-black uppercase text-rose-800 tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-rose-600" />
              Tujuan Chat WhatsApp Klien
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="relative">
                <User className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Nama Klien (e.g. Bu Bella)"
                  className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  inputMode="numeric"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="No. WhatsApp (e.g. 081299887766)"
                  className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>
          </div>

          {/* 3 Main Category Tabs (Touch-friendly 48px height) */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-2">
              1. Pilih Kategori Signage
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleCategoryTab('huruf_timbul')}
                className={`py-3 px-2 rounded-xl text-xs font-black transition text-center flex flex-col items-center justify-center gap-1 border cursor-pointer ${
                  category === 'huruf_timbul'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>Huruf Timbul</span>
                <span className="text-[9px] font-normal opacity-90">Hitungan /cm</span>
              </button>

              <button
                type="button"
                onClick={() => handleCategoryTab('neon_box')}
                className={`py-3 px-2 rounded-xl text-xs font-black transition text-center flex flex-col items-center justify-center gap-1 border cursor-pointer ${
                  category === 'neon_box'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>Neon Box</span>
                <span className="text-[9px] font-normal opacity-90">Hitungan /m²</span>
              </button>

              <button
                type="button"
                onClick={() => handleCategoryTab('papan_reklame')}
                className={`py-3 px-2 rounded-xl text-xs font-black transition text-center flex flex-col items-center justify-center gap-1 border cursor-pointer ${
                  category === 'papan_reklame'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>Papan Reklame</span>
                <span className="text-[9px] font-normal opacity-90">Flexi / Siku</span>
              </button>
            </div>
          </div>

          {/* Subcategory Dropdown & Price List */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1.5">
              2. Spesifikasi Material & Tarif Resmi
            </label>
            {category === 'huruf_timbul' && (
              <select
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-3 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-rose-500"
              >
                <option value="stainless_biasa_led">Stainless Steel Biasa + Lampu LED — Rp 20.000 / cm</option>
                <option value="stainless_gold_led">Stainless Gold Titanium + Lampu LED — Rp 25.000 / cm</option>
                <option value="akrilik_dual_glow">Akrilik Dual Glow (Cahaya Depan & Belakang) — Rp 18.000 / cm</option>
                <option value="stainless_off">Stainless Steel (Tanpa Lampu) — Rp 12.000 / cm</option>
                <option value="akrilik_off">Akrilik Solid (Tanpa Lampu) — Rp 10.000 / cm</option>
                <option value="galvanis_duco_off">Plat Galvanis Cat Duco (Tanpa Lampu) — Rp 10.000 / cm</option>
              </select>
            )}

            {category === 'neon_box' && (
              <select
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-3 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-rose-500"
              >
                <option value="neon_box_2sisi">Neon Box 2 Sisi Akrilik + Lampu TL — Rp 2.850.000 / m²</option>
                <option value="neon_box_1sisi">Neon Box 1 Sisi Akrilik + Lampu TL — Rp 1.900.000 / m²</option>
              </select>
            )}

            {category === 'papan_reklame' && (
              <select
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-3 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-rose-500"
              >
                <option value="reklame_flexi_korea">Papan Reklame Hollow 3x3 + Galvalum + Flexi Korea — Rp 950.000 / m²</option>
                <option value="billboard_heavy_duty">Rangka Billboard Raksasa Besi Siku Heavy Duty — Rp 1.350.000 / m²</option>
              </select>
            )}
          </div>

          {/* Dynamic Dimension Inputs */}
          {category === 'huruf_timbul' ? (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Teks / Brand Kata</label>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                    const clean = e.target.value.replace(/\s+/g, '');
                    setCharCount(clean.length || 1);
                  }}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 font-black text-sm text-slate-900 uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Tinggi Huruf (cm)</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-black text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Jumlah Huruf</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={charCount}
                    onChange={(e) => setCharCount(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-black text-slate-900"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Panjang (cm)</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={lengthCm}
                    onChange={(e) => setLengthCm(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-black text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Tinggi / Lebar (cm)</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-black text-slate-900"
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                Luas Terhitung: <strong className="text-slate-900">{((lengthCm * heightCm) / 10000).toFixed(2)} m²</strong> (Min. charge: 1.0 m²)
              </p>
            </div>
          )}

          {/* Modular Add-on: Tiang Konstruksi & Pondasi */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-black uppercase text-slate-700 flex items-center gap-1.5">
                <Construction className="w-4 h-4 text-amber-600" />
                Add-on Tiang & Pondasi Pemasangan
              </span>
              <label className="flex items-center gap-2 cursor-pointer font-bold text-rose-600">
                <input
                  type="checkbox"
                  checked={needPole}
                  onChange={(e) => setNeedPole(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                />
                <span>+ Pakai Tiang</span>
              </label>
            </div>

            {needPole && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Ukuran Pipa Tiang</label>
                  <select
                    value={poleType}
                    onChange={(e) => setPoleType(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-2 font-bold text-slate-900"
                  >
                    <option value="pipa_2">Pipa 2 Inch — Rp 175.000 / m</option>
                    <option value="pipa_3">Pipa 3 Inch — Rp 250.000 / m</option>
                    <option value="pipa_4">Pipa 4 Inch — Rp 375.000 / m</option>
                    <option value="pipa_6">Pipa 6 Inch — Rp 650.000 / m</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Tinggi Tiang (Meter)</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={poleHeightMeter}
                    onChange={(e) => setPoleHeightMeter(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-bold text-slate-900"
                  />
                </div>

                <div className="sm:col-span-2 pt-2 border-t border-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={needPondasi}
                      onChange={(e) => setNeedPondasi(e.target.checked)}
                      className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                    />
                    <span>+ Pondasi Cor Cakar Ayam + Angkur (Rp 850.000 / titik)</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Variabel Lapangan (Lantai & Scaffolding) */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
            <span className="font-black uppercase text-slate-700 flex items-center gap-1.5">
              <HardHat className="w-4 h-4 text-slate-600" />
              Elevasi Pemasangan Lapangan
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-600 mb-1">Lantai Pasang</label>
                <select
                  value={floorLevel}
                  onChange={(e) => setFloorLevel(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-2 font-bold text-slate-900"
                >
                  <option value="1">Lantai 1 (Ground)</option>
                  <option value="2">Lantai 2 (+25%)</option>
                  <option value="3">Lantai 3 (+50%)</option>
                  <option value="4">Lantai 4+ (Tinggi)</option>
                </select>
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={useScaffolding}
                    onChange={(e) => setUseScaffolding(e.target.checked)}
                    className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                  />
                  <span>Sewa Scaffolding (+250rb)</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Total Card & WhatsApp Action */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main Price Card */}
          <div className="bg-gradient-to-br from-rose-600 to-rose-700 text-white rounded-2xl p-5 sm:p-6 shadow-md shadow-rose-600/20 space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-rose-100 uppercase tracking-wider font-bold text-[10px]">
                Salsabilla Estimator Resmi
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-white font-bold text-[10px]">
                Cabang {activeBranch.city}
              </span>
            </div>

            <div className="border-t border-rose-500/60 pt-3">
              <span className="text-[11px] uppercase tracking-wider font-bold text-rose-100 block">
                Total Harga Jual Penawaran:
              </span>
              <div className="text-3xl sm:text-4xl font-black tracking-tight mt-1">
                {formatRupiah(pricing.finalSellingPrice)}
              </div>
              <p className="text-[11px] text-rose-100/90 mt-1.5 leading-relaxed">
                Sudah termasuk jasa instalasi {activeBranch.city} & garansi resmi 1 tahun.
              </p>
            </div>

            {/* Tombol Hijau Cepat: Kirim ke WhatsApp (1-Klik) */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-md shadow-emerald-500/30 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Kirim Estimasi ke WhatsApp (1-Klik)</span>
              </button>

              <a
                href="/projects"
                className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Lihat Dokumen Proyek Aktif</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Breakdown Card (HPP Internal Bengkel) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3 text-xs">
            <h2 className="font-black uppercase tracking-wider text-slate-900 text-xs flex justify-between items-center">
              <span>Rincian Komponen Penawaran</span>
              <span className="text-[10px] text-emerald-600 font-bold">Margin ~{pricing.actualMarginPercent}%</span>
            </h2>

            <div className="space-y-2 divide-y divide-slate-100">
              <div className="flex justify-between py-1">
                <span className="text-slate-600">Material Utama:</span>
                <span className="font-extrabold text-slate-900">{formatRupiah(pricing.material.materialSell)}</span>
              </div>

              {needPole && (
                <div className="flex justify-between py-1">
                  <span className="text-slate-600">Tiang & Pondasi:</span>
                  <span className="font-extrabold text-slate-900">{formatRupiah(pricing.construction.constructionSell)}</span>
                </div>
              )}

              <div className="flex justify-between py-1">
                <span className="text-slate-600">Jasa Pasang & Elevasi:</span>
                <span className="font-extrabold text-slate-900">{formatRupiah(pricing.installation.installationSell)}</span>
              </div>

              <div className="flex justify-between py-1">
                <span className="text-slate-600">Transportasi Armada:</span>
                <span className="font-extrabold text-slate-900">{formatRupiah(pricing.transport.transportSell)}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-between items-center font-bold">
              <span className="text-slate-500 uppercase text-[10px]">Estimasi Modal HPP:</span>
              <span className="text-slate-700">{formatRupiah(pricing.subtotalHpp)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Sticky Action Bar for Mobile Thumb Usage */}
      <div className="md:hidden fixed bottom-14 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 shadow-lg flex items-center justify-between gap-3">
        <div>
          <span className="text-[9px] uppercase font-bold text-slate-500 block">Total Estimasi:</span>
          <span className="text-base font-black text-rose-600">{formatRupiah(pricing.finalSellingPrice)}</span>
        </div>
        <button
          type="button"
          onClick={handleOpenWhatsApp}
          className="py-2.5 px-4 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Kirim WA</span>
        </button>
      </div>
    </div>
  );
}
