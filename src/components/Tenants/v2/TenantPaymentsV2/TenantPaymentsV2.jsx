import { useEffect, useState } from 'react';
import './TenantPaymentsV2.scss';
import apiRequest from '../../../../lib/apiRequest';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

const TenantPayments = () => {
  const location = useLocation();
  const tenantDetails = location.state?.tenantDetails;

  const navigate = useNavigate();
  const { tenantId } = useParams();
  const [selectedTab, setSelectedTab] = useState('complete'); // Toggle between Complete and Outstanding
  const [showPopup, setShowPopup] = useState(false); // Popup for updating default values
  const [showPaymentPopup, setShowPaymentPopup] = useState(false); // Popup for outstanding payments
  // const [year, setYear] = useState('2024'); // Selected year
  const [completePayments, setCompletePayments] = useState([]);
  const [outstandingPayments, setOutstandingPayments] = useState([]);
  const [error, setError] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null); // Selected outstanding payment

  const [currentMonth, setCurrentMonth] = useState('');
  const [currentYear, setCurrentyear] = useState('');
  const [nextMonth, setNextMonth] = useState('');

  // New States for Water Bill Dropdown
  const [waterBillDropdownOpen, setWaterBillDropdownOpen] = useState(false); // Toggle dropdown
  const [accumulatedWaterBill, setAccumulatedWaterBill] = useState(''); // Accumulated Water Bill
  const [paidWaterBill, setPaidWaterBill] = useState(''); // Paid Water Bill

  //
  const [extraChargesDropdownOpen, setExtraChargesDropdownOpen] =
    useState(false); // Toggle dropdown
  const [selectedExtraCharge, setSelectedExtraCharge] = useState({
    paidAmount: '',
    expectedAmount: '',
    description: '',
  }); // Selected extra charge

  const toggleExtraChargesDropdown = () => {
    setExtraChargesDropdownOpen((prevState) => !prevState);
  };

  // Separate function to fetch unpaid payments
  const fetchUnpaidPayments = async (tenantId) => {
    try {
      const response = await apiRequest.get(
        `/v2/payments/unpaidPayments/${tenantId}`
      );
      console.log('unfinished: ', response.data);
      setOutstandingPayments(response.data);
    } catch (error) {
      setError(error.response.data.message);
      throw new Error(
        error.response?.data?.message || 'Error fetching unpaid payments'
      );
    }
  };

  // Separate function to fetch fully paid payments
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const fetchFullyPaidPayments = async (tenantId) => {
    try {
      const response = await apiRequest.get(
        `/v2/payments/fullyPaidPayments/${tenantId}`
      );

      // Example structure of returned data
      const paymentsData = response.data; // Assume this is an array with 'year' and 'month' keys

      // Step 1: Extract all unique years
      const years = [...new Set(paymentsData.map((payment) => payment.year))];

      // Step 2: Find the most recent year
      const mostRecentYear = Math.max(...years);

      // Step 3: Filter data for the most recent year
      const dataForMostRecentYear = paymentsData.filter(
        (payment) => payment.year === mostRecentYear
      );

      // Step 4: Find the most recent month in the most recent year's data
      const mostRecentMonth = dataForMostRecentYear
        .map((payment) => months.indexOf(payment.month))
        .reduce((max, current) => (current > max ? current : max), -1);

      const currentMonthName = months[mostRecentMonth];

      // Step 5: Determine the next month
      const nextMonthIndex = (mostRecentMonth + 1) % 12;
      const nextMonthName = months[nextMonthIndex];

      setCurrentMonth(currentMonthName);
      setNextMonth(nextMonthName);
      setCurrentyear(mostRecentYear);
      setCompletePayments(response.data);
    } catch (error) {
      setError(
        error.response?.data?.message || 'Error fetching fully paid payments'
      );
      throw new Error(
        error.response?.data?.message || 'Error fetching fully paid payments'
      );
    }
  };

  // Fetch payments using the separated functions
  useEffect(() => {
    fetchUnpaidPayments(tenantId);
    fetchFullyPaidPayments(tenantId);
  }, [tenantId]);

  const toggleTab = (tab) => {
    setSelectedTab(tab);
  };

  const [newMonthlyAmount, setNewMonthlyAmount] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [newPaymentDate, setNewPaymentDate] = useState('');

  const handleAddPayment = async (e) => {
    e.preventDefault();
    // Handle adding payment here
    try {
      const response = await apiRequest.post(
        '/v2/payments/monthlyPayProcessing',
        {
          tenantId,
          newMonthlyAmount,
          referenceNumber,
          newPaymentDate,
          extraCharges: selectedExtraCharge,
          month: nextMonth,
          year: currentYear,
        }
      );
      if (response.status) {
        // Reset form fields
        setNewMonthlyAmount('');
        setReferenceNumber('');
        setNewPaymentDate('');
        setSelectedExtraCharge({
          paidAmount: '',
          expectedAmount: '',
          description: '',
        });

        fetchUnpaidPayments(tenantId);
      }
    } catch (error) {
      console.log('error occurred: ', error);
      setError(error?.response?.data?.message);
    }
  };

  const handleUpdateDefaults = (e) => {
    e.preventDefault();
    setShowPopup(false); // Close the popup
    // Handle default update here
  };

  const handlePaymentClick = (payment) => {
    setSelectedPayment(payment);
    // Initialize Water Bill States with existing data if available
    setAccumulatedWaterBill(payment?.waterBill?.accumulated || 0);
    setPaidWaterBill(payment?.waterBill?.paid || 0);
    setWaterBillDropdownOpen(false); // Ensure dropdown is closed initially
    setShowPaymentPopup(true); // Show the payment popup
  };

  const handlePaymentUpdate = async (e) => {
    e.preventDefault();
    // Handle updating payment here
    // Example API call:
    const formData = new FormData(e.target);
    try {
      const response = await apiRequest.put(
        `/v2/payments/updatePayment/${selectedPayment._id}`,
        {
          rentDeficit: formData.get('rentDeficit'),
          garbageDeficit: formData.get('garbageDeficit'),
          waterDeficit: formData.get('waterDeficit'),
          referenceNumber: formData.get('referenceNumber'),
          date: formData.get('date'),
          month: selectedPayment.month,
          year: selectedPayment.year,
          accumulatedWaterBill: accumulatedWaterBill, // Send accumulated water bill
          paidWaterBill: paidWaterBill, // Send paid water bill
          tenantId: tenantId,
        }
      );
      if (response.status === 200) {
        console.log(`responseFromBackend: `, response.data);
        navigate('/rentpayment');
      }
      setShowPaymentPopup(false);
      // Optionally, refresh the outstanding payments
      fetchUnpaidPayments(tenantId);
    } catch (error) {
      setError(error.response.data.message);
    }
  };

  const toggleWaterBillDropdown = () => {
    setWaterBillDropdownOpen((prevState) => !prevState);
  };

  const hasOutstandingPayments = outstandingPayments.length > 0;

  return (
    <div className="tenant-payments-container">
      <h1>{tenantDetails?.name} Payment Management</h1>
      {error && <span>{error}</span>}
      <div className="payments-cards">
        {/* Left Card */}
        <div className={`card left-card `}>
          <div className="card-header">
            <button
              className={`tab-button ${
                selectedTab === 'complete' ? 'active' : ''
              }`}
              onClick={() => toggleTab('complete')}
            >
              Complete Payments
            </button>
            <button
              className={`tab-button ${
                selectedTab === 'outstanding' ? 'active' : ''
              }`}
              onClick={() => toggleTab('outstanding')}
            >
              Pending Payments
            </button>
          </div>
          <div className="card-body">
            {selectedTab === 'complete' ? (
              <>
                {/* <div className="year-selector">
                  <label>Select Year: </label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                  >
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                  </select>
                </div> */}
                <div className="mini-cards">
                  {completePayments?.map((payment, index) => {
                    const cleared =
                      payment.rent.paid &&
                      payment.waterBill.paid &&
                      payment.garbageFee.paid;

                    return (
                      <div key={index} className="mini-card">
                        <p>
                          <strong>Month:</strong>{' '}
                          {payment?.month || currentMonth}, {currentYear}
                        </p>
                        <p>
                          <strong>Total Paid Amount:</strong>{' '}
                          {payment?.totalAmountPaid}
                        </p>
                        <p>
                          <strong>Excess Payment:</strong>{' '}
                          {payment?.overpay > 0 ? payment?.overpay : 'None'}
                        </p>
                        <p>
                          <strong>Cleared:</strong> {cleared ? 'Yes' : 'No'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="mini-cards">
                {outstandingPayments?.map((payment, index) => (
                  <div
                    key={index}
                    className="mini-card outstanding"
                    onClick={() => handlePaymentClick(payment)}
                  >
                    <p>
                      <strong>Month:</strong>{' '}
                      <span className="monthOuts">{payment?.month}</span>
                    </p>
                    <p>
                      <strong>Rent Deficit:</strong>
                      {payment?.rent?.deficit > 0
                        ? payment?.rent?.deficit
                        : 'None'}
                    </p>
                    <p>
                      <strong>Water Deficit:</strong>{' '}
                      {payment?.waterBill?.deficit > 0
                        ? payment?.waterBill?.deficit
                        : 'Water Bill...'}
                    </p>
                    <p>
                      <strong>Garbage Fee Deficit:</strong>{' '}
                      {payment?.garbageFee?.deficit > 0
                        ? payment?.garbageFee?.deficit
                        : 'None'}
                    </p>
                    <p>
                      <strong>Current Global Deficit:</strong>{' '}
                      {payment?.globalDeficit > 0
                        ? payment?.globalDeficit
                        : 'None'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Card */}
        <div className={`card right-card `}>
          <div className="card-header">
            <button
              className="update-defaults-btn"
              onClick={() => setShowPopup(true)}
            >
              Update Defaults
            </button>
          </div>
          <div
            className={`card-body ${
              hasOutstandingPayments ? 'disabled-card' : ''
            } `}
          >
            <form onSubmit={handleAddPayment}>
              <label>
                New Payment for {nextMonth}, {currentYear}
              </label>
              <div className="form-group">
                <label>Monthly Amount:</label>
                <input
                  type="number"
                  placeholder="Enter amount provided"
                  value={newMonthlyAmount}
                  onChange={(e) => setNewMonthlyAmount(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Reference Number:</label>
                <input
                  type="text"
                  placeholder="reference No used"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>New Payment Date:</label>
                <input
                  type="date"
                  placeholder="date"
                  value={newPaymentDate}
                  onChange={(e) => setNewPaymentDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Extra Charges:</label>
                <div className="extra-charges-dropdown">
                  <label
                    onClick={toggleExtraChargesDropdown}
                    className="dropdown-label"
                  >
                    <span>
                      {selectedExtraCharge.description || 'Select Extra Charge'}
                    </span>
                    <span className="dropdown-toggle">
                      {extraChargesDropdownOpen ? '⬆️' : '⬇️'}
                    </span>
                  </label>
                  {extraChargesDropdownOpen && (
                    <div className="extra-charges-dropdown-content">
                      <div className="form-group">
                        <label>Expected Amount:</label>
                        <input
                          type="number"
                          value={selectedExtraCharge.expectedAmount}
                          onChange={(e) =>
                            setSelectedExtraCharge((prevState) => ({
                              ...prevState,
                              expectedAmount: e.target.value,
                            }))
                          }
                          name="expectedAmount"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Paid Amount:</label>
                        <input
                          type="number"
                          value={selectedExtraCharge.paidAmount}
                          onChange={(e) =>
                            setSelectedExtraCharge((prevState) => ({
                              ...prevState,
                              paidAmount: e.target.value,
                            }))
                          }
                          name="paidAmount"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Description:</label>
                        <input
                          type="text"
                          value={selectedExtraCharge.description}
                          onChange={(e) =>
                            setSelectedExtraCharge((prevState) => ({
                              ...prevState,
                              description: e.target.value,
                            }))
                          }
                          name="description"
                          required
                        />
                      </div>
                      <button
                        type="button"
                        className="close-dropdown-btn"
                        onClick={toggleExtraChargesDropdown}
                      >
                        ⬆
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <button type="submit" className="confirm-btn">
                Add Payment
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Update Defaults Popup */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h2>Update Default Values</h2>
            <form onSubmit={handleUpdateDefaults}>
              <div className="form-group">
                <label>Rent Default:</label>
                <input type="number" placeholder="Enter rent default" />
              </div>
              <div className="form-group">
                <label>Water Default:</label>
                <input type="number" placeholder="Enter water default" />
              </div>
              <div className="form-group">
                <label>Garbage Default:</label>
                <input type="number" placeholder="Enter garbage default" />
              </div>
              <button type="submit">Update</button>
              <button
                type="button"
                className="close-btnClose"
                onClick={() => setShowPopup(false)}
              >
                Close
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Pending Payments Popup */}
      {showPaymentPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h2>Pending Payments</h2>
            <form onSubmit={handlePaymentUpdate}>
              {/* Rent Deficit */}
              {selectedPayment?.rent?.deficit ? (
                <div className="form-group">
                  <label>
                    Rent Deficit: {selectedPayment?.rent?.deficit || ''}
                  </label>
                  <input type="number" name="rentDeficit" />
                </div>
              ) : null}

              {/* Water Deficit */}
              {selectedPayment?.waterBill?.deficit ? (
                <>
                  <div className="form-group">
                    <label>
                      Water Bill {selectedPayment?.waterBill?.deficit || ''}
                    </label>
                    <input type="number" name="waterDeficit" />
                  </div>
                </>
              ) : (
                ''
              )}

              {selectedPayment?.waterBill?.accumulatedAmount ==
              selectedPayment?.waterBill?.amount ? (
                <>
                  {' '}
                  <div className="form-group water-bill-section">
                    <label
                      onClick={toggleWaterBillDropdown}
                      className="water-bill-label"
                    >
                      <span className="water-bill-icon">💧</span> Water Bill{' '}
                      <span className="dropdown-toggle">
                        {waterBillDropdownOpen ? '⬆' : '⬇'}
                      </span>
                    </label>
                    {waterBillDropdownOpen && (
                      <div className="water-bill-dropdown">
                        <div className="form-group">
                          <label>Accumulated Water Bill:</label>
                          <input
                            type="number"
                            value={accumulatedWaterBill}
                            onChange={(e) =>
                              setAccumulatedWaterBill(e.target.value)
                            }
                            name="accumulatedWaterBill"
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Paid Water Bill:</label>
                          <input
                            type="number"
                            value={paidWaterBill}
                            onChange={(e) => setPaidWaterBill(e.target.value)}
                            name="paidWaterBill"
                            required
                          />
                        </div>
                        <button
                          type="button"
                          className="close-dropdown-btn"
                          onClick={toggleWaterBillDropdown}
                        >
                          ⬆
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                ''
              )}
              {/* New Water Bill Dropdown Section */}

              {/* Garbage Deficit */}
              {selectedPayment?.garbageFee?.deficit ? (
                <div className="form-group">
                  <label>
                    Garbage Deficit:{' '}
                    {selectedPayment?.garbageFee?.deficit || ''}
                  </label>
                  <input type="number" name="garbageDeficit" required />
                </div>
              ) : null}

              {/* Reference Number */}
              <div className="form-group">
                <label>Reference Number</label>
                <input type="text" name="referenceNumber" required />
              </div>

              {/* Date */}
              <div className="form-group">
                <label>Date:</label>
                <input type="date" name="date" required />
              </div>

              {/* Submit and Cancel Buttons */}
              <button type="submit" className="confirm-btn">
                Update Payment
              </button>
              <button
                type="button"
                className="close-btnClose"
                onClick={() => setShowPaymentPopup(false)}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantPayments;
