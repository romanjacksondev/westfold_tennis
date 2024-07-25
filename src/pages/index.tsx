import { useRouter } from 'next/router'
import { paths } from 'lib/paths'

const Home = () => {
  const router = useRouter();

  router.push(paths.torneos.root);
  // return <HomeComponent />;
}

export default Home;