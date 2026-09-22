'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';

export interface ComboboxOption {
  id: string;
  name: string;
  category?: string;
  unit?: string;
  costPrice?: number;
  sellPrice?: number;
  notes?: string;
}

interface SearchableComboboxProps {
  options: ComboboxOption[];
  value: string;
  onChange: (option: ComboboxOption) => void;
  placeholder?: string;
  label?: string;
  showPricing?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function SearchableCombobox({
  options,
  value,
  onChange,
  placeholder = 'Cari dan pilih bahan...',
  label,
  showPricing = true,
  disabled = false,
  className = '',
}: SearchableComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Selected Option based on ID or Name
  const selectedOption = useMemo(() => {
    return options.find(
      (opt) =>
        opt.id === value ||
        opt.name.toLowerCase() === value.toLowerCase() ||
        (opt.id && value && opt.id.toLowerCase() === value.toLowerCase())
    ) || null;
  }, [options, value]);

  // Filtered Options based on Search Query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const q = searchQuery.toLowerCase();
    return options.filter(
      (opt) =>
        opt.name.toLowerCase().includes(q) ||
        (opt.category && opt.category.toLowerCase().includes(q)) ||
        (opt.notes && opt.notes.toLowerCase().includes(q)) ||
        (opt.unit && opt.unit.toLowerCase().includes(q))
    );
  }, [options, searchQuery]);

  // Handle outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Auto focus search input
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const formatRupiah = (num?: number) => {
    if (num === undefined || num === null) return '';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="font-bold text-slate-700 text-xs block mb-1.5 flex items-center justify-between">
          <span>{label}</span>
          {selectedOption && (
            <span className="text-[10px] text-emerald-600 font-extrabold uppercase">
              ✓ Master Terpilih
            </span>
          )}
        </label>
      )}

      {/* Main Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            setSearchQuery('');
          }
        }}
        className={`w-full text-left bg-white border rounded-xl px-3.5 py-2.5 text-xs font-bold transition flex items-center justify-between gap-2 shadow-xs cursor-pointer ${
          isOpen
            ? 'border-indigo-500 ring-2 ring-indigo-500/20'
            : 'border-slate-300 hover:border-slate-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : ''}`}
      >
        <div className="flex-1 truncate">
          {selectedOption ? (
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-900 font-extrabold truncate">
                {selectedOption.name}
              </span>
              {showPricing && selectedOption.sellPrice !== undefined && (
                <span className="shrink-0 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-mono font-black text-[11px] border border-emerald-200">
                  {formatRupiah(selectedOption.sellPrice)} /{selectedOption.unit || 'unit'}
                </span>
              )}
            </div>
          ) : (
            <span className="text-slate-400 font-medium">{placeholder}</span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-indigo-600' : ''
          }`}
        />
      </button>

      {/* Floating Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1.5 left-0 right-0 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 min-w-[300px]">
          {/* Search Input Box */}
          <div className="p-2.5 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ketik untuk mencari bahan..."
              className="w-full bg-transparent text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Options List */}
          <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 p-1">
            {filteredOptions.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                Tidak ada bahan yang cocok dengan &quot;{searchQuery}&quot;
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = selectedOption?.id === opt.id || selectedOption?.name === opt.name;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      onChange(opt);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl text-xs transition flex items-center justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 text-indigo-950 font-black'
                        : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold truncate text-slate-900">{opt.name}</span>
                        {opt.category && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-100 text-slate-600 uppercase shrink-0">
                            {opt.category}
                          </span>
                        )}
                      </div>
                      {opt.notes && (
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">{opt.notes}</p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      {opt.sellPrice !== undefined && (
                        <div className="font-mono font-black text-[11px] text-emerald-700">
                          {formatRupiah(opt.sellPrice)} <span className="text-[9.5px] font-normal text-slate-500">/{opt.unit || 'unit'}</span>
                        </div>
                      )}
                      {opt.costPrice !== undefined && (
                        <div className="text-[9.5px] font-mono text-slate-400">
                          HPP: {formatRupiah(opt.costPrice)}
                        </div>
                      )}
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
