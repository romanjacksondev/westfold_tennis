import type { Instrumentation } from 'next';
import { logger } from '@/lib/logger';

const REQUIRED_ENV = ['DATABASE_URL', 'NEXTAUTH_SECRET', 'BLOB_READ_WRITE_TOKEN'] as const;

export function onServerStart() {
  const missing = REQUIRED_ENV.filter((name) => !process.env[name]);
  logger.info('app.start', {
    node: process.version,
    vercelEnv: process.env.VERCEL_ENV,
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7),
  });
  if (missing.length > 0) logger.error('app.config_missing', { missing });
}

export const reportRequestError: Instrumentation.onRequestError = async (err, request, context) => {
  logger.error('request.unhandled_error', {
    err,
    digest:
      typeof err === 'object' && err !== null && 'digest' in err ? String(err.digest) : undefined,
    path: request.path.split('?')[0],
    method: request.method,
    routePath: context.routePath,
    routeType: context.routeType,
  });
};
