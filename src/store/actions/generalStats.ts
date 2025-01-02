const getGeneralStats = async () => {
  const response = await fetch(`/api/generalStats`)
  const json = await response.json();
  return json
}

export { getGeneralStats }
