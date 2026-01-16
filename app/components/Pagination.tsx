'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
  itemsPerPageOptions?: number[];
  itemName?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [10, 20, 50],
  itemName = 'items'
}: PaginationProps) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-100 bg-gray-50">
      <p className="text-sm text-gray-500">
        Mostrando {startItem} - {endItem} de {totalItems} {itemName}
      </p>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Mostrar:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-sm text-gray-700 focus:ring-2 focus:ring-accent-green focus:border-transparent outline-none cursor-pointer"
          >
            {itemsPerPageOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Pagina anterior"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>

          <span className="px-3 py-1.5 text-sm text-gray-700">
            Pagina {currentPage} de {totalPages}
          </span>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Pagina siguiente"
          >
            <ChevronRight size={20} className="text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
