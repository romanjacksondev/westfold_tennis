import useSWR from "swr";

export function fetcher(url) {
    // debugger
    return fetch(url).then((res) => res.json());
  }

const useTournament = (id) => {
    const { data, isLoading, error } = useSWR({url: `/api/tournaments`, id: id}, fetcher);
  
    return { user: data, isLoading, error };
  };

export default useTournament;