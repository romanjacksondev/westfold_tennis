import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';

export async function requireSession() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return { session: null, response: NextResponse.json({ message: 'No autorizado' }, { status: 401 }) };
  }

  return { session, response: null };
}

export const requireUser = requireSession;

export async function requireAdmin() {
  const result = await requireSession();
  if (result.response) return result;
  if (result.session.user.role !== 'ADMIN') {
    return { session: null, response: NextResponse.json({ message: 'Se requieren permisos de administrador' }, { status: 403 }) };
  }
  return result;
}