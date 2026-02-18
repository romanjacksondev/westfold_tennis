export async function useVenues() {
  const response = await fetch("/api/venues");
  const json = await response.json();
  return json;
}

export function useSetVenuesData(data) {}

export async function useAddVenue(data) {
  const response = await fetch("/api/add-venue", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  const json = await response.json();
  data.id = json.id;
  return json;
}
