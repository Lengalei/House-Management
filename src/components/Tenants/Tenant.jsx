import { useState } from 'react';
import './Tenant.css';
import Navbar from '../Navbar/Navbar';
import { useNavigate } from 'react-router-dom';
import apiRequest from '../../lib/apiRequest';
import Sidebar from '../sidebar/Sidebar';

function Tenant() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    nationalId: '',
    phoneNo: '',
    placementDate: '',
    houseDeposit: '',
    houseNo: '',
    rentPayable: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };
  const [error, serError] = useState('');
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    serError('');
    try {
      const res = await apiRequest.post('/tenants', formData);
      if (res.status) {
        console.log('Tenant registered:', res.data);
        navigate('/listAllTenants');
      }
    } catch (err) {
      console.error('Error registering tenant:', err);
      serError(err.message);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="tenant">
        <Sidebar />
        <div className="registration">
          <h3>Input Tenant{`'`}s details to register</h3>
          <div className="form">
            <form onSubmit={handleSubmit}>
              <div className="forminput">
                <label htmlFor="name">
                  Name <span>*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div className="forminput">
                <label htmlFor="email">
                  Email <span>*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="forminput">
                <label htmlFor="nationalId">
                  National ID<span>*</span>
                </label>
                <input
                  type="number"
                  id="nationalId"
                  name="nationalId"
                  value={formData.nationalId}
                  onChange={handleChange}
                />
              </div>
              <div className="forminput">
                <label htmlFor="phoneNo">
                  Phone No<span>*</span>
                </label>
                <input type="number" id="phoneNo" />
              </div>
              <div className="forminput">
                <label htmlFor="subject">
                  Placement Date<span>*</span>
                </label>
                <input type="text" id="subject" />
              </div>
              <div className="forminput">
                <label htmlFor="houseDeposit">
                  House Deposit<span>*</span>
                </label>
                <input type="text" id="subject" />
              </div>
              <div className="forminput">
                <label htmlFor="subject">
                  House No<span>*</span>
                </label>
                <input type="tex" id="subject" />
              </div>
              <div className="forminput">
                <label htmlFor="subject">
                  Rent Payable<span>*</span>
                </label>
                <input type="text" id="subject" />
              </div>
              <div>
                <button className="btn">Register</button>
              </div>
            </form>
            {error && <span>{error}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Tenant;
