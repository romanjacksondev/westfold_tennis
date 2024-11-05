/** @format */

import { format } from "date-fns";
import Link from "next/link";
import { TextBodyXs } from "components/Text";
import LoadingComponent from "components/Loader";
import BaseTable from "components/BaseTable/BaseTable";
import { createColumnHelper } from "@tanstack/react-table";
import { Eye, Trophy } from "lucide-react";
import PropTypes from "prop-types";

const TournamentsTemplate = ({ tournaments }) => {
  if (tournaments.length == 0) {
    return <LoadingComponent size="large" />;
  }

  const columnHelper = createColumnHelper<any>();

  const columns = [
    columnHelper.accessor("name", {
      id: "name",
      minSize: 180,
      cell: (row) => <i>{row.getValue()}</i>,
      header: () => <span>Nombre</span>,
    }),
    columnHelper.accessor("champion.name", {
      id: "championName",
      cell: (info) => (
        <div>
          <Trophy className="w-4 h-4 inline mr-2 text-yellow-300" />
          <i>{info.getValue()}</i>
        </div>
      ),
      header: () => <span>Ganador</span>,
    }),
    columnHelper.accessor(
      (row) => row.tournamentCategory.tournamentCategoryPoints[0].points,
      {
        id: "somethingLong",
        cell: (info) => <i>{info.getValue()}</i>,
        header: () => <span>Puntos</span>,
      }
    ),
    columnHelper.accessor("date", {
      id: "date",
      cell: (info) => <i>{format(info.getValue(), "dd/MM/yyyy")}</i>,
      header: () => <span>Fecha</span>,
    }),
    columnHelper.accessor("id", {
      id: "actions",
      cell: (info) => (
        <Link href={`/torneos/${info.getValue()}`}>
          <TextBodyXs className="font-bold">
            <Eye />
          </TextBodyXs>
        </Link>
      ),
      header: () => <span>Acciones</span>,
    }),
  ];

  return (
    <BaseTable
      title="Historial de torneos"
      data={tournaments}
      columns={columns}
    />
  );
};

TournamentsTemplate.propTypes = {
  tournaments: PropTypes.arrayOf(
    PropTypes.shape({})
  ).isRequired,
};

export default TournamentsTemplate;
