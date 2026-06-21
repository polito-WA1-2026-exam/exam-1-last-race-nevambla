import { useState, useEffect } from "react"
import { doLogin, doLogout } from "../api/auth"
import { useNavigate } from "react-router"
import { Form, Button, Container } from "react-bootstrap"

function LoginForm(props) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errormsg, setErrormsg] = useState('')

  const doSubmit = async (ev) => {
    ev.preventDefault()
    setErrormsg('')
    try {
      const user = await doLogin(username, password)
      props.doLogin(user)
    } catch (ex) {
      setErrormsg(ex.message)
      setTimeout(() => setErrormsg(''), 3000)
    }
  }

  const formStyle = {
    maxWidth: '400px',
    margin: '40px auto',
    padding: '30px',
    backgroundColor: '#1a1a0e',
    border: '2px solid #c9a84c',
    borderRadius: '8px',
    fontFamily: 'serif'
  }

  const labelStyle = { color: '#c9a84c', letterSpacing: '1px' }

  const inputStyle = {
    backgroundColor: '#2a2a1e',
    border: '1px solid #c9a84c',
    color: '#e8d5a3'
  }

  return (
    <div style={formStyle}>
      <h2 style={{ color: '#c9a84c', textAlign: 'center', letterSpacing: '2px', marginBottom: '20px' }}>Enter Middle earth</h2>
      <Form onSubmit={doSubmit}>
        <Form.Group controlId="formBasicEmail">
          <Form.Label style={labelStyle}>Email address</Form.Label>
          <Form.Control style={inputStyle} type="email" placeholder="Enter email" value={username} onChange={(ev) => setUsername(ev.target.value)} />
        </Form.Group>
        <Form.Group controlId="formBasicPassword">
          <Form.Label style={labelStyle}>Password</Form.Label>
          <Form.Control style={inputStyle} type="password" placeholder="Password" value={password} onChange={(ev) => setPassword(ev.target.value)} />
        </Form.Group>
        <Button type="submit" style={{ backgroundColor: '#c9a84c', border: 'none', color: '#1a1a0e', fontFamily: 'serif', letterSpacing: '1px', width: '100%', marginTop: '15px' }}>
          Log in
        </Button> {errormsg && <div style={{ color: '#ff6b6b', textAlign: 'center', marginTop: '10px' }}>{errormsg}</div>}
      </Form>
    </div>
  );
}

function Logout(props) {
  const navigate = useNavigate()

  useEffect(() => {
    doLogout().then(() => {
      props.handleLogout()
      navigate('/')
    })
  }, [])

  return "Logging out..."
}

export { LoginForm, Logout }
