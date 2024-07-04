import './Register.css';
import { useState } from 'react';
import apiRequest from '../../lib/apiRequest';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await apiRequest.post('/auth/register', {
        email,
        username,
        password,
      });

      if (response.status === 200) {
        const { accessToken, user } = response.data;

        // Store token and username in localStorage
        localStorage.setItem('token', accessToken);
        localStorage.setItem('username', user.username);

        // Redirect to homepage or another page
        navigate('/');
      } else {
        setError('Failed to register.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register.');
    }
  };

  return (
    <div className="register">
      <div>
        <form className="register-container" onSubmit={handleRegister}>
          <h1>Register</h1>
          <input
            type="email"
            placeholder="Email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
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
          </div>
          <span>
            <h6>
              Already Have an Account? <a href="/login">Login</a>
            </h6>
          </span>
          {error && <span className="error">{error}</span>}
          <button type="submit" className="btn">
            Register
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;
