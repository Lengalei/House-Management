import React from "react";
import { Link } from "react-router-dom";


const TaxPaymentHistory = ({ payments }) => {
  return (
    <div className="tax-payment-history-container">
      <h2>Tax Payment History</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Month</th>
            <th>Total Rents Obtained</th>
            <th>Tax Paid (7.5%)</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment, index) => (
            <tr key={index}>
              <td>{payment.date}</td>
              <td>{payment.month}</td>
              <td>{payment.rent}</td>
              <td>{payment.tax}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Link to="/taxpayment" className="back-button">
        Back to Tax Payment
      </Link>
    </div>
  );
};

export default TaxPaymentHistory;
