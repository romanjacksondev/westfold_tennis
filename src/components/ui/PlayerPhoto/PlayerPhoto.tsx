'use client';
import { useState } from 'react';

const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

type PlayerPhotoProps = {
  src: string | null;
  name: string;
  size: number;
  className?: string;
};

export default function PlayerPhoto({ src, name, size, className }: PlayerPhotoProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (src && failedSrc !== src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={`Foto de ${name}`} width={size} height={size} className={className} onError={() => setFailedSrc(src)} />
    );
  }

  return (
    <span
      role="img"
      aria-label={`Sin foto de ${name}`}
      className={`player-photo-fallback ${className ?? ''}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
    >
      {initials(name)}
    </span>
  );
}
