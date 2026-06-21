import { useContext } from "react";
import { Button, Container, Navbar } from "react-bootstrap";
import { Link, useNavigate } from 'react-router';

import UserContext from "../contexts/UserContext";

function Header() {
  const user = useContext(UserContext);

  // if the user is logged go to /home, if not to /
  const destination = user.id ? '/home' : '/';

  return (
    <Navbar style={{ backgroundColor: '#1a1a0e', borderBottom: '2px solid #c9a84c'}}>
      <Container fluid>
          <Navbar.Brand as={Link} to={destination} style={{ color: '#c9a84c', fontFamily: 'serif', fontSize: '1.5em', letterSpacing: '2px'}}>Last Race</Navbar.Brand>
        <div style={{ color: '#c9a84c', fontFamily: 'serif' }}>{user.name ? <UserInfo name={user.name} /> : <LoginButton />}</div>
      </Container>
    </Navbar>
  );
}

function LoginButton() {
  const navigate = useNavigate();
  return <Button onClick={() => navigate('/login')}>Log In</Button>;
}

function UserInfo(props) {
  return <div>
    <div>{props.name}</div>
    <div><Link to='/logout'>Logout</Link></div>
  </div>
}

export default Header;