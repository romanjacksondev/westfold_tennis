import { formatNumber } from 'lib/helpers';
import PropTypes from 'prop-types';
import BaseTable from "components/BaseTable/BaseTable";
import { createColumnHelper } from "@tanstack/react-table";

const SetTemplate = ({ stats }) => {

    type MatchTemplate = {
        setsPlayed: number
        setsWon: number
        setsLost: number
    }

    const columnHelper = createColumnHelper<MatchTemplate>();

    const columns = [
        columnHelper.accessor("setsPlayed", {
            id: "setsPlayed",
            minSize: 180,
            cell: (row) => <i>{row.getValue()}</i>,
            header: () => <span>Jugados</span>,
        }),
        columnHelper.accessor("setsWon", {
            id: "setsWon",
            minSize: 180,
            cell: (row) => <i>{row.getValue()}</i>,
            header: () => <span>Ganados</span>,
        }),
        columnHelper.accessor("setsLost", {
            id: "setsLost",
            minSize: 180,
            cell: (row) => <i>{row.getValue()}</i>,
            header: () => <span>Perdidos</span>,
        }),
        columnHelper.accessor(row => formatNumber(row.setsWon / row.setsPlayed, 2), {
            id: '% victorias',
        })
    ];

    const array = []
    array.push(stats)
    return (
        <BaseTable data={array} title="Resumen Partidos" columns={columns} />
    )

}

SetTemplate.propTypes = {
    stats: PropTypes.shape({
        setsPlayed: PropTypes.number,
        setsWon: PropTypes.number,
        setsLost: PropTypes.number,
    }).isRequired
};

export default SetTemplate