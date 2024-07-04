import { Link } from 'react-router-dom';
import './emailSent.css';

const EmailSent = () => {
  return (
    <div className="email-sent">
      <div className="content">
        <h1>Check Your Email</h1>
        <p>We have sent an email to reset your password.</p>
        <Link to="/login">Back to Login</Link>
      </div>
    </div>
  );
};

export default EmailSent;
