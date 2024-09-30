import './Register.scss';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import apiRequest from '../../../lib/apiRequest';
import { toast, ToastContainer } from 'react-toastify';
import { TailSpin } from 'react-loader-spinner';

function Register() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await apiRequest.post('/auth/register', {
        email,
        username,
        password,
        role,
      });

      if (response.status === 200) {
        console.log(response.data);
        setLoading(false);
        toast.success('Success Registration');
        navigate('/login');
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to register!.');
      toast.error(error.response.data.message || 'Failed To register!');
    }
  };

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setRoleDropdownOpen(false); // Close dropdown after selection
  };

  return (
    <div className="register">
      <div>
        <form className="register-container" onSubmit={handleRegister}>
          <h1>Register Admin</h1>
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

          {/* Role selector */}
          <div className="role-selector">
            <div
              className="role-display"
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            >
              <span>{role || 'Select Role'}</span>
              {roleDropdownOpen ? <FaChevronUp /> : <FaChevronDown />}
            </div>
            {roleDropdownOpen && (
              <ul className="role-dropdown">
                <li onClick={() => handleRoleSelect('super_admin')}>
                  Super Admin
                </li>
                <li onClick={() => handleRoleSelect('admin')}>Admin</li>
                <li onClick={() => handleRoleSelect('moderator')}>Moderator</li>
              </ul>
            )}
          </div>

          <span>
            <h6>
              Already Have an Account? <Link to={'/login'}>Login</Link>
            </h6>
          </span>
          {error && <span className="registerError">{error}</span>}
          <button type="submit" className="registerBtn">
            Register
          </button>
        </form>
      </div>
      {loading && (
        <div className="loader-overlay">
          <TailSpin
            height="100"
            width="100"
            color="#4fa94d"
            ariaLabel="loading"
            visible={true}
          />
        </div>
      )}

      <ToastContainer />
    </div>
  );
}

export default Register;
