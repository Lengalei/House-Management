import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Dashboard from "./components/Dashboard/Dashboard";
import NotFound from "./components/underDeve/NotFound/NotFound.jsx";
import Tenant from "./components/Tenants/Tenant.jsx";
import Listall from "./components/Tenants/Listall.jsx";
import ListLandlord from "./components/LandLord/ListLandlord.jsx";
import Landlord from "./components/LandLord/Landlord.jsx";
import TenantProfile from "./components/Tenants/TenantProfile.jsx";
import ChangePassword from "./components/ChangePassword/ChangePassword.jsx";
import Admin from "./components/Userprofile/Admin.jsx";
import { Layout, RequireAuth } from "./Routes/layout/layout.jsx";
import Login from "./components/Home/Login/Login.jsx";
import Register from "./components/Home/register/Register.jsx";
import EmailSent from "./components/Home/EmailSent/EmailSent.jsx";
import LandLordProfile from "./components/LandLord/LandLordProfile.jsx";
import EditTenant from "./components/Tenants/EditTenant.jsx";
import UpdateLandlord from "./components/LandLord/UpdateLandlord.jsx";
import ResetPassword from "./components/Home/ResetPassword/ResetPassword.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/emailSent" element={<EmailSent />} />
          <Route path="/resetPasswordLinkClicked" element={<ResetPassword />} />
        </Route>
        <Route element={<RequireAuth />}>
          <Route index element={<Dashboard />} />
          <Route path="/registerTenant" element={<Tenant />} />
          <Route path="/registerLandlord" element={<Landlord />} />
          <Route path="/listAllTenants" element={<Listall />} />
          <Route path="/tenant/edit/:_id" element={<EditTenant />} />
          <Route path="/landlord/edit/:_id" element={<UpdateLandlord />} />
          <Route path="/tenantProfile/:_id" element={<TenantProfile />} />
          <Route path="/landlordProfile/:_id" element={<LandLordProfile />} />
          <Route path="/changePassword" element={<ChangePassword />} />
          <Route path="/listAllLandlord" element={<ListLandlord />} />
          <Route path="/profileSettings" element={<Admin />} />
        </Route>
        <Route path="/*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
