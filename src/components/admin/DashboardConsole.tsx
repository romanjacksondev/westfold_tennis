'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import SiteFooter from '@/components/SiteFooter';

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

const labels: Record<string, string> = { name: 'Nombre', nickname: 'Apodo', lastname: 'Apellido', mail: 'Email', email: 'Email', phone: 'Teléfono', address: 'Dirección', date: 'Fecha', venueId: 'Sede', surfaceId: 'Superficie', championId: 'Campeón', tournamentCategoryId: 'Categoría', tournamentTypeId: 'Tipo', tournamentId: 'Torneo', player1Id: 'Jugador 1', player2Id: 'Jugador 2', winnerId: 'Ganador', role: 'Rol', password: 'Contraseña' };
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

async function requestJson(url: string, options?: RequestInit) {
  const response = await fetch(url, options);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message ?? 'La solicitud no pudo completarse');
  return payload;
}

export default function DashboardConsole({ userName }: { userName: string }) {
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
  const isSimple = resource !== 'tournaments' && resource !== 'matches';
  const newTournamentForm = () => ({ name: '', date: todayInputValue(), venueId: options.venues.find((venue) => venue.name === 'Kauri Club')?.id ?? '', surfaceId: options.surfaces.find((surface) => surface.name === 'Polvo de Ladrillo')?.id ?? '', role: 'USER' });

  async function load() {
    setLoading(true);
    try { setItems(await requestJson(`/api/admin/${resource}`)); }
    catch (error) { setMessage({ type: 'error', text: error instanceof Error ? error.message : 'No se pudo cargar' }); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    setEditing(null); setForm(resource === 'tournaments' ? newTournamentForm() : { name: '', role: 'USER' }); setMessage(null); load();
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
  const fields = isSimple ? simpleFields[resource as Exclude<Resource, 'tournaments' | 'matches'>] : resource === 'tournaments' ? ['name', 'date', 'venueId', 'surfaceId', 'tournamentCategoryId', 'tournamentTypeId', ...(editing ? ['championId'] : [])] : ['tournamentId', 'player1Id', 'player2Id', 'winnerId'];
  const requiredFields = resource === 'users' ? ['email', 'role', ...(!editing ? ['password'] : [])] : fields.filter((field) => field !== 'date');
  const selectedTournamentType = options.types.find((option) => option.id === form.tournamentTypeId);

  function startEdit(item: RecordItem) {
    setEditing(item);
    setForm(Object.fromEntries(fields.map((field) => [field, String(item[field] ?? '')])));
    setMessage(null);
  }

  function resetForm() { setEditing(null); setForm(resource === 'tournaments' ? newTournamentForm() : { name: '', role: 'USER' }); }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const missingField = requiredFields.find((field) => !form[field]?.trim());
    if (missingField) { setMessage({ type: 'error', text: `El campo ${labels[missingField] ?? missingField} es obligatorio.` }); return; }
    setSaving(true); setMessage(null);
    try {
      const payload = Object.fromEntries(Object.entries(form).map(([key, value]) => [key, value.trim()]));
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

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <Link href="/" className="brand-mark" aria-label="Volver a Westfold Tennis" title="Volver a Westfold Tennis"><span>WT</span><div><strong>Westfold</strong><small>Admin console</small></div></Link>
        <nav aria-label="Secciones administrativas">
          {sections.map((section) => <button key={section.key} className={resource === section.key ? 'nav-item active' : 'nav-item'} onClick={() => setResource(section.key)}><span>{section.label}</span><small>{section.description}</small></button>)}
        </nav>
        <div className="admin-user"><small>Sesión activa</small><strong>{userName}</strong></div>
      </aside>
      <section className="admin-content">
        <header className="admin-header"><div><p className="eyebrow">Panel de gestión</p><h1>{sections.find((section) => section.key === resource)?.label}</h1><p className="muted">Administra el circuito con datos claros y controlados.</p></div><div className="status-pill"><span /> Conectado</div></header>
        {message && <div className={`request-message ${message.type}`} role="status">{message.text}</div>}
        <div className="admin-grid">
          <section className="admin-panel form-panel"><div className="panel-heading"><div><p className="eyebrow">{editing ? 'Editar registro' : 'Nuevo registro'}</p><h2>{editing ? 'Actualizar datos' : resource === 'tournaments' ? 'Nuevo Torneo' : 'Agregar elemento'}</h2></div>{editing && <button className="text-button" onClick={resetForm}>Cancelar</button>}</div>
            <form onSubmit={submit}>{fields.map((field) => <label key={field} className="field"><span>{labels[field] ?? field}{(resource === 'users' ? requiredFields.includes(field) : field !== 'date') ? <b aria-hidden="true"> *</b> : null}{field === 'tournamentTypeId' && <button type="button" className="field-info-button" onClick={() => setShowTournamentTypeInfo(true)} aria-label="Información sobre tipos de torneo" title="Ver formatos de torneo">i</button>}</span>{field === 'role' ? <select required value={form[field] ?? 'USER'} onChange={(event) => setForm((current) => ({ ...current, [field]: event.target.value }))}><option value="USER">Usuario</option><option value="ADMIN">Administrador</option></select> : field === 'tournamentTypeId' ? <button type="button" className={`type-selector ${selectedTournamentType ? 'has-value' : ''}`} onClick={() => setShowTournamentTypeInfo(true)}>{selectedTournamentType ? String(selectedTournamentType.name) : 'Seleccionar formato...'}</button> : relationOptions[field] ? <select required value={form[field] ?? ''} onChange={(event) => setForm((current) => ({ ...current, [field]: event.target.value }))}><option value="">Seleccionar...</option>{relationOptions[field].map((option) => <option key={option.id} value={option.id}>{String(option.name ?? option.id)}</option>)}</select> : <input required={resource === 'users' ? requiredFields.includes(field) : field === 'name'} type={field === 'date' ? 'date' : field === 'email' ? 'email' : field === 'password' ? 'password' : 'text'} value={form[field] ?? ''} onChange={(event) => setForm((current) => ({ ...current, [field]: event.target.value }))} placeholder={field === 'password' ? 'Mínimo 12 caracteres' : field === 'name' ? 'Escribí un nombre' : `Agregar ${labels[field]?.toLowerCase() ?? field}`} />}</label>)}{resource === 'users' && !editing && <label className="legal-consent"><input type="checkbox" required /> <span>La persona fue informada y acepta los <a href="/terms">Términos</a> y la <a href="/privacy">Política de privacidad</a>. <b>*</b></span></label>}<button className="primary-button" disabled={saving}>{saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear registro'}</button></form>
            {showTournamentTypeInfo && <div className="type-modal-backdrop" role="presentation" onClick={() => setShowTournamentTypeInfo(false)}><section className="type-modal" role="dialog" aria-modal="true" aria-labelledby="tournament-type-title" onClick={(event) => event.stopPropagation()}><div className="panel-heading"><div><p className="eyebrow">Formato de competencia</p><h2 id="tournament-type-title">Elegí el tipo de torneo</h2></div><button type="button" className="text-button" onClick={() => setShowTournamentTypeInfo(false)}>Cerrar</button></div><div className="type-info-list">{Object.entries(tournamentTypeInfo).map(([name, info]) => { const option = options.types.find((item) => String(item.name).trim().toLowerCase() === name.toLowerCase()); return <button type="button" className={`type-info-item ${form.tournamentTypeId === option?.id ? 'selected' : ''}`} key={name} disabled={!option} onClick={() => { if (!option) return; setForm((current) => ({ ...current, tournamentTypeId: option.id })); setShowTournamentTypeInfo(false); }}><div className={`draw-preview draw-${name.toLowerCase().replaceAll(' ', '-')}`}><span /><span /><span /><span /><span /></div><div><h3>{name}{form.tournamentTypeId === option?.id && <small className="type-selected-label">Seleccionado</small>}</h3><p>{info.description}</p><small>{info.rounds.join(' · ')}</small>{!option && <small className="type-unavailable">No disponible</small>}</div></button>})}</div></section></div>}
          </section>
          <section className="admin-panel list-panel"><div className="panel-heading"><div><p className="eyebrow">Registros activos</p><h2>{items.length} elementos</h2></div><input className="search-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar..." aria-label="Buscar registros" /></div>{loading ? <div className="empty-state">Cargando registros...</div> : visibleItems.length === 0 ? <div className="empty-state">No hay registros para mostrar.</div> : <div className="record-list">{visibleItems.map((item) => <div className="record-row" key={item.id}><div><strong>{String(item.name ?? item.email ?? item.id)}</strong><small>{item.email ? `${String(item.email)} · ${String(item.role ?? 'USER')}` : item.id}</small></div><div className="row-actions"><button className="text-button" onClick={() => startEdit(item)}>Editar</button><button className="danger-button" onClick={() => archive(item)}>Archivar</button></div></div>)}</div>}</section>
        </div>
        <SiteFooter />
      </section>
    </main>
  );
}
