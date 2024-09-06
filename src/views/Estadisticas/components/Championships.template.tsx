// import { TextHeadingH4 } from "components/Text";
import { TextHeadingH4 } from 'components/Text';
import PropTypes from 'prop-types';



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
    data.forEach(player => {
      Object.keys(player.points).forEach(point => {
        allPoints.add(point);
      });
    });
    return Array.from(allPoints).sort((a, b) => Number(a) - Number(b)); // Ordenar de menor a mayor
  };

  
  const pointTypes = getAllPointTypes(championships);

  const Styles = {
    ThStyle: `py-4 px-3 bg-rolandGarrosRed border-b border-l text-center`,
    TdStyle: `py-5 px-2 bg-rolandGarrosOrange border-b border-l text-center`,
  };
  console.log("championships: ", championships)
  if (championships.length == 0) {
    return (
      "LOADING"
    )
  }

  return (
    <>
      <TextHeadingH4>Total torneos ganados</TextHeadingH4>
      <table>
        <thead>
          <tr>
            <th className={Styles.ThStyle}>Nombre</th>
            <th className={Styles.ThStyle}>Total de Torneos Ganados</th>
            {pointTypes.map(point => (
              <th className={Styles.ThStyle} key={point}>Categoria {point}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {championships.map((player, index) => (
            <tr key={index}>
              <td className={Styles.TdStyle}>{player.name}</td>
              <td className={Styles.TdStyle}>{player.total}</td>
              {pointTypes.map(point => (
                <td className={Styles.TdStyle} key={point}>{player.points[point] || 0}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )

}

ChampionshipsTemplate.propTypes = {
  championships: PropTypes.arrayOf(
    PropTypes.shape({})
  ).isRequired
};


export default ChampionshipsTemplate