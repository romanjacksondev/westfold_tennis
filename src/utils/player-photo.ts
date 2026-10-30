export type PhotoSize = 'thumb' | 'full';

type PlayerPhotoSource = {
  id: string;
  photoUrl?: string | null;
  photoThumbUrl?: string | null;
};

// La versión (parte final del pathname, con sufijo aleatorio) invalida la caché al cambiar la foto.
export const photoVersion = (pathname: string) => (pathname.split('/').pop() ?? '').replace(/\.[^.]+$/, '');

export function getPlayerPhoto(player: PlayerPhotoSource, size: PhotoSize): string | null {
  const pathname = size === 'thumb' ? (player.photoThumbUrl ?? player.photoUrl) : player.photoUrl;
  if (!pathname) return null;
  return `/api/players/${player.id}/photo?size=${size}&v=${encodeURIComponent(photoVersion(pathname))}`;
}
