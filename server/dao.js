// Data Access Object - all database queries
import crypto from 'crypto';

import sqlite from 'sqlite3';

const db = new sqlite.Database('lastrace.sqlite', (err) => {
  if (err) throw err;
});

// Stations, lines, segments, events
// get all metro lines
export const getLines = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT id, name, color FROM lines';
    db.all(sql, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// get all stations
export const getStations = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT id, name FROM stations';
    db.all(sql, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// get all line-station connections
export const getLineStations = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT line_id, station_id, position FROM line_stations ORDER BY line_id, position';
    db.all(sql, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// get all segments
// two stations form a segment if they are on the same line with consecutive positions
export const getSegments = () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT
        ls1.station_id AS station1_id, s1.name AS station1_name,
        ls2.station_id AS station2_id, s2.name AS station2_name,
        ls1.line_id, l.name AS line_name
      FROM line_stations ls1
      JOIN line_stations ls2 ON ls1.line_id = ls2.line_id AND ls2.position = ls1.position + 1
      JOIN stations s1 ON ls1.station_id = s1.id
      JOIN stations s2 ON ls2.station_id = s2.id
      JOIN lines l ON ls1.line_id = l.id
      ORDER BY ls1.line_id, ls1.position
    `;
    db.all(sql, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// get all events
export const getEvents = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT id, description, effect FROM events';
    db.all(sql, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// USERS 
// find a user by email and verify password with scrypt
// returns the user object if credentials are valid, false otherwise
export const getUser = (email, password) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users WHERE email = ?';
    db.get(sql, [email], (err, row) => {
      if (err) reject(err);
      else if (row === undefined) resolve(false);
      else {
        crypto.scrypt(password, row.salt, 32, (err, hashedPassword) => {
          if (err) reject(err);
          else if (!crypto.timingSafeEqual(Buffer.from(row.password, 'hex'), hashedPassword))
            resolve(false);
          else
            resolve({ id: row.id, email: row.email, name: row.name });
        });
      }
    });
  });
};

// GAMES require login
// create a new game 
// returns the new game id
export const createGame = (userId, startStationId, endStationId) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO games (user_id, start_station_id, end_station_id) VALUES (?, ?, ?)';
    db.run(sql, [userId, startStationId, endStationId], function (err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
};

// get a game by id
export const getGame = (gameId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM games WHERE id = ?';
    db.get(sql, [gameId], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// mark a game as completed with its final score
export const completeGame = (gameId, score) => {
  return new Promise((resolve, reject) => {
    const sql = "UPDATE games SET score = ?, status = 'completed' WHERE id = ?";
    db.run(sql, [score, gameId], function (err) {
      if (err) reject(err);
      else resolve(this.changes);
    });
  });
};

// RANKING
// get the best score for each user 
export const getRanking = () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT u.name, MAX(g.score) AS best_score
      FROM games g
      JOIN users u ON g.user_id = u.id
      WHERE g.status = 'completed'
      GROUP BY g.user_id
      ORDER BY best_score DESC
    `;
    db.all(sql, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};