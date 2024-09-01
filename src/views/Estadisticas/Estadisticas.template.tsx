const EstadisticasTemplate = ({ h2h }) => {

  const Styles = {
    ThStyle: `py-4 px-3 bg-rolandGarrosRed border-b border-l`,
    TdStyle: `py-5 px-2 bg-rolandGarrosOrange border-b border-l`,
  };

  const jugadores = Object.keys(h2h);
  // console.log(jugadores)

  return (
    <>
      <table className="w-full table-auto">
        <thead className="text-center bg-gray-300">
          <tr>
            <th className={Styles.ThStyle}> Jugador </th>
            {jugadores.map(jugador => (
              <th className={Styles.ThStyle} key={jugador}>{jugador}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {jugadores.map(jugador1 => (
            <tr key={jugador1}>
              <td className={Styles.TdStyle}>{jugador1}</td>
              {jugadores.map(jugador2 => (
                <td className={Styles.TdStyle} key={jugador2}>
                  <div><strong>Ganados:</strong> {h2h[jugador1].won[jugador2] || 0}</div>
                  <div><strong>Perdidos:</strong> {h2h[jugador1].lost[jugador2] || 0}</div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )

}
export default EstadisticasTemplate