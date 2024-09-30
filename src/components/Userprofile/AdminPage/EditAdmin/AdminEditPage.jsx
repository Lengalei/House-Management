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
import axios from 'axios';

const AdminEditPage = () => {
const [name, setName] = useState('')
const [password, setPassword] = useState('')
const [email, setEmail] = useState('')
const [phone, setPhone] = useState('')




  const location = useLocation();
  const admin = location.state || {};
  console.log('admin: ', admin);
  const [user, setUser] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    password: '',
    phone: '(123) 456-7890',
    isActive: true,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({ ...prevUser, [name]: value }));
  };

  const handleSwitchChange = () => {
    setUser((prevUser) => ({ ...prevUser, isActive: !prevUser.isActive }));
  };

  const handleSubmit = async(e) => {
    e.preventDefault();

    const response = await axios.put(
      "http://localhost:5500/api/user", {
        name, password, email,phone
      }
    );

    if(response == 200){
      setName('')
      setEmail('')
      setPassword('')
      setPhone('')
    }
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
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
              placeholder="Full Name"
            />
          </div>
          <div className="form-group">
            <FaEnvelope />
            <input
              name="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              placeholder="Email"
              type="email"
            />
          </div>
          <div className="form-group">
            <FaLock />
            <input
              name="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              placeholder="New Password"
              type="password"
            />
          </div>
          <div className="form-group">
            <FaPhone />
            <input
              name="phone"
              value={phone}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              placeholder="Phone Number"
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
          <button>Save Changes</button>
        </form>
      </div>
    </div>
  );
};

export default AdminEditPage;
