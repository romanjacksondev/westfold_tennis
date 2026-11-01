import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import { PrismaClient } from '../../prisma/generated/client';

const databaseUrl = process.env.DATABASE_URL;
const schema = databaseUrl ? new URL(databaseUrl).searchParams.get('schema') ?? undefined : undefined;
const adapter = new PrismaPg({ connectionString: databaseUrl }, { schema });
export const prisma = new PrismaClient({ adapter });

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// export const prisma =
//   globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
