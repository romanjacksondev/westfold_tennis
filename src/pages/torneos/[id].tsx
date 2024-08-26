
import { useRouter } from 'next/router'

export default function Torneo() {
  const router = useRouter()
  return <p>Post: {router.query.slug}</p>
}
