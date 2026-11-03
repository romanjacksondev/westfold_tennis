'use client';

import { useCallback, useEffect, useState } from 'react';
import DrawBracket, { type DrawNode } from '@/components/features/DrawBracket';

type Player = { id: string; name: string | null } | null;
type Pending = { drawMatchId: string; stage: string | null; player1: Player; player2: Player };
type DrawView = { kind: string; status: string; championId: string | null; matches: DrawNode[] };
type SetForm = { g1: string; g2: string; tiebreak: boolean; tb1: string; tb2: string };

type Props = {
  tournament: { id: string; name?: string; status: string };
  onClose: () => void;
  onChanged: (message: string) => void;
};

const emptySet = (): SetForm => ({ g1: '', g2: '', tiebreak: false, tb1: '', tb2: '' });
const stageLabels: Record<string, string> = { GROUP: 'Fase de grupos', ROUND_OF_32: '16avos', ROUND_OF_16: 'Octavos', QUARTERFINAL: 'Cuartos', SEMIFINAL: 'Semifinal', FINAL: 'Final' };

async function call(url: string, init?: RequestInit) {
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...init });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message ?? 'No se pudo completar la acción');
  return data;
}

export default function TournamentResultsModal({ tournament, onClose, onChanged }: Props) {
  const finished = tournament.status === 'FINISHED';
  const [view, setView] = useState<DrawView | null>(null);
  const [pending, setPending] = useState<Pending[]>([]);
  const [slotId, setSlotId] = useState('');
  const [sets, setSets] = useState<SetForm[]>([emptySet()]);
  const [playedAt, setPlayedAt] = useState('');
  const [order, setOrder] = useState<Player[] | null>(null);
  const [correcting, setCorrecting] = useState<DrawNode | null>(null);
  const [newWinnerId, setNewWinnerId] = useState('');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    const next: DrawView = await call(`/api/admin/draws/${tournament.id}`);
    setView(next);
    if (next.status === 'IN_PROGRESS') {
      const data = await call(`/api/admin/draws/${tournament.id}/pending`);
      setPending(data.pending);
    } else {
      setPending([]);
    }
  }, [tournament.id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load().catch((err) => setError(err instanceof Error ? err.message : 'No se pudo cargar'));
  }, [load]);

  const slot = pending.find((item) => item.drawMatchId === slotId);

  function groupPlayers(): Player[] {
    const seen = new Map<string, Player>();
    for (const node of view?.matches ?? []) {
      if (node.phase !== 'GROUP') continue;
      for (const player of [node.player1, node.player2]) if (player) seen.set(player.id, player);
    }
    return [...seen.values()];
  }

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await action();
      await load();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo completar la acción';
      setError(message);
      if (/empate/i.test(message) && view?.kind !== 'PLAYOFFS') setOrder((current) => current ?? groupPlayers());
    } finally {
      setBusy(false);
    }
  }

  function submitResult() {
    if (!slot || !slot.player1 || !slot.player2) return;
    const p1 = slot.player1.id;
    const p2 = slot.player2.id;
    const invalid = sets.some((set) => {
      const a = Number(set.g1);
      const b = Number(set.g2);
      return !Number.isInteger(a) || !Number.isInteger(b) || a === b || (set.tiebreak && (set.tb1 === '' || set.tb2 === ''));
    });
    if (invalid) return setError('Completá el resultado de cada set con un ganador claro.');
    const payloadSets = sets.map((set) => ({
      gamesPlayer1: Number(set.g1),
      gamesPlayer2: Number(set.g2),
      winner: Number(set.g1) > Number(set.g2) ? p1 : p2,
      hasTiebreak: set.tiebreak,
      tiebreakPlayer1Points: set.tiebreak ? Number(set.tb1) : null,
      tiebreakPlayer2Points: set.tiebreak ? Number(set.tb2) : null,
    }));
    const won1 = payloadSets.filter((set) => set.winner === p1).length;
    if (won1 * 2 === payloadSets.length) return setError('El partido no puede quedar empatado en sets.');
    run(async () => {
      await call('/api/add-match', {
        method: 'POST',
        body: JSON.stringify({ drawMatchId: slot.drawMatchId, idPlayer1: p1, idPlayer2: p2, winner: won1 * 2 > payloadSets.length ? p1 : p2, sets: payloadSets, playedAt: playedAt || undefined }),
      });
      setSlotId('');
      setSets([emptySet()]);
      setNotice('Resultado cargado');
      onChanged('Resultado cargado');
    });
  }

  function finishTournament() {
    if (!window.confirm('¿Cerrar el torneo? El campeón se calcula a partir de los resultados.')) return;
    run(async () => {
      const data = await call(`/api/admin/tournaments/${tournament.id}`, { method: 'PATCH', body: JSON.stringify({ action: 'finish' }) });
      onChanged(data.message ?? 'Torneo finalizado');
      onClose();
    });
  }

  function saveOrder() {
    if (!order) return;
    run(async () => {
      await call(`/api/admin/draws/${tournament.id}`, { method: 'POST', body: JSON.stringify({ action: 'set-group-order', order: order.map((p) => p?.id) }) });
      setNotice('Orden de la tabla guardado');
    });
  }

  function move(index: number, delta: number) {
    setOrder((current) => {
      if (!current) return current;
      const next = [...current];
      const target = index + delta;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function submitCorrection() {
    if (!correcting?.matchId) return;
    const current = view?.championId;
    if (!reason.trim()) return setError('Indicá el motivo de la corrección.');
    const body = { winnerId: newWinnerId || correcting.winnerId, reason: reason.trim() };
    if (finished && !window.confirm('Esta corrección modifica un torneo ya finalizado y puede cambiar al campeón. Quedará registrada en la auditoría. ¿Continuar?')) return;
    run(async () => {
      const data = await call(`/api/admin/matches/${correcting.matchId}`, { method: 'PATCH', body: JSON.stringify(body) });
      setCorrecting(null);
      setReason('');
      setNewWinnerId('');
      const message = data.championChanged ? `Corrección guardada. El campeón cambió (antes: ${current ?? '—'}).` : 'Corrección guardada. El campeón no cambió.';
      setNotice(message);
      onChanged(message);
    });
  }

  return (
    <div className="type-modal-backdrop" role="presentation" onClick={onClose}>
      <section className="type-modal preparation-modal" role="dialog" aria-modal="true" aria-labelledby="results-title" onClick={(event) => event.stopPropagation()}>
        <div className="panel-heading">
          <div>
            <p className="eyebrow">{finished ? 'Torneo finalizado · corrección de resultados' : 'Carga de resultados'}</p>
            <h2 id="results-title" style={{ margin: '4px 0 0' }}>{tournament.name ?? 'Torneo'}</h2>
          </div>
          <button type="button" className="text-button" onClick={onClose}>✕ Cerrar</button>
        </div>

        {error && <div className="request-message error" role="alert" style={{ margin: '10px 0' }}>{error}</div>}
        {notice && <div className="request-message success" role="status" style={{ margin: '10px 0' }}>{notice}</div>}

        {!finished && (
          <section aria-label="Partidos pendientes">
            <h3 className="prep-section-title">Partidos pendientes ({pending.length})</h3>
            {pending.length === 0 ? (
              <p className="muted">No hay partidos pendientes con ambos jugadores definidos.</p>
            ) : (
              <label className="field">
                <span>Partido</span>
                <select value={slotId} onChange={(event) => setSlotId(event.target.value)} aria-label="Partido pendiente">
                  <option value="">Elegí un partido del cuadro…</option>
                  {pending.map((item) => (
                    <option key={item.drawMatchId} value={item.drawMatchId}>
                      {stageLabels[item.stage ?? 'GROUP'] ?? item.stage} · {item.player1?.name} vs {item.player2?.name}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {slot && (
              <div className="match-sets-editor">
                <span className="match-sets-heading">Resultado: {slot.player1?.name} (J1) vs {slot.player2?.name} (J2)</span>
                {sets.map((set, index) => (
                  <div className="match-set-row" key={index}>
                    <strong>Set {index + 1}</strong>
                    <div className="match-set-scores">
                      <input type="number" min={0} value={set.g1} aria-label={`Games jugador 1 - set ${index + 1}`} onChange={(e) => setSets((c) => c.map((s, i) => (i === index ? { ...s, g1: e.target.value } : s)))} />
                      <span>-</span>
                      <input type="number" min={0} value={set.g2} aria-label={`Games jugador 2 - set ${index + 1}`} onChange={(e) => setSets((c) => c.map((s, i) => (i === index ? { ...s, g2: e.target.value } : s)))} />
                    </div>
                    <label>
                      <input type="checkbox" checked={set.tiebreak} onChange={(e) => setSets((c) => c.map((s, i) => (i === index ? { ...s, tiebreak: e.target.checked } : s)))} /> Tie-break
                    </label>
                    {set.tiebreak && (
                      <div className="match-set-scores">
                        <input type="number" min={0} value={set.tb1} aria-label={`Tie-break jugador 1 - set ${index + 1}`} onChange={(e) => setSets((c) => c.map((s, i) => (i === index ? { ...s, tb1: e.target.value } : s)))} />
                        <span>-</span>
                        <input type="number" min={0} value={set.tb2} aria-label={`Tie-break jugador 2 - set ${index + 1}`} onChange={(e) => setSets((c) => c.map((s, i) => (i === index ? { ...s, tb2: e.target.value } : s)))} />
                      </div>
                    )}
                    {sets.length > 1 && <button type="button" className="text-button" onClick={() => setSets((c) => c.filter((_, i) => i !== index))}>Quitar</button>}
                  </div>
                ))}
                {sets.length < 5 && <button type="button" className="text-button" onClick={() => setSets((c) => [...c, emptySet()])}>+ Agregar set</button>}
                <label className="field">
                  <span>Fecha del partido</span>
                  <input type="date" value={playedAt} onChange={(event) => setPlayedAt(event.target.value)} />
                  <small>Opcional. Por defecto, la fecha del torneo.</small>
                </label>
                <button type="button" className="primary-button" disabled={busy} onClick={submitResult}>Guardar resultado</button>
              </div>
            )}
          </section>
        )}

        {order && !finished && (
          <section aria-label="Orden de la tabla">
            <h3 className="prep-section-title">Orden de la tabla (desempate manual)</h3>
            <ol>
              {order.map((player, index) => (
                <li key={player?.id}>
                  {player?.name}{' '}
                  <button type="button" className="text-button" onClick={() => move(index, -1)} aria-label={`Subir a ${player?.name}`}>↑</button>
                  <button type="button" className="text-button" onClick={() => move(index, 1)} aria-label={`Bajar a ${player?.name}`}>↓</button>
                </li>
              ))}
            </ol>
            <button type="button" className="secondary-button" disabled={busy} onClick={saveOrder}>Guardar orden</button>
          </section>
        )}

        <section aria-label="Cuadro" style={{ marginTop: 16 }}>
          <h3 className="prep-section-title">Cuadro</h3>
          {view && (
            <DrawBracket matches={view.matches} />
          )}
        </section>

        {view && view.matches.some((node) => node.matchId) && (
          <section aria-label="Corrección de resultados" style={{ marginTop: 16 }}>
            <h3 className="prep-section-title">Corregir un resultado</h3>
            <p className="draw-warning">{finished ? 'Corregir un torneo finalizado puede cambiar al campeón. Se exige un motivo y queda registrado en la auditoría.' : 'Corregir el ganador reordena el cuadro. Indicá el motivo; queda registrado.'}</p>
            <label className="field">
              <span>Partido</span>
              <select
                aria-label="Partido a corregir"
                value={correcting?.id ?? ''}
                onChange={(event) => {
                  setCorrecting(view.matches.find((node) => node.id === event.target.value) ?? null);
                  setNewWinnerId('');
                }}
              >
                <option value="">Elegí un partido jugado…</option>
                {view.matches.filter((node) => node.matchId).map((node) => (
                  <option key={node.id} value={node.id}>
                    {stageLabels[node.stage ?? 'GROUP'] ?? node.stage} · {node.player1?.name} vs {node.player2?.name}
                  </option>
                ))}
              </select>
            </label>
            {correcting && (
              <>
                <label className="field">
                  <span>Ganador</span>
                  <select value={newWinnerId || correcting.winnerId || ''} onChange={(event) => setNewWinnerId(event.target.value)} aria-label="Nuevo ganador">
                    {[correcting.player1, correcting.player2].map((player) => player && <option key={player.id} value={player.id}>{player.name}</option>)}
                  </select>
                </label>
                <label className="field">
                  <span>Motivo de la corrección <b>*</b></span>
                  <input type="text" value={reason} onChange={(event) => setReason(event.target.value)} />
                </label>
                <button type="button" className="primary-button" disabled={busy} onClick={submitCorrection}>Guardar corrección</button>
              </>
            )}
          </section>
        )}

        <div className="prep-modal-footer">
          <button type="button" className="text-button" onClick={onClose}>Cerrar</button>
          {!finished && (
            <button type="button" className="primary-button" disabled={busy || pending.length > 0} onClick={finishTournament} title={pending.length > 0 ? 'Faltan partidos por cargar' : 'Cierra el torneo y calcula al campeón'}>
              🏆 Cerrar torneo
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
