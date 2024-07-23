import PageTitle from "../PageTitle";
import { useRouter } from "next/router";

export default function PlayerDetails({ playersList }) {

    const router = useRouter();
    const { id } = router.query;
    const player = playersList.find(e => e.id === id);
  return (
    <>
    {player.name}
    </>
  );
}
