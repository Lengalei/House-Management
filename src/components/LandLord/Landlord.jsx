import React from 'react'
import './Landlord.css'
import "../Tenants/Tenant.css";
import Navbar from '../Navbar/Navbar'
import Sidebar from '../sidebar/Sidebar'

function Landlord() {
  return (
    <div className="landLord">
      <Navbar />
      <div className="listLandLord">
        <Sidebar />
        <div className="regitration">
          <h3>Enter Landlord's Details</h3>
          <div className="form">
            <form action="">
              <div className="forminput">
                <label htmlFor="name">
                  Name <span>*</span>
                </label>
                <input type="text" id="name" name="name" />
              </div>
              <div className="forminput">
                <label htmlFor="Email">
                  Email <span>*</span>
                </label>
                <input type="Email" id="Email" name="Email" />
              </div>
              <div className="forminput">
                <label htmlFor="phoneNo">
                  phoneNo <span>*</span>
                </label>
                <input type="number" id="phoneNo" name="phoneNo" />
              </div>
              <div className="forminput">
                <label htmlFor="nationalId">
                  IdNo <span>*</span>
                </label>
                <input type="number" id="nationalId" name="nationalId" />
              </div>
              <div className="forminput">
                <label htmlFor="placementDate">
                  Placement Date<span>*</span>
                </label>
                <input type="date" id="placementDate" name="placementDate" />
              </div>
              <div className="forminput">
                <label htmlFor="houseNo">
                  House No. <span>*</span>
                </label>
                <input type="text" id="houseNo" name="houseNo" />
              </div>

              <button className="btn">Register</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Landlord
