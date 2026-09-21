'use client';

import { getAllBranches, BranchConfig } from '@/lib/branches';
import { MapPin } from 'lucide-react';

interface BranchSelectorProps {
  selectedBranchId: string;
  onBranchChange: (branchId: string) => void;
  className?: string;
}

export default function BranchSelector({
  selectedBranchId,
  onBranchChange,
  className = '',
}: BranchSelectorProps) {
  const branches = getAllBranches();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
        <MapPin className="w-3.5 h-3.5 text-rose-600" />
        <span>Cabang Operasional:</span>
      </div>
      <select
        value={selectedBranchId}
        onChange={(e) => onBranchChange(e.target.value)}
        className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-sm cursor-pointer"
      >
        {branches.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name} ({b.city})
          </option>
        ))}
      </select>
    </div>
  );
}
