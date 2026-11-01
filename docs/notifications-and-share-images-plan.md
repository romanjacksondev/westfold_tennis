# Plan de viabilidad (futuro): Notificaciones e imágenes para compartir

Estado: **Fuera de alcance por ahora**. Documento para evaluar viabilidad y costos antes de decidir.

## 1. Imágenes para promover y compartir (la parte más viable y barata)

Objetivo: generar piezas gráficas listas para WhatsApp/Instagram sin diseñarlas a mano.

### Piezas

| Pieza | Contenido | Formato |
|---|---|---|
| **Promo de partido** | Fotos de ambos jugadores, nombres, nivel, torneo, ronda, fecha/hora/cancha (cuando exista programación) | 1080×1350 (feed) y 1080×1920 (story) |
| **Resultado de partido** | Marcador por sets (con tiebreaks), ganador destacado, torneo y fase | 1080×1350 / 1200×630 |
| **Cuadro del torneo** | Cuadro de eliminación o tabla de grupos con resultados | PNG ancho, y PDF para imprimir |
| **Podio / campeón** | Campeón, finalista, puntos obtenidos | 1080×1350 |
| **Ranking** | Top N del leaderboard | 1080×1350 |
| **Resultados del torneo** | Lista de partidos y posiciones finales | PDF + CSV |

### Cómo se haría

- **`next/og` (`ImageResponse`)**, ya incluido en Next: JSX + CSS → PNG en un route handler (por ejemplo `GET /api/share/match/[id]?format=story`). Limitaciones documentadas: solo flexbox (sin `display: grid`), bundle máximo de 500 KB (JSX, fuentes e imágenes), fuentes `ttf/otf/woff`. Los cuadros con muchos nodos se arman con flex y posiciones absolutas.
- **Fotos de jugadores**: están en Vercel Blob **privado** (`get(pathname, { access: 'private' })`); el generador las lee en el servidor y las embebe como data URL, sin exponer URLs. Si no hay foto, iniciales sobre fondo del club.
- **Fuentes y marca**: una o dos fuentes `ttf` cargadas una vez a nivel de módulo; colores y logo del club configurables.
- **Open Graph**: `opengraph-image` por torneo/partido para que el link compartido muestre la imagen automáticamente (docs: `opengraph-image.md`).
- **PDF** del cuadro/agenda: opción 1, `@react-pdf/renderer` (vectorial, nítido al imprimir); opción 2, imprimir una vista HTML con CSS `@media print` (más barato, menos control). Recomiendo empezar por la segunda.
- **CSV** de resultados: route handler simple, sin dependencias.
- **Caché**: las imágenes de partidos terminados son inmutables ⇒ `Cache-Control` largo; las de partidos pendientes, corto. El costo de cómputo en Vercel es bajo con caché.
- **UI**: botón «Compartir / Descargar imagen» en el partido, el cuadro y el perfil; en móvil usar `navigator.share` con el archivo.

### Riesgos

- Consentimiento y privacidad: usar la foto solo de jugadores que lo permiten (campo `shareConsent`), nunca mail/teléfono.
- Rendimiento de cuadros grandes (32 jugadores): validar legibilidad y tamaño; fallback a PDF.
- Fuentes con tildes/ñ y emojis: probar render.

### Esfuerzo estimado

Promo y resultado de partido: **1–2 días**. Cuadro y podio: **2–3 días**. PDF/CSV: **1 día**. Depende de `official-draw-bracket-plan.md` para el cuadro con datos reales.

## 2. Notificaciones a jugadores (viabilidad)

Eventos candidatos: sorteo publicado, «tu próximo rival es X», partido programado/cambiado (cuando exista agenda), resultado cargado a confirmar, torneo terminado, recordatorio 24 h antes.

### Canales

| Canal | Pros | Contras | Viabilidad |
|---|---|---|---|
| **Email** (Resend, Postmark o SES) | Barato, simple, ya tenemos `User.email` | Se ignora fácil | **Alta**: primera opción |
| **Web Push / PWA** | Gratis, instantáneo | Requiere instalar la PWA; iOS limitado | Media |
| **WhatsApp Business API** | Es donde está el club | Costo por conversación, plantillas aprobadas por Meta, opt-in obligatorio, alta de número | Media-baja: evaluar con volumen real |
| **Telegram bot** | Gratis y fácil | Pocos jugadores lo usan | Baja |
| **Enlace de WhatsApp precargado** (`wa.me/?text=…`) | Sin API ni costo; el admin envía con un clic | Manual | **Alta** como paso intermedio |

### Arquitectura propuesta

1. Tabla `Notification` (outbox): `id`, `userId`/`playerId`, `type`, `payload` (Json), `channel`, `status` (`PENDING`/`SENT`/`FAILED`), `attempts`, `scheduledFor`, `sentAt`.
2. Los eventos de dominio (sorteo confirmado, resultado cargado) **encolan** notificaciones en la misma transacción.
3. Un **cron de Vercel** (cada pocos minutos) procesa pendientes, con reintentos y backoff; los recordatorios usan `scheduledFor`.
4. Preferencias por usuario: canales, tipos de aviso y baja con un clic; guardar `optIn` con fecha.
5. Plantillas en un solo módulo (`src/lib/notifications/templates.ts`) para es-AR.
6. Logging y auditoría con las utilidades existentes (`logger`, `audit`), sin loguear mails completos.

### Riesgos

- Spam y reputación del dominio de email (SPF/DKIM).
- Consentimiento (política de privacidad y términos).
- Costos de WhatsApp si el volumen crece.

### Recomendación

1. Primero **imágenes compartibles + enlace `wa.me`** (valor inmediato, costo cero).
2. Luego **email transaccional** para sorteo y recordatorios.
3. Evaluar WhatsApp Business solo si hay uso real y presupuesto.

## Dependencias

- `official-draw-bracket-plan.md` (cuadro y resultados confiables).
- Programación de partidos (hoy fuera de alcance) para promos con horario/cancha y recordatorios.
- `player-public-experience-plan.md` (páginas públicas a las que apuntan los enlaces).
