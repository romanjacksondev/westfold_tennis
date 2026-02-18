export async function usePlayers() {
  const response = await fetch("/api/players");
  const json = await response.json();
  return json;
}

export function useSetPlayersData(data) {
  console.log("Setting players data", data);
}

export async function useAddPlayer(data) {
  const response = await fetch("/api/add-player", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  const json = await response.json();
  data.id = json.id;
}
