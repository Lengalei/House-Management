import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from "./components/Login/Login";
import Dashboard from './components/Dashboard/Dashboard';
import Register from './components/register/Register';
import EmailSent from './components/EmailSent/EmailSent';
import NotFound from './components/underDeve/NotFound/NotFound.jsx';
import Tenant from './components/Tenants/Tenant.jsx';
import Listall from './components/Tenants/Listall.jsx';

function App() {
  return (
    <Router>
      <div>
        <div className="app">
          <Routes>
            <Route path="/" element={<Dashboard/>} />
            <Route path="/login" element={<Login/>} />
            <Route path="/register" element={<Register/>} />
            <Route path="/emailSent" element={<EmailSent/>} />
            <Route path="/registertenant" element={<Tenant/>} />
            <Route path="/listall" element={<Listall/>} />
            <Route path="/*" element={<NotFound/>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
