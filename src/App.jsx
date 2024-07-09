import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login/Login';
import Dashboard from './components/Dashboard/Dashboard';
import Register from './components/register/Register';
import EmailSent from './components/EmailSent/EmailSent';
import NotFound from './components/underDeve/NotFound/NotFound.jsx';
import Tenant from './components/Tenants/Tenant.jsx';
import Listall from './components/Tenants/Listall.jsx';
import ListLandlord from './components/LandLord/ListLandlord.jsx';
import Landlord from './components/LandLord/Landlord.jsx';
import TenantProfile from './components/Tenants/TenantProfile.jsx';
import ChangePassword from './components/ChangePassword/ChangePassword.jsx';
import Admin from './components/Userprofile/Admin.jsx';

function App() {
  return (
    <Router>
      <div>
        <div className="app">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/emailSent" element={<EmailSent />} />
            <Route path="/registerTenant" element={<Tenant />} />
            <Route path="/registerLandlord" element={<Landlord />} />
            <Route path="/listAllTenants" element={<Listall />} />
            <Route path="/tenantProfile/:_id" element={<TenantProfile />} />
            <Route path="/changePassword" element={<ChangePassword />} />
            <Route path="/listAllLandlord" element={<ListLandlord />} />
            <Route path="/profileSettings" element={<Admin />} />
            <Route path="/*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
