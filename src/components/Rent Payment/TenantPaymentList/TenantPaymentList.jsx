import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import './TenantPaymentList.scss';
import { MdDeleteForever } from 'react-icons/md';
import apiRequest from '../../../lib/apiRequest';
import MiniPaymentsPopup from './MiniPaymentsPopup/MiniPaymentsPopup';

const TenantPaymentList = () => {
  const { tenantId } = useParams();
  const [payments, setPayments] = useState([]);
  const [onEntryOverPay, setOnEntryOverPay] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showModal, setShowModal] = useState(false); // State for modal visibility
  const [paymentToDelete, setPaymentToDelete] = useState(null); // State for selected payment for deletion
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await apiRequest.get(
          `/payments/paymentsByTenant/${tenantId}`
        );
        setPayments(response.data.payments);
        setOnEntryOverPay(response.data.onEntryOverPay);
      } catch (error) {
        setError('Failed to fetch payments.');
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
    try {
      const response = await apiRequest.delete(
        `/payments/deletePayment/${paymentToDelete}`
      );
      if (response.status === 200) {
        setPayments(
          payments.filter((payment) => payment._id !== paymentToDelete)
        );
        setShowModal(false); // Close modal on successful deletion
        setPaymentToDelete(null);
      }
    } catch (error) {
      setError('Failed to delete payment.');
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

  return (
    <div className="tenant-payment-list">
      {error && <span className="error-message">{error}</span>}
      <h2>Tenant Payment History</h2>
      <table>
        <thead>
          <tr>
            <th>Month</th>
            <th>Rent</th>
            <th>Water Bill</th>
            <th>Garbage Fee</th>
            <th>Extra Bills</th>
            <th>Total Amount</th>
            <th>Amount Paid</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr key={payment._id}>
              <td>{new Date(payment.date).toLocaleDateString()}</td>
              <td>{payment.rent}</td>
              <td>{payment.waterBill}</td>
              <td>{payment.garbageFee}</td>
              <td>{payment.extraBills}</td>
              <td>{payment.totalAmount}</td>
              <td>{payment.amountPaid}</td>
              <td>
                <Link to="/paymentDetails" state={{ payment, onEntryOverPay }}>
                  <button>View Details</button>
                </Link>
                <MdDeleteForever
                  size={20}
                  color={'red'}
                  className="paymentRecordDeletebtn"
                  onClick={() => handleOpenModal(payment._id)}
                />
                <br />
                <br />
                {payment.paymentHistory &&
                  payment.paymentHistory.length > 0 && (
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
    </div>
  );
};

export default TenantPaymentList;
