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

  // 2. Real Master Rates Salsabilla
  const rates = [
    { name: 'Huruf Timbul Stainless 304 Mirror', category: 'huruf_timbul', unit: 'cm', costPrice: 7500, sellPrice: 13500, notes: 'Outdoor anti karat' },
    { name: 'Huruf Timbul Stainless 201 Hairline', category: 'huruf_timbul', unit: 'cm', costPrice: 5500, sellPrice: 11000, notes: 'Serat garis hairline' },
    { name: 'Huruf Timbul Akrilik Solid + Spon EVA', category: 'huruf_timbul', unit: 'cm', costPrice: 6000, sellPrice: 12000, notes: 'Marga Cipta 3mm' },
    { name: 'Huruf Timbul Galvanis Cat Duco Oven', category: 'huruf_timbul', unit: 'cm', costPrice: 4200, sellPrice: 8500, notes: 'Cat duco glossy/matte' },
    { name: 'Neon Box Akrilik 2 Muka Cutting Oracal', category: 'neon_box', unit: 'm2', costPrice: 850000, sellPrice: 1600000, notes: 'Rangka hollow 4x4' },
    { name: 'Neon Box Akrilik 2 Muka Print UV', category: 'neon_box', unit: 'm2', costPrice: 1100000, sellPrice: 2000000, notes: 'Flatbed UV print' },
    { name: 'Neon Box Flexy Backlite Jerman', category: 'neon_box', unit: 'm2', costPrice: 650000, sellPrice: 1300000, notes: 'Hi-Res outdoor' },
    { name: 'Modul LED Samsung IP68 Waterproof', category: 'led', unit: 'pcs', costPrice: 3800, sellPrice: 6500, notes: '1.2W / 1.5W per modul' },
    { name: 'Trafo Rainproof 400W 12V', category: 'trafo', unit: 'pcs', costPrice: 185000, sellPrice: 285000, notes: 'Heavy duty outdoor' },
  ];

  for (const r of rates) {
    const existing = await prisma.materialRate.findFirst({ where: { name: r.name } });
    if (!existing) {
      await prisma.materialRate.create({ data: r });
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
