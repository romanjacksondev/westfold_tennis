import itemsData from '../data/matches.json';

export function getMatchesById(id) {
  return itemsData[id];
}