import { useEffectOnce } from '../hooks/useEffectOnce'
import { useRouter } from 'next/router'

const Home = () => {
  const router = useRouter()

  useEffectOnce(() => {
    // router.push("/torneos")
  })
}

export default Home
