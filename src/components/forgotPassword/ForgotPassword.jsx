import { useState } from 'react';
import './forgotPassword.css';
import apiRequest from '../../lib/apiRequest';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = ({ setIsForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await apiRequest.post('/auth/forgotPassword', { email });
      navigate('/emailSent');
    } catch (err) {
      setError(err.response.data.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <form className="forgot-container" onSubmit={handleSubmit}>
        <h1>Reset Password</h1>
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="btn" disabled={isLoading}>
          Send Email
        </button>
        {error && <span className="error">{error}</span>}
        <button
          type="button"
          onClick={() => setIsForgotPassword(false)}
          className="btn"
        >
          Back to Login
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
