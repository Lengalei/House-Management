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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState('');
  const [houseOptions, setHouseOptions] = useState([]);
  const [selectedHouse, setSelectedHouse] = useState('');
  const [showCustomHouseInput, setShowCustomHouseInput] = useState(false);
  const [customHouseInput, setCustomHouseInput] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleFloorChange = (e) => {
    const { value } = e.target;
    setSelectedFloor(value);

    if (value === 'GroundFloor') {
      setHouseOptions(['A', 'B']);
      setShowCustomHouseInput(false);
      setShowPopup(true); // Show popup for house selection
    } else if (value.startsWith('Floor')) {
      const floorNumber = value.split('Floor')[1];
      setHouseOptions([
        `${floorNumber}A`,
        `${floorNumber}B`,
        `${floorNumber}C`,
        `${floorNumber}D`,
      ]);
      setShowCustomHouseInput(false);
      setShowPopup(true); // Show popup for house selection
    } else if (value === 'Others') {
      setHouseOptions([]);
      setShowCustomHouseInput(true); // Show custom house input
      setShowPopup(false); // Do not show the popup for custom input
    }
  };

  const handleHouseChoice = (e) => {
    const house = e.target.value.toUpperCase();
    const floorLabel = selectedFloor
      .replace('Floor', '')
      .replace('GroundFloor', 'Ground Floor');
    const houseNo = `${floorLabel}, House ${house}`;
    setSelectedHouse(houseNo);
    setFormData((prevFormData) => ({
      ...prevFormData,
      assignedHouseNo: houseNo,
    }));

    setShowPopup(false);
  };

  const handleCustomHouseChange = (e) => {
    setCustomHouseInput(e.target.value);
  };

  const handleCustomHouseSubmit = () => {
    const houseNo = `Custom House: ${customHouseInput}`;
    setSelectedHouse(houseNo);
    setFormData((prevFormData) => ({
      ...prevFormData,
      assignedHouseNo: houseNo,
    }));
    setShowCustomHouseInput(false); // Hide the custom input after submission
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiRequest.post('/landlords', formData);
      if (res.status) {
        toast.success('Landlord registered successfully!');
        navigate('/listAllLandlord');
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      console.error('Error registering landlord:', err);
      setError(err.response.data.message);
      toast.error('Error registering landlord.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="tenant">
        <div className="registration">
          <h3>Input Landlord&apos;s details to register</h3>
          <div className="form">
            <form onSubmit={handleSubmit}>
              {/* Name */}
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

              {/* Email */}
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

              {/* National ID */}
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

              {/* Phone Number */}
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

              {/* Placement Date */}
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

              {/* Floor Selection */}
              <div className="forminput">
                <label htmlFor="floor">
                  Floor<span>*</span>
                </label>
                <select
                  id="floor"
                  name="floor"
                  onChange={handleFloorChange}
                  value={selectedFloor}
                >
                  <option value="" disabled>
                    Select Floor
                  </option>
                  <option value="GroundFloor">Ground Floor</option>
                  <option value="Floor1">1st Floor</option>
                  <option value="Floor2">2nd Floor</option>
                  <option value="Floor3">3rd Floor</option>
                  <option value="Floor4">4th Floor</option>
                  <option value="Floor5">5th Floor</option>
                  <option value="Floor6">6th Floor</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              {/* Selected Floor and House Display */}
              {selectedFloor && selectedHouse && (
                <div className="selected-house">
                  <h4>
                    Selected Floor:{' '}
                    {selectedFloor === 'GroundFloor'
                      ? 'Ground Floor'
                      : selectedFloor === 'Others'
                      ? 'Custom Floor'
                      : selectedFloor.replace('Floor', 'Floor ')}
                    <br />
                    Selected House: {selectedHouse}
                  </h4>
                </div>
              )}

              {/* House Options Popup */}
              {showPopup && !showCustomHouseInput && (
                <div className="popup">
                  <div className="popup-content">
                    <h4>Select House</h4>
                    {houseOptions.map((option) => (
                      <button
                        key={option}
                        value={option}
                        onClick={handleHouseChoice}
                      >
                        {option}
                      </button>
                    ))}
                    <button
                      className="close-popup"
                      onClick={() => setShowPopup(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}

              {/* Custom House Input and Submit */}
              {showCustomHouseInput && (
                <div className="forminput">
                  <label htmlFor="customHouse">
                    Custom House<span>*</span>
                  </label>
                  <input
                    type="text"
                    id="customHouse"
                    name="customHouse"
                    value={customHouseInput}
                    onChange={handleCustomHouseChange}
                    placeholder="Enter custom house number"
                  />
                  <button type="button" onClick={handleCustomHouseSubmit}>
                    Submit Custom House
                  </button>
                </div>
              )}

              {/* Assigned House No */}
              <div className="forminput">
                <label htmlFor="assignedHouseNo">
                  Assigned House No<span>*</span>
                </label>
                <p id="assignedHouseNo">{formData.assignedHouseNo}</p>
              </div>

              {/* Monthly Pay */}
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

              {/* Emergency Contact Number */}
              <div className="forminput">
                <label htmlFor="emergencyContactNumber">
                  Emergency Contact Number
                </label>
                <input
                  type="number"
                  id="emergencyContactNumber"
                  name="emergencyContactNumber"
                  value={formData.emergencyContactNumber}
                  onChange={handleChange}
                />
              </div>

              {/* Emergency Contact Name */}
              <div className="forminput">
                <label htmlFor="emergencyContactName">
                  Emergency Contact Name
                </label>
                <input
                  type="text"
                  id="emergencyContactName"
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleChange}
                />
              </div>

              {/* Submit Button */}
              <div className="forminput">
                <button type="submit" disabled={loading}>
                  {loading ? (
                    <ThreeDots
                      height="10"
                      width="100"
                      radius="9"
                      color="white"
                      ariaLabel="three-dots-loading"
                      visible={true}
                    />
                  ) : (
                    'Register'
                  )}
                </button>
              </div>

              {/* Error Handling */}
              {error && <div className="error">{error}</div>}
            </form>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default Landlord;
