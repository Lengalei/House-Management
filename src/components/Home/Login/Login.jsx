import './Login.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ForgotPassword from '../forgotPassword/ForgotPassword';
import apiRequest from '../../../lib/apiRequest';
import { useDispatch } from 'react-redux';
import { setAdmin } from '../../../features/Admin/adminSlice';
import { TailSpin } from 'react-loader-spinner';
import { toast, ToastContainer } from 'react-toastify';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false); // State to toggle between login and forgot password

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [adminBc, setAdminFromBc] = useState([]);

  useEffect(() => {
    const checkIfthereIsAnUserLoggedIn = async () => {
      try {
        const response = await apiRequest.get('/auth/getAdmins');
        if (response.status) {
          // console.log('admins found: ', response.data);
          setAdminFromBc(response.data);
        }
      } catch (error) {
        setError(error.response.data.message);
      }
    };
    checkIfthereIsAnUserLoggedIn();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await apiRequest.post('/auth/login', {
        username,
        password,
        rememberMe: e.target.checkbox.checked, // Pass rememberMe option
      });

      if (response.status) {
        // console.log('logged from login page', response.data);
        dispatch(setAdmin(response.data));
        localStorage.setItem('adminData', JSON.stringify(response.data));
        setLoading(false);
        toast.success('Success Login');
        navigate('/');
      }
    } catch (err) {
      setLoading(false);
      toast.error(error.response.data.message || 'Failed To login!');
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
              {adminBc.length > 0 && adminBc[0]?.username ? (
                <>
                  <h6>Admin Found.Register Endpoint Not Allowed!</h6>
                </>
              ) : (
                <h6>
                  Don{"'"}t have an Account?{' '}
                  <a className="forgot-password-link" href="/register">
                    Sign Up
                  </a>
                </h6>
              )}
            </span>
            {error && <span className="loginError">{error}!</span>}
            <button type="submit" className="LoginBtn">
              Login
            </button>
          </form>
        </div>
      )}

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

export default Login;
