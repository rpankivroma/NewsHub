import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  hasMore: boolean;
  onPageChange: (newPage: number) => void;
  disabled?: boolean;
}

export default function Pagination({ currentPage, hasMore, onPageChange, disabled }: PaginationProps) {
  if (currentPage === 0 && !hasMore) return null;

  return (
    <div className="flex items-center justify-center gap-4 mt-12 py-4">
      <button
        onClick={() => onPageChange(Math.max(0, currentPage - 1))}
        disabled={currentPage === 0 || disabled}
        className="p-2 rounded-full border border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      
      <span className="text-sm font-medium text-gray-700">
        Page {currentPage + 1}
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasMore || disabled}
        className="p-2 rounded-full border border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        aria-label="Next page"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
