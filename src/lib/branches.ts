export interface BranchConfig {
  id: string;
  code: string;
  name: string;
  shortName: string;
  city: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  bankName: string;
  bankAccount: string;
  bankAccountName: string;
  signerName: string;
  signerRole: string;
  signatureImage: string;
  logo: string;
  defaultTerms: string[];
  notes?: string;
  active: boolean;
}

export const SALSABILLA_BRANCHES: Record<string, BranchConfig> = {
  jakarta: {
    id: 'jakarta',
    code: 'JKT',
    name: 'Salsabilla Advertising Jakarta',
    shortName: 'Cabang Jakarta',
    city: 'Jakarta',
    address: 'Jl. Meruya Selatan No. 20, RT.9/RW.4, Meruya Selatan, Kec. Kembangan, Kota Jakarta Barat, Jakarta 11650',
    phone: '(021) 21262496 / 082318914774',
    whatsapp: '082318914774 / 082315596769',
    email: 'salsabilladv13@gmail.com / earlyida92@gmail.com',
    website: 'www.jasareklameneonbox.com',
    bankName: 'BCA',
    bankAccount: '0540763461',
    bankAccountName: 'JUJU ABDUL ROHIM',
    signerName: 'Juju Abdul Rohim',
    signerRole: 'Pimpinan Cabang / Operational Head',
    signatureImage: '/signature_juju.jpg',
    logo: '/salsabilla-mark.png',
    defaultTerms: [
      'Harga sudah termasuk biaya pemasangan untuk area Jakarta.',
      'Tidak termasuk pajak reklame.',
      'Lama pengerjaan 12 hari kerja.',
      'Pekerjaan dimulai setelah DP dibayar minimal 50%, 50% setelah pekerjaan dinyatakan telah diterima dengan baik.',
      'Pembayaran ditransfer via rekening resmi perusahaan.'
    ],
    notes: 'Alamat dan kontak telah divalidasi sesuai dokumen penawaran fisik resmi.',
    active: true,
  },
  bandung: {
    id: 'bandung',
    code: 'BDG',
    name: 'Salsabilla Advertising Bandung / Cimahi',
    shortName: 'Cabang Bandung',
    city: 'Bandung / Cimahi',
    address: 'Jl. Melong Raya Gang Perkutut Blok 4 No. 138, RT. 003 / RW. 10, Melong, Cimahi Selatan, Kota Cimahi, Jawa Barat 40534',
    phone: '082318914774 / 082315596769',
    whatsapp: '082318914774 / 082315596769',
    email: 'salsabilladv13@gmail.com',
    website: 'www.jasareklameneonbox.com',
    bankName: 'BCA',
    bankAccount: '0540763461',
    bankAccountName: 'JUJU ABDUL ROHIM',
    signerName: 'Juju Abdul Rohim',
    signerRole: 'Operational Head',
    signatureImage: '/signature_juju.jpg',
    logo: '/salsabilla-mark.png',
    defaultTerms: [
      'Harga sudah termasuk biaya pemasangan untuk area Bandung & Cimahi.',
      'Tidak termasuk pajak reklame & izin koordinasi lingkungan luar ruang.',
      'Lama pengerjaan 10-14 hari kerja.',
      'Pekerjaan dimulai setelah DP dibayar minimal 50%, 50% setelah pekerjaan dinyatakan telah diterima dengan baik.',
      'Pembayaran ditransfer via rekening resmi perusahaan.'
    ],
    // TODO: Konfirmasi admin jika ada rekening bank atau PIC cabang khusus wilayah Bandung
    notes: 'TODO: Konfirmasi jika ada rekening cabang terpisah untuk operasional Bandung.',
    active: true,
  },
  tangerang: {
    id: 'tangerang',
    code: 'TNG',
    name: 'Salsabilla Advertising Tangerang',
    shortName: 'Cabang Tangerang',
    city: 'Tangerang',
    address: 'RM8W+253, RT.002/RW.005, Ketapang, Kec. Cipondoh, Kota Tangerang, Banten 15148',
    phone: '081318486932',
    whatsapp: '081318486932',
    email: 'salsabilladv13@gmail.com',
    website: 'www.jasareklameneonbox.com',
    bankName: 'BCA',
    bankAccount: '0540763461',
    bankAccountName: 'JUJU ABDUL ROHIM',
    signerName: 'Juju Abdul Rohim',
    signerRole: 'Operational Head',
    signatureImage: '/signature_juju.jpg',
    logo: '/salsabilla-mark.png',
    defaultTerms: [
      'Harga sudah termasuk biaya pemasangan untuk area Tangerang & sekitarnya.',
      'Tidak termasuk pajak reklame.',
      'Lama pengerjaan 10-14 hari kerja.',
      'Pekerjaan dimulai setelah DP dibayar minimal 50%, 50% setelah pekerjaan dinyatakan telah diterima dengan baik.',
      'Pembayaran ditransfer via rekening resmi perusahaan.'
    ],
    // TODO: Konfirmasi rekening bank khusus cabang Tangerang bila ada
    notes: 'TODO: Konfirmasi rekening bank khusus cabang Tangerang & nama PIC jika terpisah.',
    active: true,
  }
};

export const DEFAULT_BRANCH_ID = 'jakarta';

export function getBranchConfig(branchId?: string): BranchConfig {
  if (!branchId || !SALSABILLA_BRANCHES[branchId]) {
    return SALSABILLA_BRANCHES[DEFAULT_BRANCH_ID];
  }
  return SALSABILLA_BRANCHES[branchId];
}

export function getAllBranches(): BranchConfig[] {
  return Object.values(SALSABILLA_BRANCHES).filter(b => b.active);
}
