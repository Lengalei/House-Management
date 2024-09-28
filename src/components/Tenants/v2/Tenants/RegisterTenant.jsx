/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import './RegisterTenant.scss';
import { useNavigate } from 'react-router-dom';
import apiRequest from '../../../../lib/apiRequest';
import { TailSpin } from 'react-loader-spinner';
import { toast, ToastContainer } from 'react-toastify';

const RegisterTenant = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    nationalId: '',
    phoneNo: '',
    placementDate: '',
    houseNo: '',
    emergencyContactNumber: '',
    emergencyContactName: '',
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const [selectedFloor, setSelectedFloor] = useState(null);
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [isHousePopupVisible, setIsHousePopupVisible] = useState(false);
  const [isDepositPopupVisible, setIsDepositPopupVisible] = useState(false);
  const [tenantData, setTenantData] = useState(null);

  // Separate form data for single and multiple deposits
  const [singleDepositData, setSingleDepositData] = useState({
    totalAmount: '',
    referenceNo: '',
    depositDate: '',
  });

  const [multipleDepositData, setMultipleDepositData] = useState({
    rentDeposit: '',
    waterDeposit: '',
    initialRentPayment: '',
    referenceNo: '',
    depositDate: '',
  });

  const [showSingleDeposit, setShowSingleDeposit] = useState(true); // Default to single deposit
  const [houses, setHouses] = useState([]);
  const [floorHouses, setFloorHouses] = useState({});

  const floors = [
    { floorNumber: 0, name: 'Ground Floor' },
    { floorNumber: 1, name: 'First Floor' },
    { floorNumber: 2, name: 'Second Floor' },
    { floorNumber: 3, name: 'Third Floor' },
    { floorNumber: 4, name: 'Fourth Floor' },
    { floorNumber: 5, name: 'Fifth Floor' },
    { floorNumber: 6, name: 'Sixth Floor' },
    { floorNumber: 7, name: 'Seventh Floor' },
  ];

  useEffect(() => {
    const fetchHouses = async () => {
      setLoading(true);
      try {
        const response = await apiRequest.get('/houses/getAllHouses');
        const houseData = response.data;
        setHouses(houseData);

        // Organize houses by floor
        const organizedHouses = houseData.reduce((acc, house) => {
          const floor = house.floor;
          if (!acc[floor]) acc[floor] = [];
          acc[floor].push(house);
          return acc;
        }, {});

        // toast.success('Houses Fetched Successfully');
        setFloorHouses(organizedHouses);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching houses:', error);
        toast.error(error.response.data.message || 'Error Fetching Houses');
        setLoading(false);
      }
    };

    fetchHouses();
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Separate handlers for single and multiple deposit data
  const handleSingleDepositChange = (e) => {
    setSingleDepositData({
      ...singleDepositData,
      [e.target.name]: e.target.value,
    });
  };

  const handleMultipleDepositChange = (e) => {
    setMultipleDepositData({
      ...multipleDepositData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFloorSelection = (floor) => {
    setSelectedFloor(floor);
  };

  const handleHouseSelection = (house) => {
    if (!house.isOccupied) {
      const houseLetter = house.houseName.slice(-1);
      const houseNumber = `${selectedFloor}${houseLetter}`;
      setSelectedHouse(houseNumber);
      setFormData({ ...formData, houseNo: houseNumber });
      setIsHousePopupVisible(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await apiRequest.post(
        '/v2/tenants/createTenant',
        formData
      );
      if (response.status) {
        setTenantData(response.data);
        setIsDepositPopupVisible(true);
        setLoading(false);
        toast.success('Success Tenant Creation');
      }
    } catch (error) {
      // console.error('Error registering tenant:', error);
      setError(error.response.data.message);
      setLoading(false);
      toast.error(error.response.data.message || 'Error Creating Tenant');
    } finally {
      setError('');
    }
  };

  const handleDeposit = async (url, depositData, e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await apiRequest.post(url, {
        ...depositData,
        tenantId: tenantData._id,
      });
      if (response.status) {
        const isCleared = response.data.tenant.deposits.isCleared;
        navigate(isCleared ? '/listAllTenants' : '/v2/incompleteDeposits');
        setLoading(false);
        toast.success('Success Deposits Addition');
      }
    } catch (error) {
      setError(error.response.data.message);
      toast.error(error.response.data.message || 'Error Adding Deposits');
      console.error('Error processing deposit:', error);
      setLoading(false);
    } finally {
      setError('');
    }
  };

  return (
    <div className="register-tenant">
      {!tenantData && (
        <div className="registration-card">
          <h2>Tenant Registration</h2> <hr className="h" />
          <form onSubmit={handleSubmit}>
            <label htmlFor="name">Name</label>
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            <label htmlFor="nationalId">National Id</label>
            <input
              type="text"
              name="nationalId"
              placeholder="National ID"
              value={formData.nationalId}
              onChange={handleInputChange}
              required
            />
            <label htmlFor="phoneNo">Phone No.</label>
            <input
              type="text"
              name="phoneNo"
              placeholder="Phone No."
              value={formData.phoneNo}
              onChange={handleInputChange}
              required
            />
            <label htmlFor="placementDate">Placement Date</label>
            <input
              type="date"
              name="placementDate"
              value={formData.placementDate}
              onChange={handleInputChange}
              required
            />
            <label htmlFor="emergencyContactName">Emergency Contact Name</label>
            <input
              type="text"
              id="emergencyContactName"
              name="emergencyContactName"
              value={formData.emergencyContactName}
              onChange={handleInputChange}
            />
            <label htmlFor="emergencyContactNumber">Emergency Contact No</label>
            <input
              type="number"
              id="emergencyContactNumber"
              name="emergencyContactNumber"
              value={formData.emergencyContactNumber}
              onChange={handleInputChange}
            />
            <div
              className="house-selection"
              onClick={() => setIsHousePopupVisible(true)}
            >
              {selectedHouse ? selectedHouse : 'Select House'}
            </div>
            {error && <span>{error}</span>}
            <button type="submit">Register Tenant</button>
          </form>
        </div>
      )}

      {isHousePopupVisible && (
        <div className="floor-popup">
          <button
            className="closePopup"
            onClick={() => setIsHousePopupVisible(false)}
          >
            ×
          </button>
          <h3>Select a Floor</h3>
          {floors.map((floorObj) => (
            <div
              key={floorObj.floorNumber}
              className={`floor-option ${
                selectedFloor === floorObj.floorNumber ? 'selected' : ''
              }`}
              onClick={() => handleFloorSelection(floorObj.floorNumber)}
            >
              {floorObj.name}
              {selectedFloor === floorObj.floorNumber && (
                <div className="house-popup">
                  {floorHouses[floorObj.floorNumber]?.map((house) => (
                    <div
                      key={house._id}
                      className={`house-option ${
                        house.isOccupied ? 'occupied' : ''
                      }`}
                      onClick={() =>
                        !house.isOccupied && handleHouseSelection(house)
                      }
                    >
                      {house.isOccupied ? '🚫' : house.houseName.slice(-1)}{' '}
                      {/* Show the house letter or no entry emoji */}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tenantData && (
        <div className="deposit-popup">
          <button
            className="close-popup"
            onClick={() => (window.location.href = '/v2/incompleteDeposits')}
          >
            ×
          </button>
          <h2>
            <span>Tenant </span> : {tenantData.name}
          </h2>
          <div className="deposit-toggle">
            <button onClick={() => setShowSingleDeposit(!showSingleDeposit)}>
              {showSingleDeposit
                ? 'Switch to Multiple Deposits'
                : 'Switch to Single Deposit'}
            </button>
          </div>
          <div className="card-options">
            {showSingleDeposit ? (
              <div className="deposit-card single-deposit">
                <h3>Single Deposit</h3>
                <form
                  onSubmit={(e) =>
                    handleDeposit(
                      '/v2/tenants/addSingleAmountDeposit',
                      singleDepositData,
                      e
                    )
                  }
                >
                  <label htmlFor="totalAmount">Total Amount</label>
                  <input
                    type="number"
                    name="totalAmount"
                    placeholder="Total Amount"
                    value={singleDepositData.totalAmount}
                    onChange={handleSingleDepositChange}
                    required
                  />
                  <label htmlFor="referenceNo">Reference No.</label>
                  <input
                    type="text"
                    name="referenceNo"
                    placeholder="Reference No."
                    value={singleDepositData.referenceNo}
                    onChange={handleSingleDepositChange}
                    required
                  />
                  <label htmlFor="depositDate">Deposit Date</label>
                  <input
                    type="date"
                    name="depositDate"
                    value={singleDepositData.depositDate}
                    onChange={handleSingleDepositChange}
                    required
                  />
                  {error && <span>{error}</span>}
                  <button type="submit">Submit Deposit</button>
                </form>
              </div>
            ) : (
              <div className="deposit-card multiple-deposits">
                <h3>Multiple Deposits</h3>
                <form
                  onSubmit={(e) =>
                    handleDeposit(
                      '/v2/tenants/addDeposits',
                      multipleDepositData,
                      e
                    )
                  }
                >
                  <label htmlFor="rentDeposit">Rent Deposit</label>
                  <input
                    type="number"
                    name="rentDeposit"
                    placeholder="Rent Deposit"
                    value={multipleDepositData.rentDeposit}
                    onChange={handleMultipleDepositChange}
                    required
                  />
                  <label htmlFor="waterDeposit">Water Deposit</label>
                  <input
                    type="number"
                    name="waterDeposit"
                    placeholder="Water Deposit"
                    value={multipleDepositData.waterDeposit}
                    onChange={handleMultipleDepositChange}
                    required
                  />
                  <label htmlFor="initialRentPayment">
                    Initial Rent Payment
                  </label>
                  <input
                    type="number"
                    name="initialRentPayment"
                    placeholder="Initial Rent Payment"
                    value={multipleDepositData.initialRentPayment}
                    onChange={handleMultipleDepositChange}
                    required
                  />
                  <label htmlFor="referenceNo">Reference No.</label>
                  <input
                    type="text"
                    name="referenceNo"
                    placeholder="Reference No."
                    value={multipleDepositData.referenceNo}
                    onChange={handleMultipleDepositChange}
                    required
                  />
                  <label htmlFor="depositDate">Deposit Date</label>
                  <input
                    type="date"
                    name="depositDate"
                    value={multipleDepositData.depositDate}
                    onChange={handleMultipleDepositChange}
                    required
                  />
                  {error && <span>{error}</span>}
                  <button type="submit">Submit Deposits</button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {loading && (
        <div className="loader-overlay">
          <TailSpin
            height="100"
            width="100"
            color="#4fa94d"
            ariaLabel="loading"
            visible={true}
          />
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default RegisterTenant;
