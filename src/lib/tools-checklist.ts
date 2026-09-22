/**
 * Salsabilla Advertising - Master Checklist Peralatan Kerja & Standar K3 Lapangan
 */

export interface ToolItem {
  name: string;
  category: 'kelistrikan' | 'konstruksi' | 'fastener' | 'apd';
  checked?: boolean;
  isMandatory?: boolean;
  reason?: string;
}

export const MASTER_TOOLS: ToolItem[] = [
  // 1. KELISTRIKAN
  { name: 'Bor Cordless + Mata Obeng & Hex', category: 'kelistrikan' },
  { name: 'Kabel Roll 50 Meter Industri (Tahan Cuaca)', category: 'kelistrikan' },
  { name: 'Multimeter Digital & Tespen', category: 'kelistrikan' },
  { name: 'Tang Kupas Kabel & Tang Kombinasi', category: 'kelistrikan' },
  { name: 'Isolasi Listrik Unibel & Wago Quick Connector', category: 'kelistrikan' },
  { name: 'Trafo Rainproof 12V Cadangan (100W/400W)', category: 'kelistrikan' },

  // 2. KONSTRUKSI & PENGUKURAN
  { name: 'Waterpass Magnet Presisi (Cek Ketegakan)', category: 'konstruksi' },
  { name: 'Meteran Laser & Meteran Roll 10m', category: 'konstruksi' },
  { name: 'Mesin Bor Hammer Beton + Mata Bor M10/M12', category: 'konstruksi' },
  { name: 'Mesin Las Inverter Portable & Kawat Las RD-260', category: 'konstruksi' },
  { name: 'Mesin Gerinda Tangan & Batu Potong Besi', category: 'konstruksi' },
  { name: 'Palu Bodem / Hammer Besi 2kg', category: 'konstruksi' },

  // 3. FASTENER & SEALANT
  { name: 'Lem Sealant Neutral Silikon Bening / Hitam', category: 'fastener' },
  { name: 'Baut Dynabolt Besi M8, M10 & M12', category: 'fastener' },
  { name: 'Baut Tapping Drilling & Sekrup Rangka', category: 'fastener' },
  { name: 'Lakban Kertas & Double Tape 3M VHB Foam', category: 'fastener' },

  // 4. APD & KESELAMATAN K3 (KETINGGIAN)
  { name: 'Full Body Harness K3 (Double Big Hook)', category: 'apd' },
  { name: 'Helm Safety Proyek (Standar SNI)', category: 'apd' },
  { name: 'Scaffolding / Steger Lengkap Catwalk & Roda Rem', category: 'apd' },
  { name: 'Tangga Lipat Aluminium Heavy Duty 3-4m', category: 'apd' },
  { name: 'Sarung Tangan Safety Katun / Karet', category: 'apd' },
];

/**
 * Menganalisis kebutuhan alat kerja secara otomatis berdasarkan rincian item proyek
 */
export function getRecommendedToolsForProject(projectItems: any[] = []): ToolItem[] {
  let hasLighting = false;
  let hasPoleOrHeavy = false;
  let hasFasad = false;
  let hasScaffolding = false;

  for (const it of projectItems) {
    const desc = (it.description || '').toLowerCase();
    const mat = (it.material || '').toLowerCase();
    const type = (it.itemType || '').toLowerCase();

    if (it.lighting && it.lighting !== 'none') hasLighting = true;
    if (mat.includes('led') || desc.includes('led') || desc.includes('lampu')) hasLighting = true;

    if (type === 'tiang' || desc.includes('tiang') || desc.includes('pipa') || desc.includes('cakar')) {
      hasPoleOrHeavy = true;
    }
    if (type === 'fasad' || desc.includes('fasad') || desc.includes('acp') || desc.includes('kisi')) {
      hasFasad = true;
    }
    if (desc.includes('steger') || desc.includes('scaffolding')) {
      hasScaffolding = true;
    }
  }

  return MASTER_TOOLS.map((tool) => {
    let checked = false;
    let isMandatory = false;
    let reason = '';

    // Standar wajib semua proyek
    if (
      tool.name.includes('Bor Cordless') ||
      tool.name.includes('Meteran') ||
      tool.name.includes('Bor Hammer') ||
      tool.name.includes('Sealant') ||
      tool.name.includes('Lakban') ||
      tool.name.includes('Sarung Tangan')
    ) {
      checked = true;
      isMandatory = true;
    }

    // Kelistrikan
    if (tool.category === 'kelistrikan') {
      if (hasLighting) {
        checked = true;
        isMandatory = true;
        reason = 'Proyek memuat modul lampu LED / trafo';
      }
    }

    // Konstruksi & Tiang / Fasad
    if (tool.category === 'konstruksi') {
      if (hasPoleOrHeavy) {
        checked = true;
        isMandatory = true;
        reason = 'Memerlukan perakitan tiang pipa & angkur cor';
      } else if (hasFasad) {
        checked = true;
        reason = 'Pemasangan rangka hollow & lembaran fasad';
      }
    }

    // APD Ketinggian
    if (tool.category === 'apd') {
      if (hasScaffolding || hasPoleOrHeavy || hasFasad) {
        checked = true;
        isMandatory = true;
        reason = 'Wajib K3 untuk pekerjaan elevasi / rangka fasad & tiang';
      } else if (tool.name.includes('Tangga')) {
        checked = true;
      }
    }

    return {
      ...tool,
      checked,
      isMandatory,
      reason,
    };
  });
}
