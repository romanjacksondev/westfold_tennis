export async function useTournaments(dispatch: any) {
  const response = await fetch("api/tournaments");
  const json = await response.json();
  return json;
}

export function useSetTournamentData(data: any) {}

export async function useAddTournament(payload: any) {
  const response = await fetch("/api/add-tournament", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const json = await response.json();
  payload.id = json.id;
  return json;
}
