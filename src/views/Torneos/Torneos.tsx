const TorneosView = () => {
  const records = [
    {
      id: 1,
      name: "nombre",
      winner: { name: "yo" },
      venue: { points: "344" },
      tournament: "cccc",
      date: "",
    },
  ];

  const TdStyle = {
    ThStyle: `w-1/6 min-w-[160px] border-l border-transparent py-4 px-3 text-lg font-semibold lg:py-7 lg:px-4`,
    TdStyle: `border-b border-l border-[#E8E8E8] bg-[#F3F6FF] py-5 px-2 text-center text-base font-medium text-dark`,
    TdButton: `inline-block px-6 py-2 border rounded border-primary text-primary hover:bg-primary hover:text-white`,
  };

  return (
    <>
      <table className="w-full table-auto">
        <thead className="text-center bg-primary">
          <tr>
            <th className={TdStyle.ThStyle}> Nombre </th>
            <th className={TdStyle.ThStyle}> Ganador </th>
            <th className={TdStyle.ThStyle}> Puntos </th>
            <th className={TdStyle.ThStyle}> Fecha </th>
            <th className={TdStyle.ThStyle}> </th>
          </tr>
        </thead>

        <tbody>
          {records.map((tournament) => (
            <tr key={tournament.id}>
              <td className={TdStyle.TdStyle}>{tournament.name}</td>
              <td className={TdStyle.TdStyle}>{tournament.winner.name}</td>
              <td className={TdStyle.TdStyle}>{tournament.venue.points}</td>
              <td className={TdStyle.TdStyle}>
                {/* <FormatDate dateString={tournament.date} /> */}
                {tournament.date}
              </td>
              <td className={TdStyle.TdStyle}>
                {/* <Link href={`/tournaments/${tournament.id}`}> */}
                Ver Detalles
                {/* </Link> */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default TorneosView;
