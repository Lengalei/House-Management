import { useState } from 'react';
import '../Tenants/Tenant.scss';
import { useNavigate } from 'react-router-dom';
import apiRequest from '../../lib/apiRequest';
import { toast, ToastContainer } from 'react-toastify';
import { ThreeDots } from 'react-loader-spinner';
import 'react-toastify/dist/ReactToastify.css';

function Landlord() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    nationalId: '',
    phoneNo: '',
    placementDate: '',
    assignedHouseNo: '',
    monthlyPay: '',
    emergencyContactNumber: '',
    emergencyContactName: '',
  });
  // console.log(formData);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiRequest.post('/landlords', formData);
      if (res.status === 201) {
        toast.success('landlord registered successfully!');
        navigate('/listAllLandlord');
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      console.error('Error registering landlord:', err);
      setError(err.message);
      toast.error('Error registering landlord.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="tenant">
        <div className="registration">
          <h3>Input Landlord{`'`}s details to register</h3>
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
                <label htmlFor="assignedHouseNo">
                  Assigned House No<span>*</span>
                </label>
                <input
                  type="text"
                  name="assignedHouseNo"
                  id="assignedHouseNo"
                  value={formData.assignedHouseNo}
                  onChange={handleChange}
                />
              </div>
              <div className="forminput">
                <label htmlFor="monthlyPay">
                  Monthly Pay<span>*</span>
                </label>
                <input
                  type="number"
                  name="monthlyPay"
                  id="monthlyPay"
                  value={formData.monthlyPay}
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

export default Landlord;
