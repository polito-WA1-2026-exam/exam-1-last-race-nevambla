async function getLines() {
  try {
    const response = await fetch('http://localhost:3001/api/lines');
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error('HTTP error in getLines, code=' + response.status);
    }
  } catch (ex) {
    throw new Error("Network error", { cause: ex });
  }
}

async function getStations() {
  try {
    const response = await fetch('http://localhost:3001/api/stations');
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error('HTTP error in getStations, code=' + response.status);
    }
  } catch (ex) {
    throw new Error("Network error", { cause: ex });
  }
}

async function getSegments() {
  try {
    const response = await fetch('http://localhost:3001/api/segments');
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error('HTTP error in getSegments, code=' + response.status);
    }
  } catch (ex) {
    throw new Error("Network error", { cause: ex });
  }
}

async function getLineStations() {
  try {
    const response = await fetch('http://localhost:3001/api/line-stations');
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error('HTTP error in getLineStations, code=' + response.status);
    }
  } catch (ex) {
    throw new Error("Network error", { cause: ex });
  }
}

async function createGame() {
  try {
    const response = await fetch('http://localhost:3001/api/games', {
      method: 'POST',
      credentials: 'include'
    });
    if (response.ok) {
      return await response.json();  // gameId, startStation, endStation
    } else {
      throw new Error('HTTP error in createGame, code=' + response.status);
    }
  } catch (ex) {
    throw new Error("Network error", { cause: ex });
  }
}

async function submitRoute(gameId, segments) {
  try {
    const response = await fetch('http://localhost:3001/api/games/' + gameId + '/route', {
      method: 'POST',
      body: JSON.stringify({ segments: segments }),
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
    if (response.ok) {
      return await response.json();  // valid, score, steps 
    } else {
      throw new Error('HTTP error in submitRoute, code=' + response.status);
    }
  } catch (ex) {
    throw new Error("Network error", { cause: ex });
  }
}

async function getRanking() {
  try {
    const response = await fetch('http://localhost:3001/api/ranking', {
      credentials: 'include'
    });
    if (response.ok) {
      return await response.json();  // name, best_score
    } else {
      throw new Error('HTTP error in getRanking, code=' + response.status);
    }
  } catch (ex) {
    throw new Error("Network error", { cause: ex });
  }
}

export { getLines, getStations, getSegments, getLineStations, createGame, submitRoute, getRanking };