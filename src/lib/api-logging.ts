import { connection, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { runWithRequestContext } from '@/lib/request-context';

const SLOW_MS = 1000;

type Handler<Req extends Request, Args extends unknown[]> = (
  request: Req,
  ...args: Args
) => Promise<Response> | Response;

// Envuelve un route handler: requestId, duración, log de request y 500 controlado ante excepciones.
// `quiet` evita el log info de lecturas frecuentes (solo registra 4xx/5xx y requests lentas).
export function withApiLogging<Req extends Request, Args extends unknown[]>(
  route: string,
  handler: Handler<Req, Args>,
  options: { quiet?: boolean } = {},
): Handler<Req, Args> {
  return async (request, ...args) => {
    // Con cacheComponents, requestId/fecha deben calcularse recién al recibir la request.
    await connection();
    const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID();
    const context = {
      requestId,
      method: request.method,
      route,
      ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
      userAgent: request.headers.get('user-agent'),
    };

    return runWithRequestContext(context, async () => {
      const startedAt = Date.now();
      try {
        const response = await handler(request, ...args);
        const durationMs = Date.now() - startedAt;
        const level =
          response.status >= 500
            ? 'error'
            : response.status >= 400 || durationMs > SLOW_MS
              ? 'warn'
              : 'info';
        if (!(options.quiet && level === 'info'))
          logger[level]('api.request', {
            status: response.status,
            durationMs,
            ...(durationMs > SLOW_MS ? { slow: true } : {}),
          });
        response.headers.set('x-request-id', requestId);
        return response;
      } catch (err) {
        logger.error('api.error', { err, durationMs: Date.now() - startedAt });
        return NextResponse.json(
          { message: 'Error interno del servidor', requestId },
          { status: 500, headers: { 'x-request-id': requestId } },
        );
      }
    });
  };
}
