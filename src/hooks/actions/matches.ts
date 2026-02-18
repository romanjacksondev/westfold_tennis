export async function useMatches(data) {
  const params = new URLSearchParams({
    id: data,
  });
  const response = await fetch(`/api/matches?${params}`);
  const json = await response.json();
  return json;
}

export function useSetMatchesData(data) {}

export function useClearMatches() {}

export async function useAddMatch(data) {
  const response = await fetch("/api/add-match", {
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
