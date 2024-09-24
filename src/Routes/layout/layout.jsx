import './layout.scss';
import { Navigate, Outlet } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Sidebar from '../../components/sidebar/Sidebar';
import { useSelector } from 'react-redux';

function Layout() {
  return (
    <div className="authlayout">
      <Navbar />
      {/* <Sidebar /> */}
      <div className="content">
        <Outlet />
      </div>
    </div>
  );
}
function RequireAuth() {
  const admin = useSelector((store) => store.adminData.adminDataValue);
  const adminData = JSON.parse(localStorage.getItem('adminData'));

  // console.log('adminDataStoredInLocalStorage: ', adminData);
  // console.log('adminValueInSlice: ', admin);

  if (adminData && adminData.username) {
    return (
      <div className="layout">
        <Navbar />
        <Sidebar />
        <div className="content">
          <Outlet />
        </div>
      </div>
    );
  } else {
    return <Navigate to="/login" />;
  }
}

export { Layout, RequireAuth };
