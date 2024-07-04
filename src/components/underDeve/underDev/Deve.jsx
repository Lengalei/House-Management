import { Link } from 'react-router-dom';
import useLogout from '../logout/useLogout';
import './Deve.scss';

const UnderDev = () => {
  const { logout } = useLogout();

  return (
    <div className="not-found">
      <p>The page you are looking for is under Development.</p>
      <p>From Bidders Hub Development Team.</p>
      <div className="not-found-animation">
        <span>
          {/* <div className="not-found-circle"></div> */}
          <div className="not-found-circle"></div>
          {/* <div className="not-found-circle not-found-circle-secondary"></div> */}
        </span>
        <div className="not-found-circle"></div>
        <div className="not-found-circle not-found-circle-secondary"></div>
        <span>
          <div className="not-found-circle not-found-circle-secondary"></div>
          {/* <div className="not-found-circle not-found-circle-secondary"></div> */}
          {/* <div className="not-found-circle"></div> */}
        </span>
      </div>
      <a href="/" className="home-link">
        Go Home
      </a>
      <Link onClick={logout} className="home-link">
        Logout
      </Link>
    </div>
  );
};

export default UnderDev;
