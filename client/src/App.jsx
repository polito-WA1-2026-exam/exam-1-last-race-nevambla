import 'bootstrap/dist/css/bootstrap.min.css';
import background from './assets/background.png'

import { useContext, useState, useEffect } from 'react';
import { Container, Button } from 'react-bootstrap';
import { Navigate, Outlet, Route, Routes, useNavigate } from 'react-router';

import { getLines, getStations, getSegments, createGame } from './api/api';

import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import { LoginForm, Logout } from './components/LoginForm.jsx';
import RankingView from './components/RankingView.jsx';
import GameView from './components/GameView.jsx';
import ResultView from './components/ResultView.jsx';

import UserContext from './contexts/UserContext.js';

function App() {
  const navigate = useNavigate();

  const [user, setUser] = useState({ id: undefined, email: undefined, name: undefined });

  const [lines, setLines] = useState([]);
  const [stations, setStations] = useState([]);
  const [segments, setSegments] = useState([]);

  const [game, setGame] = useState(null);
  const [result, setResult] = useState(null);

  const doLogin = (newUser) => {
    setUser({ id: newUser.id, email: newUser.email, name: newUser.name });
    navigate('/home');
  };

  const handleLogout = () => {
    setUser({ id: undefined, email: undefined, name: undefined });
    setGame(null);
    setResult(null);
  };

  useEffect(() => {
    if (!user.id) return;
    Promise.all([getLines(), getStations(), getSegments()])
      .then(([l, s, seg]) => { setLines(l); setStations(s); setSegments(seg); })
      .catch(() => {});
  }, [user.id]);

  const startGame = async () => {
    const g = await createGame();
    setGame(g);
    setResult(null);
    navigate('/game');
  };
  
  // called from gaveview when game ends
  const endGame = (res) => {
    setResult(res);
    setGame(null);
    navigate('/result');
  };

  return (
    <UserContext.Provider value={user}>
      <Container fluid style={{
        backgroundImage: `url(${background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh'
      }}>
        <Routes>
          <Route path='/' element={<MainLayout />}>
            <Route index element={<WelcomeView />} />
            <Route path='home' element={<HomeView startGame={startGame} result={result} />} />
            <Route path='login' element={<LoginForm doLogin={doLogin} />} />
            <Route path='logout' element={<Logout handleLogout={handleLogout} />} />
            <Route path='ranking' element={<RankingView />} />
            <Route path='game' element={<GameView game={game} segments={segments} stations={stations} lines={lines} endGame={endGame} />} />
            <Route path='result' element={<ResultView result={result} />} />
          </Route>
        </Routes>
      </Container>
    </UserContext.Provider>
  );
}

function MainLayout() {
  return <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
    <Header />
    <div style={{ flex: 1 }}>
      <Outlet />
    </div>
    <Footer />
  </div>;
}

// for user not logged in
function WelcomeView() {
  const user = useContext(UserContext);
  if (user.id) return <Navigate to='/home' />;

  return (
    <Container className='mt-4' style={{ maxWidth: '700px' }}>
    <div style={{ textAlign: 'center'}}>
      <img src="src/assets/logo.png" alt="Last Race" style={{ maxWidth: '800px', width: '100%' }} />
    </div>
    <div className='game-panel mb-3'>
        <h5 style={{ color: '#c9a84c', fontFamily: 'serif' }}>How to Play</h5>
        <p style={{ color: '#e8d5a3', fontFamily: 'serif' }}>
          You start each game with <strong>20 coins</strong>. The server assigns you a random starting station
          and a destination station. You have <strong>90 seconds</strong> to build a valid route by selecting
          segments one by one from the available connections.
        </p>
        <p style={{ color: '#e8d5a3', fontFamily: 'serif' }}>
          A valid route must start at the assigned origin, end at the assigned destination,
          and change lines only at interchange stations. Each segment can only be used once.
        </p>
        <p style={{ color: '#e8d5a3', fontFamily: 'serif' }}>
          Once submitted, a random event occurs at each segment of your journey, adding or removing
          coins. If your route is invalid or incomplete, you lose all coins and score zero.
        </p>
        <p style={{ color: '#e8d5a3', fontFamily: 'serif' }}>
          Your best score is recorded in the general ranking. Log in to start playing!
        </p>
      </div>
      </Container>
  );
}

function HomeView({ startGame, result }) {
  const user = useContext(UserContext);
  const navigate = useNavigate();
  if (!user.id) return <Navigate to='/' />;

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h3 style={{ color: '#1a1a0e', fontFamily: 'serif' }}>Welcome, {user.name}!</h3>
      
      {result && (
        <div style={{ backgroundColor: '#1a1a0e', border: '2px solid #c9a84c', borderRadius: '8px', padding: '20px', maxWidth: '500px', margin: '15px auto', fontFamily: 'serif' }}>
          <h4 style={{ color: '#c9a84c' }}>Last Result</h4>
          <p style={{ color: result.valid ? '#4a7c59' : '#e63946', fontSize: '1.2em' }}>
            {result.valid ? `Score: ${result.score} coins` : 'Invalid route'}
          </p>
        </div>
      )}
      
      <img src="src/assets/metromap_full.png" alt="Metro Map" style={{ maxWidth: '900px', width: '100%' }} />
      <div style={{ marginTop: '20px' }}>
        <Button onClick={startGame} className='me-2' style={{ backgroundColor: '#c9a84c', border: 'none', color: '#1a1a0e', fontFamily: 'serif', letterSpacing: '1px' }}>New Game</Button>        
        <Button onClick={() => navigate('/ranking')} style={{ backgroundColor: '#c9a84c', border: 'none', color: '#1a1a0e', fontFamily: 'serif', letterSpacing: '1px' }}>
          View Ranking
        </Button>
      </div>
    </div>
  );
}

export default App;
