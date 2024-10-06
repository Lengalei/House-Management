import React from 'react'

function TopSumarry() {
  return (
    <div className="topSummary">
      <div className="summaryCard">
        <div className="currentTotal">
          <div>
            <h3>24</h3> / 24<h3></h3>
          </div>
          <div className="glassy"></div>
        </div>
        <div className="details">
          <p>Houses Registered</p>
        </div>
      </div>
      <div className="summaryCard">
        <div className="currentTotal c2">
          <div>
            <h3>2</h3>
          </div>
          <div className="glassy"></div>
        </div>
        <div className="details">
          <p>Total Appartments</p>
        </div>
      </div>
      <div className="summaryCard">
        <div className="currentTotal">
          <div>
            {" "}
            <h3>2400000</h3>
          </div>

          <div className="glassy"></div>
        </div>
        <div className="details">
          <p>Total Earnings</p>
        </div>
      </div>
      <div className="summaryCard">
        <div className="currentTotal c2">
          <div>
            <h3>24</h3>
          </div>
          <div className="glassy"></div>
        </div>
        <div className="details">
          <p>Active Tenants</p>
        </div>
      </div>
    </div>
  );
}

export default TopSumarry