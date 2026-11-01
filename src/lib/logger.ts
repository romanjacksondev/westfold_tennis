import pino from 'pino';
import { getRequestContext } from './request-context.ts';
import { REDACTED, sanitizeLogValue, serializeError } from './log-sanitize.ts';

const level = process.env.LOG_LEVEL ?? (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

// Segunda red de seguridad: pino también oculta estas rutas aunque el sanitizador no las vea.
const redact = {
  paths: [
    'password',
    '*.password',
    'token',
    '*.token',
    'authorization',
    '*.authorization',
    'cookie',
    '*.cookie',
    'secret',
    '*.secret',
    'hash',
    '*.hash',
  ],
  censor: REDACTED,
};

const base = pino({
  level,
  base: { service: 'westfold-tennis', env: process.env.VERCEL_ENV ?? process.env.NODE_ENV },
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: { level: (label) => ({ level: label }) },
  redact,
});

type Fields = Record<string, unknown>;
type Level = 'debug' | 'info' | 'warn' | 'error';

function write(lvl: Level, event: string, fields: Fields = {}) {
  const ctx = getRequestContext();
  const { err, ...rest } = fields;
  const payload: Fields = {
    event,
    ...(ctx ? { requestId: ctx.requestId, route: ctx.route, method: ctx.method } : {}),
    ...(sanitizeLogValue(rest) as Fields),
    ...(err !== undefined ? { err: serializeError(err) } : {}),
  };
  base[lvl](payload);
}

export const logger = {
  debug: (event: string, fields?: Fields) => write('debug', event, fields),
  info: (event: string, fields?: Fields) => write('info', event, fields),
  warn: (event: string, fields?: Fields) => write('warn', event, fields),
  error: (event: string, fields?: Fields) => write('error', event, fields),
};
