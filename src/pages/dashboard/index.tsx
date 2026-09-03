import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import DashboardConsole from '@/components/admin/DashboardConsole';

export async function getServerSideProps(context) {
	const session = await getServerSession(context.req, context.res, authOptions);
	if (!session || session.user.role !== 'ADMIN') return { redirect: { destination: '/auth/signin?callbackUrl=/dashboard', permanent: false } };
	return { props: { userName: session.user?.name ?? session.user?.email ?? 'Administrador' } };
}

export default function Dashboard({ userName }: { userName: string }) {
	return <DashboardConsole userName={userName} />;
}
