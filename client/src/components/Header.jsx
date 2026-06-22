import './custom.css';
import logo from '../assets/logo.png';

import { useContext } from "react";
import { Button, Container, Navbar } from "react-bootstrap";
import { Link, useNavigate } from 'react-router';

import UserContext from "../contexts/UserContext";

function Header() {
  const user = useContext(UserContext);

  // if the user is logged go to /home, if not to /
  const destination = user.id ? '/home' : '/';

  return (
    <Navbar className='header'>
      <Container fluid>
          <Navbar.Brand as={Link} to={destination} className='header-title'>
            <img src={logo} alt="Last Race" className='header-logo' />
          </Navbar.Brand>
        <div className='header-right'>{user.name ? <UserInfo name={user.name} /> : <LoginButton />}</div>
      </Container>
    </Navbar>
  );
}

function LoginButton() {
  const navigate = useNavigate();
  return <Button className='btn-gold' onClick={() => navigate('/login')}>Log In</Button>;
}

function UserInfo(props) {
  return <div>
    <div>{props.name}</div>
    <div><Link to='/logout' className='header-logout'>Logout</Link></div>
  </div>
}

export default Header;