'use client';

import { useCallback, useEffect, useState } from 'react';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import DrawBracket, { type DrawNode, type DrawStanding } from '@/components/features/DrawBracket';

type Player = { id: string; name: string | null } | null;
type Pending = { drawMatchId: string };
type DrawView = { kind: string; status: string; championId: string | null; liveChampionId: string | null; standings: DrawStanding[]; matches: DrawNode[] };
type SetForm = { g1: string; g2: string; tiebreak: boolean; tb1: string; tb2: string };

type Props = {
  tournament: { id: string; name?: string; status: string };
  onClose: () => void;
  onChanged: (message: string) => void;
};

const emptySet = (): SetForm => ({ g1: '', g2: '', tiebreak: false, tb1: '', tb2: '' });

async function call(url: string, init?: RequestInit) {
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...init });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message ?? 'No se pudo completar la acción');
  return data;
}

export default function TournamentResultsModal({ tournament, onClose, onChanged }: Props) {
  const { confirm, dialog: confirmDialog } = useConfirm();
  const finished = tournament.status === 'FINISHED';
  const [view, setView] = useState<DrawView | null>(null);
  const [pending, setPending] = useState<Pending[]>([]);
  const [active, setActive] = useState<DrawNode | null>(null);
  const [walkover, setWalkover] = useState(false);
  const [woWinnerId, setWoWinnerId] = useState('');
  const [sets, setSets] = useState<SetForm[]>([emptySet()]);
  const [playedAt, setPlayedAt] = useState('');
  const [order, setOrder] = useState<Player[] | null>(null);
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

  const slot = active && !active.matchId ? active : null;
  const correcting = active?.matchId ? active : null;

  function openMatch(node: DrawNode) {
    setActive(node);
    setSets([emptySet()]);
    setPlayedAt('');
    setWalkover(false);
    setWoWinnerId('');
    setNewWinnerId('');
    setReason('');
    setError(null);
    setNotice(null);
  }

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
    if (walkover) {
      if (!woWinnerId) return setError('Indicá quién gana el W.O.');
      const filled = sets.filter((set) => set.g1 !== '' || set.g2 !== '');
      const partial = filled.map((set) => ({ gamesPlayer1: Number(set.g1), gamesPlayer2: Number(set.g2), winner: Number(set.g1) > Number(set.g2) ? p1 : p2, hasTiebreak: false, tiebreakPlayer1Points: null, tiebreakPlayer2Points: null }));
      if (filled.some((set) => !Number.isInteger(Number(set.g1)) || !Number.isInteger(Number(set.g2)) || set.g1 === '' || set.g2 === '' || set.g1 === set.g2)) return setError('Los sets parciales deben tener un ganador claro.');
      return run(async () => {
        await call('/api/add-match', { method: 'POST', body: JSON.stringify({ drawMatchId: slot.id, idPlayer1: p1, idPlayer2: p2, winner: woWinnerId, sets: partial, playedAt: playedAt || undefined, walkover: true }) });
        setActive(null);
        setNotice('W.O. registrado');
        onChanged('W.O. registrado');
      });
    }
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
        body: JSON.stringify({ drawMatchId: slot.id, idPlayer1: p1, idPlayer2: p2, winner: won1 * 2 > payloadSets.length ? p1 : p2, sets: payloadSets, playedAt: playedAt || undefined }),
      });
      setActive(null);
      setNotice('Resultado cargado');
      onChanged('Resultado cargado');
    });
  }

  async function finishTournament() {
    if (!(await confirm({ title: '¿Finalizar torneo?', message: 'Esto no puede ser modificado posteriormente.', confirmLabel: 'Finalizar torneo' }))) return;
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

  async function submitCorrection() {
    if (!correcting?.matchId) return;
    const current = view?.championId;
    if (!reason.trim()) return setError('Indicá el motivo de la corrección.');
    const body = { winnerId: newWinnerId || correcting.winnerId, reason: reason.trim() };
    if (finished && !(await confirm({ title: 'Corregir torneo finalizado', message: 'Esta corrección modifica un torneo ya finalizado y puede cambiar al campeón. Quedará registrada en la auditoría. ¿Continuar?', confirmLabel: 'Corregir' }))) return;
    run(async () => {
      const data = await call(`/api/admin/matches/${correcting.matchId}`, { method: 'PATCH', body: JSON.stringify(body) });
      setActive(null);
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

        <p className="muted" style={{ margin: '8px 0' }}>
          {finished ? 'Hacé click en un partido para corregir su resultado.' : pending.length > 0 ? `Hacé click en un partido para cargar el resultado (${pending.length} pendientes).` : 'No hay partidos pendientes. Podés cerrar el torneo o corregir un resultado desde el cuadro.'}
        </p>

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
            <DrawBracket matches={view.matches} onMatchClick={openMatch} championId={view.championId ?? view.liveChampionId} standings={view.standings} />
          )}
        </section>

        {active && (
          <div className="type-modal-backdrop" role="presentation" onClick={() => setActive(null)}>
            <section className="type-modal result-dialog" role="dialog" aria-modal="true" aria-label="Resultado del partido" onClick={(event) => event.stopPropagation()}>
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">{correcting ? 'Corregir resultado' : 'Cargar resultado'}</p>
                  <h3 style={{ margin: '4px 0 0' }}>{active.player1?.name} vs {active.player2?.name}</h3>
                </div>
                <button type="button" className="text-button" onClick={() => setActive(null)}>✕</button>
              </div>
              {error && <div className="request-message error" role="alert" style={{ margin: '10px 0' }}>{error}</div>}

              {slot && (
                <div className="match-sets-editor">
                  <label className="wo-toggle">
                    <input type="checkbox" checked={walkover} onChange={(event) => setWalkover(event.target.checked)} /> W.O. (abandono o no presentación)
                  </label>
                  {walkover && (
                    <label className="field">
                      <span>Ganador por W.O.</span>
                      <select value={woWinnerId} onChange={(event) => setWoWinnerId(event.target.value)} aria-label="Ganador por W.O.">
                        <option value="">Elegí quién avanza…</option>
                        {[slot.player1, slot.player2].map((player) => player && <option key={player.id} value={player.id}>{player.name} gana (rival abandona)</option>)}
                      </select>
                    </label>
                  )}
                  <span className="match-sets-heading">{walkover ? 'Sets jugados antes del abandono (opcional)' : `Resultado: ${slot.player1?.name} (J1) vs ${slot.player2?.name} (J2)`}</span>
                  {sets.map((set, index) => (
                    <div className="match-set-row" key={index}>
                      <strong>Set {index + 1}</strong>
                      <div className="match-set-scores">
                        <input type="number" min={0} value={set.g1} aria-label={`Games jugador 1 - set ${index + 1}`} onChange={(e) => setSets((c) => c.map((s, i) => (i === index ? { ...s, g1: e.target.value } : s)))} />
                        <span>-</span>
                        <input type="number" min={0} value={set.g2} aria-label={`Games jugador 2 - set ${index + 1}`} onChange={(e) => setSets((c) => c.map((s, i) => (i === index ? { ...s, g2: e.target.value } : s)))} />
                      </div>
                      {!walkover && (
                        <label>
                          <input type="checkbox" checked={set.tiebreak} onChange={(e) => setSets((c) => c.map((s, i) => (i === index ? { ...s, tiebreak: e.target.checked } : s)))} /> Tie-break
                        </label>
                      )}
                      {!walkover && set.tiebreak && (
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
                  <button type="button" className="primary-button" disabled={busy} onClick={submitResult}>{walkover ? 'Registrar W.O.' : 'Guardar resultado'}</button>
                </div>
              )}

              {correcting && (
                <div>
                  <p className="draw-warning">{finished ? 'Corregir un torneo finalizado puede cambiar al campeón. Se exige un motivo y queda registrado en la auditoría.' : 'Corregir el ganador reordena el cuadro. Indicá el motivo; queda registrado.'}</p>
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
                </div>
              )}
            </section>
          </div>
        )}

        <div className="prep-modal-footer">
          <button type="button" className="text-button" onClick={onClose}>Cerrar</button>
          {!finished && (
            <div style={{ display: 'flex' }}>
              <button type="button" className="primary-button" disabled={busy || pending.length > 0} onClick={finishTournament} title={pending.length > 0 ? 'Faltan partidos por cargar' : 'Cierra el torneo y calcula al campeón'}>
                🏆 Cerrar torneo
              </button>
            </div>
          )}
        </div>
        {confirmDialog}
      </section>
    </div>
  );
}
