import { Link } from 'react-router-dom';
import './emailSent.css';

const EmailSent = () => {
  return (
    <div className="email-sent">
      <div className="emailContent">
        <h1>Check Your Email</h1>
        <p>We have sent an email to reset your password.</p>
        <h5>
          Email may take upto 10 mins to reach you as we verify your identify.
          you may need to resend the email by cliking the Forgot Password in the
          Login page
        </h5>
        <Link to="/login">Back to Login</Link>
      </div>
    </div>
  );
};

export default EmailSent;
