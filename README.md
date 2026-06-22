# Exam #1: "Last Race"
## Student: s123456 Nevado Manuel 

## React Client Application Routes

- Route /: Welcome page for anonymous users. Shows game title, instructions and a prompt to log in. Redirects to /home if already authenticated.
- Route /home: Home page (Phase 1: Setup). Displays the full metro network map with colored lines and a "Start Game" button. Requires authentication.
- Route /game: Game page (Phase 2: Planning). Shows the metro map without line colors, a 90-second countdown timer, and two columns: available segments to pick from and the player's selected route. Requires an active game; redirects to /home if none.
- Route /result: Result page (Phase 3: Execution + Phase 4: Result). Events are revealed one by one with their coin effects, then the final score is displayed with options to play again or view the ranking.
- Route /ranking: Ranking page. Shows a table of all players ranked by their best score. Requires authentication.
- Route /login: Login form with email and password fields.
- Route /logout: Logs the user out and redirects to /.

## API Server

* POST `/api/sessions`
  * Request body: `{ "username": "email", "password": "password" }`
  * Response body: `{ "id": 1, "email": "frodo@shire.com", "name": "Frodo Baggins" }`
* GET `/api/sessions/current`
  * No request parameters
  * Response body: `{ "id": 1, "email": "frodo@shire.com", "name": "Frodo Baggins" }` or `401` if not authenticated
* DELETE `/api/sessions/current`
  * No request parameters
  * No response body (ends session)
* GET `/api/lines`
  * No request parameters
  * Response body: `[{ "id": 1, "name": "Fellowship Path", "color": "#e63946" }, ...]`
* GET `/api/stations`
  * No request parameters
  * Response body: `[{ "id": 1, "name": "Hobbiton" }, ...]`
* GET `/api/segments`
  * No request parameters
  * Response body: `[{ "station1_id": 1, "station1_name": "Hobbiton", "station2_id": 2, "station2_name": "Bree", "line_id": 1, "line_name": "Fellowship Path" }, ...]`
* GET `/api/line-stations`
  * No request parameters
  * Response body: `[{ "line_id": 1, "station_id": 1, "position": 1 }, ...]`
### Authenticated
* POST `/api/games`
  * No request body. Server selects two random stations at least 3 segments apart using BFS.
  * Response body: `{ "gameId": 1, "startStation": { "id": 1, "name": "Hobbiton" }, "endStation": { "id": 6, "name": "Lothlórien" } }`
* POST `/api/games/:id/route`
  * Request parameters: `id` (game ID in URL)
  * Request body: `{ "segments": [{ "line_id": 1, "station1_id": 1, "station2_id": 2 }, ...] }` (validated with express-validator)
  * Response body: `{ "valid": true, "score": 22, "steps": [{ "station1_id": 1, "station1_name": "Hobbiton", "station2_id": 2, "station2_name": "Bree", "line_id": 1, "event": { "id": 1, "description": "Gandalf guides your path", "effect": 3 }, "coins": 23 }, ...] }`
* GET `/api/ranking`
  * No request parameters
  * Response body: `[{ "name": "Aragorn", "best_score": 25 }, ...]`

## Database Tables

- Table lines — metro lines (id, name, color). 4 lines: Fellowship Path, Kings Road, Elven Way, Shadow Line.
- Table stations — station names (id, name). 14 stations across Middle-earth.
- Table line_stations — which stations belong to which line and in what order (line_id, station_id, position). Two stations with consecutive positions on the same line form a segment.
- Table events — random events that occur during each segment (id, description, effect). Effects range from -4 to +4 coins.
- Table users — registered users (id, email, name, password, salt). Passwords hashed with scrypt.
- Table games — game records (id, user_id, start_station_id, end_station_id, score, status, created_at). Status is 'playing' or 'completed'.

## Main React Components

- App (in App.jsx): Main component with routing, user state, network data loading, and game lifecycle (startGame, endGame).
- Header (in Header.jsx): Navbar with game title and login/logout controls.
- LoginForm (in LoginForm.jsx): Email/password form for authentication.
- GameView (in GameView.jsx): Planning phase with 90-second timer, segment selection with auto-direction detection, and route building.
- ResultView (in ResultView.jsx): Events revealed one at a time, then final score with play again and ranking buttons.
- RankingView (in RankingView.jsx): Table of players ranked by best score.

## Screenshot

![Screenshot](./img/screen1.png)
![Screenshot](./img/screen2.png)

## Users Credentials

- frodo@shire.com, ringbearer (Frodo Baggins)
- aragorn@gondor.com, kingofmen (Aragorn)
- gandalf@istari.com, youshallnotpass (Gandalf) -- Recommended user to log in and play (the only one that not appear in the ranking).

## Use of AI Tools
- ChatGPT: generating graphic design assets (logos, event images, metro map illustrations).
- Claude: debugging errors, holistic view of the project for suggestions, adding CSS styles for the LOTR theme and README.
- VS Code autocomplete: accelerating development by suggesting code completions while typing.
