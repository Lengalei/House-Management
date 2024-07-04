import './Login.css';
import { useState } from 'react';
import apiRequest from '../../lib/apiRequest';
import { useNavigate } from 'react-router-dom';
import ForgotPassword from '../forgotPassword/ForgotPassword';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false); // State to toggle between login and forgot password

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await apiRequest.post('/auth/login', {
        username,
        password,
        rememberMe: e.target.checkbox.checked, // Pass rememberMe option
      });

      if (response.status === 200) {
        const { accessToken, user } = response.data;

        // Store token and username in localStorage
        localStorage.setItem('token', accessToken);
        localStorage.setItem('username', user.username);

        // Redirect to homepage or another page
        navigate('/');
      } else {
        setError('Failed to login.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login.');
    }
  };

  return (
    <div className="login">
      {isForgotPassword ? (
        <ForgotPassword setIsForgotPassword={setIsForgotPassword} />
      ) : (
        <div>
          <form className="login-container" onSubmit={handleLogin}>
            <h1>Login</h1>
            <input
              type="text"
              placeholder="Username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="reset">
              <p>
                <input type="checkbox" id="checkbox" /> Remember Me
              </p>
              <span
                onClick={() => setIsForgotPassword(true)}
                className="forgot-password-link"
              >
                Forgot Password{' ?'}
              </span>
            </div>
            <span>
              <h6>
                Don{"'"}t have an Account?{' '}
                <a className="forgot-password-link" href="/register">
                  Sign Up
                </a>
              </h6>
            </span>
            {error && <span className="error">{error}</span>}
            <button type="submit" className="btn">
              Login
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Login;
