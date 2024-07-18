import { useState } from 'react';
import './Tenant.scss';
import { useNavigate } from 'react-router-dom';
import apiRequest from '../../lib/apiRequest';
import { toast, ToastContainer } from 'react-toastify';
import { ThreeDots } from 'react-loader-spinner';
import 'react-toastify/dist/ReactToastify.css';

function Tenant() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    nationalId: '',
    phoneNo: '',
    placementDate: '',
    houseDeposit: '',
    waterDeposit: '',
    houseNo: '',
    rentPayable: '',
    emergencyContactNumber: '',
    emergencyContactName: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiRequest.post('/tenants', formData);
      if (res.status === 201) {
        toast.success('Tenant registered successfully!');
        navigate('/listAllTenants');
      }
    } catch (err) {
      console.error('Error registering tenant:', err);
      setError(err.message);
      toast.error('Error registering tenant.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="tenant">
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
                <input
                  type="number"
                  id="phoneNo"
                  name="phoneNo"
                  value={formData.phoneNo}
                  onChange={handleChange}
                />
              </div>
              <div className="forminput">
                <label htmlFor="placementDate">
                  Placement Date<span>*</span>
                </label>
                <input
                  type="date"
                  name="placementDate"
                  id="placementDate"
                  value={formData.placementDate}
                  onChange={handleChange}
                />
              </div>
              <div className="forminput">
                <label htmlFor="houseDeposit">
                  House Deposit<span>*</span>
                </label>
                <input
                  type="number"
                  name="houseDeposit"
                  id="houseDeposit"
                  value={formData.houseDeposit}
                  onChange={handleChange}
                />
              </div>
              <div className="forminput">
                <label htmlFor="waterDeposit">
                  Water Deposit<span>*</span>
                </label>
                <input
                  type="number"
                  name="waterDeposit"
                  id="waterDeposit"
                  value={formData.waterDeposit}
                  onChange={handleChange}
                />
              </div>
              <div className="forminput">
                <label htmlFor="houseNo">
                  House No<span>*</span>
                </label>
                <input
                  type="text"
                  name="houseNo"
                  id="houseNo"
                  value={formData.houseNo}
                  onChange={handleChange}
                />
              </div>
              <div className="forminput">
                <label htmlFor="rentPayable">
                  Rent Payable<span>*</span>
                </label>
                <input
                  type="number"
                  name="rentPayable"
                  id="rentPayable"
                  value={formData.rentPayable}
                  onChange={handleChange}
                />
              </div>
              <div className="forminput">
                <label htmlFor="emergencyContactName">
                  Emergency Contact Name<span>*</span>
                </label>
                <input
                  type="text"
                  name="emergencyContactName"
                  id="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleChange}
                />
              </div>
              <div className="forminput">
                <label htmlFor="emergencyContactNumber">
                  Emergency Contact Number<span>*</span>
                </label>
                <input
                  type="number"
                  name="emergencyContactNumber"
                  id="emergencyContactNumber"
                  value={formData.emergencyContactNumber}
                  onChange={handleChange}
                />
              </div>
              <div>
                <button className="btn" disabled={loading}>
                  {loading ? (
                    <ThreeDots
                      height="20"
                      width="40"
                      radius="9"
                      color="#4fa94d"
                      ariaLabel="three-dots-loading"
                      wrapperStyle={{}}
                      wrapperClassName=""
                      visible={true}
                    />
                  ) : (
                    'Register'
                  )}
                </button>
              </div>
            </form>
            {error && <span>{error}</span>}
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default Tenant;
