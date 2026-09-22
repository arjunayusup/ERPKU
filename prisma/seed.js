const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding official data for Salsabilla Advertising...');

  // 1. Users (Admin / Owner & Workshop Head)
  const passwordHashAdmin = await bcrypt.hash('admin123', 10);
  const passwordHashBengkel = await bcrypt.hash('bengkel123', 10);

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: passwordHashAdmin,
      name: 'Pak Juju Abdul Rohim (Owner/Admin)',
      role: 'admin',
      phone: '082318914774'
    }
  });

  await prisma.user.upsert({
    where: { username: 'bengkel' },
    update: {},
    create: {
      username: 'bengkel',
      password: passwordHashBengkel,
      name: 'Kang Asep (Kepala Bengkel)',
      role: 'workshop',
      phone: '082315596769'
    }
  });

  // 2. Official Master Rates Salsabilla Advertising (Update 2026)
  const rates = [
    // A. HURUF TIMBUL (Per cm tinggi/huruf)
    { name: 'Huruf Timbul Galvanis Cat Duco (Non-Lampu)', category: 'huruf_timbul', unit: 'cm', costPrice: 5000, sellPrice: 10000, notes: 'Plat galvanis bending las + finishing cat duco oven' },
    { name: 'Huruf Timbul Akrilik Solid (Non-Lampu)', category: 'huruf_timbul', unit: 'cm', costPrice: 5000, sellPrice: 10000, notes: 'Akrilik solid Marga Cipta 3mm' },
    { name: 'Huruf Timbul Stainless Steel (Non-Lampu)', category: 'huruf_timbul', unit: 'cm', costPrice: 6500, sellPrice: 12000, notes: 'Stainless steel mirror / hairline 201/304' },
    { name: 'Huruf Timbul Akrilik Dual Glow (Cahaya Depan & Belakang)', category: 'huruf_timbul', unit: 'cm', costPrice: 9500, sellPrice: 18000, notes: 'Akrilik muka & siluet belakang menyala LED' },
    { name: 'Huruf Timbul Stainless Biasa + Lampu LED', category: 'huruf_timbul', unit: 'cm', costPrice: 10500, sellPrice: 20000, notes: 'Badan stainless + backlight LED modul' },
    { name: 'Huruf Timbul Stainless Gold Titanium + Lampu LED', category: 'huruf_timbul', unit: 'cm', costPrice: 13500, sellPrice: 25000, notes: 'Stainless mirror gold titanium + LED modul' },

    // B. NEON BOX (Per m2)
    { name: 'Neon Box 1 Sisi Akrilik + Lampu TL (Tanpa Tiang)', category: 'neon_box', unit: 'm2', costPrice: 1050000, sellPrice: 1900000, notes: 'Rangka hollow 2x2, visual akrilik, lampu TL/LED tube' },
    { name: 'Neon Box 2 Sisi Akrilik + Lampu TL (Tanpa Tiang)', category: 'neon_box', unit: 'm2', costPrice: 1550000, sellPrice: 2850000, notes: 'Rangka hollow 2x2, visual akrilik bolak-balik' },

    // C. PAPAN REKLAME & BILLBOARD (Per m2)
    { name: 'Papan Reklame Flexi Korea (Tanpa Tiang)', category: 'reklame', unit: 'm2', costPrice: 520000, sellPrice: 950000, notes: 'Rangka hollow 3x3, plat galvalum backplate, flexi korea printing' },
    { name: 'Rangka Billboard Raksasa Besi Siku Heavy Duty', category: 'reklame', unit: 'm2', costPrice: 750000, sellPrice: 1350000, notes: 'Konstruksi siku 4x4 / 5x5 + pengaku angin' },

    // D. TIANG KONSTRUKSI & PONDASI (Per meter / titik)
    { name: 'Tiang Pipa Besi Medium 2 Inch', category: 'tiang', unit: 'm', costPrice: 105000, sellPrice: 175000, notes: 'Untuk neon box kecil <= 1m' },
    { name: 'Tiang Pipa Besi Medium 3 Inch', category: 'tiang', unit: 'm', costPrice: 150000, sellPrice: 250000, notes: 'Untuk neon box standar & plang nama ruko' },
    { name: 'Tiang Pipa Besi Medium 4 Inch', category: 'tiang', unit: 'm', costPrice: 230000, sellPrice: 375000, notes: 'Untuk papan reklame s/d 3x2m' },
    { name: 'Tiang Pipa Besi Tebal 6 Inch', category: 'tiang', unit: 'm', costPrice: 420000, sellPrice: 650000, notes: 'Untuk tiang pylon / billboard besar' },
    { name: 'Pondasi Cor Cakar Ayam + Angkur Baseplate', category: 'tiang', unit: 'titik', costPrice: 500000, sellPrice: 850000, notes: 'Galian pondasi beton K225 + dynabolt angkur' },

    // F. BACKGROUND FASAD & PAPAN (Per m2)
    { name: 'ACP Seven 3mm PVDF + Rangka Hollow 4x4', category: 'fasad', unit: 'm2', costPrice: 450000, sellPrice: 750000, notes: 'Aluminium Composite Panel Seven tebal 3mm + rangka hollow galvanis 4x4 anti karat' },
    { name: 'Plat Galvanil Duco + Rangka Hollow', category: 'fasad', unit: 'm2', costPrice: 400000, sellPrice: 650000, notes: 'Plat galvanil 0.8mm finishing cat duco semi-gloss / doff oven + rangka' },
    { name: 'Kisi-kisi Hollow Galvanis 2x4', category: 'fasad', unit: 'm2', costPrice: 350000, sellPrice: 550000, notes: 'Bilah kisi-kisi hollow galvanis 2x4 finish cat duco' },
    { name: 'Multiplek 12mm / Melamin Backwall', category: 'fasad', unit: 'm2', costPrice: 250000, sellPrice: 450000, notes: 'Multiplek tebal 12mm lapis melamin / HPL untuk indoor mall & ruko' },

    // G. OPERASIONAL KHUSUS LAPANGAN
    { name: 'Sewa Scaffolding / Steger per Set', category: 'operasional', unit: 'set/hari', costPrice: 35000, sellPrice: 65000, notes: 'Main frame, cross brace, catwalk & roda rem transport' },
    { name: 'Jasa Bongkar Reklame Lama', category: 'operasional', unit: 'lot', costPrice: 250000, sellPrice: 500000, notes: 'Penurunan plang lama, perapihan kabel eksisting & pembersihan area' },
    { name: 'Jasa Tarik Kabel Listrik Tambahan', category: 'operasional', unit: 'meter', costPrice: 15000, sellPrice: 25000, notes: 'Kabel NYM 2x1.5 standar SNI + pipa konduit pelindung' },

    // H. LOGO & EMBLEM TIMBUL 3D (Per cm2 / unit)
    { name: 'Logo Akrilik 3D Nyala Depan LED', category: 'logo', unit: 'cm2', costPrice: 35, sellPrice: 70, notes: 'Akrilik laser cut presisi + visual stiker Oracal + LED modul IP68' },
    { name: 'Logo Stainless Mirror 3D Backlight', category: 'logo', unit: 'cm2', costPrice: 45, sellPrice: 85, notes: 'Stainless 201 mirror/gold + siluet backlight LED' },
  ];

  // Bersihkan tarif lama dan masukkan tarif resmi baru
  await prisma.materialRate.deleteMany({});
  for (const r of rates) {
    await prisma.materialRate.create({ data: r });
  }

  // 3. Team Members / Karyawan Lapangan Salsabilla Advertising
  const teamMembers = [
    { name: 'Kang Asep', phone: '082315596769', role: 'LEAD_INSTALLER', status: 'ACTIVE', notes: 'Penanggung jawab lapangan & kelistrikan signage' },
    { name: 'Pak Joko', phone: '081288991122', role: 'DRIVER', status: 'ACTIVE', notes: 'Driver armada pikap Gran Max B 9147 TPA & logistik' },
    { name: 'Rian Hidayat', phone: '081399882233', role: 'TECHNICIAN', status: 'ACTIVE', notes: 'Teknisi pasang akrilik, modul LED & finishing' },
    { name: 'Dedi Suryadi', phone: '085711223344', role: 'WELDER', status: 'ACTIVE', notes: 'Tukang las konstruksi rangka hollow & tiang pipa' },
    { name: 'Dani Kurnia', phone: '087822334455', role: 'HELPER', status: 'ACTIVE', notes: 'Pembantu umum, angkut barang & safety assistant' },
  ];

  for (const m of teamMembers) {
    const existing = await prisma.teamMember.findFirst({ where: { phone: m.phone } });
    if (!existing) {
      await prisma.teamMember.create({ data: m });
    }
  }


  // 3. Official Sample Project: Ibu Bella (Ref: Surat Penawaran Asli Salsabilla)
  const sampleProject = await prisma.project.upsert({
    where: { projectNumber: 'PRJ-202608-011' },
    update: {
      title: 'Pekerjaan Signage KOSE, LUCENTE, NAIA & Board Fasad',
      clientName: 'Ibu Bella',
      clientPhone: '0812-9988-7766',
      installationAddress: 'Area Jakarta (Gedung Komersial)',
      status: 'ready_install',
      totalHpp: 14200000,
      totalDeal: 23673000,
      totalExpenses: 650000,
      realProfit: 8823000,
    },
    create: {
      projectNumber: 'PRJ-202608-011',
      title: 'Pekerjaan Signage KOSE, LUCENTE, NAIA & Board Fasad',
      clientName: 'Ibu Bella',
      clientPhone: '0812-9988-7766',
      installationAddress: 'Area Jakarta (Gedung Komersial)',
      status: 'ready_install',
      totalHpp: 14200000,
      totalDeal: 23673000,
      totalExpenses: 650000,
      realProfit: 8823000,
    }
  });

  // Hapus item lama jika ada lalu buat item persis seperti di PDF asli
  await prisma.quotationItem.deleteMany({ where: { projectId: sampleProject.id } });

  await prisma.quotationItem.create({
    data: {
      projectId: sampleProject.id,
      itemType: 'huruf_timbul',
      description: 'Signage KOSE outdoor',
      textOrLabel: 'KOSE',
      heightCm: 45.7,
      widthCm: 91.0,
      material: 'Akrilik Solid Marga Cipta',
      lighting: 'frontlit',
      ledCount: 65,
      trafoWatt: 100,
      hppPrice: 2350000,
      sellingPrice: 3973000,
    }
  });

  await prisma.quotationItem.create({
    data: {
      projectId: sampleProject.id,
      itemType: 'huruf_timbul',
      description: 'Signage LUCENTE outdoor',
      textOrLabel: 'LUCENTE',
      heightCm: 60.1,
      widthCm: 60.1,
      material: 'Akrilik Solid Marga Cipta',
      lighting: 'frontlit',
      ledCount: 45,
      trafoWatt: 100,
      hppPrice: 1450000,
      sellingPrice: 2395000,
    }
  });

  await prisma.quotationItem.create({
    data: {
      projectId: sampleProject.id,
      itemType: 'huruf_timbul',
      description: 'Signage NAIA outdoor',
      textOrLabel: 'NAIA',
      heightCm: 42.7,
      widthCm: 118.1,
      material: 'Akrilik Solid Marga Cipta',
      lighting: 'frontlit',
      ledCount: 75,
      trafoWatt: 150,
      hppPrice: 2950000,
      sellingPrice: 4975000,
    }
  });

  await prisma.quotationItem.create({
    data: {
      projectId: sampleProject.id,
      itemType: 'custom',
      description: 'Board Reklame Fasad Outdoor',
      textOrLabel: 'BOARD FASAD',
      heightCm: 139.0,
      widthCm: 518.2,
      material: 'Rangka Hollow 4x4 cm + Plat Cat Duco',
      lighting: 'none',
      ledCount: 0,
      trafoWatt: 0,
      hppPrice: 7450000,
      sellingPrice: 12330000,
    }
  });

  // Sample Expenses
  await prisma.projectExpense.deleteMany({ where: { projectId: sampleProject.id } });
  await prisma.projectExpense.create({
    data: {
      projectId: sampleProject.id,
      date: '2026-08-14',
      category: 'material_lokal',
      description: 'Dynabolt M12 (40 pcs) + Lem Sealant Silikon Neutral Dextone',
      amount: 180000,
    }
  });
  await prisma.projectExpense.create({
    data: {
      projectId: sampleProject.id,
      date: '2026-08-15',
      category: 'bensin',
      description: 'Bensin & Tol Pikap Gran Max Cabang Meruya Jakarta',
      amount: 220000,
    }
  });
  await prisma.projectExpense.create({
    data: {
      projectId: sampleProject.id,
      date: '2026-08-15',
      category: 'makan_lembur',
      description: 'Uang makan lembur teknisi instalasi malam (4 orang)',
      amount: 250000,
    }
  });

  // Sample Schedule Salsabilla
  await prisma.installationSchedule.deleteMany({ where: { projectId: sampleProject.id } });
  await prisma.installationSchedule.create({
    data: {
      projectId: sampleProject.id,
      date: '2026-08-16',
      timeSlot: '09:00 - 16:00 WIB (Siang)',
      teamName: 'Tim 1 Cabang Jakarta (Pikap B 9147 TPA)',
      toolsChecklist: JSON.stringify([
        { name: 'Scaffolding Main Frame 3 Set + Catwalk + Roda', checked: true },
        { name: 'Mesin Bor Beton Hammer Bosch + Mata Bor 10mm & 12mm', checked: true },
        { name: 'Full Body Harness & Helm Safety K3 (4 Set)', checked: true },
        { name: 'Kabel Roll 50 Meter + Steker Industri', checked: true },
        { name: 'Dynabolt M12 (40 pcs) & Lem Silikon Bening Dextone', checked: true },
        { name: 'Trafo Cadangan 150W & 400W Rainproof 12V', checked: true },
        { name: 'Tangga Lipat Aluminium 4 Meter', checked: true },
        { name: 'Kunci Pas 14 & 17 untuk Pengencangan Dynabolt', checked: true }
      ]),
      status: 'scheduled'
    }
  });

  console.log('Seeding finished successfully with real Salsabilla project data!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
