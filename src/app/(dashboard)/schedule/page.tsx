import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ScheduleClient from './ScheduleClient';

export default async function SchedulePage() {
  await getSession();

  let schedules: any[] = [];
  let teamMembers: any[] = [];
  try {
    schedules = await prisma.installationSchedule.findMany({
      include: {
        project: {
          include: { items: true },
        },
      },
      orderBy: { date: 'asc' },
    });
    teamMembers = await prisma.teamMember.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { name: 'asc' },
    });
  } catch (e) {
    console.error('Error fetching installation schedules:', e);
  }

  return <ScheduleClient schedules={schedules} teamMembers={teamMembers} />;
}

