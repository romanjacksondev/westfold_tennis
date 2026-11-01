export async function usePlayers() {
  const response = await fetch("/api/players");
  const json = await response.json();
  return json;
}

export async function useAddPlayer(data: any) {
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
