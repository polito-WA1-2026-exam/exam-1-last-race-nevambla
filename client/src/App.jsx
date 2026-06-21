import 'bootstrap/dist/css/bootstrap.min.css';
import background from './assets/background.png'

import { useContext, useState } from 'react';
import { Container, Button } from 'react-bootstrap';
import { Navigate, Outlet, Route, Routes, useNavigate } from 'react-router';

import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import { LoginForm, Logout } from './components/LoginForm.jsx';
import RankingView from './components/RankingView.jsx';

import UserContext from './contexts/UserContext.js';

function App() {
  const navigate = useNavigate();

  const [user, setUser] = useState({ id: undefined, email: undefined, name: undefined });

  const doLogin = (newUser) => {
    setUser({ id: newUser.id, email: newUser.email, name: newUser.name });
    navigate('/home');
  };

  const handleLogout = () => {
    setUser({ id: undefined, email: undefined, name: undefined });
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
            <Route path='home' element={<HomeView />} />
            <Route path='login' element={<LoginForm doLogin={doLogin} />} />
            <Route path='logout' element={<Logout handleLogout={handleLogout} />} />
            <Route path='ranking' element={<RankingView />} />
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

function WelcomeView() {
  const user = useContext(UserContext);
  if (user.id) return <Navigate to='/home' />;

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <img src="src/assets/logo.png" alt="Last Race" style={{ maxWidth: '800px', width: '100%' }} />
      <p>A metro route planning game in Middle earth.</p>
      <p>Log in to start playing!</p>
    </div>
  );
}

function HomeView() {
  const user = useContext(UserContext);
  const navigate = useNavigate();
  if (!user.id) return <Navigate to='/' />;

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h3 style={{ color: '#1a1a0e', fontFamily: 'serif' }}>Welcome, {user.name}!</h3>
      <img src="src/assets/metromap_full.png" alt="Metro Map" style={{ maxWidth: '900px', width: '100%' }} />
      <div style={{ marginTop: '20px' }}>
        <Button onClick={() => navigate('/ranking')} style={{ backgroundColor: '#c9a84c', border: 'none', color: '#1a1a0e', fontFamily: 'serif', letterSpacing: '1px' }}>
          View Ranking
        </Button>
      </div>
    </div>
  );
}

export default App;
