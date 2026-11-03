'use client';

import { useCallback, useEffect, useState } from 'react';
import DrawBracket, { type DrawNode, type SlotRef } from '@/components/features/DrawBracket';

type RecordItem = { id: string; name?: string; [key: string]: unknown };
type DrawView = {
  kind: string;
  status: string;
  drawStatus: 'NONE' | 'DRAFT' | 'CONFIRMED';
  seedMode: string | null;
  matches: DrawNode[];
};

type Props = {
  tournamentId: string;
  participants: RecordItem[];
  disabledReason?: string | null;
  onChanged?: () => void;
  onStatus?: (status: 'NONE' | 'DRAFT' | 'CONFIRMED') => void;
};

const seedModeLabels: Record<string, string> = {
  NONE: 'Sin cabezas de serie (sorteo puro)',
  RANKING: 'Por ranking (últimos 12 meses)',
  LEVEL: 'Por nivel del jugador',
  MANUAL: 'Manual',
};

async function call(url: string, init?: RequestInit) {
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...init });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message ?? 'No se pudo completar la acción');
  return data;
}

export default function TournamentDrawPanel({ tournamentId, participants, disabledReason, onChanged, onStatus }: Props) {
  const [view, setView] = useState<DrawView | null>(null);
  const [seedMode, setSeedMode] = useState('NONE');
  const [seedCount, setSeedCount] = useState('');
  const [manualSeeds, setManualSeeds] = useState<string[]>([]);
  const [selected, setSelected] = useState<SlotRef | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const next: DrawView = await call(`/api/admin/draws/${tournamentId}`);
      setView(next);
      onStatus?.(next.drawStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el sorteo');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tournamentId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function act(body: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    try {
      await call(`/api/admin/draws/${tournamentId}`, { method: 'POST', body: JSON.stringify(body) });
      setSelected(null);
      await load();
      onChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo completar la acción');
    } finally {
      setBusy(false);
    }
  }

  function handleSlot(ref: SlotRef) {
    if (!selected) return setSelected(ref);
    if (selected.drawMatchId === ref.drawMatchId && selected.slot === ref.slot) return setSelected(null);
    act({ action: 'swap', a: selected, b: ref });
  }

  function toggleSeed(id: string) {
    setManualSeeds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  if (!view) return <p className="muted">Cargando sorteo…</p>;

  const firstPlayoffRound = Math.min(...view.matches.filter((node) => node.phase === 'PLAYOFF').map((node) => node.round), Infinity);
  const canGenerate = !disabledReason && !busy && participants.length >= 2 && (seedMode !== 'MANUAL' || manualSeeds.length > 0);

  return (
    <section className="prep-draw-section" aria-label="Sorteo del cuadro">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <h3 className="prep-section-title" style={{ margin: 0 }}>Sorteo</h3>
        <span className="status-pill" data-testid="draw-status">
          {view.drawStatus === 'NONE' ? 'Sin sortear' : view.drawStatus === 'DRAFT' ? 'Borrador' : 'Oficial'}
        </span>
      </div>

      {error && <div className="request-message error" role="alert" style={{ margin: '10px 0' }}>{error}</div>}
      {disabledReason && <div className="draw-warning">{disabledReason}</div>}

      {view.drawStatus !== 'CONFIRMED' && (
        <div style={{ display: 'grid', gap: 8, margin: '10px 0' }}>
          <div className="prep-fields-row">
            <label className="field">
              <span>Siembra</span>
              <select value={seedMode} onChange={(event) => setSeedMode(event.target.value)} aria-label="Modo de siembra">
                {Object.entries(seedModeLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>
            {seedMode !== 'NONE' && seedMode !== 'MANUAL' && (
              <label className="field">
                <span>Cantidad de cabezas de serie</span>
                <input type="number" min={1} value={seedCount} onChange={(event) => setSeedCount(event.target.value)} placeholder="Por defecto" />
              </label>
            )}
          </div>
          {seedMode === 'MANUAL' && (
            <div className="prep-selected-box">
              <span className="prep-box-label">Elegí los cabezas de serie en orden ({manualSeeds.length})</span>
              <div className="prep-chips-wrap">
                {participants.map((player) => {
                  const index = manualSeeds.indexOf(player.id);
                  return (
                    <button key={player.id} type="button" className="prep-chip" onClick={() => toggleSeed(player.id)}>
                      {index >= 0 ? `${index + 1}. ` : ''}{String(player.name ?? player.id)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="secondary-button"
              disabled={!canGenerate}
              onClick={() => act({ action: 'generate', seedMode, manualSeedIds: manualSeeds, seedCount: seedCount ? Number(seedCount) : undefined })}
            >
              {view.drawStatus === 'DRAFT' ? 'Generar de nuevo' : 'Generar sorteo'}
            </button>
            {view.drawStatus === 'DRAFT' && (
              <>
                <button type="button" className="secondary-button" disabled={busy || Boolean(disabledReason)} onClick={() => act({ action: 'reshuffle' })}>
                  Re-sortear
                </button>
                <button type="button" className="primary-button" disabled={busy || Boolean(disabledReason)} onClick={() => act({ action: 'confirm' })}>
                  Confirmar sorteo
                </button>
                <button type="button" className="danger-button" disabled={busy} onClick={() => act({ action: 'discard' })}>
                  Descartar
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {view.drawStatus === 'DRAFT' && (
        <p className="muted" style={{ fontSize: 13 }}>
          Tocá dos jugadores de la primera ronda para intercambiarlos. El sorteo no es oficial hasta confirmarlo.
        </p>
      )}
      {view.drawStatus === 'CONFIRMED' && (
        <p className="muted" style={{ fontSize: 13 }}>Sorteo oficial confirmado. Ya no se pueden cambiar los participantes.</p>
      )}

      {view.drawStatus !== 'NONE' && (
        <DrawBracket
          matches={view.matches}
          selected={selected}
          onSlotClick={view.drawStatus === 'DRAFT' ? handleSlot : undefined}
          swappable={(node) => view.drawStatus === 'DRAFT' && node.phase === 'PLAYOFF' && node.round === firstPlayoffRound}
        />
      )}
    </section>
  );
}
