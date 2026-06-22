import './custom.css'

import { useState, useEffect } from "react"
import { doLogin, doLogout } from "../api/auth"
import { useNavigate } from "react-router"
import { Form, Button, Container } from "react-bootstrap"

function LoginForm(props) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errormsg, setErrormsg] = useState('')

  const doSubmit = async (ev) => {
    ev.preventDefault() // to prevent page reload when submitting the form
    setErrormsg('')
    try {
      const user = await doLogin(username, password)
      props.doLogin(user)
    } catch (ex) {
      setErrormsg(ex.message)
      setTimeout(() => setErrormsg(''), 3000)
    }
  }

  return (
    <div className="login-box">
      <h2>Enter Middle earth</h2>
      <Form onSubmit={doSubmit}>
        <Form.Group controlId="formBasicEmail">
          <Form.Label className="login-label">Email address</Form.Label>
          <Form.Control className="login-input" type="email" placeholder="Enter email" value={username} onChange={(ev) => setUsername(ev.target.value)} />
        </Form.Group>
        <Form.Group controlId="formBasicPassword">
          <Form.Label className="login-label">Password</Form.Label>
          <Form.Control className="login-input" type="password" placeholder="Password" value={password} onChange={(ev) => setPassword(ev.target.value)} />
        </Form.Group>
        <Button type="submit" className="btn-gold-full">
          Log in
        </Button> 
        {errormsg && 
        <div className="login-error">{errormsg}</div>}
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
