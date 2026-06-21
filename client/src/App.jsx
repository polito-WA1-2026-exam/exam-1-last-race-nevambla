import 'bootstrap/dist/css/bootstrap.min.css';

import { useContext, useState } from 'react';
import { Container } from 'react-bootstrap';
import { Navigate, Outlet, Route, Routes, useNavigate } from 'react-router';

import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import { LoginForm, Logout } from './components/LoginForm.jsx';

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
      <Container fluid>
        <Routes>
          <Route path='/' element={<MainLayout />}>
            <Route index element={<WelcomeView />} />
            <Route path='home' element={<HomeView />} />
            <Route path='login' element={<LoginForm doLogin={doLogin} />} />
            <Route path='logout' element={<Logout handleLogout={handleLogout} />} />
          </Route>
        </Routes>
      </Container>
    </UserContext.Provider>
  );
}

function MainLayout() {
  return <>
    <Header />
    <Outlet />
    <Footer />
  </>;
}

function WelcomeView() {
  const user = useContext(UserContext);
  if (user.id) return <Navigate to='/home' />;

  return (
    <div>
      <h1>Last Race</h1>
      <p>A metro route planning game in Middle earth.</p>
      <p>Log in to start playing!</p>
    </div>
  );
}

function HomeView() {
  const user = useContext(UserContext);
  if (!user.id) return <Navigate to='/' />;

  return (
    <div>
      <h3>Welcome, {user.name}!</h3>
    </div>
  );
}

export default App;
