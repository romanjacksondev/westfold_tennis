/** @format */
import { createColumnHelper } from "@tanstack/react-table";
import BaseTable from "components/BaseTable/BaseTable";
import PropTypes from "prop-types";

const SummaryTemplate = ({ summary }) => {
  // console.log("summary: ", summary)

  type Set = {
    gamesJugador1: number
    gamesJugador2: number
  }
  type MatchSummary = {
    player1Name: {
      name: string
    }
    player2Name: {
      name: string
    }
    sets: Set[]
  }

  const columnHelper = createColumnHelper<MatchSummary>();

  const columns = [
    ...[
      columnHelper.accessor("player1Name.name", {
        id: "player1Id",
        minSize: 180,
        cell: (row) => <i>{row.getValue()}</i>,
        header: () => <span>Nombre 1</span>,
      }),
      columnHelper.accessor("sets", {
        id: "sets",
        minSize: 180,
        cell: (row) => <i>{
          <ul>
            {row.getValue().map((game, i) =>
              <li key={i}>
                {game.gamesJugador1} - {game.gamesJugador2}
              </li>
            )}
          </ul>
        }</i>,
        header: () => <span>Resultado</span>,
      }),
      columnHelper.accessor("player2Name.name", {
        id: "player2Name",
        minSize: 180,
        cell: (row) => <i>{row.getValue()}</i>,
        header: () => <span>Nombre 2</span>,
      })
    ],
  ];

  return (
    <BaseTable data={summary} title="Resumen del torneo" columns={columns} />
  );
};

SummaryTemplate.propTypes = {
  summary: PropTypes.arrayOf(
    PropTypes.shape({})
  ).isRequired,
};

export default SummaryTemplate;
