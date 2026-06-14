'use client';

import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import FilterPanel from './FilterPanel';

export default function FilterModal() {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return (
    <>
      {/* Trigger Button - placed in the main controls area */}
      <button
        onClick={open}
        className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-sm font-medium transition"
      >
        <Filter className="h-4 w-4" />
        Filters
      </button>

      {/* Popup Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="font-semibold text-lg">Advanced Filters</div>
              <button
                onClick={close}
                className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close filters"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body - contains the actual filter panel */}
            <div className="p-4 max-h-[70vh] overflow-y-auto">
              <FilterPanel onClose={close} />
            </div>

            {/* Optional footer note */}
            <div className="border-t px-4 py-3 text-xs text-gray-500 bg-gray-50">
              Select options and click Apply inside the filters. Changes will update the phone list.
            </div>
          </div>
        </div>
      )}
    </>
  );
}
