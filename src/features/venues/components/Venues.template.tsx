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
    <main className="venue-page">
      <header className="venue-header">
        <div>
          <p className="eyebrow">Circuito</p>
          <h1>Sedes</h1>
          <p className="muted">Consulta los clubes y canchas disponibles.</p>
        </div>
        <div className="status-pill"><span /> {venues.length} registradas</div>
      </header>
      <section className="venue-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Infraestructura</p>
            <h2>Clubes y canchas</h2>
          </div>
        </div>
        <div className="venue-table">
          <BaseTable data={venues} columns={columns} />
        </div>
      </section>
    </main>
  );
};

export default VenuesTemplate;
