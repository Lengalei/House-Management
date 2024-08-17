import React, { useState } from "react";
import "./TaxPayment.css";

const TaxPayment = () => {
  const [rent, setRent] = useState("");
  const [date, setDate] = useState("");
  const [tax, setTax] = useState("");

  const handleRentChange = (e) => {
    const rentValue = e.target.value;
    setRent(rentValue);
    setTax((rentValue * 0.075).toFixed(2));
  };

  const handleDateChange = (e) => {
    setDate(e.target.value);
  };

  const monthName = new Date(date).toLocaleString("default", { month: "long" });
   const handleSubmit = () => {
     const monthName = new Date(date).toLocaleString("default", {
       month: "long",
     });
     addPayment({ date, month: monthName, rent, tax });
     history.push("/paymenthistory");
   };

  return (
    <div className="tax-payment-container">
      <h2 className="month-heading">
        Payment for the month of {monthName || "..."}
      </h2>
      <div className="input-group">
        <label>Total Rents Obtained:</label>
        <input
          type="number"
          value={rent}
          onChange={handleRentChange}
          placeholder="Enter total rents obtained"
        />
      </div>
      <div className="input-group">
        <label>Date:</label>
        <input type="date" value={date} onChange={handleDateChange} />
      </div>
      <div className="input-group">
        <label>Tax Paid (7.5%):</label>
        <input
          type="text"
          value={tax}
          readOnly
          placeholder="Tax will be calculated automatically"
        />
      </div>
      <button onClick={handleSubmit} className="btn">
        Enter
      </button>
    </div>
  );
};

export default TaxPayment;
