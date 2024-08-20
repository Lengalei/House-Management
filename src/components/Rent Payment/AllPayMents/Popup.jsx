/* eslint-disable react/prop-types */
import { useState } from 'react';
import { FaCheckCircle, FaTimes, FaTimesCircle } from 'react-icons/fa';
import Pagination from 'react-js-pagination';
import './Popup.scss'; // Add your Popup styling

const Popup = ({ payments, onClose }) => {
  const [activePage, setActivePage] = useState(1);
  const itemsPerPage = 5;

  const handlePageChange = (pageNumber) => {
    setActivePage(pageNumber);
  };

  const displayedPayments = payments.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage
  );

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <button className="close-button" onClick={onClose}>
          <FaTimes />
        </button>
        <h2>{displayedPayments[0].tenantId?.name} Payments Details</h2>
        <div className="popup-payments-list">
          {displayedPayments.map((payment) => (
            <div className="payment-mini-card" key={payment._id}>
              <div className="mini-card-header">
                <p>Date: {new Date(payment.date).toLocaleDateString()}</p>
                <p>Total Amount: {payment.totalAmount.toLocaleString()}</p>
                <p>
                  Status:{' '}
                  {payment.isCleared ? (
                    <FaCheckCircle className="icon success" />
                  ) : (
                    <FaTimesCircle className="icon failure" />
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
        <Pagination
          activePage={activePage}
          itemsCountPerPage={itemsPerPage}
          totalItemsCount={payments.length}
          pageRangeDisplayed={5}
          onChange={handlePageChange}
          itemClass="page-item"
          linkClass="page-link"
        />
      </div>
    </div>
  );
};

export default Popup;
