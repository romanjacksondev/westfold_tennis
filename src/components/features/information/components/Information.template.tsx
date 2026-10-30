import Link from 'next/link';
import { LuCalendarRange, LuListOrdered, LuMedal, LuNetwork, LuScale, LuTrophy } from 'react-icons/lu';
import TournamentTypeVisual from '@/components/features/admin/TournamentTypeVisual';

export type PointsRange = { key: string; label: string; from: number };
export type PointsExample = {
  category: string;
  perWin: number;
  champion: number;
  finalist: number;
  semifinal: number;
  quarterfinal: number;
};
export type PointsRow = { name: string; perWin: number; points: Record<string, number>; top: number };

const formats = [
  {
    name: 'Round Robin',
    description: 'Todos los jugadores se enfrentan entre sí, como en una liga.',
    scoring: 'Sumás los puntos de la categoría por cada partido ganado.',
  },
  {
    name: 'Round Robin + Playoffs',
    description: 'Una fase de todos contra todos define quiénes clasifican a una llave final (semifinales y final).',
    scoring:
      'Sumás los puntos por cada partido ganado en la fase de todos contra todos, más los puntos de la fase que alcanzás en los playoffs. Perder la primera ronda de playoffs no suma puntos por fase.',
  },
  {
    name: 'Playoffs',
    description: 'Eliminación directa: cada partido define quién avanza hasta la final.',
    scoring: 'Sumás los puntos de la fase a la que llegás: campeón, finalista, semifinal o cuartos de final. No hay puntos por partido.',
  },
];

const PointsTable = ({ rows, ranges, perWin }: { rows: PointsRow[]; ranges: PointsRange[]; perWin: boolean }) => (
  <div className="info-table-wrap">
    <table className={`info-table ${perWin ? 'info-table-perwin' : ''}`}>
      <thead>
        <tr>
          <th scope="col">Categoría</th>
          {perWin && <th scope="col">Por partido ganado</th>}
          {ranges.map((range) => (
            <th scope="col" key={range.key}>
              {range.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.name}>
            <th scope="row">{row.name}</th>
            {perWin && <td>{row.perWin || '—'}</td>}
            {ranges.map((range) => (
              <td key={range.key}>{row.points[range.key] ?? '—'}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const ExampleTable = ({ caption, head, rows }: { caption: string; head: string[]; rows: (string | number)[][] }) => (
  <div className="info-example">
    <p className="info-example-title">{caption}</p>
    <div className="info-table-wrap">
      <table className="info-table info-table-example">
        <thead>
          <tr>
            {head.map((label) => (
              <th scope="col" key={label}>
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={String(row[0])}>
              <th scope="row">{row[0]}</th>
              {row.slice(1).map((cell, index) => (
                <td key={index}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const InformationTemplate = ({
  ranges,
  rows,
  example,
}: {
  ranges: PointsRange[];
  rows: PointsRow[];
  example: PointsExample | null;
}) => (
  <main className="info-page">
    <header className="info-header">
      <p className="eyebrow">Cómo funciona</p>
      <h1>Reglas y puntuación</h1>
      <p className="muted">Todo lo que necesitas saber para entender el ranking y los torneos del circuito.</p>
    </header>

    <section className="info-section" aria-labelledby="info-points">
      <div className="info-section-title">
        <LuMedal aria-hidden="true" />
        <h2 id="info-points">Cómo se suman los puntos</h2>
      </div>
      <p>
        Los puntos dependen de la <strong>categoría</strong> del torneo y de su <strong>formato</strong>. Se suman cuando el
        torneo termina: los torneos en curso todavía no puntúan. El ranking es la suma de los puntos de todos los torneos
        dentro del período elegido.
      </p>
      <ul className="info-list">
        <li>
          <LuCalendarRange aria-hidden="true" />
          <span>
            <strong>12 meses:</strong> cuenta cada torneo durante los 365 días posteriores a su fecha. Después deja de sumar.
          </span>
        </li>
        <li>
          <LuCalendarRange aria-hidden="true" />
          <span>
            <strong>Año calendario:</strong> suma solo los torneos disputados entre el 1 de enero y el 31 de diciembre del
            año en curso.
          </span>
        </li>
        <li>
          <LuNetwork aria-hidden="true" />
          <span>
            Hombres y mujeres tienen <strong>rankings separados</strong>, con la misma tabla de puntos.
          </span>
        </li>
      </ul>

      {rows.length === 0 || !example ? (
        <p className="info-empty">Todavía no hay categorías de torneo cargadas.</p>
      ) : (
        <div className="info-scoring">
          <article className="info-scoring-block">
            <h3>Round Robin</h3>
            <p>{formats[0].scoring}</p>
            <PointsTable rows={rows} ranges={[]} perWin />
            <ExampleTable
              caption={`Ejemplo: 4 jugadores, categoría ${example.category}`}
              head={['Jugador', 'Partidos ganados', 'Puntos']}
              rows={[
                ['Ana', 3, 3 * example.perWin],
                ['Beto', 2, 2 * example.perWin],
                ['Carla', 1, example.perWin],
                ['Diego', 0, 0],
              ]}
            />
          </article>

          <article className="info-scoring-block">
            <h3>Playoffs</h3>
            <p>{formats[2].scoring}</p>
            <PointsTable rows={rows} ranges={ranges} perWin={false} />
            <ExampleTable
              caption={`Ejemplo: cuadro de 8 jugadores, categoría ${example.category}`}
              head={['Jugador', 'Hasta dónde llegó', 'Puntos']}
              rows={[
                ['Ana', 'Campeona', example.champion],
                ['Beto', 'Perdió la final', example.finalist],
                ['Carla', 'Perdió en semifinales', example.semifinal],
                ['Diego', 'Perdió en semifinales', example.semifinal],
                ['Eva', 'Perdió en cuartos de final', example.quarterfinal],
              ]}
            />
          </article>

          <article className="info-scoring-block">
            <h3>Round Robin + Playoffs</h3>
            <p>{formats[1].scoring}</p>
            <PointsTable rows={rows} ranges={ranges} perWin />
            <ExampleTable
              caption={`Ejemplo: 4 jugadores clasifican a semifinales, categoría ${example.category}`}
              head={['Jugador', 'Victorias en grupos', 'Fase de playoffs', 'Puntos']}
              rows={[
                ['Ana', `3 × ${example.perWin} = ${3 * example.perWin}`, `Campeona: ${example.champion}`, 3 * example.perWin + example.champion],
                ['Beto', `2 × ${example.perWin} = ${2 * example.perWin}`, `Final: ${example.finalist}`, 2 * example.perWin + example.finalist],
                ['Carla', `1 × ${example.perWin} = ${example.perWin}`, 'Perdió su primer partido de playoffs: 0', example.perWin],
                ['Diego', '0', 'Perdió su primer partido de playoffs: 0', 0],
              ]}
            />
          </article>
        </div>
      )}
      <p className="info-note">Un guion (—) significa que no suma puntos en esa categoría.</p>
    </section>

    <section className="info-section" aria-labelledby="info-tiebreak">
      <div className="info-section-title">
        <LuScale aria-hidden="true" />
        <h2 id="info-tiebreak">Cómo se desempata</h2>
      </div>
      <p>
        Cuando dos jugadores quedan igualados en la tabla de un torneo (por ejemplo para definir quién clasifica a playoffs),
        se desempata con estos criterios, en este orden:
      </p>
      <ol className="info-steps">
        <li>
          <strong>Partidos ganados.</strong> Quien gana más partidos queda arriba.
          <em className="info-step-example">Ejemplo: Ana ganó 2 partidos y Beto 1. Ana queda arriba, aunque Beto tenga mejores sets o games.</em>
        </li>
        <li>
          <strong>Diferencia de sets.</strong> Sets ganados menos sets perdidos.
          <em className="info-step-example">Ejemplo: Ana y Beto ganaron 2 partidos. Ana ganó 5 sets y perdió 2 (+3); Beto ganó 4 y perdió 3 (+1). Ana queda arriba.</em>
        </li>
        <li>
          <strong>Diferencia de games.</strong> Games ganados menos games perdidos.
          <em className="info-step-example">Ejemplo: mismos partidos y sets. Ana ganó 40 games y perdió 30 (+10); Beto ganó 38 y perdió 32 (+6). Ana queda arriba.</em>
        </li>
        <li>
          <strong>Games ganados.</strong> Si sigue el empate, quien haya ganado más games.
          <em className="info-step-example">Ejemplo: ambos tienen +4 de diferencia. Ana ganó 34 games (34-30) y Beto 30 (30-26). Ana queda arriba.</em>
        </li>
        <li>
          <strong>Partido entre ambos.</strong> Si todo lo anterior es igual, queda arriba quien ganó el partido que
          jugaron entre sí.
          <em className="info-step-example">Ejemplo: Ana y Beto están igualados en todo, pero Beto le ganó el partido a Ana. Beto queda arriba.</em>
        </li>
      </ol>
    </section>

    <section className="info-section" aria-labelledby="info-formats">
      <div className="info-section-title">
        <LuNetwork aria-hidden="true" />
        <h2 id="info-formats">Formatos de torneo</h2>
      </div>
      <div className="info-formats">
        {formats.map((format) => (
          <article className="info-format" key={format.name}>
            <div className="info-format-visual" aria-hidden="true">
              <TournamentTypeVisual typeName={format.name} />
            </div>
            <h3>{format.name}</h3>
            <p>{format.description}</p>
          </article>
        ))}
      </div>
    </section>

    <section className="info-section" aria-labelledby="info-reading">
      <div className="info-section-title">
        <LuListOrdered aria-hidden="true" />
        <h2 id="info-reading">Cómo leer el ranking</h2>
      </div>
      <dl className="info-glossary">
        <div>
          <dt>Puntos</dt>
          <dd>Total acumulado en el período. Al abrir un jugador se ve cuánto aportó cada torneo.</dd>
        </div>
        <div>
          <dt>Récord y % de victorias</dt>
          <dd>Partidos ganados y perdidos en el período, y el porcentaje de victorias sobre el total.</dd>
        </div>
        <div>
          <dt>Forma</dt>
          <dd>
            Los últimos 5 partidos: <span className="info-dot win" /> victoria y <span className="info-dot loss" /> derrota. El
            más reciente está a la derecha.
          </dd>
        </div>
        <div>
          <dt>🏆 Títulos</dt>
          <dd>Torneos ganados dentro del período.</dd>
        </div>
      </dl>
      <div className="info-sample" aria-hidden="true">
        <p className="info-example-title">Así se ve una fila del ranking</p>
        <div className="lb-row info-sample-row">
          <span className="lb-row-pos">1</span>
          <span className="lb-avatar lb-avatar-sm">AN</span>
          <span className="lb-row-main">
            <span className="lb-row-name">Ana</span>
            <span className="lb-titles">
              <LuTrophy /> 2
            </span>
          </span>
          <span className="lb-form">
            {['W', 'W', 'L', 'W', 'W'].map((result, index) => (
              <span key={index} className={`info-dot ${result === 'W' ? 'win' : 'loss'}`} />
            ))}
          </span>
          <span className="lb-row-record">
            14-3<small>82%</small>
          </span>
          <span className="lb-row-points">3350 pts</span>
        </div>
        <ul className="info-sample-legend">
          <li>1 · posición</li>
          <li>🏆 2 · títulos</li>
          <li>puntos de colores · últimos 5 partidos (verde ganado, rojo perdido)</li>
          <li>14-3 · 82% · récord y victorias</li>
          <li>3350 pts · total</li>
        </ul>
      </div>
      <p className="info-note">
        <Link href="/leaderboard">Ver el ranking →</Link>
      </p>
    </section>
  </main>
);

export default InformationTemplate;
