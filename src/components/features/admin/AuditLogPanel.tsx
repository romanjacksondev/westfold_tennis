'use client';

import { useEffect, useMemo, useState } from 'react';
import Pagination from '@/components/ui/Pagination/Pagination';

type AuditItem = {
  id: string;
  createdAt: string;
  actorId: string | null;
  actorRole: string | null;
  actorEmail: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  before: unknown;
  after: unknown;
  metadata: { requestId?: string; [key: string]: unknown } | null;
};

const PAGE_SIZE = 25;

const ACTIONS = [
  'CREATE',
  'UPDATE',
  'DELETE',
  'TOURNAMENT_START',
  'TOURNAMENT_CANCEL',
  'TOURNAMENT_REACTIVATE',
  'LOGIN_SUCCESS',
  'LOGIN_FAILURE',
  'ACCESS_DENIED',
  'PHOTO_UPLOAD',
  'PHOTO_DELETE',
  'USERS_PLAYERS_UNIFY',
];

const ENTITIES = [
  'Tournament',
  'Match',
  'Player',
  'User',
  'Venue',
  'Surface',
  'TournamentType',
  'TournamentCategory',
  'Level',
  'Route',
];

export default function AuditLogPanel() {
  const [result, setResult] = useState<{ key: string; items: AuditItem[]; total: number } | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    action: '',
    entity: '',
    entityId: '',
    from: '',
    to: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const query = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
    Object.entries(filters).forEach(([key, value]) => value && params.set(key, value));
    return params.toString();
  }, [page, filters]);
  const loading = result?.key !== query;
  const items = result?.items ?? [];
  const total = result?.total ?? 0;

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/audit-logs?${query}`)
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.message ?? 'No se pudo cargar la auditoría');
        return payload;
      })
      .then((payload) => {
        if (cancelled) return;
        setResult({ key: query, items: payload.items, total: payload.total });
        setError(null);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setResult({ key: query, items: [], total: 0 });
        setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [query]);

  const updateFilter = (key: keyof typeof filters, value: string) => {
    setPage(1);
    setFilters((current) => ({ ...current, [key]: value }));
  };

  return (
    <section className="admin-panel list-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Historial de cambios y accesos</p>
          <h2>{total} eventos</h2>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            className="search-input"
            value={filters.action}
            onChange={(e) => updateFilter('action', e.target.value)}
            aria-label="Filtrar por acción"
          >
            <option value="">Todas las acciones</option>
            {ACTIONS.map((action) => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </select>
          <select
            className="search-input"
            value={filters.entity}
            onChange={(e) => updateFilter('entity', e.target.value)}
            aria-label="Filtrar por entidad"
          >
            <option value="">Todas las entidades</option>
            {ENTITIES.map((entity) => (
              <option key={entity} value={entity}>
                {entity}
              </option>
            ))}
          </select>
          <input
            className="search-input"
            value={filters.entityId}
            onChange={(e) => updateFilter('entityId', e.target.value)}
            placeholder="ID de entidad"
            aria-label="Filtrar por ID de entidad"
          />
          <input
            className="search-input"
            type="date"
            value={filters.from}
            onChange={(e) => updateFilter('from', e.target.value)}
            aria-label="Desde"
          />
          <input
            className="search-input"
            type="date"
            value={filters.to}
            onChange={(e) => updateFilter('to', e.target.value)}
            aria-label="Hasta"
          />
        </div>
      </div>

      {error && (
        <div className="request-message error" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="empty-state">Cargando auditoría...</div>
      ) : items.length === 0 ? (
        <div className="empty-state">No hay eventos para mostrar.</div>
      ) : (
        <div className="record-list">
          {items.map((item) => (
            <div key={item.id} style={{ borderBottom: '1px solid #e0e7e2' }}>
              <div className="record-row" style={{ borderBottom: 0 }}>
                <div>
                  <strong>
                    {item.action} · {item.entity}
                  </strong>
                  <small>
                    {new Date(item.createdAt).toLocaleString('es-AR')} ·{' '}
                    {item.actorEmail ?? item.actorId ?? 'Sistema / anónimo'}
                    {item.actorRole ? ` (${item.actorRole})` : ''}
                    {item.entityId ? ` · ${item.entityId}` : ''}
                  </small>
                </div>
                <button
                  type="button"
                  className="text-button"
                  onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                >
                  {expanded === item.id ? 'Ocultar' : 'Detalle'}
                </button>
              </div>
              {expanded === item.id && (
                <pre style={{ overflow: 'auto', fontSize: 11, padding: '0 0 16px' }}>
                  {JSON.stringify(
                    { before: item.before, after: item.after, metadata: item.metadata },
                    null,
                    2,
                  )}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}
      <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
    </section>
  );
}
