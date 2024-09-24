import { useEffect, useState } from 'react';
import './TenantPaymentsV2.scss';
import apiRequest from '../../../../lib/apiRequest';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { ThreeDots } from 'react-loader-spinner';

const TenantPayments = () => {
  const location = useLocation();
  const tenantDetails = location.state?.tenantDetails;

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { tenantId } = useParams();
  const [selectedTab, setSelectedTab] = useState('complete'); // Toggle between Complete and Outstanding
  const [showPopup, setShowPopup] = useState(false); // Popup for updating default values
  const [showPaymentPopup, setShowPaymentPopup] = useState(false); // Popup for outstanding payments

  const [completePayments, setCompletePayments] = useState([]);
  const [outstandingPayments, setOutstandingPayments] = useState([]);
  const [error, setError] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null); // Selected outstanding payment

  const [selectedYear, setSelectedYear] = useState(''); // Selected year
  const [years, setYears] = useState([]); // Available years
  const [filteredPayments, setFilteredPayments] = useState([]); // Payments filtered by year

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
    expectedAmount: '',
    description: '',
  }); // Selected extra charge

  const [
    previousMonthExtraChargesDropdownOpen,
    setPreviousMonthExtraChargesDropdownOpen,
  ] = useState(false);
  const [
    previousMonthSelectedExtraCharge,
    setPreviousMonthSelectedExtraCharge,
  ] = useState({
    expectedAmount: '',
    description: '',
  }); // Selected extra charge

  const [displayRefNoHistory, setDisplayRefNoHistory] = useState(false);
  const HandleRefNoHistroy = () => {
    setDisplayRefNoHistory((prevState) => !prevState);
  };
  const toggleExtraChargesDropdown = () => {
    setExtraChargesDropdownOpen((prevState) => !prevState);
  };
  const togglePreviousMonthExtraChargesDropdown = () => {
    setPreviousMonthExtraChargesDropdownOpen((prevState) => !prevState);
  };

  const [fetchedTenantDetails, setTenantDetails] = useState('');
  // Separate function to fetch unpaid payments
  const fetchUnpaidPayments = async (tenantId) => {
    setLoading(true);
    try {
      const response = await apiRequest.get(
        `/v2/payments/unpaidPayments/${tenantId}`
      );
      console.log('unfinished: ', response.data);
      setOutstandingPayments(response.data);
    } catch (error) {
      if (error.response.data.unpaidPayments.lenght < 0) {
        console.log('no outstanding payments');
      }
      // setError(error.response.data.message);
      console.log(error.response);
    } finally {
      setLoading(false);
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
    setLoading(true);
    // console.log(tenantId);
    try {
      const response = await apiRequest.get(
        `/v2/payments/fullyPaidPayments/${tenantId}`
      );
      // console.log(response.data);
      setCompletePayments(response.data);
      setError('');
    } catch (error) {
      setError(
        error.response?.data?.message || 'Error fetching fully paid payments'
      );
      throw new Error(
        error.response?.data?.message || 'Error fetching fully paid payments'
      );
    } finally {
      setLoading(false);
    }
  };

  const [previousMonth, setPreviousMonth] = useState('');
  const [previousYear, setPreviousYear] = useState('');
  const getMostRecentPaymentByTenantId = async (tenantId) => {
    try {
      const response = await apiRequest.get(
        `/v2/tenants/getMostRecentPaymentByTenantId/${tenantId}`
      );
      if (response.status) {
        setPreviousMonth(response.data.mostRecentPayment[0].month);
        // console.log(response.data);
        setPreviousYear(response.data.mostRecentPayment[0].year);

        // Example structure of returned data
        const paymentsData = response.data.mostRecentPayment; // Assume this is an array with 'year' and 'month' keys

        // Step 1: Extract all unique years
        const years = [...new Set(paymentsData.map((payment) => payment.year))];
        // Extract unique years from the payment data
        const availableYears = [
          ...new Set(paymentsData.map((payment) => payment.year)),
        ];
        setYears(availableYears);

        setSelectedYear(availableYears[0]);
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
        console.log('currentMonthName: ', currentMonthName);

        // Step 5: Determine the next month
        // const nextMonthIndex = (mostRecentMonth + 1) % 12;
        // // const nextMonthName = months[nextMonthIndex];

        const findNextYear = determineYearForNextMonth(
          currentMonthName,
          mostRecentYear
        );

        setError('');
        setCurrentMonth(currentMonthName);
        setNextMonth(findNextYear.nextMonthName);
        // console.log('month: ', findNextYear.nextMonthName);
        setCurrentyear(findNextYear.nextYear);
        // console.log('year: ', findNextYear.nextYear);
      }
    } catch (error) {
      setError(error.response.data.message);
    }
  };

  // eslint-disable-next-line no-unused-vars
  const [nextYear, setNextYear] = useState('');

  // Helper function to determine the next year based on current month
  const determineYearForNextMonth = (currentMonth, currentYear) => {
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

    // Find index of the current month
    const currentMonthIndex = months.indexOf(currentMonth);

    // Determine the next month index
    const nextMonthIndex = (currentMonthIndex + 1) % 12;

    // Check if current month is December to increment the year
    const isDecember = currentMonthIndex === 11;
    const nextYear = isDecember ? currentYear + 1 : currentYear;

    // Get the name of the next month
    const nextMonthName = months[nextMonthIndex];

    return { nextMonthName, nextYear };
  };

  useEffect(() => {
    if ((currentMonth && currentYear) || (previousMonth && previousYear)) {
      let month = previousMonth ? previousMonth : currentMonth;
      let year = previousYear ? previousYear : currentYear;
      const { nextMonthName, nextYear } = determineYearForNextMonth(
        month,
        year
      );
      setNextMonth(nextMonthName);
      setNextYear(nextYear);
    }
  }, [currentMonth, currentYear, previousMonth]);

  useEffect(() => {
    if (selectedYear) {
      const paymentsForYear = completePayments.filter(
        (payment) => payment.year === parseInt(selectedYear)
      );
      setFilteredPayments(paymentsForYear);
    }
  }, [selectedYear, completePayments]);

  // Fetch payments using the separated functions
  useEffect(() => {
    getMostRecentPaymentByTenantId(tenantId);
    fetchUnpaidPayments(tenantId);
    fetchFullyPaidPayments(tenantId);
  }, [tenantId]);

  const toggleTab = (tab) => {
    setSelectedTab(tab);
  };

  const [newMonthlyAmount, setNewMonthlyAmount] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [newPaymentDate, setNewPaymentDate] = useState('');

  // const [rentDeficit, setRentDeficit] = useState('');
  // const [waterDeficit, setWaterDeficit] = useState('');
  // const [garbageDeficit, setGarbageDeficit] = useState('');
  // const [previousPaidWaterBill, setPreviousPaidWaterBill] = useState('');
  // const [previousOtherChargesDeficit, setPreviousOtherChargesDeficit] =
  //   useState('');
  const [previousAccumulatedWaterBill, setPreviousAccumulatedWaterBill] =
    useState('');

  const handleAddPayment = async (e) => {
    e.preventDefault();
    setLoading(true);
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
          previousMonthExtraCharges: previousMonthSelectedExtraCharge,
          month: nextMonth,
          year: currentYear || nextYear,
          //
          previousAccumulatedWaterBill,
          // rentDeficit,
          // waterDeficit,
          // garbageDeficit,
          // previousPaidWaterBill,
          // previousOtherChargesDeficit,
        }
      );
      if (response.status) {
        // Reset form fields
        setNewMonthlyAmount('');
        setReferenceNumber('');
        setNewPaymentDate('');
        setSelectedExtraCharge({
          expectedAmount: '',
          description: '',
        });
        setPreviousMonthSelectedExtraCharge({
          expectedAmount: '',
          description: '',
        });
        setPreviousAccumulatedWaterBill('');

        fetchUnpaidPayments(tenantId);
        fetchFullyPaidPayments(tenantId);
        getMostRecentPaymentByTenantId(tenantId);

        setError('');
      }
    } catch (error) {
      console.log('error occurred: ', error);
      setError(error?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const [rentDefault, setRentDefault] = useState('');
  const [garbageDefault, setGarbageDefault] = useState('');

  const handleUpdateDefaults = async (e) => {
    e.preventDefault();
    // Handle default update here
    try {
      const response = await apiRequest.put(
        `/v2/tenants/updateTenantHouseDetails/${tenantId}`,
        { rentDefault, garbageDefault }
      );
      if (response.status) {
        console.log(response.data);
      }
      setRentDefault('');
      setGarbageDefault('');
      setShowPopup(false);

      setError('');
    } catch (error) {
      setError(error.response.data.message);
    }
  };
  useEffect(() => {
    const getTenantDetails = async () => {
      try {
        const response = await apiRequest.get(
          `/v2/tenants/getSingleTenant/${tenantId}`
        );
        if (response.status) {
          setTenantDetails(response.data);
        }
      } catch (error) {
        setError(error.response.data.message);
      }
    };
    getTenantDetails();
  }, [rentDefault, tenantId]);

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
    setLoading(true);
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

        setError('');
      }
      setShowPaymentPopup(false);
      // Optionally, refresh the outstanding payments
      fetchUnpaidPayments(tenantId);
    } catch (error) {
      setError(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleWaterBillDropdown = () => {
    setWaterBillDropdownOpen((prevState) => !prevState);
  };

  const hasOutstandingPayments = outstandingPayments.length > 0;

  const [AddInternalAmountPopup, setAddInternalAmountPopup] = useState(false);
  const handleAddInternalAmount = () => {
    setAddInternalAmountPopup(true);
  };

  const [extraAmount, setExtraAmount] = useState('');
  const [extraAmountReferenceNo, setExtraAmountReferenceNo] = useState('');
  const [extraAmountGivenDate, setExtraAmountGivenDate] = useState('');

  const handleInternalMonthExtraGivenAmount = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await apiRequest.put(
        `/v2/payments/ExtraAmountGivenInAmonth/${outstandingPayments[0]?._id}`,
        {
          currentYear,
          nextMonth,
          extraAmountProvided: extraAmount,
          extraAmountReferenceNo,
          extraAmountGivenDate,
        }
      );
      if (response.status) {
        console.log('All good');
        setAddInternalAmountPopup(false);
      }
    } catch (error) {
      setError(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  const totalGlobalDeficit = outstandingPayments.reduce(
    (total, payment) => total + payment.globalDeficit,
    0 // Initial value of the sum
  );

  return (
    <div className="tenant-payments-container">
      <>
        {loading ? (
          <div className="loader">
            <ThreeDots
              height="80"
              width="80"
              radius="9"
              color="#4fa94d"
              ariaLabel="three-dots-loading"
              visible={true}
            />
          </div>
        ) : (
          <>
            {' '}
            <h1>
              <span>{tenantDetails?.name + `'s`} Payment Track</span>
            </h1>
            <div className="payments-cards">
              {/* Left Card */}
              <div className={`card left-card `}>
                <div className="card-header">
                  <div className="outstandingWithGlobalDeficit">
                    <button
                      className={`tab-button ${
                        selectedTab === 'complete' ? 'active' : ''
                      }`}
                      onClick={() => toggleTab('complete')}
                    >
                      Complete Payments
                    </button>
                    <span>_______</span>
                  </div>

                  {hasOutstandingPayments ? (
                    <div className="outstandingWithGlobalDeficit">
                      <button
                        className={`tab-button ${
                          selectedTab === 'outstanding' ? 'active' : ''
                        }`}
                        onClick={() => toggleTab('outstanding')}
                      >
                        Pending Payments
                      </button>
                      {totalGlobalDeficit ? (
                        <span>Global deficit: {totalGlobalDeficit}</span>
                      ) : (
                        <span>_______</span>
                      )}
                    </div>
                  ) : (
                    ''
                  )}
                </div>
                <div className="card-body">
                  {selectedTab === 'complete' ? (
                    <>
                      <div className="year-selector">
                        <label>Select Year: </label>
                        <select
                          value={selectedYear}
                          onChange={(e) => setSelectedYear(e.target.value)}
                        >
                          {years.map((year, index) => (
                            <option key={index} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="mini-cards">
                        {filteredPayments.map((payment, index) => {
                          const cleared =
                            payment.rent.paid &&
                            payment.waterBill.paid &&
                            payment.garbageFee.paid;

                          return (
                            <div key={index} className="mini-card">
                              <p>
                                <strong>Month:</strong>{' '}
                                {payment?.month || currentMonth},{' '}
                                {payment?.year}
                              </p>
                              <p>
                                <strong>Total Paid Amount:</strong>{' '}
                                {payment?.totalAmountPaid}
                              </p>
                              <p
                                onClick={() => {
                                  HandleRefNoHistroy();
                                }}
                              >
                                <strong>ReferenceNoHistory:</strong>
                                <span className="dropdown-toggle">
                                  {displayRefNoHistory ? '⬆️' : '⬇️'}
                                </span>
                                {displayRefNoHistory && (
                                  <>
                                    {payment?.referenceNoHistory?.map((ref) => (
                                      <p
                                        className="ReferenceNoHistory"
                                        key={ref._id}
                                      >
                                        <p>Amount:{ref.amount}</p>
                                        <p>RefNo Used:{ref.referenceNoUsed}</p>
                                      </p>
                                    ))}
                                  </>
                                )}
                              </p>
                              {/* <p>
                          <strong>Excess Payment:</strong>{' '}
                          {payment?.overpay > 0 ? payment?.overpay : 'None'}
                        </p> */}
                              <p>
                                <strong>Cleared Status:</strong>{' '}
                                {cleared ? 'True' : 'False'}
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
                          {payment?.rent?.deficit ? (
                            <p>
                              <strong>Rent Deficit:</strong>
                              {payment?.rent?.deficit > 0
                                ? payment?.rent?.deficit
                                : 'None'}
                            </p>
                          ) : (
                            ''
                          )}

                          <p>
                            <strong>Water Bill:</strong>{' '}
                            {payment?.waterBill?.deficit > 0
                              ? payment?.waterBill?.deficit
                              : 'Water Bill...'}
                          </p>
                          {payment?.garbageFee?.deficit ? (
                            <p>
                              <strong>Garbage Fee Deficit:</strong>{' '}
                              {payment?.garbageFee?.deficit > 0
                                ? payment?.garbageFee?.deficit
                                : 'None'}
                            </p>
                          ) : (
                            ''
                          )}
                          {payment?.globalDeficit ? (
                            <p>
                              <strong>{payment?.month} Total Deficit:</strong>{' '}
                              {payment?.globalDeficit > 0
                                ? payment?.globalDeficit
                                : '...'}
                            </p>
                          ) : (
                            ''
                          )}

                          {payment?.overpay ? (
                            <p>
                              <strong>Current Excess To use:</strong>{' '}
                              {payment?.overpay > 0 ? payment?.overpay : 'None'}
                            </p>
                          ) : (
                            ''
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {selectedTab === 'complete' ? (
                  ''
                ) : (
                  <>
                    {hasOutstandingPayments ? (
                      <button
                        className="addExtraAmount"
                        onClick={() => {
                          handleAddInternalAmount();
                        }}
                      >
                        Given Extra Amount within {previousMonth}
                      </button>
                    ) : (
                      ''
                    )}
                  </>
                )}
              </div>

              {/* Right Card */}

              <div className={`card right-card`}>
                <div className="card-header">
                  <button
                    className={`update-defaults-btn`}
                    onClick={() => setShowPopup(true)}
                  >
                    Update Defaults
                  </button>
                </div>

                <div className="card-body">
                  <form onSubmit={handleAddPayment}>
                    {/* Section 1: Monthly Payment Info */}
                    <div className="section section-1">
                      <h3>{nextMonth + ', ' + currentYear} Payment Info</h3>
                      {outstandingPayments?.map((payment, index) => (
                        <div key={index}>
                          {payment?.overpay ? (
                            <p>
                              <strong>Current Overpay:</strong>{' '}
                              {payment?.overpay > 0 ? payment?.overpay : 'None'}
                            </p>
                          ) : (
                            ''
                          )}
                        </div>
                      ))}

                      <div className="form-group">
                        <label>Monthly Amount:</label>
                        <input
                          type="number"
                          placeholder="Enter amount provided"
                          value={newMonthlyAmount}
                          onChange={(e) => setNewMonthlyAmount(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Reference Number:</label>
                        <input
                          type="text"
                          placeholder="Reference No used"
                          value={referenceNumber}
                          onChange={(e) => setReferenceNumber(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>New Payment Date:</label>
                        <input
                          type="date"
                          placeholder="Select date"
                          value={newPaymentDate}
                          onChange={(e) => setNewPaymentDate(e.target.value)}
                        />
                      </div>
                      {/* Section 1.2: Extra Charges */}
                      <h3>New Month Extra Charges</h3>
                      <div className="extra-charges-dropdown">
                        <label
                          onClick={toggleExtraChargesDropdown}
                          className="dropdown-label"
                        >
                          <span>
                            {selectedExtraCharge.description ||
                              'Select Extra Charge'}
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
                                value={selectedExtraCharge.expectedAmount ?? 0}
                                onChange={(e) =>
                                  setSelectedExtraCharge((prevState) => ({
                                    ...prevState,
                                    expectedAmount: e.target.value,
                                  }))
                                }
                              />
                            </div>
                            {/* <div className="form-group">
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
                        />
                      </div> */}
                            <div className="form-group">
                              <label>Description:</label>
                              <input
                                type="text"
                                value={
                                  selectedExtraCharge.description ?? 'None'
                                }
                                onChange={(e) =>
                                  setSelectedExtraCharge((prevState) => ({
                                    ...prevState,
                                    description: e.target.value,
                                  }))
                                }
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

                    {/* Section 2: Previous Monthly Deficits */}
                    <div className="section section-2">
                      <h3>Previous Month Transactions</h3>
                      {outstandingPayments && (
                        <>
                          {outstandingPayments.map((payment) => (
                            <div key={payment._id}>
                              <>
                                <label>
                                  {payment?.month + ',' + payment?.year}
                                </label>
                                {payment?.rent?.deficit > 0 ? (
                                  <div className="form-group">
                                    <label>
                                      Rent Deficit:{payment?.rent?.deficit}{' '}
                                    </label>
                                    {/* <input
                                type="number"
                                placeholder="Enter rent deficit"
                                value={rentDeficit}
                                onChange={(e) => setRentDeficit(e.target.value)}
                              /> */}
                                  </div>
                                ) : (
                                  ''
                                )}
                                {payment?.waterBill?.deficit > 0 ? (
                                  <div className="form-group">
                                    <label>
                                      Water Deficit:
                                      {payment?.waterBill?.deficit}
                                    </label>
                                    {/* <input
                                type="number"
                                placeholder="Enter water deficit"
                                value={waterDeficit}
                                onChange={(e) =>
                                  setWaterDeficit(e.target.value)
                                }
                              /> */}
                                  </div>
                                ) : (
                                  ''
                                )}
                                {payment?.waterBill?.deficit > 0 ? (
                                  ''
                                ) : (
                                  <div className="form-group water-bill-section">
                                    <label
                                      onClick={toggleWaterBillDropdown}
                                      className="water-bill-label"
                                    >
                                      <span className="water-bill-icon">
                                        💧
                                      </span>{' '}
                                      Water Bill{' '}
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
                                            value={previousAccumulatedWaterBill}
                                            onChange={(e) =>
                                              setPreviousAccumulatedWaterBill(
                                                e.target.value
                                              )
                                            }
                                            name="accumulatedWaterBill"
                                            required
                                          />
                                        </div>
                                        {/* <div className="form-group">
                                      <label>Paid Water Bill:</label>
                                      <input
                                        type="number"
                                        value={previousPaidWaterBill}
                                        onChange={(e) =>
                                          setPreviousPaidWaterBill(
                                            e.target.value
                                          )
                                        }
                                        name="paidWaterBill"
                                        required
                                      />
                                    </div> */}
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
                                )}
                                {payment?.garbageFee?.deficit > 0 ? (
                                  <div className="form-group">
                                    <label>
                                      Garbage Deficit:{' '}
                                      {payment?.garbageFee?.deficit}
                                    </label>
                                    {/* <input
                                type="number"
                                placeholder="Enter garbage deficit"
                                value={garbageDeficit}
                                onChange={(e) =>
                                  setGarbageDeficit(e.target.value)
                                }
                              /> */}
                                  </div>
                                ) : (
                                  ''
                                )}
                                {payment?.extraCharges?.deficit > 0 ? (
                                  <div className="form-group">
                                    <label>
                                      Previous Extra Charges Deficit:
                                      {payment?.extraCharges?.deficit}
                                    </label>
                                    {/* <input
                                type="number"
                                placeholder="Enter extra charges"
                                value={previousOtherChargesDeficit}
                                onChange={(e) =>
                                  setPreviousOtherChargesDeficit(e.target.value)
                                }
                              /> */}
                                  </div>
                                ) : (
                                  ''
                                )}
                                <hr />
                              </>
                            </div>
                          ))}
                        </>
                      )}
                      <h3>Previous Month Extra Charges</h3>
                      <div className="extra-charges-dropdown">
                        <label
                          onClick={togglePreviousMonthExtraChargesDropdown}
                          className="dropdown-label"
                        >
                          <span>
                            {previousMonthSelectedExtraCharge.description ||
                              'PreviousMonth  Extra Charge'}
                          </span>
                          <span className="dropdown-toggle">
                            {previousMonthExtraChargesDropdownOpen
                              ? '⬆️'
                              : '⬇️'}
                          </span>
                        </label>
                        {previousMonthExtraChargesDropdownOpen && (
                          <div className="extra-charges-dropdown-content">
                            <div className="form-group">
                              <label>Expected Amount:</label>
                              <input
                                type="number"
                                value={
                                  previousMonthSelectedExtraCharge.expectedAmount ??
                                  0
                                }
                                onChange={(e) =>
                                  setPreviousMonthSelectedExtraCharge(
                                    (prevState) => ({
                                      ...prevState,
                                      expectedAmount: e.target.value,
                                    })
                                  )
                                }
                              />
                            </div>
                            {/* <div className="form-group">
                        <label>Paid Amount:</label>
                        <input
                          type="number"
                          value={previousMonthSelectedExtraCharge.paidAmount}
                          onChange={(e) =>
                            setPreviousMonthSelectedExtraCharge(
                              (prevState) => ({
                                ...prevState,
                                paidAmount: e.target.value,
                              })
                            )
                          }
                        />
                      </div> */}
                            <div className="form-group">
                              <label>Description:</label>
                              <input
                                type="text"
                                value={
                                  previousMonthSelectedExtraCharge.description ??
                                  'None'
                                }
                                onChange={(e) =>
                                  setPreviousMonthSelectedExtraCharge(
                                    (prevState) => ({
                                      ...prevState,
                                      description: e.target.value,
                                    })
                                  )
                                }
                              />
                            </div>
                            <button
                              type="button"
                              className="close-dropdown-btn"
                              onClick={togglePreviousMonthExtraChargesDropdown}
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
                  <h2>
                    Update {tenantDetails?.name}
                    {`'s`} Default Values
                  </h2>
                  <form onSubmit={handleUpdateDefaults}>
                    <div className="form-group">
                      <label>Rent Default:</label>
                      <h5>
                        Original Payable Rent:
                        <span className="updateDefaults">
                          {fetchedTenantDetails?.houseDetails?.rent}
                        </span>
                      </h5>
                      <input
                        type="number"
                        placeholder="Enter rent default"
                        value={rentDefault}
                        onChange={(e) => {
                          setRentDefault(e.target.value);
                        }}
                      />
                    </div>
                    <div className="form-group">
                      <label>Garbage Default:</label>
                      <h5>
                        Original GarbageFee:
                        <span className="updateDefaults">
                          {fetchedTenantDetails?.houseDetails?.garbageFee}
                        </span>
                      </h5>
                      <input
                        type="number"
                        placeholder="Enter garbage default"
                        value={garbageDefault}
                        onChange={(e) => {
                          setGarbageDefault(e.target.value);
                        }}
                      />
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
            {/*Given Extra Amount Internal AmountPopup */}
            {AddInternalAmountPopup && (
              <div className="popup-overlay">
                <div className="popup-content">
                  <h2>
                    Extra {extraAmount || 0} given By {tenantDetails?.name}
                  </h2>
                  <form onSubmit={handleInternalMonthExtraGivenAmount}>
                    <div className="form-group">
                      <label>Amount Added</label>
                      <input
                        type="number"
                        placeholder="Enter amount"
                        value={extraAmount}
                        onChange={(e) => {
                          setExtraAmount(e.target.value);
                        }}
                      />
                    </div>
                    <div className="form-group">
                      <label>Reference number</label>
                      <input
                        type="text"
                        placeholder="Reference number"
                        value={extraAmountReferenceNo}
                        onChange={(e) => {
                          setExtraAmountReferenceNo(e.target.value);
                        }}
                      />
                    </div>
                    <div className="form-group">
                      <label>Date</label>
                      <input
                        type="date"
                        value={extraAmountGivenDate}
                        onChange={(e) => {
                          setExtraAmountGivenDate(e.target.value);
                        }}
                      />
                    </div>
                    <button type="submit">Add amount</button>
                    <button
                      type="button"
                      className="close-btnClose"
                      onClick={() => setAddInternalAmountPopup(false)}
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
                  <h2>{previousMonth + `,` + currentYear} Pending Payments</h2>
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
                            Water Bill{' '}
                            {selectedPayment?.waterBill?.deficit || ''}
                          </label>
                          <input type="number" name="waterDeficit" />
                        </div>
                      </>
                    ) : (
                      ''
                    )}

                    {selectedPayment?.waterBill?.deficit ? (
                      ''
                    ) : (
                      <>
                        {' '}
                        <div className="form-group water-bill-section">
                          <label
                            onClick={toggleWaterBillDropdown}
                            className="water-bill-label"
                          >
                            <span className="water-bill-icon">💧</span> Water
                            Bill{' '}
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
                                  onChange={(e) =>
                                    setPaidWaterBill(e.target.value)
                                  }
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
            {error && <span>{error}</span>}
          </>
        )}
      </>
    </div>
  );
};

export default TenantPayments;
