import CardComponent from '@/components/Card/Card.template';
import { TennisPlayerProps } from '../types/Players';

const PlayersTemplate = ({ players }: { players: TennisPlayerProps[] }) => {
  return (
    <main className="players-page">
      <header className="players-header">
        <div>
          <p className="eyebrow">Comunidad</p>
          <h1>Jugadores</h1>
          <p className="muted">Conoce a quienes forman parte del circuito.</p>
        </div>
        <div className="status-pill"><span /> {players.length} registrados</div>
      </header>
      <section className="players-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Perfiles deportivos</p>
            <h2>Todos los jugadores</h2>
          </div>
        </div>
        {players.length === 0 ? (
          <p className="players-empty">No hay jugadores para mostrar.</p>
        ) : (
          <div className="players-grid">
            {players.map((player) => (
              <CardComponent
                key={player.id}
                id={player.id}
                name={player.name}
                lastname={player.lastname}
                imageUrl={`/img/avatar/${player.nickname.replace(' ', '').toLowerCase()}.jpeg`}
                nickname={player.nickname}
                stats={player.stats}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default PlayersTemplate;
