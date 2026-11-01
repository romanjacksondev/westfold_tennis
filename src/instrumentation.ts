import type { Instrumentation } from 'next';

export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  const { onServerStart } = await import('./instrumentation-node');
  onServerStart();
}

export const onRequestError: Instrumentation.onRequestError = async (err, request, context) => {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  const { reportRequestError } = await import('./instrumentation-node');
  await reportRequestError(err, request, context);
};
