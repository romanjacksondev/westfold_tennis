import { createColumnHelper } from '@tanstack/react-table';
import BaseTable from 'components/BaseTable/BaseTable';
import ModalNewData from 'components/ModalNewData';

export default function PointsBreakdown({ name, pointsBreakdown, openModal, setOpenModal }) {
  type PointsBreakdown = {
    tournament: string;
    points: string;
  };

  const columnHelper = createColumnHelper<PointsBreakdown>();

  const columns = [
    ...[
      columnHelper.accessor('tournament', {
        id: 'tournament',
        minSize: 180,
        cell: (row) => <i>{row.getValue()}</i>,
        header: () => <span>Torneo</span>,
      }),
      columnHelper.accessor('points', {
        id: 'points',
        minSize: 180,
        cell: (row) => <i>{row.getValue()}</i>,
        header: () => <span>Puntos</span>,
      }),
    ],
  ];

  return (
    <ModalNewData
      buttonText={'Cerrar'}
      isOpen={openModal}
      onClickButton={() => setOpenModal(false)}
      setIsOpen={() => setOpenModal(false)}
      size={'lg'}
      title={`Breakdown de puntos de ${name}`}
    >
      <BaseTable data={pointsBreakdown} title="Resultados" columns={columns} />
    </ModalNewData>
  );
}
