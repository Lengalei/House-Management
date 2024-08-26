import { Link } from 'react-router-dom';
import './TaxPaymentHistory.css';
import { useEffect, useState } from 'react';
import apiRequest from '../../lib/apiRequest';

const TaxPaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false); // State for modal visibility
  const [paymentToDelete, setPaymentToDelete] = useState(null); // State for selected payment

  useEffect(() => {
    const fetchAllKra = async () => {
      try {
        const response = await apiRequest.get('/kra/allKra');
        if (response.status === 200) {
          setPayments(response.data);
        }
      } catch (error) {
        setError(error.response.data.message);
      }
    };
    fetchAllKra();
  }, []);

  // Function to convert the payment date to local time
  const convertToLocalDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(); // Converts to local date string format
  };

  const handleTaxDelete = async (_id) => {
    try {
      const response = await apiRequest.delete(`/kra/deleteKraRecord/${_id}`);
      if (response.status === 200) {
        setPayments(payments.filter((payment) => payment._id !== _id));
        setShowModal(false); // Close modal on successful deletion
      }
    } catch (error) {
      setError(error.response.data.message);
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
    <div className="maintaxbox">
      <div className="tax-payment-history-container">
        {error && <span>{error}</span>}
        <h2>Tax Payment History</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Month</th>
              <th>Total Rents Obtained</th>
              <th>Tax Paid</th>
              <th>Reference No</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments?.map((payment, index) => (
              <tr key={index}>
                <td>{convertToLocalDate(payment.date)}</td>
                <td>{payment.month}</td>
                <td>{payment.rent}</td>
                <td>{payment.tax}</td>
                <td>{payment.referenceNo}</td>
                <td>
                  <button onClick={() => handleOpenModal(payment._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Link to="/taxpayment" className="back-button">
          Back to Tax Payment
        </Link>
        {showModal && (
          <div className="confirmation-modal">
            <div className="modal-content">
              <p>Are you sure you want to delete this record?</p>
              <div className="modal-actions">
                <button className="cancel-btn" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button
                  className="confirm-btn"
                  onClick={() =>
                    paymentToDelete && handleTaxDelete(paymentToDelete)
                  }
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaxPaymentHistory;
