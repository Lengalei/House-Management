import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import Dashboard from './components/Dashboard/Dashboard';
import NotFound from './components/underDeve/NotFound/NotFound.jsx';
import Tenant from './components/Tenants/Tenant.jsx';
import Listall from './components/Tenants/Listall.jsx';
import ListLandlord from './components/LandLord/ListLandlord.jsx';
import Landlord from './components/LandLord/Landlord.jsx';
import TenantProfile from './components/Tenants/TenantProfile.jsx';
import ChangePassword from './components/ChangePassword/ChangePassword.jsx';
import Admin from './components/Userprofile/Admin.jsx';
import { Layout, RequireAuth } from './Routes/layout/layout.jsx';
import Login from './components/Home/Login/Login.jsx';
import Register from './components/Home/register/Register.jsx';
import EmailSent from './components/Home/EmailSent/EmailSent.jsx';
import LandLordProfile from './components/LandLord/LandLordProfile.jsx';
import EditTenant from './components/Tenants/EditTenant.jsx';
import UpdateLandlord from './components/LandLord/UpdateLandlord.jsx';
import ResetPassword from './components/Home/ResetPassword/ResetPassword.jsx';
import Rent from './components/Rent Payment/Rent.jsx';
import RentDetails from './components/Rent Payment/RentDetails.jsx';
import TenantPaymentForm from './components/Rent Payment/Payment/TenantPaymentForm.jsx';
import TenantPaymentList from './components/Rent Payment/TenantPaymentList/TenantPaymentList.jsx';
import PaymentDetailsPage from './components/Rent Payment/PaymentDetails/PaymentDetailsPage.jsx';
import RegisterHouse from './components/houses/RegisterHouse.jsx';
import Payments from './components/Rent Payment/AllPayMents/Payments.jsx';
import TaxPayment from './components/Tax/TaxPayment.jsx';
import TaxPaymentHistory from './components/Tax/TaxPaymentHistory.jsx';
import GreyList from './components/Tenants/GreyList.jsx';
import Records from './components/Records/Records.jsx';
//v2
import RegisterTenant from './components/Tenants/v2/Tenants/RegisterTenant.jsx';
import TenantsWithIncompleteDeposits from './components/Tenants/v2/incompleteDeposits/TenantsWithIncompleteDeposits .jsx';
import TenantUpdateDeposits from './components/Tenants/v2/incompleteDeposits/TenantUpdateDeposits.jsx';
import TenantPaymentsV2 from './components/Tenants/v2/TenantPaymentsV2/TenantPaymentsV2.jsx';
import Clearance from './components/Clearance/Clearance.jsx';
import ApartmentRegistration from './components/houses/Apartments/ApartmentRegistration .jsx';
import ApartmentListPage from './components/houses/Apartments/ApartmentListPage.jsx';
import AdminPage from './components/Userprofile/AdminPage/AdminPage.jsx';
import AdminEditPage from './components/Userprofile/AdminPage/EditAdmin/AdminEditPage.jsx';
import InvoiceTable from './components/Userprofile/AdminPage/Invoices/InvoiceTable.jsx';
import NewDashboard from './components/Dashboard/New Dashborad/NewDashboard.jsx';
import { useEffect, useState } from 'react';
import { checkTokenValidity } from './utils/checkAuth.js';
import TokenExpiredPopup from './components/JwtExpirePopup/TokenExpiredPopup.jsx';

function App() {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      const isValid = await checkTokenValidity();
      if (!isValid) {
        setShowPopup(true);
      }
    };
    verifyToken();
  }, []);
  return (
    <Router>
      {showPopup && (
        <TokenExpiredPopup showPopup={showPopup} setShowPopup={setShowPopup} />
      )}
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/emailSent" element={<EmailSent />} />
          <Route path="/resetPasswordLinkClicked" element={<ResetPassword />} />
        </Route>
        <Route element={<RequireAuth />}>
          {/* <Route index element={<Dashboard />} /> */}
          <Route index element={<NewDashboard />} />
          <Route path="/registerTenant" element={<Tenant />} />
          <Route path="/registerLandlord" element={<Landlord />} />
          <Route path="/listAllTenants" element={<Listall />} />
          <Route path="/tenant/edit/:_id" element={<EditTenant />} />
          <Route path="/rentDetails/:_id" element={<RentDetails />} />
          <Route path="/landlord/edit/:_id" element={<UpdateLandlord />} />
          <Route path="/tenantProfile/:_id" element={<TenantProfile />} />
          <Route path="/landlordProfile/:_id" element={<LandLordProfile />} />
          <Route path="/changePassword" element={<ChangePassword />} />
          <Route path="/listAllLandlord" element={<ListLandlord />} />
          <Route path="/profileSettings" element={<Admin />} />
          <Route path="/admins" element={<AdminPage />} />
          <Route path="/editAdmin/:id" element={<AdminEditPage />} />
          <Route path="/addHouse" element={<RegisterHouse />} />
          <Route path="/addAppartment" element={<ApartmentRegistration />} />
          <Route path="/apartments" element={<ApartmentListPage />} />
          <Route path="/apartment/:apartmentId" element={<RegisterHouse />} />
          <Route path="/invoices" element={<InvoiceTable />} />
          {/* Tenant Payment */}
          <Route path="/rentpayment" element={<Rent />} />
          <Route
            path="/tenantPayment/:tenantId"
            element={<TenantPaymentForm />}
          />
          <Route path="/allPayments" element={<Payments />} />
          <Route
            path="/tenantPaymentList/:tenantId"
            element={<TenantPaymentList />}
          />
          <Route path="/records" element={<Records />} />
          <Route path="/paymentDetails" element={<PaymentDetailsPage />} />
          <Route path="/greyList" element={<GreyList />} />
          <Route path="/taxPayment" element={<TaxPayment />} />
          <Route path="/taxPaymentHistory" element={<TaxPaymentHistory />} />
          {/* ****************************************** */}
          {/* v2 */}
          <Route path="/v2/registerTenant" element={<RegisterTenant />} />{' '}
          <Route
            path="/v2/incompleteDeposits"
            element={<TenantsWithIncompleteDeposits />}
          />
          <Route
            path="/v2/tenantUpdateDeposit"
            element={<TenantUpdateDeposits />}
          />
          <Route
            path="/v2/tenantPaymentsV2/:tenantId"
            element={<TenantPaymentsV2 />}
          />
          <Route path="/clearTenant/:tenantId" element={<Clearance />} />
        </Route>
        <Route path="/*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
