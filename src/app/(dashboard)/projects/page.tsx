import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ProjectsClientList from './ProjectsClientList';
import { FolderKanban, Plus } from 'lucide-react';

export default async function ProjectsPage() {
  const session = await getSession();
  const isAdmin = session?.role === 'admin';

  let projects: any[] = [];
  try {
    projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        expenses: true,
        installations: true,
      }
    });
  } catch (e) {
    console.error('Error fetching projects:', e);
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 p-4 sm:p-6 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <FolderKanban className="w-5 h-5" />
            </span>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight">
              Manajemen Penawaran & Proyek Reklame
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pantau status transaksi, cetak dokumen resmi, serta kelola arsip aktif dan tempat sampah.
          </p>
        </div>

        <a
          href="/calculator"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Penawaran Baru</span>
        </a>
      </div>

      {/* Interactive Projects List with Search, Filter & Trash */}
      <ProjectsClientList initialProjects={projects} isAdmin={isAdmin} />
    </div>
  );
}
