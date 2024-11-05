/** @format */
import { createColumnHelper } from "@tanstack/react-table";
import BaseTable from "components/BaseTable/BaseTable";
import PropTypes from "prop-types";

const SummaryTemplate = ({ playerStats }) => {
  // console.log("summary: ", summary)

  type MatchSummary = {
    id: string,
    name: string,
    matchesWon: number,
    matchesLost: number,
    gamesWon: number,
    gamesLost: number
  }

  const columnHelper = createColumnHelper<MatchSummary>();

  const columns = [
    ...[
      columnHelper.accessor("name", {
        id: "name",
        minSize: 180,
        cell: (row) => <i>{row.getValue()}</i>,
        header: () => <span>Nombre</span>,
      }),
      columnHelper.accessor("matchesWon", {
        id: "matchesWon",
        minSize: 180,
        cell: (row) => <i>{row.getValue()}</i>,
        header: () => <span>Partidos Ganados</span>,
      })
      ,
      columnHelper.accessor("matchesLost", {
        id: "matchesLost",
        minSize: 180,
        cell: (row) => <i>{row.getValue()}</i>,
        header: () => <span>Partidos Perdidos</span>,
      })
      ,
      columnHelper.accessor("gamesWon", {
        id: "gamesWon",
        minSize: 180,
        cell: (row) => <i>{row.getValue()}</i>,
        header: () => <span>Games Ganados</span>,
      })
      ,
      columnHelper.accessor("gamesLost", {
        id: "gamesLost",
        minSize: 180,
        cell: (row) => <i>{row.getValue()}</i>,
        header: () => <span>Games Perdidos</span>,
      })
    ],
  ];

  return (
    <BaseTable data={playerStats} title="Resumen del torneo" columns={columns} />
  );
};

SummaryTemplate.propTypes = {
  playerStats: PropTypes.arrayOf(
    PropTypes.shape({})
  ).isRequired,
};

export default SummaryTemplate;
