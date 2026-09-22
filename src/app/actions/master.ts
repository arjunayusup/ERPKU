'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

// ==========================================
// 1. MATERIAL RATE CRUD ACTIONS
// ==========================================

export async function createMaterialRateAction(formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const category = formData.get('category') as string;
    const unit = formData.get('unit') as string;
    const costPrice = Number(formData.get('costPrice')) || 0;
    const sellPrice = Number(formData.get('sellPrice')) || 0;
    const notes = formData.get('notes') as string || '';

    if (!name || !category || !unit) {
      return { success: false, error: 'Nama, kategori, dan satuan wajib diisi.' };
    }

    await prisma.materialRate.create({
      data: {
        name,
        category,
        unit,
        costPrice,
        sellPrice,
        notes,
        isActive: true,
      },
    });

    revalidatePath('/master');
    revalidatePath('/calculator');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function updateMaterialRateAction(id: string, formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const category = formData.get('category') as string;
    const unit = formData.get('unit') as string;
    const costPrice = Number(formData.get('costPrice')) || 0;
    const sellPrice = Number(formData.get('sellPrice')) || 0;
    const notes = formData.get('notes') as string || '';

    await prisma.materialRate.update({
      where: { id },
      data: {
        name,
        category,
        unit,
        costPrice,
        sellPrice,
        notes,
      },
    });

    revalidatePath('/master');
    revalidatePath('/calculator');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function deleteMaterialRateAction(id: string) {
  try {
    await prisma.materialRate.delete({
      where: { id },
    });

    revalidatePath('/master');
    revalidatePath('/calculator');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ==========================================
// 2. CLIENT (CUSTOMER) CRUD ACTIONS
// ==========================================

export async function createClientAction(formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const picName = formData.get('picName') as string;
    const phone = formData.get('phone') as string;
    const address = formData.get('address') as string;

    if (!name || !phone) {
      return { success: false, error: 'Nama Usaha dan Nomor WhatsApp wajib diisi.' };
    }

    const rawPhone = phone.replace(/[^0-9]/g, '');
    let cleanPhone = rawPhone;
    if (rawPhone.startsWith('0')) cleanPhone = '62' + rawPhone.substring(1);
    else if (!rawPhone.startsWith('62')) cleanPhone = '62' + rawPhone;

    await prisma.customer.create({
      data: {
        name,
        picName: picName || name,
        phone: cleanPhone,
        address: address || '',
        isActive: true,
      },
    });

    revalidatePath('/master');
    revalidatePath('/calculator');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function updateClientAction(id: string, formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const picName = formData.get('picName') as string;
    const phone = formData.get('phone') as string;
    const address = formData.get('address') as string;

    const rawPhone = phone.replace(/[^0-9]/g, '');
    let cleanPhone = rawPhone;
    if (rawPhone.startsWith('0')) cleanPhone = '62' + rawPhone.substring(1);
    else if (!rawPhone.startsWith('62')) cleanPhone = '62' + rawPhone;

    await prisma.customer.update({
      where: { id },
      data: {
        name,
        picName,
        phone: cleanPhone,
        address,
      },
    });

    revalidatePath('/master');
    revalidatePath('/calculator');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function deleteClientAction(id: string) {
  try {
    await prisma.customer.delete({
      where: { id },
    });

    revalidatePath('/master');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ==========================================
// 3. TEAM MEMBER (KARYAWAN) CRUD ACTIONS
// ==========================================

export async function createTeamMemberAction(formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const role = formData.get('role') as string || 'TECHNICIAN';
    const notes = formData.get('notes') as string || '';

    if (!name || !phone) {
      return { success: false, error: 'Nama personil dan nomor WhatsApp wajib diisi.' };
    }

    const rawPhone = phone.replace(/[^0-9]/g, '');
    let cleanPhone = rawPhone;
    if (rawPhone.startsWith('0')) cleanPhone = '62' + rawPhone.substring(1);
    else if (!rawPhone.startsWith('62')) cleanPhone = '62' + rawPhone;

    await prisma.teamMember.create({
      data: {
        name,
        phone: cleanPhone,
        role,
        notes,
        status: 'ACTIVE',
      },
    });

    revalidatePath('/master');
    revalidatePath('/schedule');
    revalidatePath('/projects');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function updateTeamMemberAction(id: string, formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const role = formData.get('role') as string || 'TECHNICIAN';
    const status = formData.get('status') as string || 'ACTIVE';
    const notes = formData.get('notes') as string || '';

    const rawPhone = phone.replace(/[^0-9]/g, '');
    let cleanPhone = rawPhone;
    if (rawPhone.startsWith('0')) cleanPhone = '62' + rawPhone.substring(1);
    else if (!rawPhone.startsWith('62')) cleanPhone = '62' + rawPhone;

    await prisma.teamMember.update({
      where: { id },
      data: {
        name,
        phone: cleanPhone,
        role,
        status,
        notes,
      },
    });

    revalidatePath('/master');
    revalidatePath('/schedule');
    revalidatePath('/projects');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function toggleTeamMemberStatusAction(id: string) {
  try {
    const member = await prisma.teamMember.findUnique({ where: { id } });
    if (!member) return { success: false, error: 'Personil tidak ditemukan.' };

    const newStatus = member.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    await prisma.teamMember.update({
      where: { id },
      data: { status: newStatus },
    });

    revalidatePath('/master');
    revalidatePath('/schedule');
    revalidatePath('/projects');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function deleteTeamMemberAction(id: string) {
  try {
    await prisma.teamMember.delete({
      where: { id },
    });

    revalidatePath('/master');
    revalidatePath('/schedule');
    revalidatePath('/projects');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

