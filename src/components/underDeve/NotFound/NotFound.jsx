import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFoundPage = () => {
  return (
    <div className="notfound-container">
      <div className="notfound-content">
        <h1 className="notfound-title">404</h1>
        <p className="notfound-message">
          Oops! The page you are looking for does not exist.
        </p>
        <Link to="/" className="notfound-button">
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
