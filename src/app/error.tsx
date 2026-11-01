'use client';

export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  const digest =
    error instanceof globalThis.Error
      ? (error as globalThis.Error & { digest?: string }).digest
      : undefined;

  return (
    <main className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-20 text-center">
      <h2 className="text-2xl font-semibold">Algo salió mal</h2>
      <p className="text-gray-600">
        Ocurrió un error inesperado. Si el problema persiste, avisale al administrador.
      </p>
      {digest && <p className="text-sm text-gray-500">Código de error: {digest}</p>}
      <button
        type="button"
        onClick={() => retry()}
        className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Reintentar
      </button>
    </main>
  );
}
