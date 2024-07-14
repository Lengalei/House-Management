import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiRequest from '../../lib/apiRequest';
import { toast, ToastContainer } from 'react-toastify';
import { ThreeDots } from 'react-loader-spinner';
import 'react-toastify/dist/ReactToastify.css';
import './Tenant.css';

function EditTenant() {
  const { _id } = useParams();
  const navigate = useNavigate();

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

  useEffect(() => {
    const fetchTenant = async () => {
      try {
        setLoading(true);
        const response = await apiRequest.get(
          `/tenants/getSingleTenant/${_id}`
        );
        const { data } = response;
        setFormData(data);
      } catch (error) {
        console.error('Error fetching tenant:', error);
        setError('Error fetching tenant data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTenant();
  }, [_id]);

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
      const res = await apiRequest.put(
        `/tenants/updateSingleTenant/${_id}`,
        formData
      );
      if (res.status === 200) {
        toast.success('Tenant details updated successfully!');
        console.log(res.data);
        navigate(`/tenantProfile/${_id}`);
      }
    } catch (err) {
      console.error('Error updating tenant:', err);
      setError('Error updating tenant. Please try again.');
      toast.error('Error updating tenant.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tenant">
      <div className="registration">
        <h3>Edit Tenant{`'`}s Details</h3>
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
                  'Update'
                )}
              </button>
            </div>
          </form>
          {error && <span>{error}</span>}
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default EditTenant;
