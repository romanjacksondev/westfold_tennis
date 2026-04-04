import SimpleTable from '@/components/SimpleTable/SimpleTable';
import { createColumnHelper } from '@tanstack/react-table';

const InformationTemplate = () => {
  type TournamentInfo = {
    categoria: string;
    campeon: number;
    finalista: number;
    semifinal: number;
    cuartosFinal: number;
  };

  const tournamentInfo = [
    {
      categoria: 'Humolabs Grand Prix',
      campeon: 4000,
      finalista: 2600,
      semifinal: 1300,
      cuartosFinal: 650,
    },
    {
      categoria: 'Grand Slam',
      campeon: 2000,
      finalista: 1300,
      semifinal: 800,
      cuartosFinal: 400,
    },
    {
      categoria: 'Masters 1000',
      campeon: 1000,
      finalista: 650,
      semifinal: 400,
      cuartosFinal: 200,
    },
    {
      categoria: 'ATP 500',
      campeon: 500,
      finalista: 330,
      semifinal: 200,
      cuartosFinal: 100,
    },
    {
      categoria: 'ATP 250',
      campeon: 250,
      finalista: 165,
      semifinal: 100,
      cuartosFinal: 50,
    },
  ];
  const columnHelper = createColumnHelper<TournamentInfo>();

  const columns = [
    ...[
      columnHelper.accessor('categoria', {
        id: 'categoria',
        minSize: 180,
        cell: (row) => <i>{row.getValue()}</i>,
        header: () => <span>Categoria</span>,
      }),
      columnHelper.accessor('campeon', {
        id: 'campeon',
        minSize: 180,
        cell: (row) => <i>{row.getValue()}</i>,
        header: () => <span>Campeon</span>,
      }),
      columnHelper.accessor('finalista', {
        id: 'finalista',
        minSize: 180,
        cell: (row) => <i>{row.getValue()}</i>,
        header: () => <span>Finalista</span>,
      }),
      columnHelper.accessor('semifinal', {
        id: 'semifinal',
        minSize: 180,
        cell: (row) => <i>{row.getValue()}</i>,
        header: () => <span>Semifinal</span>,
      }),
      columnHelper.accessor('cuartosFinal', {
        id: 'cuartosFinal',
        minSize: 180,
        cell: (row) => <i>{row.getValue()}</i>,
        header: () => <span>Cuartos Final</span>,
      }),
    ],
  ];
  return <SimpleTable data={tournamentInfo} title="Informacion General" columns={columns} />;
};

export default InformationTemplate;
