import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/utils/prisma';
import { requireAdmin } from '@/lib/require-session';
import { withApiLogging } from '@/lib/api-logging';

const MAX_PAGE_SIZE = 100;

const parseDate = (value: string | null, endOfDay = false) => {
  if (!value) return undefined;
  const date = new Date(
    /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? `${value}T${endOfDay ? '23:59:59.999' : '00:00:00.000'}Z`
      : value,
  );
  return Number.isNaN(date.getTime()) ? undefined : date;
};

async function listAuditLogs(request: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  const params = request.nextUrl.searchParams;
  const page = Math.max(1, Number(params.get('page')) || 1);
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Number(params.get('pageSize')) || 25));
  const from = parseDate(params.get('from'));
  const to = parseDate(params.get('to'), true);
  const text = (name: string) => params.get(name)?.trim() || undefined;

  const where = {
    actorId: text('actorId'),
    entity: text('entity'),
    entityId: text('entityId'),
    action: text('action'),
    createdAt: from || to ? { gte: from, lte: to } : undefined,
  };

  const [total, items] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return NextResponse.json({ items, total, page, pageSize });
}

export const GET = withApiLogging('/api/admin/audit-logs', listAuditLogs, { quiet: true });
