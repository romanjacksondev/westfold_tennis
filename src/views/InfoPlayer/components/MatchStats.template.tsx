import { formatNumber } from 'lib/helpers';
import PropTypes from 'prop-types';
import BaseTable from "components/BaseTable/BaseTable";
import { createColumnHelper } from "@tanstack/react-table";

const MatchTemplate = ({ stats }) => {

    type MatchTemplate = {
        matchesPlayed: number
        matchesWon: number
        matchesLost: number
    }

    const columnHelper = createColumnHelper<MatchTemplate>();

    const columns = [
        columnHelper.accessor("matchesPlayed", {
            id: "matchesPlayed",
            minSize: 180,
            cell: (row) => <i>{row.getValue()}</i>,
            header: () => <span>Jugados</span>,
        }),
        columnHelper.accessor("matchesWon", {
            id: "matchesWon",
            minSize: 180,
            cell: (row) => <i>{row.getValue()}</i>,
            header: () => <span>Ganados</span>,
        }),
        columnHelper.accessor("matchesLost", {
            id: "matchesLost",
            minSize: 180,
            cell: (row) => <i>{row.getValue()}</i>,
            header: () => <span>Perdidos</span>,
        }),
        columnHelper.accessor(row => formatNumber(row.matchesWon / row.matchesPlayed, 2), {
            id: '% victorias',
        })
    ];

    const array = []
    array.push(stats)
    return (
        <BaseTable data={array} title="Resumen Partidos" columns={columns} />
    )
}

MatchTemplate.propTypes = {
    stats: PropTypes.shape({

        matchesPlayed: PropTypes.number,
        matchesWon: PropTypes.number,
        matchesLost: PropTypes.number,

    }).isRequired
};


export default MatchTemplate