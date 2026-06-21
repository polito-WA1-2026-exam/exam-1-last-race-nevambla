// import
import express from "express";
import morgan from "morgan";
import cors from "cors";
import { check, validationResult } from "express-validator";
import passport from "passport";
import LocalStrategy from "passport-local";
import session from "express-session";
import {
  getLines, getStations, getLineStations, getSegments, getEvents,
  getUser, createGame, getGame, completeGame, getRanking
} from "./dao.js";

// init
const app = express();
const port = 3001;

// middlewares
app.use(express.json());
app.use(morgan("dev")); // to print the comands in the console

const corsOptions = {
  origin: "http://localhost:5173",
  optionsSuccessState: 200,
  credentials: true // to allow sesion cookies from the client
};
app.use(cors(corsOptions));

passport.use(new LocalStrategy(async function verify(username, password, cb) {
  const user = await getUser(username, password); // getUser returns user object if credentials are valid, false otherwise
  if (!user)
    return cb(null, false, "Incorrect email or password.");
  return cb(null, user);
}));

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (user, cb) {
  return cb(null, user);
});

const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: "Not authorized" });
};

app.use(session({
  secret: "middle-earth-secret-key", // to sign the session
  resave: false, // to not save session if unmodified
  saveUninitialized: false,
}));
app.use(passport.authenticate("session"));

/* ROUTES */

// POST /api/sessions
// authenticates user and creates a session
app.post("/api/sessions", passport.authenticate("local"), function (req, res) {
  return res.status(201).json(req.user);
});

// GET /api/sessions/current
// checks if the user is authenticated and returns user info
app.get("/api/sessions/current", (req, res) => {
  if (req.isAuthenticated())
    res.json(req.user);
  else
    res.status(401).json({ error: "Not authenticated" });
});

// DELETE /api/sessions/current
// log out
app.delete("/api/sessions/current", (req, res) => {
  req.logout(() => {
    res.end();
  });
});

// GET /api/lines
app.get("/api/lines", async (req, res) => {
  try {
    const lines = await getLines();
    res.json(lines);
  } catch {
    res.status(500).end();
  }
});

// GET /api/stations
app.get("/api/stations", async (req, res) => {
  try {
    const stations = await getStations();
    res.json(stations);
  } catch {
    res.status(500).end();
  }
});

// GET /api/line-stations
app.get("/api/line-stations", async (req, res) => {
  try {
    const lineStations = await getLineStations();
    res.json(lineStations);
  } catch {
    res.status(500).end();
  }
});

// GET /api/segments
app.get("/api/segments", async (req, res) => {
  try {
    const segments = await getSegments();
    res.json(segments);
  } catch {
    res.status(500).end();
  }
});

// GET /api/events
app.get("/api/events", async (req, res) => {
  try {
    const events = await getEvents();
    res.json(events);
  } catch {
    res.status(500).end();
  }
});

// POST /api/games
// start a new game
// require authentication
app.post("/api/games", isLoggedIn, async (req, res) => {
  try {
    const segments = await getSegments();
    const stations = await getStations();

    // build adjacency list
    const adj = {};
    for (const s of stations) adj[s.id] = [];
    for (const seg of segments) {
      adj[seg.station1_id].push(seg.station2_id); // add both directions
      adj[seg.station2_id].push(seg.station1_id);
    }

    // Breadth First Search to compute shortest distance from a station to all others
    const bfs = (startId) => {
      const dist = { [startId]: 0 };
      const queue = [startId];
      while (queue.length > 0) {
        const curr = queue.shift();
        for (const neighbor of adj[curr]) {
          if (dist[neighbor] === undefined) {
            dist[neighbor] = dist[curr] + 1;
            queue.push(neighbor);
          }
        }
      }
      return dist;
    };

    // find all pairs at least 3 segments apart
    const validPairs = [];
    for (const s of stations) {
      const dist = bfs(s.id);
      for (const d of stations) {
        if (s.id < d.id && dist[d.id] >= 3) {
          validPairs.push({ startId: s.id, endId: d.id });
        }
      }
    }

    // Pick a random pair, randomly assign start and end
    const pair = validPairs[Math.floor(Math.random() * validPairs.length)];
    const [startId, endId] = Math.random() < 0.5 // to randomly assign start and end
      ? [pair.startId, pair.endId]  // maintain original order
      : [pair.endId, pair.startId]; // invert order

    const gameId = await createGame(req.user.id, startId, endId);
    const startStation = stations.find((s) => s.id === startId);
    const endStation = stations.find((s) => s.id === endId);

    res.json({ gameId, startStation, endStation });
  } catch {
    res.status(500).json({ error: "Database error" });
  }
});

// POST /api/games/:id/route 
// submit route and get score
app.post("/api/games/:id/route", isLoggedIn, [
  check("segments").isArray(), // segments must be an array
  check("segments.*.line_id").isInt(), // each segment must have an integer line_id
  check("segments.*.station1_id").isInt(), // each segment must have an integer station1_id
  check("segments.*.station2_id").isInt(),  // each segment must have an integer station2_id
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  try {
    const gameId = Number(req.params.id);
    const game = await getGame(gameId);

    if (!game) return res.status(404).json({ error: "Game not found" });
    if (game.user_id !== req.user.id) return res.status(403).json({ error: "Not your game" });
    if (game.status === "completed") return res.status(400).json({ error: "Game already completed" });

    const submittedRoute = req.body.segments; // array of segments submitted by the user

    // empty route = invalid (timer expired with no segments)
    if (submittedRoute.length === 0) {
      await completeGame(gameId, 0);
      return res.json({ valid: false, score: 0, steps: [] });
    }

    // load data for validation
    const dbSegments = await getSegments();
    const lineStations = await getLineStations();

    // valid segments set
    const validSegments = new Set();
    for (const seg of dbSegments) {
      validSegments.add(`${seg.line_id}-${seg.station1_id}-${seg.station2_id}`); // ej 2-10-11: line 2, station 10 to station 11
      validSegments.add(`${seg.line_id}-${seg.station2_id}-${seg.station1_id}`); // inverse direction
    }

    // find interchange stations (on more than one line)
    const stationLines = {};
    for (const ls of lineStations) {
      if (!stationLines[ls.station_id]) stationLines[ls.station_id] = new Set(); // initialize set if not exists
      stationLines[ls.station_id].add(ls.line_id); // add line to the set of lines for this station
    }
    const interchanges = new Set();
    for (const [stationId, lines] of Object.entries(stationLines)) { // for each station check how many lines it has
      if (lines.size > 1) interchanges.add(Number(stationId)); // if more than one line = it is an interchange
    }

    // validate the route
    let valid = true;
    const usedSegments = new Set();

    if (submittedRoute[0].station1_id !== game.start_station_id) valid = false;

    const lastSeg = submittedRoute[submittedRoute.length - 1];
    if (lastSeg.station2_id !== game.end_station_id) valid = false;

    for (let i = 0; i < submittedRoute.length && valid; i++) {
      const seg = submittedRoute[i];
      const key = `${seg.line_id}-${seg.station1_id}-${seg.station2_id}`;

      if (!validSegments.has(key)) { valid = false; break; }

      const normKey = Math.min(seg.station1_id, seg.station2_id)
        + "-" + Math.max(seg.station1_id, seg.station2_id);
      if (usedSegments.has(normKey)) { valid = false; break; }
      usedSegments.add(normKey);

      if (i > 0) {
        const prev = submittedRoute[i - 1];
        if (prev.station2_id !== seg.station1_id) { valid = false; break; }

        if (prev.line_id !== seg.line_id) {
          if (!interchanges.has(seg.station1_id)) { valid = false; break; }
        }
      }
    }

    // calculate score
    const events = await getEvents();
    let score = 20;
    const steps = [];

    if (valid) {
      for (const seg of submittedRoute) {
        const event = events[Math.floor(Math.random() * events.length)];
        score += event.effect;
        steps.push({
          station1_id: seg.station1_id,
          station2_id: seg.station2_id,
          line_id: seg.line_id,
          event: { description: event.description, effect: event.effect },
          coins: score
        });
      }
      score = Math.max(0, score);
    } else {
      score = 0;
    }

    await completeGame(gameId, score);
    res.json({ valid, score, steps });
  } catch {
    res.status(500).json({ error: "Database error" });
  }
});

// GET /api/ranking
app.get("/api/ranking", isLoggedIn, async (req, res) => {
  try {
    const ranking = await getRanking();
    res.json(ranking);
  } catch {
    res.status(500).end();
  }
});

// start the server
app.listen(port, () => { console.log(`API server started at http://localhost:${port}`); });