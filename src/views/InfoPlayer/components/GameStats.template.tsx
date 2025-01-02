import PropTypes from 'prop-types';
import BaseTable from "components/BaseTable/BaseTable";
import { createColumnHelper } from "@tanstack/react-table";
import { formatNumber } from 'lib/helpers';

const GameTemplate = ({ stats }) => {

    type GameTemplate = {
        gamesPlayed: number
        gamesWon: number
        gamesLost: number
    }

    const columnHelper = createColumnHelper<GameTemplate>();
    // console.log("stats: ", stats)

    const columns = [
        columnHelper.accessor("gamesPlayed", {
            id: "gamesPlayed",
            minSize: 180,
            cell: (row) => <i>{row.getValue()}</i>,
            header: () => <span>Jugados</span>,
        }),
        columnHelper.accessor("gamesWon", {
            id: "gamesWon",
            minSize: 180,
            cell: (row) => <i>{row.getValue()}</i>,
            header: () => <span>Ganados</span>,
        }),
        columnHelper.accessor("gamesLost", {
            id: "gamesLost",
            minSize: 180,
            cell: (row) => <i>{row.getValue()}</i>,
            header: () => <span>Perdidos</span>,
        }),
        columnHelper.accessor(row => formatNumber(row.gamesWon / row.gamesPlayed, 2), {
            id: '% victorias',
        })
    ];

    const array = []
    array.push(stats)
    return (
        <BaseTable data={array} title="Resumen Games" columns={columns} />
    )
}

GameTemplate.propTypes = {
    stats: PropTypes.shape({
        gamesPlayed: PropTypes.number,
        gamesWon: PropTypes.number,
        gamesLost: PropTypes.number,
    }).isRequired
};

export default GameTemplate