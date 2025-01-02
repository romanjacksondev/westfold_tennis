import PropTypes from "prop-types";
import MatchTemplate from "./MatchStats.template";
import SetTemplate from "./SetStats.template";
import GameTemplate from "./GameStats.template";
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

  const defaultColumns = [
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
        columnHelper.accessor(row => formatNumber(row.setsWon / row.setsPlayed, 2), {
          id: '% victorias',
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
        columnHelper.accessor(row => formatNumber(row.setsWon / row.setsPlayed, 2), {
          id: '% victorias',
        })
      ]
    }),
  ]

  const array = []
  array.push(stats)


  return (
    <>

<BaseTable data={array} title="Resumen Games" columns={defaultColumns} />



      {/* <MatchTemplate stats={stats} />
      <SetTemplate stats={stats} />
      <GameTemplate stats={stats} /> */}
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
