'use client';

import { useState, useMemo, FormEvent } from 'react';
import TournamentTypeVisual from './TournamentTypeVisual';

type RecordItem = { id: string; name?: string; [key: string]: unknown };
type Options = {
  players: RecordItem[];
  venues: RecordItem[];
  surfaces: RecordItem[];
  categories: RecordItem[];
  types: RecordItem[];
  tournaments: RecordItem[];
  users: RecordItem[];
};

type Props = {
  tournament: RecordItem;
  options: Options;
  onClose: () => void;
  onSuccess: (message: string) => void;
};

const tournamentTypeInfo: Record<string, { description: string; rounds: string[] }> = {
  'Round Robin': {
    description: 'Todos los jugadores se enfrentan entre sí. La tabla final define las posiciones.',
    rounds: ['Jugador 1 vs Jugador 2', 'Jugador 1 vs Jugador 3', 'Tabla de posiciones'],
  },
  'Round Robin + Playoffs': {
    description: 'La fase de todos contra todos define los clasificados para una llave final.',
    rounds: ['Fase regular', 'Semifinales', 'Final'],
  },
  Playoffs: {
    description: 'Eliminación directa: cada partido define quién avanza hasta la final.',
    rounds: ['Cuartos de final', 'Semifinales', 'Final'],
  },
};

export default function TournamentPreparationModal({ tournament, options, onClose, onSuccess }: Props) {
  const [name, setName] = useState(String(tournament.name ?? ''));
  const [date, setDate] = useState(() => {
    if (tournament.date) {
      return new Date(tournament.date as string).toISOString().split('T')[0];
    }
    return new Date().toISOString().split('T')[0];
  });
  const [venueId, setVenueId] = useState(String(tournament.venueId ?? ''));
  const [surfaceId, setSurfaceId] = useState(String(tournament.surfaceId ?? ''));
  const [tournamentCategoryId, setTournamentCategoryId] = useState(String(tournament.tournamentCategoryId ?? ''));
  const [tournamentTypeId, setTournamentTypeId] = useState(String(tournament.tournamentTypeId ?? ''));
  const [drawSize, setDrawSize] = useState(tournament.drawSize ? String(tournament.drawSize) : '8');
  const [qualifiers, setQualifiers] = useState(tournament.qualifiers ? String(tournament.qualifiers) : '2');
  
  // Players selection
  const initialPlayers = useMemo(() => {
    if (Array.isArray(tournament.players)) {
      return (tournament.players as { id: string }[]).map((p) => p.id);
    }
    return [];
  }, [tournament.players]);

  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>(initialPlayers);
  const [playerSearch, setPlayerSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTypePicker, setShowTypePicker] = useState(false);

  const selectedType = options.types.find((t) => t.id === tournamentTypeId);
  const isRoundRobinPlusPlayoffs = String(selectedType?.name).trim().toLowerCase() === 'round robin + playoffs';

  // Available players filtering
  const availablePlayers = useMemo(() => {
    const term = playerSearch.trim().toLowerCase();
    return options.players.filter((p) => {
      if (selectedPlayerIds.includes(p.id)) return false;
      if (!term) return true;
      const fullName = `${p.name ?? ''} ${p.lastname ?? ''}`.toLowerCase();
      const nickname = String(p.nickname ?? '').toLowerCase();
      return fullName.includes(term) || nickname.includes(term);
    });
  }, [options.players, selectedPlayerIds, playerSearch]);

  const selectedPlayers = useMemo(() => {
    return selectedPlayerIds
      .map((id) => options.players.find((p) => p.id === id))
      .filter(Boolean) as RecordItem[];
  }, [options.players, selectedPlayerIds]);

  const targetDrawSize = Number(drawSize) || 0;
  const isDrawExceeded = targetDrawSize > 0 && selectedPlayerIds.length > targetDrawSize;
  const isDrawComplete = targetDrawSize > 0 && selectedPlayerIds.length === targetDrawSize;
  const canStart = Boolean(
    name.trim() &&
    venueId &&
    surfaceId &&
    tournamentCategoryId &&
    tournamentTypeId &&
    targetDrawSize >= 2 &&
    selectedPlayerIds.length >= 2 &&
    !isDrawExceeded
  );

  function addPlayer(id: string) {
    setSelectedPlayerIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }

  function removePlayer(id: string) {
    setSelectedPlayerIds((prev) => prev.filter((pId) => pId !== id));
  }

  async function saveTournament(andStart = false) {
    setError(null);
    if (!name.trim()) {
      setError('El nombre del torneo es obligatorio.');
      return;
    }

    if (andStart && !canStart) {
      setError('Para iniciar el torneo se requiere completar sede, superficie, categoría, formato, tamaño de cuadro y al menos 2 jugadores.');
      return;
    }

    if (andStart) setStarting(true);
    else setSaving(true);

    try {
      // 1. Update basic fields and players
      const payload: Record<string, unknown> = {
        name: name.trim(),
        date: date || new Date().toISOString(),
        venueId: venueId || undefined,
        surfaceId: surfaceId || undefined,
        tournamentCategoryId: tournamentCategoryId || undefined,
        tournamentTypeId: tournamentTypeId || undefined,
        drawSize: drawSize ? Number(drawSize) : null,
        qualifiers: isRoundRobinPlusPlayoffs && qualifiers ? Number(qualifiers) : null,
        playerIds: selectedPlayerIds,
      };

      const res = await fetch(`/api/admin/tournaments/${tournament.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Error al guardar los cambios');

      // 2. If start requested, trigger transition action
      if (andStart) {
        const startRes = await fetch(`/api/admin/tournaments/${tournament.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'start' }),
        });
        const startData = await startRes.json();
        if (!startRes.ok) throw new Error(startData.message ?? 'No se pudo iniciar el torneo');
        onSuccess(startData.message ?? '¡Torneo iniciado con éxito! Estado: En curso');
      } else {
        onSuccess(data.message ?? 'Torneo actualizado correctamente (En preparación)');
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error');
    } finally {
      setSaving(false);
      setStarting(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    saveTournament(false);
  }

  return (
    <div className="type-modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className="type-modal preparation-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="prep-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="panel-heading">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <p className="eyebrow" style={{ margin: 0 }}>Estado: En preparación</p>
              <span className="status-pill prep-status-pill">Editable</span>
            </div>
            <h2 id="prep-modal-title" style={{ margin: '4px 0 0' }}>
              {tournament.name ? `Configurar “${tournament.name}”` : 'Configurar Torneo'}
            </h2>
          </div>
          <button type="button" className="text-button" onClick={onClose}>
            ✕ Cerrar
          </button>
        </div>

        {error && <div className="request-message error" role="alert" style={{ margin: '14px 0' }}>{error}</div>}

        <form onSubmit={handleSubmit} className="prep-modal-form">
          <div className="prep-modal-grid">
            {/* Columna Izquierda: Parámetros del Torneo */}
            <div className="prep-modal-col">
              <h3 className="prep-section-title">Parámetros del torneo</h3>

              <label className="field">
                <span>Nombre del torneo <b>*</b></span>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Masters Series II"
                />
              </label>

              <div className="prep-fields-row">
                <label className="field">
                  <span>Fecha</span>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </label>

                <label className="field">
                  <span>Sede <b>*</b></span>
                  <select value={venueId} onChange={(e) => setVenueId(e.target.value)} required>
                    <option value="">Seleccionar sede...</option>
                    {options.venues.map((v) => (
                      <option key={v.id} value={v.id}>{String(v.name ?? v.id)}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="prep-fields-row">
                <label className="field">
                  <span>Superficie <b>*</b></span>
                  <select value={surfaceId} onChange={(e) => setSurfaceId(e.target.value)} required>
                    <option value="">Seleccionar superficie...</option>
                    {options.surfaces.map((s) => (
                      <option key={s.id} value={s.id}>{String(s.name ?? s.id)}</option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span>Categoría <b>*</b></span>
                  <select value={tournamentCategoryId} onChange={(e) => setTournamentCategoryId(e.target.value)} required>
                    <option value="">Seleccionar categoría...</option>
                    {options.categories.map((c) => (
                      <option key={c.id} value={c.id}>{String(c.name ?? c.id)}</option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="field">
                <span>Formato / Tipo de torneo <b>*</b></span>
                <button
                  type="button"
                  className={`type-selector ${selectedType ? 'has-value' : ''}`}
                  onClick={() => setShowTypePicker(true)}
                >
                  {selectedType ? String(selectedType.name) : 'Seleccionar formato...'}
                </button>
              </label>

              <div className="prep-fields-row">
                <label className="field">
                  <span>Tamaño del cuadro (cupos) <b>*</b></span>
                  <input
                    type="number"
                    min={2}
                    value={drawSize}
                    onChange={(e) => setDrawSize(e.target.value)}
                    placeholder="Ej: 8, 16, 32"
                  />
                </label>

                {isRoundRobinPlusPlayoffs && (
                  <label className="field">
                    <span>Clasificados a playoffs <b>*</b></span>
                    <input
                      type="number"
                      min={2}
                      value={qualifiers}
                      onChange={(e) => setQualifiers(e.target.value)}
                      placeholder="Ej: 2, 4"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Columna Derecha: Gestión Ágil de Jugadores */}
            <div className="prep-modal-col prep-players-col">
              <div className="prep-players-header">
                <div>
                  <h3 className="prep-section-title" style={{ margin: 0 }}>Jugadores participantes</h3>
                  <p className="muted" style={{ margin: '2px 0 0', fontSize: '13px' }}>
                    Agregá o quitá jugadores para armar el cuadro.
                  </p>
                </div>
                <div className={`prep-slots-badge ${isDrawExceeded ? 'exceeded' : isDrawComplete ? 'complete' : ''}`}>
                  <span>{selectedPlayerIds.length}</span> / {targetDrawSize || '—'} cupos
                </div>
              </div>

              {isDrawExceeded && (
                <div className="draw-warning">
                  ⚠️ Hay más jugadores confirmados ({selectedPlayerIds.length}) que los cupos configurados ({targetDrawSize}).
                </div>
              )}

              {/* Jugadores confirmados (chips) */}
              <div className="prep-selected-box">
                <span className="prep-box-label">Confirmados ({selectedPlayers.length})</span>
                {selectedPlayers.length === 0 ? (
                  <p className="prep-box-empty">Todavía no hay jugadores confirmados.</p>
                ) : (
                  <div className="prep-chips-wrap">
                    {selectedPlayers.map((player) => (
                      <span className="prep-chip" key={player.id}>
                        <strong>{String(player.name ?? player.id)}</strong>
                        {player.nickname ? <small>“{String(player.nickname)}”</small> : null}
                        <button
                          type="button"
                          className="prep-chip-remove"
                          onClick={() => removePlayer(player.id)}
                          title={`Quitar a ${String(player.name ?? player.id)}`}
                          aria-label={`Quitar a ${String(player.name ?? player.id)}`}
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Buscador de jugadores disponibles */}
              <div className="prep-search-box">
                <span className="prep-box-label">Agregar jugadores</span>
                <input
                  type="text"
                  className="search-input prep-player-search"
                  value={playerSearch}
                  onChange={(e) => setPlayerSearch(e.target.value)}
                  placeholder="Buscar jugador por nombre o apodo..."
                />

                <div className="prep-available-list">
                  {availablePlayers.length === 0 ? (
                    <p className="prep-box-empty">
                      {playerSearch ? 'No se encontraron jugadores que coincidan.' : 'Todos los jugadores disponibles ya fueron agregados.'}
                    </p>
                  ) : (
                    availablePlayers.slice(0, 15).map((player) => (
                      <button
                        key={player.id}
                        type="button"
                        className="prep-available-item"
                        onClick={() => addPlayer(player.id)}
                        title={`Sumar a ${String(player.name ?? player.id)}`}
                      >
                        <div>
                          <strong>{String(player.name ?? player.id)}</strong>
                          {player.nickname ? <span> “{String(player.nickname)}”</span> : null}
                          {player.lastname ? <small> ({String(player.lastname)})</small> : null}
                        </div>
                        <span className="prep-add-icon">+ Agregar</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Acciones del Modal */}
          <div className="prep-modal-footer">
            <button type="button" className="text-button" onClick={onClose} disabled={saving || starting}>
              Cerrar
            </button>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="submit"
                className="secondary-button prep-btn-save"
                disabled={saving || starting}
                title="Guarda la configuración y participantes manteniendo el torneo en preparación"
              >
                {saving ? 'Guardando...' : 'Guardar borrador'}
              </button>

              <button
                type="button"
                className="primary-button prep-btn-start"
                onClick={() => saveTournament(true)}
                disabled={saving || starting || !canStart}
                title={
                  canStart
                    ? 'Inicia formalmente la competencia y cambia el estado a En curso'
                    : 'Para iniciar completá todos los campos obligatorios y al menos 2 jugadores'
                }
              >
                {starting ? 'Iniciando...' : '🚀 Iniciar torneo'}
              </button>
            </div>
          </div>
        </form>

        {/* Modal anidado para elegir formato */}
        {showTypePicker && (
          <div className="type-modal-backdrop" role="presentation" onClick={() => setShowTypePicker(false)}>
            <section
              className="type-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="prep-format-title"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Formato de competencia</p>
                  <h2 id="prep-format-title">Elegí el tipo de torneo</h2>
                </div>
                <button type="button" className="text-button" onClick={() => setShowTypePicker(false)}>
                  Cerrar
                </button>
              </div>
              <div className="type-info-list">
                {Object.entries(tournamentTypeInfo).map(([typeName, info]) => {
                  const option = options.types.find(
                    (item) => String(item.name).trim().toLowerCase() === typeName.toLowerCase()
                  );
                  return (
                    <button
                      type="button"
                      className={`type-info-item ${tournamentTypeId === option?.id ? 'selected' : ''}`}
                      key={typeName}
                      disabled={!option}
                      onClick={() => {
                        if (!option) return;
                        setTournamentTypeId(option.id);
                        setShowTypePicker(false);
                      }}
                    >
                      <div className="draw-preview" aria-hidden="true">
                        <TournamentTypeVisual typeName={typeName} />
                      </div>
                      <div>
                        <h3>
                          {typeName}
                          {tournamentTypeId === option?.id && <small className="type-selected-label">Seleccionado</small>}
                        </h3>
                        <p>{info.description}</p>
                        <small>{info.rounds.join(' · ')}</small>
                        {!option && <small className="type-unavailable">No disponible</small>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
