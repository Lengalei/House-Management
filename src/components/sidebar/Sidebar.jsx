import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../Navbar/Navbar.css';
import {
  FaTachometerAlt,
  FaBell,
  FaEnvelope,
  FaUsers,
  FaUserTie,
  FaHouseUser,
  FaUserPlus,
  FaInfoCircle,
  FaKey,
  FaCog,
  FaCaretDown,
} from 'react-icons/fa';

const Sidebar = () => {
  const [tenantDropdownOpen, setTenantDropdownOpen] = useState(false);
  const [landlordDropdownOpen, setLandlordDropdownOpen] = useState(false);

  const toggleTenantDropdown = () => {
    setTenantDropdownOpen(!tenantDropdownOpen);
  };

  const toggleLandlordDropdown = () => {
    setLandlordDropdownOpen(!landlordDropdownOpen);
  };

  return (
    <div className="sidebar">
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
              <Link to="/register-landlord" className="dash">
                Register Landlord
              </Link>
              <Link to="/list-landlords" className="dash">
                List All
              </Link>
            </div>
          )}
        </div>
        <Link to="/assign-house" className="dash">
          <FaHouseUser className="icon" /> Assign House
        </Link>
        <Link to="/add-landlord" className="dash">
          <FaUserPlus className="icon" /> Add Landlord
        </Link>
      </div>

      <div className="management">
        <h4 className="h2">Your Details</h4>
        <hr className="h" />
        <Link to="/personal-info" className="dash">
          <FaInfoCircle className="icon" /> Personal Information
        </Link>
        <Link to="/change-password" className="dash">
          <FaKey className="icon" /> Change Password
        </Link>
        <Link to="/profile-settings" className="dash">
          <FaCog className="icon" /> Profile Settings
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
