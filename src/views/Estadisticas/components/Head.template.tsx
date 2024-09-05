import { TextHeadingH4 } from "components/Text";
import PropTypes from 'prop-types';

const HeadTemplate = ({ h2h }) => {

  const Styles = {
    ThStyle: `py-4 px-3 bg-rolandGarrosRed border-b border-l`,
    TdStyle: `py-5 px-2 bg-rolandGarrosOrange border-b border-l`,
  };
  // console.info(h2h)
  const jugadores = Object.keys(h2h);

  // if (jugadores) {
  //   return (
  //     <>
  //       Loading
  //     </>
  //   )
  // }

  return (
    <>
      <TextHeadingH4>Head 2 Head</TextHeadingH4>

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
                  {
                    (h2h[jugador1] == h2h[jugador2]) ? <div className="text-center">-</div> :
                      <>
                        <div className="text-center"><strong>Ganados:</strong> {h2h[jugador1].won[jugador2] || 0}</div>
                        <div className="text-center"><strong>Perdidos:</strong> {h2h[jugador1].lost[jugador2] || 0}</div>
                      </>
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )

}

HeadTemplate.propTypes = {
  h2h: PropTypes.shape({}).isRequired
};


export default HeadTemplate