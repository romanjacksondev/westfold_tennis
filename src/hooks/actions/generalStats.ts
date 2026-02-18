export async function useGeneralStats() {
  const response = await fetch(`/api/generalStats`);
  const json = await response.json();
  return json;
}
