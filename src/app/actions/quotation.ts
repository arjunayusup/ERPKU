'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getBranchConfig } from '@/lib/branches';

export interface QuotationItemInput {
  itemType: string;
  description: string;
  specifications?: string;
  textOrLabel?: string;
  charCount?: number;
  heightCm?: number;
  widthCm?: number;
  material: string;
  lighting?: string;
  quantity: number;
  unitPrice: number;
  sellingPrice: number;
  unitHpp: number;
  hppPrice: number;
}

export interface CreateQuotationPayload {
  branch: string;
  projectName: string;
  clientName: string;
  picName?: string;
  clientPhone: string;
  installationAddress?: string;
  subtotal: number;
  discountType?: 'fixed' | 'percent';
  discountValue?: number;
  discountNote?: string;
  taxPercent?: number;
  taxAmount?: number;
  totalDeal: number;
  totalHpp: number;
  notes?: string;
  items: QuotationItemInput[];
}

// 1. CREATE QUOTATION ACTION
export async function createQuotationAction(payload: CreateQuotationPayload) {
  try {
    if (!payload.clientName || !payload.clientPhone) {
      return { success: false, error: 'Nama Klien dan Nomor WhatsApp wajib diisi.' };
    }

    if (!payload.items || payload.items.length === 0) {
      return { success: false, error: 'Minimal harus ada 1 item produk dalam penawaran.' };
    }

    // Normalisasi nomor telepon ke format internasional (62xxx)
    const rawPhone = payload.clientPhone.replace(/[^0-9]/g, '');
    let cleanPhone = rawPhone;
    if (rawPhone.startsWith('0')) {
      cleanPhone = '62' + rawPhone.substring(1);
    } else if (!rawPhone.startsWith('62')) {
      cleanPhone = '62' + rawPhone;
    }

    // 1. Auto-upsert Customer (Client Directory)
    let customer = await prisma.customer.findFirst({
      where: { phone: cleanPhone },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: payload.clientName,
          picName: payload.picName || payload.clientName,
          phone: cleanPhone,
          address: payload.installationAddress || '',
          isActive: true,
        },
      });
    } else {
      // Update data jika ada perubahan alamat atau nama
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: {
          name: payload.clientName,
          picName: payload.picName || customer.picName,
          address: payload.installationAddress || customer.address,
        },
      });
    }

    // 2. Generate Nomor Penawaran Resmi (e.g. QUO/SA/202609/015)
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const count = await prisma.project.count();
    const nextNumber = String(count + 1).padStart(3, '0');
    const projectNumber = `QUO-SA-${yearMonth}-${nextNumber}`;

    // 3. Create Project Header
    const project = await prisma.project.create({
      data: {
        projectNumber,
        title: payload.projectName || `Penawaran Signage - ${payload.clientName}`,
        branch: payload.branch || 'jakarta',
        clientName: payload.clientName,
        picName: payload.picName || '',
        clientPhone: cleanPhone,
        installationAddress: payload.installationAddress || '',
        status: 'draft',
        subtotal: payload.subtotal,
        discountType: payload.discountType || 'fixed',
        discountValue: payload.discountValue || 0,
        discountNote: payload.discountNote || '',
        taxPercent: payload.taxPercent || 0,
        taxAmount: payload.taxAmount || 0,
        totalDeal: payload.totalDeal,
        totalHpp: payload.totalHpp,
        realProfit: payload.totalDeal - payload.totalHpp,
        notes: payload.notes || '',
        clientId: customer.id,
        items: {
          create: payload.items.map((item) => ({
            itemType: item.itemType || 'custom',
            description: item.description,
            specifications: item.specifications || '',
            textOrLabel: item.textOrLabel || '',
            charCount: item.charCount || null,
            heightCm: item.heightCm || null,
            widthCm: item.widthCm || null,
            material: item.material || 'Standar',
            lighting: item.lighting || 'none',
            quantity: Number(item.quantity) || 1,
            unitPrice: Number(item.unitPrice) || 0,
            sellingPrice: Number(item.sellingPrice) || 0,
            unitHpp: Number(item.unitHpp) || 0,
            hppPrice: Number(item.hppPrice) || 0,
          })),
        },
      },
    });

    revalidatePath('/projects');
    revalidatePath('/dashboard');
    revalidatePath('/calculator');
    revalidatePath('/master');

    return { success: true, projectId: project.id, projectNumber };
  } catch (error: any) {
    console.error('Error creating quotation:', error);
    return { success: false, error: error.message || 'Gagal menyimpan penawaran.' };
  }
}

// 2. UPDATE QUOTATION ACTION
export async function updateQuotationAction(projectId: string, payload: Partial<CreateQuotationPayload>) {
  try {
    const existing = await prisma.project.findUnique({
      where: { id: projectId },
      include: { items: true },
    });

    if (!existing) {
      return { success: false, error: 'Proyek tidak ditemukan.' };
    }

    // Update items if provided
    if (payload.items) {
      await prisma.quotationItem.deleteMany({
        where: { projectId },
      });

      await prisma.quotationItem.createMany({
        data: payload.items.map((item) => ({
          projectId,
          itemType: item.itemType || 'custom',
          description: item.description,
          specifications: item.specifications || '',
          textOrLabel: item.textOrLabel || '',
          charCount: item.charCount || null,
          heightCm: item.heightCm || null,
          widthCm: item.widthCm || null,
          material: item.material || 'Standar',
          lighting: item.lighting || 'none',
          quantity: Number(item.quantity) || 1,
          unitPrice: Number(item.unitPrice) || 0,
          sellingPrice: Number(item.sellingPrice) || 0,
          unitHpp: Number(item.unitHpp) || 0,
          hppPrice: Number(item.hppPrice) || 0,
        })),
      });
    }

    // Update header
    const totalDeal = payload.totalDeal !== undefined ? payload.totalDeal : existing.totalDeal;
    const totalHpp = payload.totalHpp !== undefined ? payload.totalHpp : existing.totalHpp;

    await prisma.project.update({
      where: { id: projectId },
      data: {
        title: payload.projectName !== undefined ? payload.projectName : existing.title,
        branch: payload.branch !== undefined ? payload.branch : existing.branch,
        clientName: payload.clientName !== undefined ? payload.clientName : existing.clientName,
        picName: payload.picName !== undefined ? payload.picName : existing.picName,
        clientPhone: payload.clientPhone !== undefined ? payload.clientPhone : existing.clientPhone,
        installationAddress: payload.installationAddress !== undefined ? payload.installationAddress : existing.installationAddress,
        subtotal: payload.subtotal !== undefined ? payload.subtotal : existing.subtotal,
        discountType: payload.discountType !== undefined ? payload.discountType : existing.discountType,
        discountValue: payload.discountValue !== undefined ? payload.discountValue : existing.discountValue,
        discountNote: payload.discountNote !== undefined ? payload.discountNote : existing.discountNote,
        taxPercent: payload.taxPercent !== undefined ? payload.taxPercent : existing.taxPercent,
        taxAmount: payload.taxAmount !== undefined ? payload.taxAmount : existing.taxAmount,
        totalDeal,
        totalHpp,
        realProfit: totalDeal - totalHpp - existing.totalExpenses,
        notes: payload.notes !== undefined ? payload.notes : existing.notes,
      },
    });

    revalidatePath(`/projects/${projectId}`);
    revalidatePath('/projects');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error: any) {
    console.error('Error updating quotation:', error);
    return { success: false, error: error.message || 'Gagal memperbarui penawaran.' };
  }
}

// 3. SOFT DELETE ACTION (Hapus Aman)
export async function deleteQuotationAction(projectId: string) {
  try {
    await prisma.project.update({
      where: { id: projectId },
      data: { deletedAt: new Date() },
    });

    revalidatePath('/projects');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    console.error('Error soft deleting project:', error);
    return { success: false, error: error.message };
  }
}

// 4. RESTORE ACTION (Pulihkan dari Tempat Sampah)
export async function restoreQuotationAction(projectId: string) {
  try {
    await prisma.project.update({
      where: { id: projectId },
      data: { deletedAt: null },
    });

    revalidatePath('/projects');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    console.error('Error restoring project:', error);
    return { success: false, error: error.message };
  }
}
