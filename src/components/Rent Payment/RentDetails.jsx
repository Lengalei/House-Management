import React from 'react'

function RentDetails() {
  return (
    <div className="rent">
      <div className="form">
        <h2>Rent Records</h2>
        <form action="">
          <div className="forminput">
            <label htmlFor="Monthly Rent">Monthly Rent</label>
            <input type="number" name="Monthly Rent" />
          </div>
          <div className="forminput">
            <label htmlFor="Extra Bills">Extra Bills</label>
            <input type="number" name="Extra Bills" />
          </div>
          <div className="forminput">
            <label htmlFor="Total">Total Amount</label>
            <input type="number" name="Total" />
          </div>
        </form>
      </div>
      <div className="form">
        <h2>Payment Records</h2>
        <form action="">
          <div className="forminput">
            <label htmlFor="Monthly Rent">Amount Paid</label>
            <input type="number" name="Monthly Rent" />
          </div>
          <div className="forminput">
            <label htmlFor="Extra Bills">Balance</label>
            <input type="number" name="Extra Bills" />
          </div>

          <button className='btn'>Enter</button>
        </form>
      </div>
    </div>
  );
}

export default RentDetails
