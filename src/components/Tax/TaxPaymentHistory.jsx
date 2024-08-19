import React from "react";
import { Link } from "react-router-dom";
import "./TaxPayment.css";

const TaxPaymentHistory = () => {
  const payments = [
    {
      date: "2024-08-01",
      month: "August",
      rent: "12,000",
      tax: "900",
    },
    {
      date: "2024-07-01",
      month: "July",
      rent: "11,500",
      tax: "862.50",
    },
    {
      date: "2024-06-01",
      month: "June",
      rent: "10,800",
      tax: "810",
    },
    {
      date: "2024-05-01",
      month: "May",
      rent: "11,000",
      tax: "825",
    },
  ];

  return (
    <div className="tax-payment-history-container">
      <h2>Tax Payment History</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Month</th>
            <th>Total Rents Obtained</th>
            <th>Tax Paid</th>
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
