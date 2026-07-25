import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

export default function Pagination({
  page,
  totalPages,
  onPageChange,
  hasNextPage,
  hasPreviousPage,
  className = ''
}) {
  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-between py-4 border-t border-slate-100 ${className}`}>
      <div className="flex-1 flex justify-between sm:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPreviousPage}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage}
        >
          Next
        </Button>
      </div>
      
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400">
            Page <span className="text-slate-700 font-bold">{page}</span> of{' '}
            <span className="text-slate-700 font-bold">{totalPages}</span>
          </p>
        </div>
        
        <div>
          <nav className="relative z-0 inline-flex rounded-xl -space-x-px gap-2" aria-label="Pagination">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={!hasPreviousPage}
              icon={ChevronLeft}
            >
              Previous
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={!hasNextPage}
              className="flex-row-reverse"
              icon={ChevronRight}
            >
              Next
            </Button>
          </nav>
        </div>
      </div>
    </div>
  );
}