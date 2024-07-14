import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './resetPassword.css';
import apiRequest from '../../../lib/apiRequest';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match!');
      setIsLoading(false);
      return;
    }

    try {
      await apiRequest.post('/auth/resetPassword', {
        token,
        newPassword: password,
      });
      navigate('/login');
    } catch (err) {
      setError(err.response.data.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login">
      <div>
        <form className="formContainer" onSubmit={handleSubmit}>
          <h1>Reset Password</h1>
          <input
            type="password"
            placeholder="New Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button className="btn" disabled={isLoading}>
            Reset Password
          </button>
          {error && <span>{error}</span>}
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
