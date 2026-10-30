import Link from 'next/link';
import { LuCalendarRange, LuListOrdered, LuMedal, LuNetwork, LuScale } from 'react-icons/lu';
import TournamentTypeVisual from '@/components/features/admin/TournamentTypeVisual';

export type PointsRange = { key: string; label: string; from: number };
export type PointsRow = { name: string; points: Record<string, number>; top: number };

const formats = [
  {
    name: 'Round Robin',
    description: 'Todos los jugadores se enfrentan entre sí. La tabla final define las posiciones.',
  },
  {
    name: 'Round Robin + Playoffs',
    description: 'Una fase de todos contra todos define quiénes clasifican a una llave final (semifinales y final).',
  },
  {
    name: 'Playoffs',
    description: 'Eliminación directa: cada partido define quién avanza hasta la final.',
  },
];

const InformationTemplate = ({ ranges, rows }: { ranges: PointsRange[]; rows: PointsRow[] }) => (
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
        Al terminar cada torneo, los jugadores reciben puntos según su <strong>posición final</strong> y la{' '}
        <strong>categoría</strong> del torneo. El ranking es la suma de los puntos de todos los torneos dentro del período
        elegido.
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

      {rows.length === 0 ? (
        <p className="info-empty">Todavía no hay categorías de torneo cargadas.</p>
      ) : (
        <div className="info-table-wrap">
          <table className="info-table">
            <caption className="sr-only">Puntos por categoría y posición final</caption>
            <thead>
              <tr>
                <th scope="col">Categoría</th>
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
                  {ranges.map((range) => (
                    <td key={range.key}>{row.points[range.key] ?? '—'}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="info-note">Un guion (—) significa que esa posición no suma puntos en esa categoría.</p>
    </section>

    <section className="info-section" aria-labelledby="info-tiebreak">
      <div className="info-section-title">
        <LuScale aria-hidden="true" />
        <h2 id="info-tiebreak">Cómo se desempata</h2>
      </div>
      <p>La posición final de cada torneo se ordena con estos criterios, en este orden:</p>
      <ol className="info-steps">
        <li>
          <strong>Partidos ganados.</strong> Quien gana más partidos queda arriba.
        </li>
        <li>
          <strong>Diferencia de games.</strong> Games ganados menos games perdidos.
        </li>
        <li>
          <strong>Games ganados.</strong> Si sigue el empate, quien haya ganado más games.
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
      <p className="info-note">
        <Link href="/leaderboard">Ver el ranking →</Link>
      </p>
    </section>
  </main>
);

export default InformationTemplate;
