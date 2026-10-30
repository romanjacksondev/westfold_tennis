'use client';
import { Tooltip } from 'flowbite-react';
import { ChangeEvent, useRef, useState } from 'react';
import { LuCamera, LuTrash2 } from 'react-icons/lu';
import { getPlayerPhoto } from '@/utils/player-photo';
import PlayerPhoto from './PlayerPhoto';

export type PhotoPaths = { photoUrl: string | null; photoThumbUrl: string | null };

type Props = {
  playerId: string;
  name: string;
  photoUrl: string | null;
  photoThumbUrl: string | null;
  onChanged?: (paths: PhotoPaths) => void;
  showPreview?: boolean;
  compact?: boolean;
};

const FULL = { size: 512, maxBytes: 280 * 1024 };
const THUMB = { size: 128, maxBytes: 55 * 1024 };

async function toSquareJpeg(bitmap: ImageBitmap, { size, maxBytes }: { size: number; maxBytes: number }) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Tu navegador no puede procesar la imagen');
  const side = Math.min(bitmap.width, bitmap.height);
  context.fillStyle = '#fff';
  context.fillRect(0, 0, size, size);
  context.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, size, size);

  for (let quality = 0.86; quality >= 0.4; quality -= 0.1) {
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
    if (blob && blob.size <= maxBytes) return blob;
  }
  throw new Error('No se pudo reducir la imagen lo suficiente');
}

export default function PlayerPhotoEditor({ playerId, name, photoUrl, photoThumbUrl, onChanged, showPreview = true, compact = false }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  const call = async (init: RequestInit) => {
    const response = await fetch(`/api/players/${playerId}/photo`, init);
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.message ?? 'No se pudo guardar la foto');
    return payload;
  };

  const onSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setBusy(true);
    setMessage(null);
    try {
      if (!file.type.startsWith('image/')) throw new Error('Elegí un archivo de imagen');
      const bitmap = await createImageBitmap(file);
      const [photo, thumb] = [await toSquareJpeg(bitmap, FULL), await toSquareJpeg(bitmap, THUMB)];
      bitmap.close();
      const body = new FormData();
      body.append('photo', photo, 'photo.jpg');
      body.append('thumb', thumb, 'thumb.jpg');
      const payload = await call({ method: 'POST', body });
      onChanged?.({ photoUrl: payload.photoUrl, photoThumbUrl: payload.photoThumbUrl });
      setMessage({ text: 'Foto actualizada', error: false });
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : 'No se pudo subir la foto', error: true });
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    setMessage(null);
    try {
      await call({ method: 'DELETE' });
      onChanged?.({ photoUrl: null, photoThumbUrl: null });
      setMessage({ text: 'Foto eliminada', error: false });
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : 'No se pudo eliminar la foto', error: true });
    } finally {
      setBusy(false);
    }
  };

  if (compact) {
    return (
      <div className="photo-editor photo-editor-compact">
        <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={onSelect} />
        <div className="photo-editor-icons">
          <Tooltip content={photoUrl ? 'Cambiar foto' : 'Subir foto'} placement="bottom">
            <button type="button" className="photo-icon-button" disabled={busy} aria-label={photoUrl ? 'Cambiar foto' : 'Subir foto'} onClick={() => input.current?.click()}>
              <LuCamera aria-hidden="true" />
            </button>
          </Tooltip>
          {photoUrl && (
            <Tooltip content="Quitar foto" placement="bottom">
              <button type="button" className="photo-icon-button photo-icon-danger" disabled={busy} aria-label="Quitar foto" onClick={remove}>
                <LuTrash2 aria-hidden="true" />
              </button>
            </Tooltip>
          )}
        </div>
        {message && (
          <small role={message.error ? 'alert' : 'status'} className={message.error ? 'photo-editor-error' : 'photo-editor-ok'}>
            {message.text}
          </small>
        )}
      </div>
    );
  }

  return (
    <div className="photo-editor">
      {showPreview && (
        <PlayerPhoto src={getPlayerPhoto({ id: playerId, photoUrl, photoThumbUrl }, 'thumb')} name={name} size={64} className="photo-editor-preview" />
      )}
      <div className="photo-editor-actions">
        <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={onSelect} />
        <button type="button" className="text-button" disabled={busy} onClick={() => input.current?.click()}>
          {busy ? 'Procesando…' : photoUrl ? 'Cambiar foto' : 'Subir foto'}
        </button>
        {photoUrl && (
          <button type="button" className="text-button" disabled={busy} onClick={remove}>
            Quitar
          </button>
        )}
        {message && (
          <small role={message.error ? 'alert' : 'status'} className={message.error ? 'photo-editor-error' : 'photo-editor-ok'}>
            {message.text}
          </small>
        )}
      </div>
    </div>
  );
}
