import Image from 'next/image';
import { getBranchConfig } from '@/lib/branches';

interface UniversalPrintHeaderProps {
  branchId?: string;
  documentTitle: string;
  documentNumber: string;
  dateStr?: string;
}

export default function UniversalPrintHeader({
  branchId = 'jakarta',
  documentTitle,
  documentNumber,
  dateStr,
}: UniversalPrintHeaderProps) {
  const branch = getBranchConfig(branchId);
  const displayDate = dateStr || new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="border-b-2 border-slate-900 pb-4 mb-6">
      <div className="flex justify-between items-start">
        {/* Left: Official Salsabilla Logo & Information */}
        <div className="flex items-center gap-4">
          <div className="relative w-28 h-16 shrink-0">
            {/* Logo resmi Salsabilla Advertising */}
            <img
              src="/salsabilla-mark.png"
              alt="Salsabilla Advertising Logo"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="max-w-md">
            <h1 className="text-base font-extrabold tracking-tight text-slate-900 uppercase leading-none">
              SALSABILLA ADVERTISING
            </h1>
            <p className="text-[10px] font-bold tracking-wider text-slate-700 uppercase mt-0.5">
              INDOOR - OUTDOOR SIGNAGE & REKLAME
            </p>
            <p className="text-[10.5px] text-slate-700 leading-snug mt-1 font-medium">
              {branch.address}
            </p>
            <p className="text-[10px] text-slate-600 mt-0.5">
              <span className="font-semibold text-slate-800">Phone:</span> {branch.phone} • <span className="font-semibold text-slate-800">WA:</span> {branch.whatsapp}
            </p>
            <p className="text-[10px] text-slate-600">
              <span className="font-semibold text-slate-800">Email:</span> {branch.email} • <span className="font-semibold text-slate-800">Web:</span> {branch.website}
            </p>
          </div>
        </div>

        {/* Right: Document Metadata & Branch Code */}
        <div className="text-right shrink-0">
          <div className="inline-block px-3 py-1 bg-slate-900 text-white font-extrabold text-xs uppercase tracking-wider rounded">
            {documentTitle}
          </div>
          <p className="font-mono text-xs font-bold text-slate-900 mt-2">
            No: {documentNumber}
          </p>
          <p className="text-[11px] text-slate-600 mt-0.5">
            {branch.city}, {displayDate}
          </p>
          <span className="inline-block text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-300 mt-1">
            {branch.shortName}
          </span>
        </div>
      </div>
    </div>
  );
}
