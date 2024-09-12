const getPlayerStats = async (payload) => {

  const params = new URLSearchParams({
    'id': payload
  });

  const response = await fetch(`/api/playerStats?${params}`)
  const json = await response.json();
  return json
}

export { getPlayerStats }
