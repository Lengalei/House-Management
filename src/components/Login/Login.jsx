import React from 'react'
import "./Login.css";

function Login() {
  return (
    <div className='login'>
      <div className="login-container">
        <h1>Login</h1>
        <input type="text" placeholder='Username' name='username' />
        <input type="password" placeholder='Password' name='password' />

        <div className="reset">
          <p><input type="checkbox" id='checkbox'/> Remember Me</p>
          <p>Forgot Password</p>
        </div>

        <button className='btn'>Login</button>
      </div>
    </div>
  )
}

export default Login
