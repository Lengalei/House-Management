// src/components/PaymentDetailsPage.jsx
import { useLocation } from 'react-router-dom';
import './PaymentDetailsPage.scss';

const PaymentDetailsPage = () => {
  const location = useLocation();
  const paymentDetails = location.state?.payment || {};
  console.log('paymentDetails: ', paymentDetails);

  return (
    <div className="payment-details-page">
      {paymentDetails ? (
        <div className="cards-container">
          <div className="left-card">
            <div className="minicard payment-details">
              <h3>Payment Details</h3>
              <p>Month: {new Date(paymentDetails.date).toLocaleDateString()}</p>
              <p>Rent: {paymentDetails.rent}</p>
              <p>Water Bill: {paymentDetails.waterBill}</p>
              <p>Garbage Fee: {paymentDetails.garbageFee}</p>
              <p>Extra Bills: {paymentDetails.extraBills}</p>
              <p>Total Amount: {paymentDetails.totalAmount}</p>
              <hr />
              <p>Amount Paid: {paymentDetails.amountPaid}</p>
              <p>previous Excess Pay : {paymentDetails.previousExcessPay}</p>

              <p>Current Excess Pay : {paymentDetails.excessPay}</p>
              <p>previous Balance: {paymentDetails.previousBalance}</p>
              <p>Balance: {paymentDetails.balance}</p>
            </div>
            <div className="minicard payment-maker">
              <h3>Payment Maker</h3>
              <p>Name: {paymentDetails.tenantId.name}</p>
              <hr />
              <p>Email: {paymentDetails.tenantId.email}</p>
            </div>
          </div>
          <div className="right-card">
            <h3>Advanced</h3>
            <div className="button-container">
              <button className="generate-invoice">Generate Invoice</button>
              <button className="generate-receipt">Generate Receipt</button>
            </div>
          </div>
        </div>
      ) : (
        <p>Loading payment details...</p>
      )}
    </div>
  );
};

export default PaymentDetailsPage;
