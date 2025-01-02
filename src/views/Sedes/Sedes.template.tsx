import BaseTable from 'components/BaseTable/BaseTable';
import PropTypes from 'prop-types';
import { createColumnHelper } from "@tanstack/react-table";
import { Venue } from 'interfaces';

const SedesTemplate = ({ venues }: { venues: Venue[] }) => {

  const columnHelper = createColumnHelper<any>();

  // console.log("venus: ", venues)

  const columns = [
    columnHelper.accessor("name", {
      id: "name",
      minSize: 180,
      cell: (row) => <i>{row.getValue()}</i>,
      header: () => <span>Nombre</span>,
    }),
    columnHelper.accessor("phone", {
      id: "phone",
      cell: (info) => (
        <div>
          <i>{info.getValue()}</i>
        </div>
      ),
      header: () => <span>Telefono</span>,
    }),
    columnHelper.accessor("address", {
      id: "address",
      cell: (info) => (
        <div>
          <i>{info.getValue()}</i>
        </div>
      ),
      header: () => <span>Direccion</span>,
    })
  ];

  return (
    <BaseTable
      title="Sedes"
      data={venues}
      columns={columns}
    />
  );
}

SedesTemplate.propTypes = {
  venues: PropTypes.arrayOf(
    PropTypes.shape({})
  ).isRequired
};

export default SedesTemplate