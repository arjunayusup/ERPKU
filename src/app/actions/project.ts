'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export async function addExpenseAction(formData: FormData): Promise<void> {
  const projectId = formData.get('projectId') as string;
  const date = formData.get('date') as string || new Date().toISOString().split('T')[0];
  const category = formData.get('category') as string;
  const description = formData.get('description') as string;
  const amount = Number(formData.get('amount')) || 0;

  if (!projectId || !description || amount <= 0) {
    return;
  }

  // 1. Create Expense
  await prisma.projectExpense.create({
    data: {
      projectId,
      date,
      category,
      description,
      amount,
    },
  });

  // 2. Recalculate Project Expenses & Real Profit
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { expenses: true },
  });

  if (project) {
    const totalExpenses = project.expenses.reduce((acc, exp) => acc + exp.amount, 0);
    const realProfit = project.totalDeal - project.totalHpp - totalExpenses;

    await prisma.project.update({
      where: { id: projectId },
      data: {
        totalExpenses,
        realProfit,
      },
    });
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath('/dashboard');
}

export async function updateProjectStatusAction(projectId: string, status: string) {
  try {
    await prisma.project.update({
      where: { id: projectId },
      data: { status },
    });

    revalidatePath(`/projects/${projectId}`);
    revalidatePath('/projects');
    revalidatePath('/schedule');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    console.error('Error updating project status:', error);
    return { success: false, error: error.message };
  }
}

export async function updateItemFabricationSpecAction(payload: {
  itemId: string;
  projectId: string;
  fabricationNotes: string;
  poLedCount?: number;
  poTrafoType?: string;
  qcStatus?: string;
}) {
  try {
    const item = await prisma.quotationItem.findUnique({
      where: { id: payload.itemId },
    });

    if (!item) {
      return { success: false, error: 'Item tidak ditemukan.' };
    }

    const existingSnap = typeof item.specSnapshot === 'string'
      ? JSON.parse(item.specSnapshot)
      : (item.specSnapshot || {});

    const updatedSnapshot = {
      ...existingSnap,
      fabricationNotes: payload.fabricationNotes.trim(),
      poLedCount: payload.poLedCount || existingSnap.poLedCount || undefined,
      poTrafoType: payload.poTrafoType ? payload.poTrafoType.trim() : existingSnap.poTrafoType || undefined,
      updatedAt: new Date().toISOString(),
    };

    await prisma.quotationItem.update({
      where: { id: payload.itemId },
      data: {
        specSnapshot: updatedSnapshot,
        qcNotes: payload.fabricationNotes.trim() || undefined,
        ...(payload.poLedCount !== undefined && payload.poLedCount > 0 ? { ledCount: payload.poLedCount } : {}),
        ...(payload.qcStatus ? { qcStatus: payload.qcStatus } : {}),
      },
    });

    revalidatePath(`/projects/${payload.projectId}`);
    revalidatePath(`/documents/${payload.projectId}/spk`);
    return { success: true };
  } catch (error: any) {
    console.error('Error updating fabrication spec:', error);
    return { success: false, error: error.message || 'Gagal menyimpan instruksi fabrikasi.' };
  }
}

export async function upsertInstallationScheduleAction(payload: {
  projectId: string;
  date: string;
  timeSlot: string;
  teamName: string;
  assignedMembers?: any[];
  toolsChecklist?: any[];
}) {
  try {
    const existing = await prisma.installationSchedule.findFirst({
      where: { projectId: payload.projectId },
    });

    const checklistString = payload.toolsChecklist
      ? JSON.stringify(payload.toolsChecklist)
      : JSON.stringify([
          { item: 'Scaffolding Main Frame / Tangga Lipat Aluminium', checked: true },
          { item: 'Mesin Bor Beton Hammer + Mata Bor Dynabolt M10/M12', checked: true },
          { item: 'Baut Dynabolt, Sekrup & Sealant Silikon Bening', checked: true },
          { item: 'Trafo Rainproof Cadangan & Kabel Roll Industri', checked: true },
          { item: 'Full Body Harness K3 & Helm Safety Proyek', checked: true },
        ]);

    const assignedMembersString = payload.assignedMembers
      ? JSON.stringify(payload.assignedMembers)
      : undefined;

    if (existing) {
      await prisma.installationSchedule.update({
        where: { id: existing.id },
        data: {
          date: payload.date,
          timeSlot: payload.timeSlot,
          teamName: payload.teamName,
          toolsChecklist: checklistString,
          ...(assignedMembersString ? { assignedMembers: assignedMembersString } : {}),
        },
      });
    } else {
      await prisma.installationSchedule.create({
        data: {
          projectId: payload.projectId,
          date: payload.date,
          timeSlot: payload.timeSlot,
          teamName: payload.teamName,
          toolsChecklist: checklistString,
          assignedMembers: assignedMembersString,
          status: 'scheduled',
        },
      });
    }

    // Perbarui status proyek menjadi ready_install (Siap Pasang) jika masih di tahap awal/pabrikasi
    const project = await prisma.project.findUnique({
      where: { id: payload.projectId },
    });
    if (project && (project.status === 'draft' || project.status === 'in_production')) {
      await prisma.project.update({
        where: { id: payload.projectId },
        data: { status: 'ready_install' },
      });
    }

    revalidatePath(`/projects/${payload.projectId}`);
    revalidatePath('/projects');
    revalidatePath('/schedule');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    console.error('Error saving installation schedule:', error);
    return { success: false, error: error.message || 'Gagal menyimpan jadwal pemasangan.' };
  }
}

export async function updateInstallationScheduleStatusAction(scheduleId: string, status: string) {
  try {
    const schedule = await prisma.installationSchedule.update({
      where: { id: scheduleId },
      data: {
        status,
        ...(status === 'completed' ? { completedAt: new Date() } : {}),
      },
      include: { project: true },
    });

    if (status === 'completed' && schedule.projectId) {
      await prisma.project.update({
        where: { id: schedule.projectId },
        data: { status: 'completed' },
      });
    } else if (status === 'installing' && schedule.projectId) {
      await prisma.project.update({
        where: { id: schedule.projectId },
        data: { status: 'installing' },
      });
    }

    revalidatePath('/schedule');
    revalidatePath('/projects');
    if (schedule.projectId) revalidatePath(`/projects/${schedule.projectId}`);
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    console.error('Error updating installation schedule status:', error);
    return { success: false, error: error.message || 'Gagal memperbarui status jadwal.' };
  }
}

