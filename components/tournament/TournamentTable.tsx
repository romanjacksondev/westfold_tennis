import Link from "next/link";
import React from "react";
import FormatDate from "../../utils/FormatDate";

const TdStyle = {
  ThStyle: `w-1/6 min-w-[160px] border-l border-transparent py-4 px-3 text-lg font-semibold lg:py-7 lg:px-4`,
  TdStyle: `border-b border-l border-[#E8E8E8] bg-[#F3F6FF] py-5 px-2 text-center text-base font-medium text-dark`,
  TdButton: `inline-block px-6 py-2 border rounded border-primary text-primary hover:bg-primary hover:text-white`,
};

const Table = ({ records }) => {

console.log(records)

  if (records.length === 0) {
    return <></>;
  } else {
    return (
      <section className="pt-10 bg-white">
        <div className="container">
          <div className="flex flex-wrap -mx-4">
            <div className="w-full ">
              <div className="max-w-full overflow-x-auto">
                <table className="w-full table-auto">
                  <thead className="text-center bg-primary">
                    <tr>
                      <th className={TdStyle.ThStyle}> Nombre </th>
                      <th className={TdStyle.ThStyle}> Ganador </th>
                      <th className={TdStyle.ThStyle}> Puntos </th>
                      <th className={TdStyle.ThStyle}> Fecha </th>
                    </tr>
                  </thead>

                  <tbody>
                    {records.map((tournament) => (
                      <tr key={tournament.id}>
                        <td className={TdStyle.TdStyle}>
                          <Link href={`/tournaments/${tournament.id}`}>
                            {tournament.name}
                          </Link>
                        </td>
                        <td className={TdStyle.TdStyle}>{tournament.winner.name}</td>
                        <td className={TdStyle.TdStyle}>{tournament.points}</td>
                        <td className={TdStyle.TdStyle}>
                          <FormatDate dateString={tournament.date} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
};

export default Table;
