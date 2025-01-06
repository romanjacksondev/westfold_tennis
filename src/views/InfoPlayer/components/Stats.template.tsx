import PropTypes from "prop-types";
import LoadingComponent from "components/Loader";
import BaseTable from "components/BaseTable/BaseTable";
import { createColumnHelper } from "@tanstack/react-table";
import { formatNumber } from "lib/helpers";

const StatsTemplate = ({ stats }) => {
  if (!stats.matchesPlayed) {
    return <LoadingComponent size="large" />;
  }

  type MatchTemplate = {
    matchesPlayed: number
    matchesWon: number
    matchesLost: number
    gamesPlayed: number
    gamesWon: number
    gamesLost: number
    setsPlayed: number
    setsWon: number
    setsLost: number
  }

  const columnHelper = createColumnHelper<MatchTemplate>();

  // console.log("star, ", stats)

  const defaultColumns = [
    columnHelper.group({
      header: 'Partidos',
      // footer: props => props.column.id,
      columns: [
        columnHelper.accessor("matchesPlayed", {
          id: "matchesPlayed",
          minSize: 80,
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
        columnHelper.accessor(
          row => formatNumber(row.matchesWon / row.matchesPlayed, 2) + "%", {
          id: 'matches',
          header: "% victorias",
        })
      ]
    }),
    columnHelper.group({
      header: 'Sets',
      // footer: props => props.column.id,
      columns: [
        columnHelper.accessor("setsPlayed", {
          id: "setsPlayed",
          minSize: 80,
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
        columnHelper.accessor(row => formatNumber(row.setsWon / row.setsPlayed, 2) + "%", {
          id: 'sets',
          header: "% victorias",
        })
      ]
    }),
    columnHelper.group({
      header: 'Games',
      columns: [
        columnHelper.accessor("gamesPlayed", {
          id: "gamesPlayed",
          minSize: 80,
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
        columnHelper.accessor(row => formatNumber(row.gamesWon / row.gamesPlayed, 2) + "%", {
          id: 'games',
          header: "% victorias",
        })
      ]
    }),
  ]

  const array = []
  array.push(stats)


  return (
    <>
      <BaseTable data={array} title="Estadisticas" columns={defaultColumns} />
    </>
  );
};

StatsTemplate.propTypes = {
  stats: PropTypes.shape({
    matchesPlayed: PropTypes.number,
    matchesWon: PropTypes.number,
    matchesLost: PropTypes.number,
  }).isRequired,
};

export default StatsTemplate;
