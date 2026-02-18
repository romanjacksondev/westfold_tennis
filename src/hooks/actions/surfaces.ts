export async function useSurfaces() {
  const response = await fetch("/api/surfaces");
  const json = await response.json();
  return json;
}

export function useSetSurfacesData(data) {}
