import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import MasterHubClient from './MasterHubClient';
import { Database } from 'lucide-react';

export default async function MasterDataPage() {
  const session = await getSession();
  if (session?.role !== 'admin') {
    notFound();
  }

  let rates: any[] = [];
  let clients: any[] = [];
  let users: any[] = [];
  let teamMembers: any[] = [];

  try {
    rates = await prisma.materialRate.findMany({
      orderBy: { id: 'asc' },
    });
    clients = await prisma.customer.findMany({
      orderBy: { name: 'asc' },
      include: { projects: true },
    });
    users = await prisma.user.findMany({
      orderBy: { role: 'asc' },
    });
    teamMembers = await prisma.teamMember.findMany({
      orderBy: { name: 'asc' },
    });
  } catch (e) {
    console.error('Error loading master data:', e);
  }


  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 p-4 sm:p-6 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
            <Database className="w-5 h-5" />
          </span>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight">
            Pusat Master Data & Konfigurasi Salsabilla
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Kelola direktori pelanggan, tarif acuan bahan & modal HPP, data 3 cabang, serta akun staf dalam satu pusat kendali terpisah.
        </p>
      </div>

      {/* Interactive Tabbed Hub Component */}
      <MasterHubClient
        initialRates={rates}
        initialClients={clients}
        initialUsers={users}
        initialTeamMembers={teamMembers}
      />
    </div>
  );
}

