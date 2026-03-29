interface PaginationProps {
  page: number;
  lastPage: number;
  onPageChange: (page: number) => void;
  total?: number;
  perPage?: number;
}

export default function Pagination({ page, lastPage, onPageChange, total, perPage }: PaginationProps) {
  if (lastPage <= 1 && !total) return null;

  // Genera el rango de páginas a mostrar (máx 5 botones)
  function getPageRange(): (number | "...")[] {
    if (lastPage <= 7) {
      return Array.from({ length: lastPage }, (_, i) => i + 1);
    }
    const pages: (number | "...")[] = [1];
    if (page > 3) pages.push("...");
    for (let p = Math.max(2, page - 1); p <= Math.min(lastPage - 1, page + 1); p++) {
      pages.push(p);
    }
    if (page < lastPage - 2) pages.push("...");
    pages.push(lastPage);
    return pages;
  }

  const from = total && perPage ? (page - 1) * perPage + 1 : null;
  const to = total && perPage ? Math.min(page * perPage, total) : null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
      {/* Info de registros */}
      {total != null && from != null && to != null ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 order-2 sm:order-1">
          Mostrando <span className="font-medium text-gray-700 dark:text-gray-300">{from}–{to}</span> de{" "}
          <span className="font-medium text-gray-700 dark:text-gray-300">{total}</span> registros
        </p>
      ) : lastPage > 1 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 order-2 sm:order-1">
          Página <span className="font-medium text-gray-700 dark:text-gray-300">{page}</span> de{" "}
          <span className="font-medium text-gray-700 dark:text-gray-300">{lastPage}</span>
        </p>
      ) : null}

      {/* Controles de paginación */}
      {lastPage > 1 && (
        <div className="flex items-center gap-1 order-1 sm:order-2">
          {/* Anterior */}
          <button
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Anterior</span>
          </button>

          {/* Números de página */}
          <div className="flex gap-1">
            {getPageRange().map((p, i) =>
              p === "..." ? (
                <span key={`ellipsis-${i}`} className="px-2 py-1.5 text-sm text-gray-400 dark:text-gray-500">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => onPageChange(p as number)}
                  className={`min-w-[2rem] px-2 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                    p === page
                      ? "bg-blue-600 text-white shadow-sm"
                      : "border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {p}
                </button>
              )
            )}
          </div>

          {/* Siguiente */}
          <button
            onClick={() => onPageChange(Math.min(lastPage, page + 1))}
            disabled={page === lastPage}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <span className="hidden sm:inline">Siguiente</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
