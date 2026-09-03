import type { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async ({ params }) => ({
	redirect: {
		destination: `/tournaments/${params?.id ?? ''}`,
		permanent: false,
	},
});

const Partidos = () => null;

export default Partidos;
