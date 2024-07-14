import './Register.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiRequest from '../../../lib/apiRequest';

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
        console.log(response.data);
        navigate('/login');
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

          <span>
            <h6>
              Already Have an Account? <a href="/login">Login</a>
            </h6>
          </span>
          {error && <span className="registerError">{error}</span>}
          <button type="submit" className="registerBtn">
            Register
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;
