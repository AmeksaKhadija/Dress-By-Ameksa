import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (!totalPages || totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);

      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-1.5 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
      >
        <HiChevronLeft size={18} />
      </button>

      {getPageNumbers().map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} className="px-2 text-gray-400">...</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-10 h-10 rounded-lg text-sm font-medium transition ${
              currentPage === p
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 border border-gray-300 hover:border-primary-400'
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
      >
        <HiChevronRight size={18} />
      </button>
    </div>
  );
};

export default Pagination;
