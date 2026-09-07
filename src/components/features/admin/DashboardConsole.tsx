'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import SiteFooter from '@/components/features/SiteFooter';

type Resource = 'tournaments' | 'tournament-types' | 'tournament-categories' | 'players' | 'surfaces' | 'venues' | 'matches' | 'users';
type RecordItem = { id: string; name?: string; [key: string]: unknown };
type Options = { players: RecordItem[]; venues: RecordItem[]; surfaces: RecordItem[]; categories: RecordItem[]; types: RecordItem[]; tournaments: RecordItem[] };

const sections: { key: Resource; label: string; description: string }[] = [
  { key: 'tournaments', label: 'Torneos', description: 'Competencias y participantes' },
  { key: 'matches', label: 'Partidos', description: 'Resultados y sets' },
  { key: 'players', label: 'Perfiles deportivos', description: 'Datos de competencia' },
  { key: 'venues', label: 'Sedes', description: 'Clubes y canchas' },
  { key: 'surfaces', label: 'Superficies', description: 'Tipos de cancha' },
  { key: 'tournament-types', label: 'Tipos', description: 'Playoff y round robin' },
  { key: 'tournament-categories', label: 'Categorías', description: 'ATP 250, 500 y más' },
  { key: 'users', label: 'Usuarios', description: 'Acceso y permisos' },
];

const simpleFields: Record<Exclude<Resource, 'tournaments' | 'matches'>, string[]> = {
  players: ['name', 'nickname', 'lastname', 'mail', 'phone'],
  venues: ['name', 'phone', 'address'],
  surfaces: ['name'],
  'tournament-types': ['name'],
  'tournament-categories': ['name'],
  users: ['name', 'email', 'role', 'password', 'playerId'],
};

const labels: Record<string, string> = { name: 'Nombre', nickname: 'Apodo', lastname: 'Apellido', mail: 'Email', email: 'Email', phone: 'Teléfono', address: 'Dirección', date: 'Fecha', venueId: 'Sede', surfaceId: 'Superficie', championId: 'Campeón', tournamentCategoryId: 'Categoría', tournamentTypeId: 'Tipo', tournamentId: 'Torneo', player1Id: 'Jugador 1', player2Id: 'Jugador 2', winnerId: 'Ganador', role: 'Rol', password: 'Contraseña', status: 'Estado', drawSize: 'Tamaño del cuadro', qualifiers: 'Clasificados a playoffs' };
const tournamentStatusLabels: Record<string, string> = { IN_PROGRESS: 'En curso', FINISHED: 'Finalizado', CANCELLED: 'Cancelado' };
const tournamentTypeInfo: Record<string, { description: string; rounds: string[] }> = {
  'Round Robin': { description: 'Todos los jugadores se enfrentan entre sí. La tabla final define las posiciones.', rounds: ['Jugador 1 vs Jugador 2', 'Jugador 1 vs Jugador 3', 'Tabla de posiciones'] },
  'Round Robin + Playoffs': { description: 'La fase de todos contra todos define los clasificados para una llave final.', rounds: ['Fase regular', 'Semifinales', 'Final'] },
  Playoffs: { description: 'Eliminación directa: cada partido define quién avanza hasta la final.', rounds: ['Cuartos de final', 'Semifinales', 'Final'] },
};
const todayInputValue = () => {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${today.getFullYear()}-${month}-${day}`;
};
const formatShortDate = (value?: string | null) => (value ? new Date(value).toLocaleDateString('es-AR') : null);
type MatchSetForm = { gamesPlayer1: string; gamesPlayer2: string; hasTiebreak: boolean; tiebreakPlayer1: string; tiebreakPlayer2: string };
const emptyMatchSet = (): MatchSetForm => ({ gamesPlayer1: '', gamesPlayer2: '', hasTiebreak: false, tiebreakPlayer1: '', tiebreakPlayer2: '' });

async function requestJson(url: string, options?: RequestInit) {
  const response = await fetch(url, options);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message ?? 'La solicitud no pudo completarse');
  return payload;
}

// export default function DashboardConsole({ userName }: { userName: string }) {
export default function DashboardConsole() {
  const [resource, setResource] = useState<Resource>('tournaments');
  const [items, setItems] = useState<RecordItem[]>([]);
  const [editing, setEditing] = useState<RecordItem | null>(null);
  const [form, setForm] = useState<Record<string, string>>({ name: '', role: 'USER' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<Options>({ players: [], venues: [], surfaces: [], categories: [], types: [], tournaments: [] });
  const [showTournamentTypeInfo, setShowTournamentTypeInfo] = useState(false);
  const [matchSets, setMatchSets] = useState<MatchSetForm[]>([emptyMatchSet()]);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const isSimple = resource !== 'tournaments' && resource !== 'matches';
  const newTournamentForm = () => ({ name: '', date: todayInputValue(), venueId: options.venues.find((venue) => venue.name === 'Kauri Club')?.id ?? '', surfaceId: options.surfaces.find((surface) => surface.name === 'Polvo de Ladrillo')?.id ?? '', role: 'USER' });

  async function load() {
    setLoading(true);
    try { setItems(await requestJson(`/api/admin/${resource}`)); }
    catch (error) { setMessage({ type: 'error', text: error instanceof Error ? error.message : 'No se pudo cargar' }); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    setEditing(null); setForm(resource === 'tournaments' ? newTournamentForm() : { name: '', role: 'USER' }); setMatchSets([emptyMatchSet()]); setMessage(null); load();
    if (resource === 'tournaments' || resource === 'matches' || resource === 'users') {
      Promise.all([
        requestJson('/api/admin/players'), requestJson('/api/admin/venues'), requestJson('/api/admin/surfaces'),
        requestJson('/api/admin/tournament-categories'), requestJson('/api/admin/tournament-types'), requestJson('/api/admin/tournaments'),
      ]).then(([players, venues, surfaces, categories, types, tournaments]) => {
        setOptions({ players, venues, surfaces, categories, types, tournaments });
        if (resource === 'tournaments') setForm((current) => ({ ...current, date: current.date || todayInputValue(), venueId: current.venueId || venues.find((venue: RecordItem) => venue.name === 'Kauri Club')?.id || '', surfaceId: current.surfaceId || surfaces.find((surface: RecordItem) => surface.name === 'Polvo de Ladrillo')?.id || '' }));
      }).catch(() => setMessage({ type: 'error', text: 'No se pudieron cargar las opciones relacionadas.' }));
    }
  }, [resource]);

  const visibleItems = useMemo(() => items.filter((item) => JSON.stringify(item).toLowerCase().includes(query.toLowerCase())), [items, query]);
  const relationOptions: Record<string, RecordItem[]> = { venueId: options.venues, surfaceId: options.surfaces, championId: options.players, tournamentCategoryId: options.categories, tournamentTypeId: options.types, tournamentId: options.tournaments, player1Id: options.players, player2Id: options.players, winnerId: options.players, playerId: options.players };
  const selectedTournamentTypeName = options.types.find((t) => t.id === form.tournamentTypeId)?.name ?? '';
  const isRoundRobinPlusPlayoffs = String(selectedTournamentTypeName).trim().toLowerCase() === 'round robin + playoffs';
  const fields = isSimple ? simpleFields[resource as Exclude<Resource, 'tournaments' | 'matches'>] : resource === 'tournaments' ? ['name', 'date', 'venueId', 'surfaceId', 'tournamentCategoryId', 'tournamentTypeId', 'drawSize', ...(isRoundRobinPlusPlayoffs ? ['qualifiers'] : []), ...(editing ? ['championId'] : [])] : resource === 'matches' && !editing ? ['tournamentId', 'player1Id', 'player2Id'] : ['tournamentId', 'player1Id', 'player2Id', 'winnerId'];
  const requiredFields = resource === 'users' ? ['email', 'role', ...(!editing ? ['password'] : [])] : fields.filter((field) => field !== 'date' && field !== 'championId' && field !== 'drawSize' && field !== 'qualifiers');
  const selectedTournamentType = options.types.find((option) => option.id === form.tournamentTypeId);

  function startEdit(item: RecordItem) {
    setEditing(item);
    setForm(Object.fromEntries(fields.map((field) => [field, String(item[field] ?? '')])));
    setMessage(null);
    // Pre-populate players checklist from the item's players relation
    if (resource === 'tournaments') {
      const existingPlayers = Array.isArray(item.players)
        ? (item.players as { id: string }[]).map((p) => p.id)
        : [];
      setSelectedPlayerIds(existingPlayers);
    } else {
      setSelectedPlayerIds([]);
    }
  }

  function resetForm() { setEditing(null); setForm(resource === 'tournaments' ? newTournamentForm() : { name: '', role: 'USER' }); setMatchSets([emptyMatchSet()]); setSelectedPlayerIds([]); }

  function updateMatchSet(index: number, patch: Partial<MatchSetForm>) {
    setMatchSets((current) => current.map((set, setIndex) => (setIndex === index ? { ...set, ...patch } : set)));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const missingField = requiredFields.find((field) => !form[field]?.trim());
    if (missingField) { setMessage({ type: 'error', text: `El campo ${labels[missingField] ?? missingField} es obligatorio.` }); return; }
    if (resource === 'matches' && !editing) {
      if (form.player1Id === form.player2Id) { setMessage({ type: 'error', text: 'Jugador 1 y Jugador 2 deben ser distintos.' }); return; }
      const invalidSet = matchSets.find((set) => {
        const gamesPlayer1 = Number(set.gamesPlayer1);
        const gamesPlayer2 = Number(set.gamesPlayer2);
        if (!Number.isInteger(gamesPlayer1) || !Number.isInteger(gamesPlayer2) || gamesPlayer1 === gamesPlayer2) return true;
        return set.hasTiebreak && (set.tiebreakPlayer1.trim() === '' || set.tiebreakPlayer2.trim() === '');
      });
      if (invalidSet) { setMessage({ type: 'error', text: 'Completá el resultado de cada set con un ganador claro.' }); return; }
      setSaving(true); setMessage(null);
      try {
        const sets = matchSets.map((set) => {
          const gamesPlayer1 = Number(set.gamesPlayer1);
          const gamesPlayer2 = Number(set.gamesPlayer2);
          return {
            gamesPlayer1, gamesPlayer2,
            winner: gamesPlayer1 > gamesPlayer2 ? form.player1Id : form.player2Id,
            hasTiebreak: set.hasTiebreak,
            tiebreakPlayer1Points: set.hasTiebreak ? Number(set.tiebreakPlayer1) : null,
            tiebreakPlayer2Points: set.hasTiebreak ? Number(set.tiebreakPlayer2) : null,
          };
        });
        const setsWonByPlayer1 = sets.filter((set) => set.winner === form.player1Id).length;
        const winner = setsWonByPlayer1 > sets.length - setsWonByPlayer1 ? form.player1Id : form.player2Id;
        await requestJson('/api/add-match', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idPlayer1: form.player1Id, idPlayer2: form.player2Id, tournamentId: form.tournamentId, winner, sets }) });
        setMessage({ type: 'success', text: 'Partido creado correctamente' }); resetForm(); await load();
      } catch (error) { setMessage({ type: 'error', text: error instanceof Error ? error.message : 'No se pudo guardar' }); }
      finally { setSaving(false); }
      return;
    }
    setSaving(true); setMessage(null);
    try {
      const payload: Record<string, unknown> = Object.fromEntries(Object.entries(form).map(([key, value]) => [key, value.trim()]));
      // Include playerIds when editing a tournament
      if (resource === 'tournaments' && editing) {
        payload.playerIds = selectedPlayerIds;
      }
      const result = await requestJson(`/api/admin/${resource}${editing ? `/${editing.id}` : ''}`, { method: editing ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      setMessage({ type: 'success', text: result.message }); resetForm(); await load();
    } catch (error) { setMessage({ type: 'error', text: error instanceof Error ? error.message : 'No se pudo guardar' }); }
    finally { setSaving(false); }
  }

  async function archive(item: RecordItem) {
    if (!window.confirm(`¿Archivar ${item.name ?? 'este registro'}?`)) return;
    setMessage(null);
    try { const result = await requestJson(`/api/admin/${resource}/${item.id}`, { method: 'DELETE' }); setMessage({ type: 'success', text: result.message }); await load(); }
    catch (error) { setMessage({ type: 'error', text: error instanceof Error ? error.message : 'No se pudo archivar' }); }
  }

  async function toggleTournamentStatus(item: RecordItem) {
    const cancelling = item.status !== 'CANCELLED';
    if (!window.confirm(cancelling ? `¿Cancelar el torneo “${item.name}”?` : `¿Reactivar el torneo “${item.name}”?`)) return;
    setMessage(null);
    try {
      const result = await requestJson(`/api/admin/tournaments/${item.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: cancelling ? 'cancel' : 'reactivate' }) });
      setMessage({ type: 'success', text: result.message }); await load();
    } catch (error) { setMessage({ type: 'error', text: error instanceof Error ? error.message : 'No se pudo actualizar el estado' }); }
  }

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <Link href="/" className="brand-mark" aria-label="Volver a Westfold Tennis" title="Volver a Westfold Tennis"><span>WT</span><div><strong>Westfold</strong><small>Admin console</small></div></Link>
        <nav aria-label="Secciones administrativas">
          {sections.map((section) => <button key={section.key} className={resource === section.key ? 'nav-item active' : 'nav-item'} onClick={() => setResource(section.key)}><span>{section.label}</span><small>{section.description}</small></button>)}
        </nav>
        <div className="admin-user"><small>Sesión activa</small><strong>{"userName"}</strong></div>
      </aside>
      <section className="admin-content">
        <header className="admin-header"><div><p className="eyebrow">Panel de gestión</p><h1>{sections.find((section) => section.key === resource)?.label}</h1><p className="muted">Administra el circuito con datos claros y controlados.</p></div><div className="status-pill"><span /> Conectado</div></header>
        {message && <div className={`request-message ${message.type}`} role="status">{message.text}</div>}
        <div className="admin-grid">
          <section className="admin-panel form-panel"><div className="panel-heading"><div><p className="eyebrow">{editing ? 'Editar registro' : 'Nuevo registro'}</p><h2>{editing ? 'Actualizar datos' : resource === 'tournaments' ? 'Nuevo Torneo' : 'Agregar elemento'}</h2></div>{editing && <button className="text-button" onClick={resetForm}>Cancelar</button>}</div>
            <form onSubmit={submit}>{fields.map((field) => <label key={field} className="field"><span>{labels[field] ?? field}{(resource === 'users' ? requiredFields.includes(field) : field !== 'date' && field !== 'drawSize' && field !== 'qualifiers') ? <b aria-hidden="true"> *</b> : null}{field === 'tournamentTypeId' && <button type="button" className="field-info-button" onClick={() => setShowTournamentTypeInfo(true)} aria-label="Información sobre tipos de torneo" title="Ver formatos de torneo">i</button>}</span>{field === 'role' ? <select required value={form[field] ?? 'USER'} onChange={(event) => setForm((current) => ({ ...current, [field]: event.target.value }))}><option value="USER">Usuario</option><option value="ADMIN">Administrador</option></select> : field === 'tournamentTypeId' ? <button type="button" className={`type-selector ${selectedTournamentType ? 'has-value' : ''}`} onClick={() => setShowTournamentTypeInfo(true)}>{selectedTournamentType ? String(selectedTournamentType.name) : 'Seleccionar formato...'}</button> : field === 'drawSize' || field === 'qualifiers' ? <input type="number" min={1} value={form[field] ?? ''} onChange={(event) => setForm((current) => ({ ...current, [field]: event.target.value }))} placeholder={field === 'drawSize' ? 'Ej: 8, 16, 32' : 'Ej: 4'} /> : relationOptions[field] ? <select required={requiredFields.includes(field)} value={form[field] ?? ''} onChange={(event) => setForm((current) => ({ ...current, [field]: event.target.value }))}><option value="">Seleccionar...</option>{relationOptions[field].map((option) => <option key={option.id} value={option.id}>{String(option.name ?? option.id)}</option>)}</select> : <input required={resource === 'users' ? requiredFields.includes(field) : field === 'name'} type={field === 'date' ? 'date' : field === 'email' ? 'email' : field === 'password' ? 'password' : 'text'} value={form[field] ?? ''} onChange={(event) => setForm((current) => ({ ...current, [field]: event.target.value }))} placeholder={field === 'password' ? 'Mínimo 12 caracteres' : field === 'name' ? 'Escribí un nombre' : `Agregar ${labels[field]?.toLowerCase() ?? field}`} />}</label>)}{resource === 'tournaments' && editing && (<div className="field"><span className="players-checklist-label">Jugadores confirmados <small>({selectedPlayerIds.length}{form.drawSize ? `/${form.drawSize}` : ''})</small></span>{Number(form.drawSize) > 0 && selectedPlayerIds.length > Number(form.drawSize) && <div className="draw-warning">⚠️ Hay más jugadores confirmados que el tamaño del cuadro ({form.drawSize}).</div>}{isRoundRobinPlusPlayoffs && Number(form.qualifiers) > 0 && Number(form.qualifiers) > Number(form.drawSize) && <div className="draw-warning">⚠️ Los clasificados ({form.qualifiers}) superan el tamaño del cuadro ({form.drawSize}).</div>}<div className="players-checklist" role="group" aria-label="Jugadores confirmados">{options.players.length === 0 ? <p className="players-checklist-empty">No hay jugadores disponibles.</p> : options.players.map((player) => { const checked = selectedPlayerIds.includes(player.id); return (<label key={player.id} className={`players-checklist-item${checked ? ' checked' : ''}`}><input type="checkbox" checked={checked} onChange={() => setSelectedPlayerIds((current) => checked ? current.filter((pid) => pid !== player.id) : [...current, player.id])} /><span>{String(player.name ?? player.id)}</span></label>); })}</div></div>)}{resource === 'matches' && !editing && <div className="match-sets-editor"><span className="match-sets-heading">Resultado del partido <b aria-hidden="true"> *</b></span>{matchSets.map((set, index) => <div className="match-set-row" key={index}><strong>Set {index + 1}</strong><div className="match-set-scores"><input type="number" min={0} required value={set.gamesPlayer1} onChange={(event) => updateMatchSet(index, { gamesPlayer1: event.target.value })} placeholder="Games J1" aria-label={`Games jugador 1 - set ${index + 1}`} /><span>-</span><input type="number" min={0} required value={set.gamesPlayer2} onChange={(event) => updateMatchSet(index, { gamesPlayer2: event.target.value })} placeholder="Games J2" aria-label={`Games jugador 2 - set ${index + 1}`} /></div><label className="match-set-tiebreak"><input type="checkbox" checked={set.hasTiebreak} onChange={(event) => updateMatchSet(index, { hasTiebreak: event.target.checked })} /> Tiebreak</label>{set.hasTiebreak && <div className="match-set-scores"><input type="number" min={0} required value={set.tiebreakPlayer1} onChange={(event) => updateMatchSet(index, { tiebreakPlayer1: event.target.value })} placeholder="Puntos J1" aria-label={`Puntos tiebreak jugador 1 - set ${index + 1}`} /><span>-</span><input type="number" min={0} required value={set.tiebreakPlayer2} onChange={(event) => updateMatchSet(index, { tiebreakPlayer2: event.target.value })} placeholder="Puntos J2" aria-label={`Puntos tiebreak jugador 2 - set ${index + 1}`} /></div>}{matchSets.length > 1 && <button type="button" className="text-button" onClick={() => setMatchSets((current) => current.filter((_, setIndex) => setIndex !== index))}>Quitar set</button>}</div>)}{matchSets.length < 5 && <button type="button" className="text-button" onClick={() => setMatchSets((current) => [...current, emptyMatchSet()])}>+ Agregar set</button>}</div>}{resource === 'users' && !editing && <label className="legal-consent"><input type="checkbox" required /> <span>La persona fue informada y acepta los <a href="/terms">Términos</a> y la <a href="/privacy">Política de privacidad</a>. <b>*</b></span></label>}<button className="primary-button" disabled={saving}>{saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear registro'}</button></form>
            {showTournamentTypeInfo && <div className="type-modal-backdrop" role="presentation" onClick={() => setShowTournamentTypeInfo(false)}><section className="type-modal" role="dialog" aria-modal="true" aria-labelledby="tournament-type-title" onClick={(event) => event.stopPropagation()}><div className="panel-heading"><div><p className="eyebrow">Formato de competencia</p><h2 id="tournament-type-title">Elegí el tipo de torneo</h2></div><button type="button" className="text-button" onClick={() => setShowTournamentTypeInfo(false)}>Cerrar</button></div><div className="type-info-list">{Object.entries(tournamentTypeInfo).map(([name, info]) => { const option = options.types.find((item) => String(item.name).trim().toLowerCase() === name.toLowerCase()); return <button type="button" className={`type-info-item ${form.tournamentTypeId === option?.id ? 'selected' : ''}`} key={name} disabled={!option} onClick={() => { if (!option) return; setForm((current) => ({ ...current, tournamentTypeId: option.id })); setShowTournamentTypeInfo(false); }}><div className={`draw-preview draw-${name.toLowerCase().replaceAll(' ', '-')}`}><span /><span /><span /><span /><span /></div><div><h3>{name}{form.tournamentTypeId === option?.id && <small className="type-selected-label">Seleccionado</small>}</h3><p>{info.description}</p><small>{info.rounds.join(' · ')}</small>{!option && <small className="type-unavailable">No disponible</small>}</div></button>})}</div></section></div>}
          </section>
          <section className="admin-panel list-panel"><div className="panel-heading"><div><p className="eyebrow">Registros activos</p><h2>{items.length} elementos</h2></div><input className="search-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar..." aria-label="Buscar registros" /></div>{loading ? <div className="empty-state">Cargando registros...</div> : visibleItems.length === 0 ? <div className="empty-state">No hay registros para mostrar.</div> : <div className="record-list">{visibleItems.map((item) => <div className="record-row" key={item.id}><div><strong>{String(item.name ?? item.email ?? item.id)}</strong><small>{resource === 'tournaments' ? `${tournamentStatusLabels[String(item.status)] ?? String(item.status)} · Creado ${formatShortDate(item.createdAt as string) ?? '-'}${item.finishedAt ? ` · Finalizado ${formatShortDate(item.finishedAt as string)}` : ''}` : item.email ? `${String(item.email)} · ${String(item.role ?? 'USER')}` : item.id}</small></div><div className="row-actions"><button className="text-button" onClick={() => startEdit(item)}>Editar</button>{resource === 'tournaments' && item.status !== 'FINISHED' && <button className="text-button" onClick={() => toggleTournamentStatus(item)}>{item.status === 'CANCELLED' ? 'Reactivar' : 'Cancelar'}</button>}<button className="danger-button" onClick={() => archive(item)}>Archivar</button></div></div>)}</div>}</section>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
