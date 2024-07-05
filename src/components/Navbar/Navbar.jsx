import { useState } from 'react';
import './Navbar.css';
import { FaBell, FaEnvelope, FaCaretDown } from 'react-icons/fa';

const Navbar = ({ userName }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <div className="navbar">
      <div className="navbar-logo">
        <img src="/houselogo1.png" alt="" />
      </div>
      <div className="navbar-center">
        <FaBell size={20} />
        <FaEnvelope size={20} />
      </div>
      <div className="navbar-profile">
        <img src="/profile3.jfif" alt="Profile" className="profile-pic" />
        <span>Hi, John </span>
        <div className="dropdown">
          <button className="dropbtn" onClick={toggleDropdown}>
            <FaCaretDown />
          </button>
          {dropdownOpen && (
            <div className="dropdown-content">
              <a href="#">Edit Profile</a>
              <a href="#">Sign Out</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
