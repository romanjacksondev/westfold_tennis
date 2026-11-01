'use client';
import Pagination, { paginate } from '@/components/ui/Pagination/Pagination';
import SimpleTable from '@/components/ui/SimpleTable/SimpleTable';
import { createColumnHelper } from '@tanstack/react-table';
import { format } from 'date-fns';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { HiOutlineEye } from 'react-icons/hi';

type Tournament = {
  id: string;
  name: string;
  date: string | Date;
  champion?: { name?: string } | null;
  level?: { name?: string } | null;
  tournamentCategory?: { tournamentCategoryPoints?: { points?: number }[] } | null;
};

const TournamentsTemplate = ({ tournaments }: { tournaments: Tournament[] }) => {
  const [tableReady, setTableReady] = useState(false);
  const [query, setQuery] = useState('');
  const [year, setYear] = useState('');
  const [page, setPage] = useState(1);
  const years = useMemo(() => Array.from(new Set(tournaments.map((item) => new Date(item.date).getFullYear()))).sort((a, b) => b - a), [tournaments]);
  const filtered = useMemo(
    () =>
      tournaments.filter((item) => {
        if (year && String(new Date(item.date).getFullYear()) !== year) return false;
        const text = `${item.name} ${item.champion?.name ?? ''} ${item.level?.name ?? ''}`.toLowerCase();
        return text.includes(query.toLowerCase());
      }),
    [tournaments, query, year],
  );
  const paged = paginate(filtered, page, 15);

  useEffect(() => {
    setPage(1);
  }, [query, year]);
  const columnHelper = createColumnHelper<any>();

  useEffect(() => {
    setTableReady(true);
  }, []);

  const columns = [
    columnHelper.accessor('name', {
      id: 'name',
      minSize: 180,
      cell: (row) => <i>{row.getValue()}</i>,
      header: () => <span>Nombre</span>,
    }),
    columnHelper.accessor((row) => row.champion?.name ?? '-', {
      id: 'championName',
      cell: (info) => (
        <div>
          {/* <Trophy className="w-4 h-4 inline mr-2 text-yellow-300" /> */}
          <i>{info.getValue()}</i>
        </div>
      ),
      header: () => <span>Ganador</span>,
    }),
    columnHelper.accessor((row) => row.level?.name ?? '-', {
      id: 'level',
      cell: (info) => <i>{info.getValue()}</i>,
      header: () => <span>Nivel</span>,
    }),
    columnHelper.accessor((row) => row.tournamentCategory?.tournamentCategoryPoints?.[0]?.points ?? '-', {
      id: 'somethingLong',
      cell: (info) => <i>{info.getValue()}</i>,
      header: () => <span>Puntos</span>,
    }),
    columnHelper.accessor('date', {
      id: 'date',
      cell: (info) => <i>{format(info.getValue(), 'dd/MM/yyyy')}</i>,
      header: () => <span>Fecha</span>,
    }),
    columnHelper.accessor('id', {
      id: 'actions',
      cell: (info) => (
        <Link
          href={`/tournaments/${info.getValue()}`}
          className="tournament-details-link"
          aria-label="Ver detalles del torneo"
          title="Ver detalles del torneo"
        >
          <HiOutlineEye aria-hidden="true" />
        </Link>
      ),
      header: () => <span>Acciones</span>,
    }),
  ];

  return (
    <main className="tournament-page">
      <header className="tournament-header">
        <div>
          <p className="eyebrow">Competencia</p>
          <h1>Torneos</h1>
          <p className="muted">Explora el historial y los resultados del circuito.</p>
        </div>
        <div className="status-pill"><span /> {filtered.length} registrados</div>
      </header>
      <section className="tournament-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Archivo deportivo</p>
            <h2>Historial de torneos</h2>
          </div>
        </div>
        <div className="tournament-filters">
          <input className="search-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar torneo, ganador o nivel..." aria-label="Buscar torneos" />
          <select className="search-input" value={year} onChange={(event) => setYear(event.target.value)} aria-label="Filtrar por año">
            <option value="">Todos los años</option>
            {years.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </div>
        <div className="tournament-table">
          {tableReady ? <SimpleTable data={paged.items} columns={columns} /> : <div className="empty-state">Cargando torneos...</div>}
        </div>
        <Pagination page={paged.current} pageSize={15} total={filtered.length} onPageChange={setPage} />
      </section>
    </main>
  );
};

export default TournamentsTemplate;
