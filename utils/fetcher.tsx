export function fetcher(url) {
  return fetch(url).then((res) => res.json());
}

export function fetcherWithParams(key) {
  return fetch(key[0]).then((res) => res.json());
}