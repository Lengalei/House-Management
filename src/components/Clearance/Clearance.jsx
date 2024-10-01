import { useEffect, useState } from 'react';
import './Clearance.scss';
import { useLocation, useNavigate } from 'react-router-dom';
import apiRequest from '../../lib/apiRequest';
import { toast, ToastContainer } from 'react-toastify';
import { TailSpin } from 'react-loader-spinner';
import Pagination from 'react-js-pagination';

function Clearance() {
  const location = useLocation();
  const navigate = useNavigate();
  const { tenant } = location.state || {};
  // console.log(tenant);

  const [waterBill, setWaterBill] = useState('');
  const [garbageFee, setGarbageFee] = useState('');
  const [paintingFee, setPaintingFee] = useState('');
  const [otherCharges, setOtherCharges] = useState('');
  const [date, setDate] = useState('');

  const extraCharges = Number(otherCharges) + Number(paintingFee);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false); // New state for popup
  const [paymentData, setPaymentData] = useState([]); // State to hold payment data from backend
  const [activePage, setActivePage] = useState(1); // State for pagination
  const [itemsPerPage] = useState(5); // Number of items per page

  const [mostRecentPayments, setMostRecentPayments] = useState({});
  // console.log(mostRecentPayments);

  useEffect(() => {
    const getMostRecentPaymentByTenantId = async (tenantId) => {
      try {
        const response = await apiRequest.get(
          `/v2/tenants/getMostRecentPaymentByTenantId/${tenantId}`
        );
        if (response.status) {
          // console.log(response.data);
          setMostRecentPayments(response.data.mostRecentPayment[0]);
          setError('');
        }
      } catch (error) {
        setError(error.response.data.message);
      }
    };

    getMostRecentPaymentByTenantId(tenant._id);
  }, [tenant._id]);

  const handleClearTenant = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await apiRequest.put(
        `/v2/tenants/clearTenant/${tenant._id}`,
        {
          date,
          waterBill,
          garbageFee,
          extraCharges,
        }
      );
      if (response.status) {
        console.log(response.data.payment);
        setWaterBill('');
        setGarbageFee('');
        setPaintingFee('');
        setOtherCharges('');
        setDate('');
        toast.success('Tenant cleared successfully!');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred');
      toast.error(error.response?.data?.message || 'Failed to clear tenant');

      // Open popup with payment data if the error is related to payments
      if (error.response?.data?.mostRecentPayment) {
        setPaymentData(error.response.data.mostRecentPayment);
        setMostRecentPayments(error.response.data.mostRecentPayment);
        setIsPopupOpen(true);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle page change for pagination
  const handlePageChange = (pageNumber) => {
    setActivePage(pageNumber);
  };

  const [isFlipped, setIsFlipped] = useState(false);

  const handleCLearTenantFinal = async (totalRefundAmunt) => {
    setLoading(true);
    try {
      const response = await apiRequest.post(
        `/v2/tenants/sendEmails/${tenant?._id}`,
        { refundAmount: totalRefundAmunt }
      );
      if (response.status) {
        toast.success('Tenant Cleared');
        setLoading(false);
      }
    } catch (error) {
      toast.error(error.response.data.message || 'Error Clearing Tenant');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="clearance">
      <h1>CLEAR TENANT</h1>
      <div className="forms">
        {/* Flipping card structure */}
        <div className={`flip-card ${isFlipped ? 'flipped' : ''}`}>
          <div className="flip-card-inner">
            {/* Front Side: Tenant Bill Form */}
            <div className="flip-card-front">
              <form onSubmit={handleClearTenant} className="form2">
                <h1>Tenant{`'`}s bills</h1>
                <div className="clear">
                  <label htmlFor="">Water Bill</label>
                  <input
                    value={waterBill}
                    onChange={(e) => setWaterBill(e.target.value)}
                    type="number"
                  />
                </div>
                <div className="clear">
                  <label htmlFor="">Garbage fee</label>
                  <input
                    value={garbageFee}
                    onChange={(e) => setGarbageFee(e.target.value)}
                    type="number"
                  />
                </div>
                <div className="clear">
                  <label htmlFor="">Painting fee</label>
                  <input
                    value={paintingFee}
                    onChange={(e) => setPaintingFee(e.target.value)}
                    type="number"
                  />
                </div>
                <div className="clear">
                  <label htmlFor="">Miscellaneous</label>
                  <input
                    value={otherCharges}
                    onChange={(e) => setOtherCharges(e.target.value)}
                    type="number"
                  />
                </div>
                <div className="clear">
                  <label htmlFor="">Exiting Date</label>
                  <input
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    type="date"
                  />
                </div>
                <div className="clear">
                  <button disabled={loading} className="clearBtn">
                    Submit
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFlipped(true)} // Flip to back side
                    className="flipBtn"
                  >
                    View Data
                  </button>
                </div>
                {error && (
                  <div className="clear">
                    <h3>{error}</h3>
                  </div>
                )}
              </form>
            </div>

            {/* Back Side: Tenant and Payment Data */}
            <div className="flip-card-back">
              <div className="tenant-data">
                <h1>Tenant Data</h1>
                <p>Name: {tenant?.name}</p>
                <p>House No: {tenant?.houseDetails?.houseNo}</p>
                <p>
                  Amount Avaliable :{' '}
                  {(mostRecentPayments?.tenant?.houseDetails?.rentDeposit ||
                    0) +
                    (mostRecentPayments?.tenant?.houseDetails?.waterDeposit +
                      0) +
                    (mostRecentPayments?.overpay || 0)}
                </p>
              </div>
              <div className="payment-data">
                <h1>Recent Payment</h1>
                <table className="payment-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Amount Used</th>
                      <th>Refund</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mostRecentPayments && (
                      <tr>
                        <td>
                          {mostRecentPayments?.month +
                            ', ' +
                            mostRecentPayments?.year || new Date()}
                        </td>
                        <td>{mostRecentPayments?.totalAmountPaid}</td>
                        <td>
                          {(mostRecentPayments?.tenant?.deposits?.rentDeposit ||
                            0) +
                            (mostRecentPayments?.tenant?.deposits
                              ?.waterDeposit || 0)}
                        </td>
                        <td>
                          {mostRecentPayments?.isCleared
                            ? 'Cleared'
                            : 'Pending'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <Pagination
                  activePage={activePage}
                  itemsCountPerPage={itemsPerPage}
                  totalItemsCount={mostRecentPayments?.length}
                  pageRangeDisplayed={5}
                  onChange={handlePageChange}
                />
                <button
                  type="button"
                  className="flipBtn"
                  onClick={() => setIsFlipped(false)} // Flip back to front side
                >
                  Back to Form
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="formright">
          <form className="form1">
            <h1>Tenant{`'`}s Details</h1>
            <div className="clear title">
              <h4>
                Name : <span>{tenant?.name}</span>
              </h4>
            </div>
            <div className="clear title2">
              <h5>
                House No : <span>{tenant?.houseDetails?.houseNo}</span>
              </h5>
            </div>
            <div className="form1Clear">
              <label htmlFor="">
                House Deposit :{' '}
                <span className="clearspan">
                  {mostRecentPayments?.tenant?.houseDetails?.rentDeposit}{' '}
                </span>
              </label>{' '}
              <hr />
              <label htmlFor="">
                Water Deposit :{' '}
                <span className="clearspan">
                  {mostRecentPayments?.tenant?.houseDetails?.waterDeposit}
                </span>
              </label>
              {mostRecentPayments?.overpay > 0 && (
                <label htmlFor="">
                  Last Overpay:
                  <span className="clearspan">
                    {mostRecentPayments?.overpay}
                  </span>
                </label>
              )}
              <hr />
              <label htmlFor="">
                Cash at Hand :
                <span className="clearspan">
                  {(mostRecentPayments?.tenant?.deposits?.rentDeposit || 0) +
                    (mostRecentPayments?.tenant?.deposits?.waterDeposit || 0) +
                    (mostRecentPayments?.overpay || 0)}
                </span>
              </label>
            </div>
          </form>
          <div className="cleardiv">
            <div className="clear">
              <label htmlFor="">
                Refund:{' '}
                {(mostRecentPayments?.tenant?.deposits?.rentDeposit || 0) +
                  (mostRecentPayments?.tenant?.deposits?.waterDeposit || 0) +
                  (mostRecentPayments?.overpay || 0)}
              </label>
            </div>
            <button
              className="btn"
              onClick={() =>
                handleCLearTenantFinal(
                  (mostRecentPayments?.tenant?.deposits?.rentDeposit || 0) +
                    (mostRecentPayments?.tenant?.deposits?.waterDeposit || 0) +
                    (mostRecentPayments?.overpay || 0)
                )
              }
            >
              Clear
            </button>
          </div>
        </div>
      </div>

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

      {/* Popup for payment data */}
      {isPopupOpen && (
        <div className="popup-overlay">
          <div className="popup">
            <div className="header">
              <h3>{tenant?.name} Outstanding Payments</h3>
            </div>
            <table className="payment-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {mostRecentPayments &&
                  mostRecentPayments
                    ?.slice(
                      (activePage - 1) * itemsPerPage,
                      activePage * itemsPerPage
                    )
                    ?.map((payment, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{payment?.globalDeficit}</td>
                        <td>{payment?.month + ', ' + payment?.year}</td>
                        <td>{payment?.isCleared ? 'Cleared' : 'Pending'}</td>
                      </tr>
                    ))}
              </tbody>
            </table>
            <Pagination
              activePage={activePage}
              itemsCountPerPage={itemsPerPage}
              totalItemsCount={paymentData?.length}
              pageRangeDisplayed={5}
              onChange={handlePageChange}
            />
            <div className="clearBtns">
              <button
                className="popup-btn "
                onClick={() => navigate(`/v2/tenantPaymentsV2/${tenant?._id}`)}
              >
                Go to Payments
              </button>
              <button
                className="popup-btn"
                onClick={() => setIsPopupOpen(false)}
              >
                close
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
}

export default Clearance;
