/** @format */

import { createColumnHelper } from "@tanstack/react-table";
import BaseTable from "components/BaseTable/BaseTable";
import LoadingComponent from "components/Loader";
import PropTypes from "prop-types";

const ChampionshipsTemplate = ({ championships }) => {
  interface Player {
    name: string;
    total: number;
    points: {
      [key: string]: number; // Las claves de `points` son dinámicas (pueden ser "250", "500", etc.) y los valores son números
    };
  }

  type PointType = string;

  const getAllPointTypes = (data: Player[]): PointType[] => {
    const allPoints: Set<string> = new Set();
    data.forEach((player) => {
      Object.keys(player.points).forEach((point) => {
        allPoints.add(point);
      });
    });
    return Array.from(allPoints).sort((a, b) => Number(a) - Number(b)); // Ordenar de menor a mayor
  };

  const pointTypes = getAllPointTypes(championships);

  // console.log("championships: ", championships)
  if (championships.length == 0) {
    return <LoadingComponent size="large" />;
  }

  const columnHelper = createColumnHelper<Player>();

  const columns = [
    ...[
      columnHelper.accessor("name", {
        id: "name",
        minSize: 180,
        cell: (row) => <i>{row.getValue()}</i>,
        header: () => <span>Nombre</span>,
      }),
      columnHelper.accessor("total", {
        id: "total",
        cell: (row) => <i>{row.getValue()}</i>,
        header: () => <span>Total de Torneos Ganados</span>,
      }),
    ],
  ];
  pointTypes.forEach((type) => {
    columns.push(
      columnHelper.accessor("points", {
        id: type,
        cell: (context) => <i>{context.row.original.points[type]}</i>,
        header: () => <span>{type}</span>,
      }) as any
    );
  });

  return (
    <BaseTable data={championships} title="Torneos ganados" columns={columns} />
  );
};

ChampionshipsTemplate.propTypes = {
  championships: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

export default ChampionshipsTemplate;
