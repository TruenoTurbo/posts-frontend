import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
      <div className="text-sm text-text-secondary">
        Showing {startItem}-{endItem} of {totalItems} posts
      </div>
      
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 rounded-lg border border-border bg-bg-card text-text-primary
                     disabled:opacity-50 disabled:cursor-not-allowed hover:bg-bg-secondary 
                     transition-colors"
        >
          ← Prev
        </button>
        
        {getPageNumbers().map((page, i) => 
          page === '...' ? (
            <span key={`ellipsis-${i}`} className="px-3 py-2 text-text-secondary">...</span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={`px-3 py-2 rounded-lg border transition-colors ${
                currentPage === page
                  ? 'bg-accent text-white border-accent'
                  : 'border-border bg-bg-card text-text-primary hover:bg-bg-secondary'
              }`}
            >
              {page}
            </button>
          )
        )}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 rounded-lg border border-border bg-bg-card text-text-primary
                     disabled:opacity-50 disabled:cursor-not-allowed hover:bg-bg-secondary 
                     transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  );
};
