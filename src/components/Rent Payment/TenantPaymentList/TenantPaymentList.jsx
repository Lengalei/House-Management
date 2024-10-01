import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import './TenantPaymentList.scss';
import { MdDeleteForever } from 'react-icons/md';
import apiRequest from '../../../lib/apiRequest';
import MiniPaymentsPopup from './MiniPaymentsPopup/MiniPaymentsPopup';
import Pagination from 'react-js-pagination'; // Import Pagination
import { InfinitySpin } from 'react-loader-spinner';

const TenantPaymentList = () => {
  const { tenantId } = useParams();
  const [payments, setPayments] = useState([]);
  const [onEntryOverPay, setOnEntryOverPay] = useState([]);
  const [tenant, setTenant] = useState();
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);
  const [error, setError] = useState('');

  // Pagination states
  const [activePage, setActivePage] = useState(1);
  const itemsPerPage = 4; // Define how many items you want to show per page

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      try {
        const response = await apiRequest.get(
          `/v2/payments/paymentsByTenant/${tenantId}`
        );
        setPayments(response.data.payments);
        setTenant(response.data.tenant);
        setOnEntryOverPay(response.data.onEntryOverPay);
      } catch (error) {
        setError('Failed to fetch payments.');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [tenantId]);

  const handleViewMiniPayments = (payment) => {
    setSelectedPayment(payment);
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setSelectedPayment(null);
  };

  const handleDeletePaymentDetail = async () => {
    setLoading(true);
    try {
      const response = await apiRequest.delete(
        `/v2/payments/deletePayment/${paymentToDelete}`
      );
      if (response.status === 200) {
        setPayments(
          payments.filter((payment) => payment._id !== paymentToDelete)
        );
        setShowModal(false);
        setPaymentToDelete(null);
      }
    } catch (error) {
      setError('Failed to delete payment.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (_id) => {
    setPaymentToDelete(_id);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setPaymentToDelete(null);
  };

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setActivePage(pageNumber);
  };

  // Calculate displayed payments
  const indexOfLastPayment = activePage * itemsPerPage;
  const indexOfFirstPayment = indexOfLastPayment - itemsPerPage;
  const currentPayments = payments.slice(
    indexOfFirstPayment,
    indexOfLastPayment
  );

  return (
    <div className="tenant-payment-list">
      {error && <span className="error-message">{error}</span>}
      <h2>{tenant?.name} Payment History</h2>
      <table>
        <thead>
          <tr>
            <th>Month</th>
            <th>Rent</th>
            <th>Water Bill</th>
            <th>Garbage Fee</th>
            <th>Extra Bills</th>
            <th>Total Amount</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentPayments.map((payment) => (
            <tr key={payment?._id}>
              <td>{payment?.month + ', ' + payment?.year}</td>
              <td>{payment?.rent?.amount || 'None'}</td>
              <td>{payment?.waterBill?.amount || 'None'}</td>
              <td>{payment?.garbageFee?.amount || 'None'}</td>
              <td>{payment?.extraCharges?.amount || 'None'}</td>
              <td>{payment?.totalAmountPaid || 'None'}</td>
              <td>
                <Link to="/paymentDetails" state={{ payment, onEntryOverPay }}>
                  <button>View Details</button>
                </Link>
                <MdDeleteForever
                  size={25}
                  color={'red'}
                  className="paymentRecordDeletebtn"
                  onClick={() => handleOpenModal(payment?._id)}
                />
                <br />
                <br />
                {payment?.paymentHistory &&
                  payment?.paymentHistory?.length > 0 && (
                    <button onClick={() => handleViewMiniPayments(payment)}>
                      MiniPayments
                    </button>
                  )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showPopup && selectedPayment && (
        <MiniPaymentsPopup
          payment={selectedPayment}
          onClose={handleClosePopup}
        />
      )}

      {showModal && (
        <div className="confirmation-modal">
          <div className="modal-content">
            <p>Are you sure you want to delete this payment record?</p>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={handleCloseModal}>
                Cancel
              </button>
              <button
                className="confirm-btn"
                onClick={handleDeletePaymentDetail}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="loader-overlay">
          <InfinitySpin
            height="100"
            width="100"
            color="#4fa94d"
            ariaLabel="loading"
            visible={true}
          />
        </div>
      )}

      {/* Pagination component */}
      <div className="pagination">
        <Pagination
          activePage={activePage}
          itemsCountPerPage={itemsPerPage}
          totalItemsCount={payments.length}
          pageRangeDisplayed={5}
          onChange={handlePageChange}
          innerClass="pagination"
          linkClass="page-link"
          activeLinkClass="active"
          previousLabel={<span className="arrow">&#9664;</span>} // Left arrow
          nextLabel={<span className="arrow">&#9654;</span>} // Right arrow
          firstLabel="First"
          lastLabel="Last"
          previousClass="arrow"
          nextClass="arrow"
        />
      </div>
    </div>
  );
};

export default TenantPaymentList;
