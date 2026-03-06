import BaseTable from '@/components/SimpleTable/SimpleTable';
import { createColumnHelper } from '@tanstack/react-table';
import { Venue } from '../types/Venues';

const VenuesTemplate = ({ venues }: { venues: Venue[] }) => {
  const columnHelper = createColumnHelper<Venue>();

  // console.log("venues: ", venues)

  const columns = [
    columnHelper.accessor('name', {
      id: 'name',
      minSize: 180,
      cell: (row) => <i>{row.getValue()}</i>,
      header: () => <span>Nombre</span>,
    }),
    columnHelper.accessor('phone', {
      id: 'phone',
      cell: (info) => (
        <div>
          <i>{info.getValue()}</i>
        </div>
      ),
      header: () => <span>Telefono</span>,
    }),
    columnHelper.accessor('address', {
      id: 'address',
      cell: (info) => (
        <div>
          <i>{info.getValue()}</i>
        </div>
      ),
      header: () => <span>Direccion</span>,
    }),
  ];

  return (
    <>
      <BaseTable title="Sedes" data={venues} columns={columns} />
    </>
  );
};

export default VenuesTemplate;
