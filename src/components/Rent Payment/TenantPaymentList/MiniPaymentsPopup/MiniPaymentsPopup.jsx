/* eslint-disable react/prop-types */
// src/components/MiniPaymentsPopup.jsx
import { useState } from 'react';
import './MiniPaymentsPopup.scss';

const MiniPaymentsPopup = ({ payment, onClose }) => {
  console.log('miniPayment: ', payment);
  const [currentPage, setCurrentPage] = useState(1);
  const paymentsPerPage = 5;

  // Pagination calculations
  const indexOfLastPayment = currentPage * paymentsPerPage;
  const indexOfFirstPayment = indexOfLastPayment - paymentsPerPage;
  const currentPayments = payment.paymentHistory.slice(
    indexOfFirstPayment,
    indexOfLastPayment
  );

  const totalPages = Math.ceil(payment.paymentHistory.length / paymentsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="mini-payments-popup">
      <div className="popup-content">
        <button className="closeBtnPopup" onClick={onClose}>
          Close
        </button>
        <div className="card-container">
          <div className="left-card">
            {currentPayments.map((miniPayment, index) => (
              <div className="payment-card" key={index}>
                <div>
                  Date: {new Date(miniPayment.timestamp).toLocaleDateString()}
                </div>
                <div>Amount: {miniPayment.amount}</div>
              </div>
            ))}
          </div>
          <div className="right-card">
            <button onClick={() => alert('Generate Invoice')}>
              Generate Invoice
            </button>
            <button onClick={() => alert('Generate Receipt')}>
              Generate Receipt
            </button>
          </div>
        </div>
        <div className="pagination">
          {[...Array(totalPages).keys()].map((page) => (
            <button
              key={page + 1}
              onClick={() => handlePageChange(page + 1)}
              className={currentPage === page + 1 ? 'active' : ''}
            >
              {page + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MiniPaymentsPopup;
