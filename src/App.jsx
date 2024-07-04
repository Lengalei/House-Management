import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login/Login';
import Register from './components/register/Register';
import Home from './components/Home/Home';
import EmailSent from './components/EmailSent/EmailSent';
import ResetPassword from './components/ResetPassword/ResetPassword';
import NotFoundPage from './components/underDeve/NotFound/NotFound';

function App() {
  return (
    <Router>
      <div>
        <div className="app">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/emailSent" element={<EmailSent />} />
            <Route path="/resetPassword" element={<ResetPassword />} />
            <Route path="/*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
