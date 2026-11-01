'use client';

export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  const digest =
    error instanceof globalThis.Error
      ? (error as globalThis.Error & { digest?: string }).digest
      : undefined;

  return (
    <html lang="es">
      <body
        style={{ fontFamily: 'system-ui, sans-serif', textAlign: 'center', padding: '5rem 1rem' }}
      >
        <h2>Algo salió mal</h2>
        <p>Ocurrió un error inesperado. Si el problema persiste, avisale al administrador.</p>
        {digest && (
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Código de error: {digest}</p>
        )}
        <button type="button" onClick={() => retry()}>
          Reintentar
        </button>
      </body>
    </html>
  );
}
