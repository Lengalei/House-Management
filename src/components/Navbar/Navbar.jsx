import { useState } from 'react';
import './Navbar.css';
import { Link, useNavigate } from 'react-router-dom';
import { FaCaretDown } from 'react-icons/fa';
import apiRequest from '../../lib/apiRequest';
import { useDispatch } from 'react-redux';
import { resetAdmin } from '../../features/Admin/adminSlice';

const Navbar = () => {
  //const admin = useSelector((store) => store.adminData.adminDataValue);
  const admin = JSON.parse(localStorage.getItem('adminData'));
  // console.log('adminData: ', admin);

  // console.log('logged from Nav: ', admin);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const HandleLogout = async () => {
    const res = await apiRequest('/auth/logout');
    if (!res.status) {
      setError(res.data.error);
    } else {
      // console.log('Logouted Succesfully');
      localStorage.removeItem('adminData');
      dispatch(resetAdmin());
      navigate('/login');
    }
  };
  const handleProfileIconCLick = () => {
    navigate('/profileSettings');
  };
  return (
    <div className="navbar">
      <div className="navbar-logo">
        <img src="/homelogo.png" alt="" />
      </div>
      <div className="navbar-center">
        <img src="/welcomegif2.gif" alt="welcome" />
        {/* <h3>Welcome {admin?.username}</h3> */}
      </div>
      {admin ? (
        <div className="navbar-profile">
          <img
            src={admin?.profile ? admin.profile : '/profile3.jfif'}
            alt="Profile"
            className="profile-pic"
            onClick={handleProfileIconCLick}
          />
          <span className="iconName" onClick={handleProfileIconCLick}>
            Hi, {admin ? admin.username : 'John'}{' '}
          </span>
          <div className="dropdown">
            <button className="dropbtn" onClick={toggleDropdown}>
              <FaCaretDown className="drp" />
            </button>
            {dropdownOpen && (
              <div className="dropdown-content">
                <Link to="profileSettings" className="dash">
                  Profile
                </Link>
                <a onClick={HandleLogout}>Sign Out</a>
                {error && <span>{error}</span>}
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <Link to="/login" className="notLoggedInLink">
            Login
          </Link>
        </>
      )}
    </div>
  );
};

export default Navbar;
