'use client';

type PaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
};

export const paginate = <T,>(items: T[], page: number, pageSize: number) => {
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(Math.max(page, 1), pageCount);
  return { pageCount, current, items: items.slice((current - 1) * pageSize, current * pageSize) };
};

export default function Pagination({ page, pageSize, total, onPageChange }: PaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  if (total <= pageSize) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <nav className="pagination" aria-label="Paginación">
      <span className="pagination-summary">
        {from}-{to} de {total}
      </span>
      <div className="pagination-controls">
        <button type="button" className="text-button" onClick={() => onPageChange(1)} disabled={page <= 1} aria-label="Primera página">«</button>
        <button type="button" className="text-button" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>Anterior</button>
        <span className="pagination-current">Página {page} de {pageCount}</span>
        <button type="button" className="text-button" onClick={() => onPageChange(page + 1)} disabled={page >= pageCount}>Siguiente</button>
        <button type="button" className="text-button" onClick={() => onPageChange(pageCount)} disabled={page >= pageCount} aria-label="Última página">»</button>
      </div>
    </nav>
  );
}
