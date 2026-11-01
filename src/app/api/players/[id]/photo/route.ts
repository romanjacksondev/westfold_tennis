import { del, get, put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/require-session';
import { prisma } from '@/utils/prisma';
import { actorFromSession, audit } from '@/lib/audit';
import { logger } from '@/lib/logger';
import { withApiLogging } from '@/lib/api-logging';

type Context = { params: Promise<{ id: string }> };

const MAX_PHOTO_BYTES = 300 * 1024;
const MAX_THUMB_BYTES = 60 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const extensionFor = (type: string) => (type === 'image/png' ? 'png' : type === 'image/webp' ? 'webp' : 'jpg');
const notFound = () => new NextResponse(null, { status: 404, headers: { 'Cache-Control': 'public, max-age=60' } });

// GET es público: el ranking muestra las fotos sin login y el Blob privado nunca se expone.
async function getPhoto(request: Request, context: Context) {

  const { id } = await context.params;
  const { searchParams } = new URL(request.url);
  const size = searchParams.get('size') === 'full' ? 'full' : 'thumb';

  const player = await prisma.player.findFirst({
    where: { id, deletedAt: null },
    select: { photoUrl: true, photoThumbUrl: true },
  });
  const pathname = size === 'full' ? player?.photoUrl : (player?.photoThumbUrl ?? player?.photoUrl);
  if (!pathname) return notFound();

  try {
    const ifNoneMatch = request.headers.get('if-none-match') ?? undefined;
    const result = await get(pathname, { access: 'private', ifNoneMatch });
    if (!result) return notFound();

    // La versión (?v=) cambia con cada subida, por lo que con ella la respuesta es inmutable.
    const cacheControl = searchParams.has('v')
      ? 'public, max-age=31536000, immutable'
      : 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400';
    const headers = { 'Cache-Control': cacheControl, ETag: result.blob.etag };

    if (result.statusCode === 304) return new NextResponse(null, { status: 304, headers });
    return new NextResponse(result.stream, {
      headers: { ...headers, 'Content-Type': result.blob.contentType, 'X-Content-Type-Options': 'nosniff' },
    });
  } catch (error) {
    logger.error('photo.read_failed', { err: error, pathname });
    return notFound();
  }
}

async function authorize(id: string) {
  const { session, response } = await requireSession();
  if (response) return { response };
  if (session.user.role !== 'ADMIN' && session.user.playerId !== id) {
    logger.warn('photo.forbidden', { userId: session.user.id, playerId: id });
    return { response: NextResponse.json({ message: 'No tenés permisos para editar esta foto' }, { status: 403 }) };
  }
  const player = await prisma.player.findFirst({ where: { id, deletedAt: null }, select: { photoUrl: true, photoThumbUrl: true } });
  if (!player) return { response: NextResponse.json({ message: 'Jugador no encontrado' }, { status: 404 }) };
  return { player, actor: actorFromSession(session) };
}

function validate(file: FormDataEntryValue | null, maxBytes: number, label: string) {
  if (!(file instanceof File)) return `Falta el archivo de ${label}`;
  if (!ALLOWED_TYPES.includes(file.type)) return `El archivo de ${label} debe ser JPG, PNG o WebP`;
  if (file.size === 0 || file.size > maxBytes) return `El archivo de ${label} supera el tamaño permitido`;
  return null;
}

const removeBlobs = (paths: (string | null | undefined)[]) => {
  const list = [...new Set(paths.filter((path): path is string => Boolean(path)))];
  return list.length ? del(list) : Promise.resolve();
};

async function postPhoto(request: Request, context: Context) {
  const { id } = await context.params;
  const auth = await authorize(id);
  if (auth.response) return auth.response;
  const player = auth.player!;

  try {
    const form = await request.formData();
    const photo = form.get('photo');
    const thumb = form.get('thumb');
    const error = validate(photo, MAX_PHOTO_BYTES, 'la foto') ?? validate(thumb, MAX_THUMB_BYTES, 'la miniatura');
    if (error) return NextResponse.json({ message: error }, { status: 400 });
    const photoFile = photo as File;
    const thumbFile = thumb as File;

    const [full, small] = await Promise.all([
      put(`players/${id}.${extensionFor(photoFile.type)}`, photoFile, { access: 'private', addRandomSuffix: true, contentType: photoFile.type }),
      put(`players/${id}-thumb.${extensionFor(thumbFile.type)}`, thumbFile, { access: 'private', addRandomSuffix: true, contentType: thumbFile.type }),
    ]);

    await prisma.player.update({ where: { id }, data: { photoUrl: full.pathname, photoThumbUrl: small.pathname } });
    await removeBlobs([player.photoUrl, player.photoThumbUrl]).catch((e) => logger.error('photo.blob_cleanup_failed', { err: e, playerId: id }));

    await audit({ action: 'PHOTO_UPLOAD', entity: 'Player', entityId: id, actor: auth.actor, metadata: { sizeBytes: photoFile.size, contentType: photoFile.type } });
    return NextResponse.json({ photoUrl: full.pathname, photoThumbUrl: small.pathname, message: 'Foto actualizada' });
  } catch (e) {
    logger.error('photo.upload_failed', { err: e, playerId: id });
    return NextResponse.json({ message: 'No se pudo subir la foto' }, { status: 500 });
  }
}

async function deletePhoto(_request: Request, context: Context) {
  const { id } = await context.params;
  const auth = await authorize(id);
  if (auth.response) return auth.response;
  const player = auth.player!;

  try {
    await prisma.player.update({ where: { id }, data: { photoUrl: null, photoThumbUrl: null } });
    await removeBlobs([player.photoUrl, player.photoThumbUrl]).catch((e) => logger.error('photo.blob_cleanup_failed', { err: e, playerId: id }));
    await audit({ action: 'PHOTO_DELETE', entity: 'Player', entityId: id, actor: auth.actor });
    return NextResponse.json({ message: 'Foto eliminada' });
  } catch (e) {
    logger.error('photo.delete_failed', { err: e, playerId: id });
    return NextResponse.json({ message: 'No se pudo eliminar la foto' }, { status: 500 });
  }
}

export const GET = withApiLogging('/api/players/[id]/photo', getPhoto, { quiet: true });
export const POST = withApiLogging('/api/players/[id]/photo', postPhoto);
export const DELETE = withApiLogging('/api/players/[id]/photo', deletePhoto);
