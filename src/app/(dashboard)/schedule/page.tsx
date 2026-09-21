import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ScheduleClient from './ScheduleClient';

export default async function SchedulePage() {
  await getSession();

  let schedules: any[] = [];
  try {
    schedules = await prisma.installationSchedule.findMany({
      include: {
        project: true,
      },
      orderBy: { date: 'asc' },
    });
  } catch (e) {
    console.error('Error fetching installation schedules:', e);
  }

  return <ScheduleClient schedules={schedules} />;
}
