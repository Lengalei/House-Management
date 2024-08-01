// src/components/TenantPaymentList.jsx
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import './TenantPaymentList.scss';
import apiRequest from '../../../lib/apiRequest';
import MiniPaymentsPopup from './MiniPaymentsPopup/MiniPaymentsPopup';

const TenantPaymentList = () => {
  const { tenantId } = useParams();
  const [payments, setPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await apiRequest.get(
          `/payments/paymentsByTenant/${tenantId}`
        );
        console.log('TenantPayments: ', response.data);
        setPayments(response.data);
      } catch (error) {
        console.error('Error fetching payments:', error);
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

  return (
    <div className="tenant-payment-list">
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
            {/* <th>Balance</th> */}
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
              {/* <td>{payment.balance}</td> */}
              <td>
                <Link to="/paymentDetails" state={{ payment }}>
                  <button> View Details</button>
                </Link>
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
    </div>
  );
};

export default TenantPaymentList;
