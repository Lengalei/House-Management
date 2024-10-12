/* eslint-disable react/prop-types */
// src/components/Popup/TokenExpiredPopup.jsx
import './TokenExpiredPopup.scss';
import { useNavigate } from 'react-router-dom';

const TokenExpiredPopup = ({ showPopup, setShowPopup }) => {
  const navigate = useNavigate();

  const handleLoginRedirect = () => {
    setShowPopup(false);
    navigate('/login');
  };

  if (!showPopup) return null;

  return (
    <div className="jwtExpirePopupOverlay">
      <div className="popup-container">
        <h2>Session Expired</h2>
        <p>
          Your session has expired, or you are not logged in. Please log in
          again to continue.
        </p>
        <button onClick={handleLoginRedirect}>Login</button>
      </div>
    </div>
  );
};

export default TokenExpiredPopup;
