'use client';
import SimpleTable from '@/components/SimpleTable/SimpleTable';
import { createColumnHelper } from '@tanstack/react-table';
import { format } from 'date-fns';
import Link from 'next/link';

type Tournament = {
  id: string;
  name: string;
  date: string | Date;
  champion?: { name?: string } | null;
  tournamentCategory?: { tournamentCategoryPoints?: { points?: number }[] } | null;
};

const TournamentsTemplate = ({ tournaments }: { tournaments: Tournament[] }) => {
  const columnHelper = createColumnHelper<any>();

  const columns = [
    columnHelper.accessor('name', {
      id: 'name',
      minSize: 180,
      cell: (row) => <i>{row.getValue()}</i>,
      header: () => <span>Nombre</span>,
    }),
    columnHelper.accessor('champion.name', {
      id: 'championName',
      cell: (info) => (
        <div>
          {/* <Trophy className="w-4 h-4 inline mr-2 text-yellow-300" /> */}
          <i>{info.getValue()}</i>
        </div>
      ),
      header: () => <span>Ganador</span>,
    }),
    columnHelper.accessor((row) => row.tournamentCategory.tournamentCategoryPoints[0].points, {
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
      cell: (info) => <Link href={`/torneos/${info.getValue()}`}>EDIT</Link>,
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
        <div className="status-pill"><span /> {tournaments.length} registrados</div>
      </header>
      <section className="tournament-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Archivo deportivo</p>
            <h2>Historial de torneos</h2>
          </div>
        </div>
        <div className="tournament-table">
          <SimpleTable data={tournaments} columns={columns} />
        </div>
      </section>
    </main>
  );
};

export default TournamentsTemplate;
