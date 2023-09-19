import useSWR from 'swr';
import { fetcher } from "./fetcher"

export default function usePlayers () {
    const { data, error, isLoading } = useSWR(`/api/getPlayers`, fetcher)
   
    return {
      user: data,
      isLoading,
      isError: error
    }
  }