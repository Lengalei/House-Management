import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaClipboardList } from 'react-icons/fa';
import { VscRecordSmall } from 'react-icons/vsc';
import { TbSquarePercentage } from 'react-icons/tb';
import { IoReceiptOutline } from 'react-icons/io5';
import { FaUserLock } from "react-icons/fa6";
import { GiReceiveMoney } from 'react-icons/gi';
import { MdOutlineFormatClear } from 'react-icons/md';
import {
  FaTachometerAlt,
  FaUsers,
  FaUserTie,
  FaHouseUser,
  FaCog,
  FaCaretDown,
  FaBars,
  FaTimes,
} from 'react-icons/fa';
import './sidebar.css';

const Sidebar = () => {
  const [tenantDropdownOpen, setTenantDropdownOpen] = useState(false);
  const [landlordDropdownOpen, setLandlordDropdownOpen] = useState(false);
  const [addAppartmentOpen, setAddAppartmentOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleTenantDropdown = () => {
    setTenantDropdownOpen(!tenantDropdownOpen);
  };

  const toggleLandlordDropdown = () => {
    setLandlordDropdownOpen(!landlordDropdownOpen);
  };

  const toggleAddAppartmentOpen = () => {
    setAddAppartmentOpen(!addAppartmentOpen);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <>
      <button className="hamburger-menu" onClick={toggleSidebar}>
        <FaBars />
      </button>
      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <button className="close-btn" onClick={toggleSidebar}>
          <FaTimes />
        </button>
        <div className="overview">
          <div className="h2">Overview</div>
          <hr className="h" />
          <Link to="/" className="dash">
            <FaTachometerAlt className="icon" /> Dashboard
          </Link>
          <Link to="/listAllTenants" className="dash">
            <FaUsers className="icon" /> All Tenants
          </Link>
          <Link to="/v2/incompleteDeposits" className="dash">
            <FaClipboardList className="icon" />
            Grey List
          </Link>
          <Link to="/records" className="dash">
            <VscRecordSmall className="icon" />
            Records
          </Link>

          <div className="dropdown">
            <div className="dash" onClick={toggleAddAppartmentOpen}>
              <FaUsers className="icon" /> Appartments
              <FaCaretDown className="caret" />
            </div>
            {addAppartmentOpen && (
              <div className="dropdown-content">
                <Link to="/addAppartment" className="dash">
                  Add Appartment
                </Link>
                <Link to="/apartments" className="dash">
                  All Apartments
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="management">
          <h4 className="h2">Manage Property</h4>
          <hr className="h" />
          <div className="dropdown">
            <div className="dash" onClick={toggleTenantDropdown}>
              <FaUsers className="icon" /> Tenants{" "}
              <FaCaretDown className="caret" />
            </div>
            {tenantDropdownOpen && (
              <div className="dropdown-content">
                <Link to="/v2/registerTenant" className="dash">
                  Register Tenant
                </Link>
                <Link to="/v2/incompleteDeposits" className="dash">
                  Incomplete Deposits
                </Link>
              </div>
            )}
          </div>
          <div className="dropdown">
            <div className="dash" onClick={toggleLandlordDropdown}>
              <FaUserTie className="icon" /> CareTaker{" "}
              <FaCaretDown className="caret" />
            </div>
            {landlordDropdownOpen && (
              <div className="dropdown-content">
                <Link to="/registerLandlord" className="dash">
                  Register CareTaker
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
          <Link to="/allPayments" className="dash">
            <GiReceiveMoney className="icon" /> All Payments
          </Link>
          {/* <Link to="/clearTenant" className="dash">
            <MdOutlineFormatClear className="icon" /> Clearance
          </Link> */}
        </div>
        <div className="management">
          <h4 className="h2">TAX</h4>
          <hr className="h" />
          <Link to="taxPayment" className="dash">
            <TbSquarePercentage className="icon" /> KRA
          </Link>
          <Link to="taxPaymentHistory" className="dash">
            <IoReceiptOutline className="icon" /> KRA History
          </Link>
        </div>

        <div className="management">
          <h4 className="h2">Your Details</h4>
          <hr className="h" />
          <Link to="profileSettings" className="dash">
            <FaCog className="icon" /> Profile Settings
          </Link>
          <Link to="/admins" className="dash">
            <FaUserLock className="icon" />
            Admins
          </Link>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
