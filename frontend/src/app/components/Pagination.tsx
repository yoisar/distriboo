interface PaginationProps {
  page: number;
  lastPage: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, lastPage, onPageChange }: PaginationProps) {
  if (lastPage <= 1) return null;

  return (
    <div className="flex justify-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
      >
        Anterior
      </button>
      <span className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
        {page} / {lastPage}
      </span>
      <button
        onClick={() => onPageChange(Math.min(lastPage, page + 1))}
        disabled={page === lastPage}
        className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
      >
        Siguiente
      </button>
    </div>
  );
}
