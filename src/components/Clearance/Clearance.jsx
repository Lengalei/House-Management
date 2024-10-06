import { useEffect, useState } from 'react';
import './Clearance.scss';
import { useNavigate, useParams } from 'react-router-dom';
import apiRequest from '../../lib/apiRequest';
import { toast, ToastContainer } from 'react-toastify';
import { TailSpin } from 'react-loader-spinner';
import Pagination from 'react-js-pagination';

import { FaEdit } from 'react-icons/fa'; // Edit icon
import { GiReceiveMoney } from 'react-icons/gi'; // Receipt icon
import { RiDeleteBin6Line } from 'react-icons/ri'; // Delete icon

function Clearance() {
  const { tenantId } = useParams();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState('');
  const [paintingFee, setPaintingFee] = useState('');
  const [otherCharges, setOtherCharges] = useState('');
  const [date, setDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const [itemsPerPage] = useState(3);
  const [mostRecentPayments, setMostRecentPayments] = useState([]);
  const [accumulatedWater, setAccumulatedWater] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('');
  const [disableForm, setDisableForm] = useState(false);
  const [waterBillPopup, setWaterBillPopup] = useState(false);

  const [clearancePopup, setClearacePopup] = useState(false);
  const [clearanceDataArray, setClearanceDataArray] = useState([]);
  const [confirmationPopup, setConfirmationPopup] = useState(false);

  const [moneyPopup, setMoneypopup] = useState(false);
  const [selectedClearData, setSelectedClearData] = useState('');
  const [amount, setAmount] = useState('');

  // console.log('selectedPayment: ', selectedPayment);
  useEffect(() => {
    fetchTenantData();
    getMostRecentPaymentByTenantId(tenantId);
    fetchClearingData(tenantId);
  }, [tenantId]);

  const fetchClearingData = async (tenantId) => {
    setLoading(true);
    try {
      const response = await apiRequest.get(
        `/v2/clearance/tenantClearData/${tenantId}`
      );
      if (response.status) {
        setClearanceDataArray(response.data);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || 'Error Fetching Clearance Data!'
      );
      console.log(error?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };
  const getMostRecentPaymentByTenantId = async (tenantId) => {
    setLoading(true);
    try {
      const response = await apiRequest.get(
        `/v2/tenants/getMostRecentPaymentByTenantId/${tenantId}`
      );
      if (response.status) {
        setMostRecentPayments(response.data.mostRecentPayment);
        setError('');
      }
    } catch (error) {
      setError(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTenantData = async () => {
    setLoading(true);
    try {
      const response = await apiRequest.get(
        `/v2/tenants/getSingleTenant/${tenantId}`
      );
      if (response.status) {
        setTenant(response.data);
        setError('');
        // toast.success('Tenant Fetched Successfully!');
      }
    } catch (error) {
      toast.error(error.response.data.message || 'Error fetching Tenant!');
      setError(error.response.data.message || 'Error fetching Tenant!');
    } finally {
      setLoading(false);
    }
  };

  const handleCLearTenantFinal = async (totalRefundAmunt) => {
    setLoading(true);
    closeConfirmationPopup();
    try {
      const response = await apiRequest.post(
        `/v2/tenants/sendEmails/${tenant?._id}`,
        { refundAmount: totalRefundAmunt }
      );
      if (response.status) {
        toast.success(response?.data?.message || 'Tenant Cleared');

        navigate('/admins');
      }
    } catch (error) {
      toast.error(error.response.data.message || 'Error Clearing Tenant');
    } finally {
      setLoading(false);
    }
  };

  const handleClearTenant = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await apiRequest.put(
        `/v2/tenants/clearance/${tenantId}`,
        {
          date,
          paintingFee,
          miscellaneous: otherCharges,
        }
      );
      if (response.status) {
        if (!response.data.status) {
          setPaintingFee('');
          setOtherCharges('');
          setError('');
          setDate('');
          toast.success(
            'Clearing Tenant unsuccessfull!.Insufficient Deposits to cover deficits!'
          );
          await fetchTenantData();
          await getMostRecentPaymentByTenantId(tenantId);
          await fetchClearingData(tenantId);
        } else {
          setPaintingFee('');
          setOtherCharges('');
          setError('');
          setDate('');
          toast.success('Tenant cleared successfully!');
          await fetchTenantData();
          await getMostRecentPaymentByTenantId(tenantId);
          await fetchClearingData(tenantId);
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred');
      toast.error(error.response?.data?.message || 'Failed to clear tenant');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (pageNumber) => {
    setActivePage(pageNumber);
  };

  const handleFlipClick = () => {
    setIsFlipped(true);
  };

  const handleDisplayPayment = (payment) => {
    setSelectedPayment(payment);
    setIsPopupOpen(true);
  };

  useEffect(() => {
    const anyHeartbeat = mostRecentPayments.some(
      (payment) => !payment.waterBill.paid && !payment.waterBill.deficit
    );
    setDisableForm(anyHeartbeat);
  }, [mostRecentPayments]);

  const handleArrowButtonClick = (payment) => {
    setSelectedPayment(payment);
    handleFlipClick();
  };

  const handleAddWaterBillBtnClick = () => {
    setWaterBillPopup(true);
  };

  const handleCloseWaterPopup = () => {
    setWaterBillPopup(false);
  };

  const dataToSend = {
    updatedRentDeficit: selectedPayment?.rent?.deficit,
    updatedWaterDeficit: selectedPayment?.waterBill?.deficit,
    updatedAccumulatedWaterBill: accumulatedWater
      ? accumulatedWater
      : selectedPayment?.waterBill?.accumulatedAmount,
    updatedGarbageDeficit: selectedPayment?.garbageFee?.deficit,
    updatedReferenceNumber: selectedPayment?.referenceNumber,
    updatedExtraCharges: selectedPayment?.extraCharges?.deficit,
  };
  const handleWaterAdded = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await apiRequest.put(
        `/v2/payments/updateDeficit/${selectedPayment?._id}`,
        dataToSend
      );

      if (response.status) {
        toast.success('Accumulated Water Added Successfully!');
        handleCloseWaterPopup(); //close waterBill popup
        setAccumulatedWater(''); //reset accumulated water field
        await fetchTenantData();
        await getMostRecentPaymentByTenantId(tenantId);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Error updating waterBill');
    } finally {
      setLoading(false);
    }
  };

  const handleClearanceBtnClicked = () => {
    setClearacePopup(true);
  };
  const closeClearancePopupClick = () => {
    setClearacePopup(false);
  };

  // Example functions for the action buttons
  const handleEdit = (id) => {
    // Logic to edit the clearance
  };

  const handleReceiveMoney = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await apiRequest.put(
        `/v2/clearance/updateClearanceData/${selectedClearData._id}`,
        {
          amount,
          tenantId,
          date: new Date(Date.now()),
          receivedMonth: selectedClearData.month,
          year: selectedClearData.year,
        }
      );
      if (response.status) {
        toast.success('Update success!');
        setAmount('');
        getMostRecentPaymentByTenantId(tenantId);
        fetchClearingData(tenantId);
        closeMoneyPopup();
      }
    } catch (error) {
      toast.error(
        error.response.data.message || 'Error payments so as to Clear tenant!'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      const response = await apiRequest.delete(
        `/v2/clearance/deleteClearance/${id}`
      );
      if (response.status) {
        toast.success('Deleted successfullly!');
        await fetchClearingData(tenantId);

        closeClearancePopupClick();
      }
    } catch (error) {
      toast.error(
        error.response.data.message || 'Error deleting Clearance Data!'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClearFinalClicked = () => {
    setConfirmationPopup(true);
  };
  const closeConfirmationPopup = () => {
    setConfirmationPopup(false);
  };

  const displayAddMoneyPopup = (clearanaceDt) => {
    setSelectedClearData(clearanaceDt);
    setMoneypopup(true);
  };
  const closeMoneyPopup = () => {
    setSelectedClearData('');
    setMoneypopup(false);
  };

  return (
    <div className="clearance">
      <div className="forms">
        {/* Flipping card structure */}
        <div className={`flip-card ${isFlipped ? 'flipped' : ''}`}>
          <div className="flip-card-inner">
            {/* Front Side: Tenant Bill Form */}
            <div className="flip-card-front">
              <div className="innerHolder">
                <div className="mini-cards-container">
                  {mostRecentPayments
                    .slice(
                      (activePage - 1) * itemsPerPage,
                      activePage * itemsPerPage
                    )
                    .map((payment) => (
                      <div
                        key={payment._id}
                        className={`mini-card ${
                          !payment.waterBill.paid && !payment.waterBill.deficit
                            ? 'heartbeat-blink'
                            : ''
                        }`}
                        onClick={() => handleDisplayPayment(payment)}
                      >
                        <h4>{payment.title}</h4>
                        <p>{payment.month}</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleArrowButtonClick(payment);
                          }}
                          className="arrow-btn"
                        >
                          →
                        </button>
                      </div>
                    ))}
                </div>
                <Pagination
                  activePage={activePage}
                  itemsCountPerPage={itemsPerPage}
                  totalItemsCount={mostRecentPayments?.length}
                  pageRangeDisplayed={5}
                  onChange={handlePageChange}
                />
                {/* Arrow pointing to the blinking card */}
                {disableForm && <div className="arrow-indicator"></div>}
                <form
                  onSubmit={handleClearTenant}
                  className={`form2 ${disableForm ? 'blur' : ''}`}
                  style={{ pointerEvents: disableForm ? 'none' : 'auto' }}
                >
                  <h1>Tenant{`'`}s bills</h1>
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
                      onClick={handleFlipClick} // Flip to back side
                      className="flipBtn"
                    >
                      Recent Payment
                    </button>
                  </div>
                  {error && (
                    <div className="clear">
                      <h3>{error}</h3>
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* Back Side: Tenant and Payment Data */}
            <div className="flip-card-back">
              <div className="tenant-data">
                <h1>Tenant Data</h1>
                <p>Name: {tenant?.name}</p>
                <p>House No: {tenant?.houseDetails?.houseNo}</p>
                <p>
                  Date:{' '}
                  {selectedPayment?.month + ', ' + selectedPayment?.year ||
                    new Date()}
                </p>
                <h5>
                  Status: {selectedPayment?.isCleared ? 'Cleared' : 'Pending'}
                </h5>
              </div>
              <div className="payment-data">
                <h1>Recent Payment</h1>
                <table className="payment-table">
                  <thead>
                    <tr>
                      {selectedPayment?.rent?.amount > 0 && <th>Rent</th>}
                      {selectedPayment?.waterBill?.amount > 0 && (
                        <th>WaterBill</th>
                      )}
                      {selectedPayment?.garbageFee?.amount > 0 && (
                        <th>GarbageFee</th>
                      )}
                      {selectedPayment?.extraCharges?.amount > 0 && (
                        <th>Extra Charges</th>
                      )}
                      {selectedPayment?.overpay > 0 && <th>Overpay</th>}
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {selectedPayment?.rent?.amount > 0 && (
                        <td>{selectedPayment?.rent?.amount} ✅</td>
                      )}
                      {selectedPayment?.waterBill?.amount > 0 && (
                        <td>{selectedPayment?.waterBill?.amount}✅</td>
                      )}
                      {selectedPayment?.garbageFee?.amount > 0 && (
                        <td>{selectedPayment?.garbageFee?.amount}✅</td>
                      )}
                      {selectedPayment?.extraCharges?.amount > 0 && (
                        <td>{selectedPayment?.extraCharges?.amount}✅</td>
                      )}
                      {selectedPayment?.overpay > 0 && (
                        <td>{selectedPayment?.overpay}</td>
                      )}
                      <td>
                        {selectedPayment?.isCleared ? 'Cleared' : 'Pending'}
                      </td>
                    </tr>
                  </tbody>
                </table>
                {selectedPayment.isCleared ? (
                  ''
                ) : (
                  <>
                    <h1>Outstandings</h1>
                    <table className="payment-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          {selectedPayment?.rent?.deficit > 0 && (
                            <th>Rent Deficit</th>
                          )}
                          {selectedPayment?.waterBill?.deficit == 0 &&
                          !selectedPayment?.waterBill?.paid ? (
                            <th>Accumulated WaterBill</th>
                          ) : (
                            <th>Water Bill</th>
                          )}
                          {selectedPayment?.garbageFee?.deficit > 0 && (
                            <th>GarbageFee</th>
                          )}
                          {selectedPayment?.extraCharges?.deficit > 0 && (
                            <th>Extra Charges</th>
                          )}
                          {selectedPayment?.overpay > 0 && <th>Overpay</th>}
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>
                            {selectedPayment?.month +
                              ', ' +
                              selectedPayment?.year}
                          </td>
                          {selectedPayment?.rent?.deficit > 0 && (
                            <td>{selectedPayment?.rent?.deficit}❌</td>
                          )}
                          {selectedPayment?.waterBill?.deficit == 0 &&
                          !selectedPayment?.waterBill?.paid ? (
                            <td>
                              <button
                                className="popup-btn"
                                onClick={() => handleAddWaterBillBtnClick()}
                              >
                                Add WaterBill
                              </button>
                            </td>
                          ) : (
                            <td>{selectedPayment?.waterBill?.deficit}❌</td>
                          )}
                          {selectedPayment?.garbageFee?.deficit > 0 && (
                            <td>{selectedPayment?.garbageFee?.deficit}❌</td>
                          )}
                          {selectedPayment?.extraCharges?.deficit > 0 && (
                            <td>{selectedPayment?.extraCharges?.deficit}❌</td>
                          )}
                          {selectedPayment?.overpay > 0 && (
                            <td>{selectedPayment?.overpay}</td>
                          )}
                          <td>
                            {selectedPayment?.isCleared ? 'Cleared' : 'Pending'}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </>
                )}

                <h5>Total Amount Paid: {selectedPayment?.totalAmountPaid} </h5>
                <button
                  type="button"
                  className="flipBtn"
                  onClick={() => setIsFlipped(false)}
                >
                  Back to Form
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="formright">
          <div className="form1">
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
                  {tenant?.deposits?.rentDeposit}
                </span>
              </label>{' '}
              <hr />
              <label htmlFor="">
                Water Deposit :{' '}
                <span className="clearspan">
                  {tenant?.deposits?.waterDeposit}
                </span>
              </label>
              {mostRecentPayments[0]?.overpay > 0 && (
                <label htmlFor="">
                  Last Overpay:
                  <span className="clearspan">
                    {mostRecentPayments[0]?.overpay}
                  </span>
                </label>
              )}
              <hr />
              <label htmlFor="">
                Cash at Hand :
                <span className="clearspan">
                  {(tenant?.deposits?.rentDeposit || 0) +
                    (tenant?.deposits?.waterDeposit || 0) +
                    (mostRecentPayments[0]?.overpay || 0)}
                </span>
              </label>
            </div>
            {clearanceDataArray?.length > 0 ? (
              <button
                className={`btn`}
                onClick={() => handleClearanceBtnClicked()}
              >
                Clearance Deficit
              </button>
            ) : (
              ''
            )}
          </div>
          <div
            className={`cleardiv ${
              mostRecentPayments.some((payment) => !payment.isCleared)
                ? 'blur'
                : ''
            }`}
          >
            <div className="clear">
              <label htmlFor="">
                Refund:
                {clearanceDataArray[0]?.overpay ? (
                  clearanceDataArray[0].overpay
                ) : (
                  <>
                    {clearanceDataArray && clearanceDataArray[0]?.overpay > 0
                      ? clearanceDataArray[0]?.overpay
                      : (tenant?.deposits?.rentDeposit || 0) +
                        (tenant?.deposits?.waterDeposit || 0) +
                        (mostRecentPayments[0]?.overpay || 0)}
                  </>
                )}
              </label>
            </div>
            <button
              disabled={mostRecentPayments?.some(
                (payment) => !payment.isCleared
              )}
              className={`btn ${
                mostRecentPayments.some((payment) => !payment.isCleared)
                  ? 'blur'
                  : ''
              }`}
              onClick={handleClearFinalClicked}
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
                  <th>Date</th>
                  {selectedPayment?.rent?.deficit > 0 && <th>Rent Deficit</th>}
                  {selectedPayment?.waterBill?.deficit == 0 &&
                  !selectedPayment?.waterBill?.paid ? (
                    <th>Accumulated WaterBill</th>
                  ) : (
                    <td>Water Bill</td>
                  )}
                  {selectedPayment?.garbageFee?.deficit > 0 && (
                    <th>GarbageFee</th>
                  )}
                  {selectedPayment?.extraCharges?.deficit > 0 && (
                    <th>Extra Charges</th>
                  )}
                  {selectedPayment?.overpay > 0 && <th>Overpay</th>}
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    {selectedPayment?.month + ', ' + selectedPayment?.year}
                  </td>
                  {selectedPayment?.rent?.deficit > 0 && (
                    <td>{selectedPayment?.rent?.deficit}</td>
                  )}
                  {selectedPayment?.waterBill?.deficit == 0 &&
                  !selectedPayment?.waterBill?.paid ? (
                    <td>
                      <button
                        className="popupbtn"
                        onClick={() => handleAddWaterBillBtnClick()}
                      >
                        Add WaterBill
                      </button>
                    </td>
                  ) : (
                    <td>{selectedPayment?.waterBill?.deficit}</td>
                  )}
                  {selectedPayment?.garbageFee?.deficit > 0 && (
                    <td>{selectedPayment?.garbageFee?.deficit}</td>
                  )}
                  {selectedPayment?.extraCharges?.deficit > 0 && (
                    <td>{selectedPayment?.extraCharges?.deficit}</td>
                  )}
                  {selectedPayment?.overpay > 0 && (
                    <td>{selectedPayment?.overpay}</td>
                  )}
                  <td>{selectedPayment?.isCleared ? 'Cleared' : 'Pending'}</td>
                </tr>
              </tbody>
            </table>
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

      {/* accumulated water bill popuo  */}
      {waterBillPopup && (
        <div className="waterBillPopupOverlay">
          <div className="popup">
            {' '}
            <form onSubmit={handleWaterAdded}>
              <h3>Update Payment</h3>
              <label htmlFor="waterBill">Accumulated WaterBill:</label>
              <input
                type="number"
                name="waterBill"
                placeholder={
                  accumulatedWater ? accumulatedWater : 'AccumulatedWater'
                }
                value={accumulatedWater}
                onChange={(e) => {
                  setAccumulatedWater(e.target.value);
                }}
              />
              <div className="clearBtns">
                <button className="popup-btn" type="submit">
                  Add Bill
                </button>
                <button
                  className="popup-btn"
                  onClick={() => handleCloseWaterPopup()}
                >
                  close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* clearance record popup */}
      {clearancePopup && (
        <div className="waterBillPopupOverlay">
          <div className="popup">
            <div className="popup-header">
              <h2>Clearance Records</h2>
              <button
                className="close-button"
                onClick={() => closeClearancePopupClick()}
              >
                &times;
              </button>
            </div>
            <table className="cleartable">
              <thead>
                <tr>
                  <th>Tenant Name</th>
                  <th>Date</th>
                  <th>Painting Fee</th>
                  <th>Miscellaneous Fee</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {clearanceDataArray &&
                  clearanceDataArray?.map((clearanaceDt) => (
                    <tr key={clearanaceDt?._id}>
                      <td>{tenant?.name}</td>
                      <td>{`${clearanaceDt?.month}, ${clearanaceDt?.year}`}</td>

                      <td>{clearanaceDt?.paintingFee?.deficit}</td>

                      <td>{clearanaceDt?.miscellaneous?.deficit}</td>

                      <td>{clearanaceDt?.isCleared ? 'Cleared' : 'Pending'}</td>
                      <td>
                        <button onClick={() => handleEdit(clearanaceDt?._id)}>
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => displayAddMoneyPopup(clearanaceDt)}
                        >
                          <GiReceiveMoney />
                        </button>
                        <button onClick={() => handleDelete(clearanaceDt?._id)}>
                          <RiDeleteBin6Line />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* money given popup */}
      {moneyPopup && (
        <div className="moneyPopupOverlay">
          <div className="popup">
            {' '}
            <form onSubmit={handleReceiveMoney}>
              <h3>Update Payment</h3>
              <label htmlFor="amount">Amount:</label>
              <input
                type="number"
                name="amount"
                placeholder={'Amount'}
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                }}
              />
              <div className="clearBtns">
                <button className="popup-btn" type="submit">
                  Add Amount
                </button>
                <button className="popup-btn" onClick={() => closeMoneyPopup()}>
                  close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* confirmation deletion btn */}
      {confirmationPopup && (
        <div className="confirmation-modal">
          <div className="modal-content">
            <p>Are you sure you want to Clear and delete this tenant?</p>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={closeConfirmationPopup}>
                Cancel
              </button>
              <button
                className="confirm-btn"
                onClick={() =>
                  handleCLearTenantFinal(
                    clearanceDataArray && clearanceDataArray[0]?.overpay > 0
                      ? clearanceDataArray[0]?.overpay
                      : (tenant?.deposits?.rentDeposit || 0) +
                          (tenant?.deposits?.waterDeposit || 0) +
                          (mostRecentPayments[0]?.overpay || 0)
                  )
                }
              >
                Yes, Delete
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
