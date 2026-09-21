'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Calculator, 
  FolderKanban, 
  Database,
  CalendarDays
} from 'lucide-react';

export default function MobileBottomNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Home',
      href: '/dashboard',
      icon: LayoutDashboard,
      active: pathname === '/dashboard',
    },
    {
      label: 'Kalkulator',
      href: '/calculator',
      icon: Calculator,
      active: pathname === '/calculator',
      highlight: true,
    },
    {
      label: 'Proyek',
      href: '/projects',
      icon: FolderKanban,
      active: pathname.startsWith('/projects'),
    },
    {
      label: 'Jadwal',
      href: '/schedule',
      icon: CalendarDays,
      active: pathname === '/schedule',
    },
    ...(isAdmin
      ? [
          {
            label: 'Master',
            href: '/master',
            icon: Database,
            active: pathname === '/master',
          },
        ]
      : []),
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] no-print">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.active;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? 'text-rose-600 font-extrabold'
                  : 'text-slate-500 hover:text-slate-900 font-medium'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-rose-50 text-rose-600 scale-105'
                    : item.highlight
                    ? 'bg-amber-50 text-amber-600'
                    : 'text-slate-600'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
