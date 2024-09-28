import { useState } from 'react';
import './AdminEditPage.scss';
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaPhone,
  FaMapMarkerAlt,
} from 'react-icons/fa'; // Font Awesome icons from react-icons
import { useLocation } from 'react-router-dom';

const AdminEditPage = () => {
  const location = useLocation();
  const admin = location.state || {};
  console.log('admin: ', admin);
  const [user, setUser] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    password: '',
    phone: '(123) 456-7890',
    address: '123 Main St, City, Country',
    isActive: true,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({ ...prevUser, [name]: value }));
  };

  const handleSwitchChange = () => {
    setUser((prevUser) => ({ ...prevUser, isActive: !prevUser.isActive }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Updated user:', user);
    // Here you would typically send the updated user data to your backend
  };

  return (
    <div className="Admin-page-container">
      <div className="card">
        <div className="card-header">
          <h2>Edit Admin </h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <FaUser />
            <input
              name="name"
              value={user.name}
              onChange={handleInputChange}
              placeholder="Full Name"
            />
          </div>
          <div className="form-group">
            <FaEnvelope />
            <input
              name="email"
              value={user.email}
              onChange={handleInputChange}
              placeholder="Email"
              type="email"
            />
          </div>
          <div className="form-group">
            <FaLock />
            <input
              name="password"
              value={user.password}
              onChange={handleInputChange}
              placeholder="New Password"
              type="password"
            />
          </div>
          <div className="form-group">
            <FaPhone />
            <input
              name="phone"
              value={user.phone}
              onChange={handleInputChange}
              placeholder="Phone Number"
            />
          </div>
          <div className="form-group">
            <FaMapMarkerAlt />
            <textarea
              name="address"
              value={user.address}
              onChange={handleInputChange}
              placeholder="Address"
            />
          </div>
          <div className="switch-container">
            <span>Active Status</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={user.isActive}
                onChange={handleSwitchChange}
              />
              <span className="slider round"></span>
            </label>
          </div>
          <button type="submit">Save Changes</button>
        </form>
      </div>
    </div>
  );
};

export default AdminEditPage;
