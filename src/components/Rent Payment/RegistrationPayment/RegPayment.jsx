import React, { useState } from "react";
import "./RegPayment.css";

const RegPayment = () => {
  const [rentDeposit, setRentDeposit] = useState("");
  const [waterDeposit, setWaterDeposit] = useState("");
  const [houseNo, setHouseNo] = useState("");

  const handleFinish = () => {
    // Handle the finish action here
    console.log("Rent Deposit:", rentDeposit);
    console.log("Water Deposit:", waterDeposit);
    console.log("House No:", houseNo);
  };

  return (
    <div className="reg-payment-container">
      <h2>Registration Payment</h2>
      <form>
        <div className="form-group">
          <label htmlFor="rentDeposit">Rent Deposit:</label>
          <input
            type="number"
            id="rentDeposit"
            value={rentDeposit}
            onChange={(e) => setRentDeposit(e.target.value)}
            placeholder="Enter rent deposit"
          />
        </div>
        <div className="form-group">
          <label htmlFor="waterDeposit">Water Deposit:</label>
          <input
            type="number"
            id="waterDeposit"
            value={waterDeposit}
            onChange={(e) => setWaterDeposit(e.target.value)}
            placeholder="Enter water deposit"
          />
        </div>
        <div className="form-group">
          <label htmlFor="houseNo">House No:</label>
          <input
            type="text"
            id="houseNo"
            value={houseNo}
            onChange={(e) => setHouseNo(e.target.value)}
            placeholder="Enter house number"
          />
        </div>
        <button type="button" className="finish-button" onClick={handleFinish}>
          Finish
        </button>
      </form>
    </div>
  );
};

export default RegPayment;
