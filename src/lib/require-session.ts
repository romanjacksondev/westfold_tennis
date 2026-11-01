import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { actorFromSession, audit, requestAuditMetadata } from '@/lib/audit';
import { logger } from '@/lib/logger';

export async function requireSession() {
  const session = await getServerSession(authOptions);

  if (!session) {
    logger.warn('auth.unauthorized');
    return { session: null, response: NextResponse.json({ message: 'No autorizado' }, { status: 401 }) };
  }

  return { session, response: null };
}

export const requireUser = requireSession;

export async function requireAdmin() {
  const result = await requireSession();
  if (result.response) return result;
  if (result.session.user.role !== 'ADMIN') {
    logger.warn('auth.forbidden', { userId: result.session.user.id, role: result.session.user.role });
    await audit({ action: 'ACCESS_DENIED', entity: 'Route', actor: actorFromSession(result.session), metadata: requestAuditMetadata() });
    return { session: null, response: NextResponse.json({ message: 'Se requieren permisos de administrador' }, { status: 403 }) };
  }
  return result;
}