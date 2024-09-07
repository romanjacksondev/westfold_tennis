import { useEffectOnce } from '../hooks/useEffectOnce'
import { useRouter } from 'next/router'

const Home = () => {
  const router = useRouter()

  useEffectOnce(() => {
    router.push("/leaderboard")
  })
}

export default Home
