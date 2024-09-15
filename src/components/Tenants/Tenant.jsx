import { useState, useEffect } from 'react';
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
    rentPayable: '',
    houseNo: '',
    emergencyContactNumber: '',
    emergencyContactName: '',
    //from popup
    amountPaid: '',
    paymentDate: '',
    monthInQuestionPay: '',
    referenceNumber: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState('');
  const [houseOptions, setHouseOptions] = useState([]);
  const [selectedHouse, setSelectedHouse] = useState('');
  const [registeredHouses, setRegisteredHouses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHouses = async () => {
      try {
        const res = await apiRequest.get('/houses/getAllHouses');
        setRegisteredHouses(res.data);
      } catch (err) {
        console.error('Error fetching houses:', err);
      }
    };

    fetchHouses();
  }, []);

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
    setShowPopup(true);

    const floorNumber =
      value === 'GroundFloor' ? 0 : parseInt(value.replace('Floor', ''), 10);

    const housesOnFloor = registeredHouses
      .filter((house) => house.floor === floorNumber)
      .map((house) => ({
        houseName: house.houseName.split(' ')[1], // Extract the '3C' part
        isOccupied: house.isOccupied,
      }))
      .sort((a, b) => a.houseName.localeCompare(b.houseName));

    setHouseOptions(housesOnFloor);
  };

  const handleHouseChoice = (e) => {
    const house = e.target.value.toUpperCase();
    const floorLabel =
      selectedFloor === 'GroundFloor'
        ? 'Ground Floor'
        : `Floor ${selectedFloor.replace('Floor', '')}`;
    const houseNo = `${floorLabel}, House ${house}`;
    setSelectedHouse(houseNo);

    setFormData((prevFormData) => ({
      ...prevFormData,
      houseNo,
    }));

    const houseType = house.slice(-1);
    let houseDeposit = 0;
    let waterDeposit = 2500;
    let rentPayable = 0;

    if (['A', 'B', 'C'].includes(houseType)) {
      houseDeposit = 17000;
      rentPayable = 17000;
    } else if (houseType === 'D') {
      houseDeposit = 15000;
      rentPayable = 15000;
    }

    setFormData((prevFormData) => ({
      ...prevFormData,
      houseDeposit,
      waterDeposit,
      rentPayable,
    }));

    setShowPopup(false);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setShowPaymentPopup(false); // Also close payment popup if open
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setShowPaymentPopup(true); // Show payment popup on form submission
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiRequest.post('/tenants', formData);
      if (res.status === 201) {
        toast.success('Tenant registered successfully!');
        if (res.data.newTenant.isInGreyList) {
          navigate('/greyList');
        } else {
          navigate('/listAllTenants');
        }
      }
    } catch (err) {
      console.error('Error registering tenant:', err);
      setError(err.response.data.message);
      toast.error('Error registering tenant.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate the expected amount
  const totalAmount = (
    Number(formData.houseDeposit) +
    Number(formData.rentPayable) +
    Number(formData.waterDeposit)
  ).toLocaleString();

  return (
    <div>
      <div className="tenant">
        <div className="registration">
          <h3>Input Tenant{`'`}s details to register</h3>
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
                  Placement Date
                  <span>*</span>
                  <br />
                  <span>
                    {
                      '(The date the Tenant entered or will enter the house officially)'
                    }
                  </span>
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
                </select>
              </div>

              {/* Selected Floor and House Display */}
              {selectedFloor && selectedHouse && (
                <div className="selected-house">
                  <h4>
                    Selected Floor:{' '}
                    {selectedFloor === 'GroundFloor'
                      ? 'Ground Floor'
                      : `Floor ${selectedFloor.replace('Floor', '')}`}
                    <br />
                    Selected House: {selectedHouse}
                  </h4>
                </div>
              )}

              {/* House Options Popup */}
              {showPopup && (
                <div className="popup">
                  <div className="popup-content">
                    <div className="innerPopupDiv">
                      <h4 className="close-popup" onClick={handleClosePopup}>
                        Close
                      </h4>
                      <h4>Select House</h4>
                    </div>

                    {houseOptions.map((option) => (
                      <button
                        key={option.houseName}
                        value={option.houseName}
                        onClick={handleHouseChoice}
                        disabled={option.isOccupied}
                        className={
                          option.isOccupied ? 'occupied' : 'notOccupied'
                        }
                      >
                        {option.houseName}
                        {option.isOccupied && ' 🚫'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* House Deposit */}
              <div className="forminput">
                <label htmlFor="houseDeposit">
                  House Deposit <span>*</span>
                </label>
                <p id="houseDeposit">
                  {formData.houseDeposit.toLocaleString()}
                </p>
              </div>

              {/* Water Deposit */}
              <div className="forminput">
                <label htmlFor="waterDeposit">
                  Water Deposit <span>*</span>
                </label>
                <p id="waterDeposit">
                  {formData.waterDeposit.toLocaleString()}
                </p>
              </div>

              {/* Rent Payable */}
              <div className="forminput">
                <label htmlFor="rentPayable">
                  Rent Payable <span>*</span>
                </label>
                <p id="rentPayable">{formData.rentPayable.toLocaleString()}</p>
              </div>

              {/* Emergency Contact Number */}
              <div className="forminput">
                <label htmlFor="emergencyContactNumber">
                  Emergency Contact Number
                </label>
                <input
                  type="text"
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
              {error && <span>{error}</span>}
              <button type="submit" disabled={loading}>
                {loading ? (
                  <ThreeDots
                    height="20"
                    width="30"
                    radius="9"
                    color="white"
                    ariaLabel="three-dots-loading"
                    wrapperStyle={{}}
                    visible={true}
                  />
                ) : (
                  'Continue'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Payment Popup */}
      {showPaymentPopup && (
        <div className="paymentPopup">
          <div className="paymentPopup-content">
            <div className="paymentInnerPopupDiv">
              <h4 className="paymentClose-popup" onClick={handleClosePopup}>
                Close
              </h4>
              <h4>Payment Details</h4>
            </div>
            <form onSubmit={handlePaymentSubmit} className="paymentForm">
              <div className="forminput">
                <label htmlFor="paymentDate">Transaction Payment Date</label>
                <input
                  type="date"
                  id="paymentDate"
                  name="paymentDate"
                  value={formData.paymentDate}
                  onChange={handleChange}
                />
              </div>
              <div className="forminput">
                <label htmlFor="monthInQuestionPay">
                  Month Pay Attributed To {'( Month Name In Full)'}
                </label>
                <input
                  type="text"
                  id="monthInQuestionPay"
                  name="monthInQuestionPay"
                  value={formData.monthInQuestionPay}
                  onChange={handleChange}
                />
              </div>
              <h4 className="expectedPay">
                Expected pay value: <span>{totalAmount}</span>{' '}
              </h4>
              <div className="forminput">
                <label htmlFor="amountPaid">Amount Paid</label>
                <input
                  type="number"
                  id="amountPaid"
                  name="amountPaid"
                  value={formData.amountPaid}
                  onChange={handleChange}
                />
              </div>

              <div className="forminput">
                <label htmlFor="referenceNumber">Reference Number</label>
                <input
                  type="text"
                  id="referenceNumber"
                  name="referenceNumber"
                  value={formData.referenceNumber}
                  onChange={handleChange}
                />
              </div>

              <button type="submit">Finish (Register)</button>
            </form>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
}

export default Tenant;
