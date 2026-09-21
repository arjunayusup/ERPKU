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
  await prisma.project.update({
    where: { id: projectId },
    data: { status },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath('/projects');
  revalidatePath('/dashboard');
  return { success: true };
}
