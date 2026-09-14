'use client';

import { useMemo, useState } from 'react';
import {
  LuCheck,
  LuCopy,
  LuCrown,
  LuDices,
  LuPlus,
  LuRefreshCw,
  LuRotateCcw,
  LuTrophy,
  LuUsers,
  LuX,
} from 'react-icons/lu';
import {
  PlayoffsVisual,
  RoundRobinPlayoffsVisual,
  RoundRobinVisual,
} from '@/components/features/admin/TournamentTypeVisual';
import {
  BracketRound,
  buildEliminationBracket,
  DrawSlot,
  generateDraw,
} from '@/utils/utils';
import { RegisteredPlayer } from './DrawGenerator';

export type TournamentFormat = 'playoffs' | 'round-robin' | 'mixed';

interface DrawGeneratorTemplateProps {
  players: RegisteredPlayer[];
  loading?: boolean;
}

type GeneratedDraw =
  | {
      type: 'playoffs';
      rounds: BracketRound[];
      totalSlots: number;
      participantCount: number;
    }
  | {
      type: 'round-robin';
      rounds: { roundName: string; matches: { top: string; bottom: string }[] }[];
      playerNames: string[];
    }
  | {
      type: 'mixed';
      groups: {
        groupName: string;
        playerNames: string[];
        rounds: { roundName: string; matches: { top: string; bottom: string }[] }[];
      }[];
      bracketRounds: BracketRound[];
      qualifiersCount: number;
    };

/** Fisher-Yates array shuffle */
function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const DrawGeneratorTemplate = ({ players, loading = false }: DrawGeneratorTemplateProps) => {
  // ─── Step 1: Format ────────────────────────────────────────────────────────
  const [format, setFormat] = useState<TournamentFormat>('playoffs');

  // ─── Step 2: Player count & source ─────────────────────────────────────────
  const [playerCount, setPlayerCount] = useState<number>(8);
  const [playerSource, setPlayerSource] = useState<'club' | 'custom'>('club');
  const [selectedClubIds, setSelectedClubIds] = useState<string[]>([]);
  const [customNames, setCustomNames] = useState<string[]>(() =>
    Array.from({ length: 8 }, (_, i) => `Jugador ${i + 1}`)
  );
  const [newPlayerInput, setNewPlayerInput] = useState<string>('');

  // Mixed format qualifiers (2 or 4)
  const [qualifiersCount, setQualifiersCount] = useState<number>(2);

  // ─── Step 3: Generated Draw State ──────────────────────────────────────────
  const [generatedDraw, setGeneratedDraw] = useState<GeneratedDraw | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Active names based on playerSource and playerCount
  const activePlayerNames: string[] = useMemo(() => {
    if (playerSource === 'club') {
      const selected = players.filter((p) => selectedClubIds.includes(p.id)).map((p) => p.name);
      if (selected.length > 0) return selected;
      // Fallback: first N players from club or generic
      const fallback = players.slice(0, playerCount).map((p) => p.name);
      if (fallback.length >= playerCount) return fallback;
      const needed = playerCount - fallback.length;
      const fillers = Array.from({ length: needed }, (_, i) => `Jugador ${fallback.length + i + 1}`);
      return [...fallback, ...fillers];
    } else {
      return customNames.slice(0, playerCount);
    }
  }, [playerSource, players, selectedClubIds, customNames, playerCount]);

  // Handle format change
  const handleSelectFormat = (f: TournamentFormat) => {
    setFormat(f);
    setGeneratedDraw(null);
    if (f === 'playoffs') {
      // Playoffs work best with power of 2
      if (![4, 8, 16, 32].includes(playerCount)) {
        let nextPower = 4;
        while (nextPower < playerCount && nextPower < 32) nextPower *= 2;
        setPlayerCount(nextPower);
      }
    }
  };

  // Adjust custom names when player count changes
  const handlePlayerCountChange = (count: number) => {
    const validCount = Math.max(2, Math.min(64, count));
    setPlayerCount(validCount);
    if (validCount > customNames.length) {
      const more = Array.from(
        { length: validCount - customNames.length },
        (_, i) => `Jugador ${customNames.length + i + 1}`
      );
      setCustomNames((prev) => [...prev, ...more]);
    }
  };

  // Quick select actions for club players
  const handleSelectAllClub = () => {
    setSelectedClubIds(players.map((p) => p.id));
    if (players.length > 0) setPlayerCount(players.length);
  };

  const handleSelectRandomClub = (n: number) => {
    const shuffled = shuffleArray(players);
    const chosen = shuffled.slice(0, n);
    setSelectedClubIds(chosen.map((p) => p.id));
    setPlayerCount(n);
  };

  const toggleClubPlayer = (id: string) => {
    setSelectedClubIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      if (next.length > 0) setPlayerCount(next.length);
      return next;
    });
  };

  // Add custom player
  const handleAddCustomPlayer = () => {
    if (!newPlayerInput.trim()) return;
    setCustomNames((prev) => [...prev, newPlayerInput.trim()]);
    setPlayerCount((prev) => prev + 1);
    setNewPlayerInput('');
  };

  // Edit custom player name
  const handleUpdateCustomName = (index: number, newName: string) => {
    setCustomNames((prev) => {
      const updated = [...prev];
      updated[index] = newName;
      return updated;
    });
  };

  // Remove custom player
  const handleRemoveCustomName = (index: number) => {
    setCustomNames((prev) => prev.filter((_, i) => i !== index));
    setPlayerCount((prev) => Math.max(2, prev - 1));
  };

  // ─── Generate Draw ─────────────────────────────────────────────────────────
  const handleGenerateDraw = () => {
    const names = shuffleArray(activePlayerNames.slice(0, playerCount));

    if (format === 'playoffs') {
      // Create DrawSlots with padding to next power of 2
      const slots: DrawSlot[] = names.map((name) => ({ id: null, label: name }));
      const bracketRounds = buildEliminationBracket(slots);
      setGeneratedDraw({
        type: 'playoffs',
        rounds: bracketRounds,
        totalSlots: slots.length,
        participantCount: names.length,
      });
    } else if (format === 'round-robin') {
      const rawRounds = generateDraw(names.length, names);
      const structured = (rawRounds as string[][][]).map((round, idx) => ({
        roundName: `Jornada ${idx + 1}`,
        matches: round.map((pair) => ({ top: pair[0], bottom: pair[1] })),
      }));
      setGeneratedDraw({
        type: 'round-robin',
        rounds: structured,
        playerNames: names,
      });
    } else if (format === 'mixed') {
      // Mixed: Group stage + playoff bracket for qualifiers
      const half = Math.ceil(names.length / 2);
      const groupA = names.slice(0, half);
      const groupB = names.slice(half);

      const rawA = generateDraw(groupA.length, groupA);
      const rawB = generateDraw(groupB.length, groupB);

      const roundsA = (rawA as string[][][]).map((round, idx) => ({
        roundName: `Jornada ${idx + 1}`,
        matches: round.map((pair) => ({ top: pair[0], bottom: pair[1] })),
      }));

      const roundsB = (rawB as string[][][]).map((round, idx) => ({
        roundName: `Jornada ${idx + 1}`,
        matches: round.map((pair) => ({ top: pair[0], bottom: pair[1] })),
      }));

      // Qualifiers bracket
      const qualSlots: DrawSlot[] = [];
      if (qualifiersCount === 2) {
        qualSlots.push({ id: null, label: '1º Grupo A' });
        qualSlots.push({ id: null, label: '1º Grupo B' });
      } else {
        // 4 qualifiers: 1A vs 2B, 1B vs 2A
        qualSlots.push({ id: null, label: '1º Grupo A' });
        qualSlots.push({ id: null, label: '2º Grupo B' });
        qualSlots.push({ id: null, label: '1º Grupo B' });
        qualSlots.push({ id: null, label: '2º Grupo A' });
      }

      const bracketRounds = buildEliminationBracket(qualSlots);

      setGeneratedDraw({
        type: 'mixed',
        groups: [
          { groupName: 'Grupo A', playerNames: groupA, rounds: roundsA },
          { groupName: 'Grupo B', playerNames: groupB, rounds: roundsB },
        ],
        bracketRounds,
        qualifiersCount,
      });
    }

    // Smooth scroll to draw section
    setTimeout(() => {
      document.getElementById('draw-results-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Copy draw summary to clipboard
  const handleCopySummary = () => {
    if (!generatedDraw) return;
    let text = `WESTFOLD TENNIS CLUB — CUADRO DE TORNEO\n`;
    text += `Formato: ${
      generatedDraw.type === 'playoffs'
        ? 'Playoffs (Eliminación directa)'
        : generatedDraw.type === 'round-robin'
          ? 'Round Robin (Todos contra todos)'
          : 'Round Robin + Playoffs (Mixto)'
    }\n`;
    text += `Fecha de sorteo: ${new Date().toLocaleDateString()}\n\n`;

    if (generatedDraw.type === 'playoffs') {
      generatedDraw.rounds.forEach((r) => {
        text += `=== ${r.roundName.toUpperCase()} ===\n`;
        r.matches.forEach((m, idx) => {
          text += `  Partido ${idx + 1}: ${m.top.label} vs ${m.bottom.label}\n`;
        });
        text += `\n`;
      });
    } else if (generatedDraw.type === 'round-robin') {
      generatedDraw.rounds.forEach((r) => {
        text += `=== ${r.roundName.toUpperCase()} ===\n`;
        r.matches.forEach((m) => {
          text += `  ${m.top} vs ${m.bottom}\n`;
        });
        text += `\n`;
      });
    } else if (generatedDraw.type === 'mixed') {
      generatedDraw.groups.forEach((g) => {
        text += `=== FASE DE GRUPOS: ${g.groupName.toUpperCase()} ===\n`;
        g.rounds.forEach((r) => {
          text += `  ${r.roundName}:\n`;
          r.matches.forEach((m) => {
            text += `    ${m.top} vs ${m.bottom}\n`;
          });
        });
        text += `\n`;
      });
      text += `=== CLASIFICADOS A PLAYOFFS ===\n`;
      generatedDraw.bracketRounds.forEach((r) => {
        text += `  ${r.roundName}:\n`;
        r.matches.forEach((m, idx) => {
          text += `    Partido ${idx + 1}: ${m.top.label} vs ${m.bottom.label}\n`;
        });
      });
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <main className="draw-page">
      {/* ─── Header ────────────────────────────────────────────────────────── */}
      <header className="draw-header">
        <div>
          <p className="eyebrow">Herramientas de Competencia</p>
          <h1>Generador de Cuadros</h1>
          <p className="muted">
            Configura el formato del torneo, selecciona los participantes y genera el sorteo con visualización gráfica interactiva.
          </p>
        </div>
        <div className="status-pill">
          <span />
          Simulador oficial
        </div>
      </header>

      {/* ─── Main Configuration Panel ──────────────────────────────────────── */}
      <section className="draw-panel">
        {/* ─── Step 1: Format Selection ────────────────────────────────────── */}
        <div className="draw-config-section">
          <div className="draw-section-title">
            <span className="draw-step-badge">1</span>
            <div>
              <h2>Selecciona el Formato del Torneo</h2>
              <p className="muted text-sm">Define la estructura competitiva para el emparejamiento de los partidos.</p>
            </div>
          </div>

          <div className="draw-formats-grid">
            {/* Playoffs Card */}
            <button
              type="button"
              id="format-card-playoffs"
              className={`draw-format-card ${format === 'playoffs' ? 'is-selected' : ''}`}
              onClick={() => handleSelectFormat('playoffs')}
            >
              <div className="draw-format-visual">
                <PlayoffsVisual />
              </div>
              <div className="draw-format-info">
                <div className="flex items-center justify-between gap-2 mb-1 w-full">
                  <strong>Playoffs</strong>
                  <span className="draw-format-badge">Eliminación directa</span>
                </div>
                <p className="text-xs text-gray-500">
                  Llave eliminatoria por rondas (Cuartos, Semis, Final). El ganador avanza y el perdedor queda eliminado.
                </p>
              </div>
              <div className="draw-format-check">
                {format === 'playoffs' && <LuCheck className="w-4 h-4 text-white" />}
              </div>
            </button>

            {/* Round Robin Card */}
            <button
              type="button"
              id="format-card-round-robin"
              className={`draw-format-card ${format === 'round-robin' ? 'is-selected' : ''}`}
              onClick={() => handleSelectFormat('round-robin')}
            >
              <div className="draw-format-visual">
                <RoundRobinVisual />
              </div>
              <div className="draw-format-info">
                <div className="flex items-center justify-between gap-2 mb-1 w-full">
                  <strong>Round Robin</strong>
                  <span className="draw-format-badge">Liga completa</span>
                </div>
                <p className="text-xs text-gray-500">
                  Todos contra todos por jornadas. Cada jugador se enfrenta a todos los rivales sumando victorias para la tabla.
                </p>
              </div>
              <div className="draw-format-check">
                {format === 'round-robin' && <LuCheck className="w-4 h-4 text-white" />}
              </div>
            </button>

            {/* Mixed Card */}
            <button
              type="button"
              id="format-card-mixed"
              className={`draw-format-card ${format === 'mixed' ? 'is-selected' : ''}`}
              onClick={() => handleSelectFormat('mixed')}
            >
              <div className="draw-format-visual">
                <RoundRobinPlayoffsVisual />
              </div>
              <div className="draw-format-info">
                <div className="flex items-center justify-between gap-2 mb-1 w-full">
                  <strong>Round Robin + Playoffs</strong>
                  <span className="draw-format-badge">Fase grupos + Llave</span>
                </div>
                <p className="text-xs text-gray-500">
                  Fase previa de grupos (todos vs todos) con pase de los mejores clasificados a una llave final de eliminación directa.
                </p>
              </div>
              <div className="draw-format-check">
                {format === 'mixed' && <LuCheck className="w-4 h-4 text-white" />}
              </div>
            </button>
          </div>
        </div>

        {/* ─── Step 2: Player Count & Configuration ────────────────────────── */}
        <div className="draw-config-section mt-8 pt-8 border-t border-[#e0e7e2]">
          <div className="draw-section-title">
            <span className="draw-step-badge">2</span>
            <div>
              <h2>Cantidad y Selección de Jugadores</h2>
              <p className="muted text-sm">
                Determina cuántos participantes disputarán el cuadro y de dónde provienen sus nombres.
              </p>
            </div>
          </div>

          {/* Quick presets & number selector */}
          <div className="draw-players-controls-row">
            <div className="draw-count-block">
              <label className="draw-input-label">Cantidad de Jugadores:</label>
              <div className="draw-presets-bar">
                {[4, 8, 12, 16, 32].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className={`draw-preset-btn ${playerCount === preset ? 'is-active' : ''}`}
                    onClick={() => handlePlayerCountChange(preset)}
                  >
                    {preset}
                  </button>
                ))}
                <div className="flex items-center gap-1.5 ml-2">
                  <span className="text-xs text-gray-500">Otro:</span>
                  <input
                    type="number"
                    min={2}
                    max={64}
                    value={playerCount}
                    onChange={(e) => handlePlayerCountChange(parseInt(e.target.value) || 2)}
                    className="draw-number-input"
                  />
                </div>
              </div>
            </div>

            {/* Format-specific configuration */}
            {format === 'mixed' && (
              <div className="draw-count-block">
                <label className="draw-input-label">Clasificados a Playoffs:</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={`draw-preset-btn ${qualifiersCount === 2 ? 'is-active' : ''}`}
                    onClick={() => setQualifiersCount(2)}
                  >
                    2 (Finalistas)
                  </button>
                  <button
                    type="button"
                    className={`draw-preset-btn ${qualifiersCount === 4 ? 'is-active' : ''}`}
                    onClick={() => setQualifiersCount(4)}
                  >
                    4 (Semifinalistas)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Player Source Selector Tabs */}
          <div className="draw-source-tabs-container mt-6">
            <div className="draw-source-tabs">
              <button
                type="button"
                className={`draw-source-tab-btn ${playerSource === 'club' ? 'is-active' : ''}`}
                onClick={() => setPlayerSource('club')}
              >
                <LuUsers className="w-4 h-4" />
                Jugadores Registrados del Club ({players.length})
              </button>
              <button
                type="button"
                className={`draw-source-tab-btn ${playerSource === 'custom' ? 'is-active' : ''}`}
                onClick={() => setPlayerSource('custom')}
              >
                <LuTrophy className="w-4 h-4" />
                Nombres Personalizados / Simulados
              </button>
            </div>
          </div>

          {/* Source 1: Registered Club Players */}
          {playerSource === 'club' && (
            <div className="draw-club-players-panel">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                <span className="text-xs font-semibold uppercase text-gray-500">
                  Seleccionados: <strong>{selectedClubIds.length}</strong> de <strong>{playerCount}</strong> necesarios
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectRandomClub(playerCount)}
                    className="draw-mini-action-btn"
                  >
                    🎲 Elegir {playerCount} al azar
                  </button>
                  <button
                    type="button"
                    onClick={handleSelectAllClub}
                    className="draw-mini-action-btn"
                  >
                    Seleccionar todos
                  </button>
                  {selectedClubIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedClubIds([])}
                      className="draw-mini-action-btn text-rose-600"
                    >
                      Limpiar
                    </button>
                  )}
                </div>
              </div>

              {loading ? (
                <p className="text-sm text-gray-400 py-4 text-center">Cargando jugadores del club...</p>
              ) : players.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">No hay jugadores registrados disponibles.</p>
              ) : (
                <div className="draw-chips-grid">
                  {players.map((p) => {
                    const isSelected = selectedClubIds.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => toggleClubPlayer(p.id)}
                        className={`draw-player-chip ${isSelected ? 'is-selected' : ''}`}
                      >
                        <span className="draw-chip-dot" />
                        <strong>{p.name}</strong>
                        {p.lastname && <small className="text-gray-400 ml-1">{p.lastname}</small>}
                        {isSelected && <LuCheck className="w-3.5 h-3.5 ml-1 text-[#31745d]" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {selectedClubIds.length < playerCount && (
                <div className="draw-warning-box mt-3">
                  ⚠️ Has seleccionado {selectedClubIds.length} de {playerCount} jugadores requeridos. Se completarán automáticamente con nombres adicionales para el sorteo.
                </div>
              )}
            </div>
          )}

          {/* Source 2: Custom / Simulated Names */}
          {playerSource === 'custom' && (
            <div className="draw-custom-players-panel">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase text-gray-500">
                  Participantes ({customNames.slice(0, playerCount).length})
                </span>
                <span className="text-xs text-gray-400">Puedes editar cualquier nombre haciendo clic sobre él</span>
              </div>

              <div className="draw-custom-grid">
                {customNames.slice(0, playerCount).map((name, idx) => (
                  <div key={idx} className="draw-custom-item">
                    <span className="draw-custom-num">#{idx + 1}</span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => handleUpdateCustomName(idx, e.target.value)}
                      className="draw-custom-input"
                    />
                    {customNames.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomName(idx)}
                        className="draw-custom-del"
                        title="Eliminar jugador"
                        aria-label="Eliminar jugador"
                      >
                        <LuX className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add custom player row */}
              <div className="draw-add-player-row mt-4">
                <input
                  type="text"
                  value={newPlayerInput}
                  onChange={(e) => setNewPlayerInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomPlayer();
                    }
                  }}
                  placeholder="Escribe el nombre de otro jugador y presiona Enter..."
                  className="draw-filter-input"
                />
                <button
                  type="button"
                  onClick={handleAddCustomPlayer}
                  className="draw-btn-add"
                >
                  <LuPlus className="w-4 h-4" />
                  Agregar Jugador
                </button>
              </div>
            </div>
          )}

          {/* Generate Action Button */}
          <div className="draw-action-bar mt-8">
            <button
              type="button"
              onClick={handleGenerateDraw}
              className="draw-generate-btn"
            >
              <LuDices className="w-5 h-5" />
              Generar Sorteo de Cuadro
            </button>
            <span className="draw-action-hint">
              Sorteo de {activePlayerNames.slice(0, playerCount).length} participantes en formato {format === 'playoffs' ? 'Playoffs' : format === 'round-robin' ? 'Round Robin' : 'Mixto'}
            </span>
          </div>
        </div>

        {/* ─── Step 3: Draw Results / On-Screen Bracket ("Draw the draw") ──── */}
        {generatedDraw && (
          <div id="draw-results-section" className="draw-results-container mt-10 pt-8 border-t-2 border-[#dce3dd]">
            <div className="draw-results-header">
              <div>
                <p className="eyebrow flex items-center gap-1.5">
                  <LuCrown className="w-4 h-4 text-[#d66e52]" />
                  Cuadro Oficial Generado
                </p>
                <h2 className="text-2xl font-bold text-[#18231f]">
                  {generatedDraw.type === 'playoffs'
                    ? `Llave de Eliminación Directa (${generatedDraw.totalSlots} cupos)`
                    : generatedDraw.type === 'round-robin'
                      ? `Fixture de Todos Contra Todos (${generatedDraw.playerNames.length} participantes)`
                      : `Fase de Grupos y Clasificación a Playoffs`}
                </h2>
              </div>

              {/* Action Buttons Toolbar */}
              <div className="draw-toolbar-actions">
                <button
                  type="button"
                  onClick={handleGenerateDraw}
                  className="draw-toolbar-btn"
                  title="Volver a sortear los emparejamientos"
                >
                  <LuRefreshCw className="w-4 h-4" />
                  Volver a Sortear
                </button>
                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="draw-toolbar-btn is-primary"
                  title="Copiar resumen del cuadro al portapapeles"
                >
                  {copied ? (
                    <>
                      <LuCheck className="w-4 h-4 text-emerald-600" />
                      ¡Copiado!
                    </>
                  ) : (
                    <>
                      <LuCopy className="w-4 h-4" />
                      Copiar Resumen
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* ─── Render: Playoffs Bracket ──────────────────────────────── */}
            {generatedDraw.type === 'playoffs' && (
              <div className="draw-bracket-viewport mt-6">
                <div className="draw-rounds">
                  {generatedDraw.rounds.map((round, rIndex) => (
                    <div key={rIndex} className="draw-round">
                      <div className="draw-round-title">
                        {round.roundName}
                        <span className="draw-round-count">{round.matches.length} {round.matches.length === 1 ? 'partido' : 'partidos'}</span>
                      </div>
                      <div className="draw-round-matches">
                        {round.matches.map((match, mIndex) => {
                          const isTopVacancy = match.top.label === 'Vacante';
                          const isBottomVacancy = match.bottom.label === 'Vacante';
                          const isTopPlaceholder = match.top.id === null && match.top.label.startsWith('Ganador');
                          const isBottomPlaceholder = match.bottom.id === null && match.bottom.label.startsWith('Ganador');

                          return (
                            <div key={mIndex} className="draw-match-card">
                              <div className="draw-match-header-tag">
                                Partido {rIndex === 0 ? mIndex + 1 : `R${rIndex + 1}-${mIndex + 1}`}
                              </div>

                              <div
                                className={`draw-match-slot ${isTopVacancy ? 'is-vacancy' : ''} ${isTopPlaceholder ? 'is-placeholder' : ''}`}
                              >
                                <span className="draw-slot-num">1</span>
                                <span className="draw-slot-label">{match.top.label}</span>
                                {isTopVacancy && <span className="draw-bye-pill">BYE</span>}
                              </div>

                              <div
                                className={`draw-match-slot ${isBottomVacancy ? 'is-vacancy' : ''} ${isBottomPlaceholder ? 'is-placeholder' : ''}`}
                              >
                                <span className="draw-slot-num">2</span>
                                <span className="draw-slot-label">{match.bottom.label}</span>
                                {isBottomVacancy && <span className="draw-bye-pill">BYE</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {/* Champion Trophy Stage Box */}
                  <div className="draw-round draw-round-champion">
                    <div className="draw-round-title text-[#b38600]">
                      🏆 CAMPEÓN
                    </div>
                    <div className="draw-champion-podium">
                      <div className="draw-champion-trophy">
                        <LuTrophy className="w-12 h-12 text-[#b38600]" />
                      </div>
                      <strong className="draw-champion-title">Ganador de la Gran Final</strong>
                      <span className="text-xs text-gray-500 text-center mt-1">
                        Consagración del torneo
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ─── Render: Round Robin Fixture ───────────────────────────── */}
            {generatedDraw.type === 'round-robin' && (
              <div className="draw-rr-container mt-6">
                <div className="draw-rr-grid">
                  {generatedDraw.rounds.map((round, rIndex) => (
                    <div key={rIndex} className="draw-rr-round-card">
                      <div className="draw-rr-round-header">
                        <strong>{round.roundName}</strong>
                        <span className="text-xs text-gray-500">{round.matches.length} enfrentamientos</span>
                      </div>
                      <div className="draw-rr-matches-list">
                        {round.matches.map((m, mIndex) => {
                          const isDummy = m.top === 'Vacante' || m.bottom === 'Vacante';
                          return (
                            <div key={mIndex} className={`draw-rr-match-row ${isDummy ? 'is-bye' : ''}`}>
                              <span className="draw-rr-player-a">{m.top}</span>
                              <span className="draw-rr-vs-badge">VS</span>
                              <span className="draw-rr-player-b">{m.bottom}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Table Standings Preview */}
                <div className="draw-standings-preview mt-8">
                  <div className="flex items-center justify-between mb-3">
                    <p className="eyebrow">Tabla de Posiciones Preliminar</p>
                    <span className="text-xs text-gray-500">{generatedDraw.playerNames.length} competidores</span>
                  </div>
                  <div className="leaderboard-table-wrap">
                    <table className="leaderboard-table">
                      <thead>
                        <tr>
                          <th className="w-16">Pos</th>
                          <th>Jugador</th>
                          <th className="text-center w-20">PJ</th>
                          <th className="text-center w-20">PG</th>
                          <th className="text-center w-20">PP</th>
                          <th className="text-right w-24">Puntos</th>
                        </tr>
                      </thead>
                      <tbody>
                        {generatedDraw.playerNames.map((name, idx) => (
                          <tr key={name}>
                            <td>
                              <span className="leaderboard-pos-badge leaderboard-pos-default">
                                {idx + 1}º
                              </span>
                            </td>
                            <td>
                              <strong className="text-[#183b32]">{name}</strong>
                            </td>
                            <td className="text-center font-mono">0</td>
                            <td className="text-center font-mono text-emerald-700">0</td>
                            <td className="text-center font-mono text-rose-700">0</td>
                            <td className="text-right font-mono font-bold text-[#31745d]">0 pts</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ─── Render: Mixed Format ─────────────────────────────────── */}
            {generatedDraw.type === 'mixed' && (
              <div className="draw-mixed-container mt-6">
                {/* Groups Stage */}
                <div className="draw-mixed-groups-grid">
                  {generatedDraw.groups.map((group) => (
                    <div key={group.groupName} className="draw-mixed-group-box">
                      <div className="draw-mixed-group-header">
                        <span className="eyebrow">Fase Regular</span>
                        <h3>{group.groupName} ({group.playerNames.length} jugadores)</h3>
                      </div>
                      <div className="draw-rr-grid">
                        {group.rounds.map((round, rIndex) => (
                          <div key={rIndex} className="draw-rr-round-card">
                            <div className="draw-rr-round-header">
                              <strong>{round.roundName}</strong>
                            </div>
                            <div className="draw-rr-matches-list">
                              {round.matches.map((m, mIndex) => (
                                <div key={mIndex} className="draw-rr-match-row">
                                  <span className="draw-rr-player-a">{m.top}</span>
                                  <span className="draw-rr-vs-badge">VS</span>
                                  <span className="draw-rr-player-b">{m.bottom}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Qualifiers Elimination Playoff */}
                <div className="draw-mixed-playoffs-box mt-10">
                  <div className="mb-4">
                    <p className="eyebrow">Fase de Definición</p>
                    <h3 className="text-xl font-bold text-[#18231f]">
                      Playoffs de Clasificados ({generatedDraw.qualifiersCount} clasificados a llave final)
                    </h3>
                  </div>

                  <div className="draw-bracket-viewport">
                    <div className="draw-rounds">
                      {generatedDraw.bracketRounds.map((round, rIndex) => (
                        <div key={rIndex} className="draw-round">
                          <div className="draw-round-title">{round.roundName}</div>
                          <div className="draw-round-matches">
                            {round.matches.map((match, mIndex) => (
                              <div key={mIndex} className="draw-match-card">
                                <div className="draw-match-header-tag">Partido {mIndex + 1}</div>
                                <div className="draw-match-slot">
                                  <span className="draw-slot-num">1</span>
                                  <span className="draw-slot-label font-medium">{match.top.label}</span>
                                </div>
                                <div className="draw-match-slot">
                                  <span className="draw-slot-num">2</span>
                                  <span className="draw-slot-label font-medium">{match.bottom.label}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}

                      {/* Final Trophy Box */}
                      <div className="draw-round draw-round-champion">
                        <div className="draw-round-title text-[#b38600]">🏆 CAMPEÓN</div>
                        <div className="draw-champion-podium">
                          <div className="draw-champion-trophy">
                            <LuTrophy className="w-12 h-12 text-[#b38600]" />
                          </div>
                          <strong className="draw-champion-title">Campeón Mixto</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
};

export default DrawGeneratorTemplate;
