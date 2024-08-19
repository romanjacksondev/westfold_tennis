export function fetcher(url) {
  return fetch(url).then((res) => res.json());
}