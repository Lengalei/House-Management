import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaBell,
  FaEnvelope,
  FaUsers,
  FaUserTie,
  FaHouseUser,
  FaUserPlus,
  FaCog,
  FaCaretDown,
  FaBars,
  FaTimes,
} from 'react-icons/fa';
import './sidebar.css';

const Sidebar = () => {
  const [tenantDropdownOpen, setTenantDropdownOpen] = useState(false);
  const [landlordDropdownOpen, setLandlordDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleTenantDropdown = () => {
    setTenantDropdownOpen(!tenantDropdownOpen);
  };

  const toggleLandlordDropdown = () => {
    setLandlordDropdownOpen(!landlordDropdownOpen);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <>
      <button className="hamburger-menu" onClick={toggleSidebar}>
        <FaBars />
      </button>
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <button className="close-btn" onClick={toggleSidebar}>
          <FaTimes />
        </button>
        <div className="overview">
          <div className="h2">Overview</div>
          <hr className="h" />
          <Link to="/" className="dash">
            <FaTachometerAlt className="icon" /> Dashboard
          </Link>
          <Link to="/notifications" className="dash">
            <FaBell className="icon" /> Notifications
          </Link>
          <Link to="/messages" className="dash">
            <FaEnvelope className="icon" /> Messages
          </Link>
        </div>

        <div className="management">
          <h4 className="h2">Manage Property</h4>
          <hr className="h" />
          <div className="dropdown">
            <div className="dash" onClick={toggleTenantDropdown}>
              <FaUsers className="icon" /> Tenants{' '}
              <FaCaretDown className="caret" />
            </div>
            {tenantDropdownOpen && (
              <div className="dropdown-content">
                <Link to="/registerTenant" className="dash">
                  Register Tenant
                </Link>
                <Link to="/listAllTenants" className="dash">
                  List All
                </Link>
              </div>
            )}
          </div>
          <div className="dropdown">
            <div className="dash" onClick={toggleLandlordDropdown}>
              <FaUserTie className="icon" /> Landlords{' '}
              <FaCaretDown className="caret" />
            </div>
            {landlordDropdownOpen && (
              <div className="dropdown-content">
                <Link to="/registerLandlord" className="dash">
                  Register Landlord
                </Link>
                <Link to="/listAllLandlord" className="dash">
                  List All
                </Link>
              </div>
            )}
          </div>
          <Link to="/rentpayment" className="dash">
            <FaHouseUser className="icon" /> Rent Payment
          </Link>
          <Link to="/registerTenant" className="dash">
            <FaHouseUser className="icon" /> Assign House
          </Link>
          <Link to="/addHouse" className="dash">
            <FaUserPlus className="icon" /> Add House
          </Link>
        </div>

        <div className="management">
          <h4 className="h2">Your Details</h4>
          <hr className="h" />
          <Link to="profileSettings" className="dash">
            <FaCog className="icon" /> Profile Settings
          </Link>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
