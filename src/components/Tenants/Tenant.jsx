import React from 'react'
import "./Tenant.css";
import Navbar from '../Navbar/Navbar';
import Sidebar from '../Navbar/Sidebar';

function Tenant() {
  return (
    <div>
      <Navbar />
      <div className="tenant">
        <Sidebar />

        <div className="registration">
          <h3>Input Tenant's details to register</h3>
          <div className="form">
            <form action="">
              <div className="forminput">
                <label htmlFor="Name">
                  Name <span>*</span>
                </label>
                <input type="text" id="Name" name="Name" />
              </div>
              <div className="forminput">
                <label htmlFor="email">
                  Email <span>*</span>
                </label>
                <input type="email" id="email" />
              </div>
              <div className="forminput">
                <label htmlFor="Company">
                  Tenant ID<span>*</span>
                </label>
                <input type="text" id="company" />
              </div>
              <div className="forminput">
                <label htmlFor="subject">
                  Phone No<span>*</span>
                </label>
                <input type="text" id="subject" />
              </div>
              <div className="forminput">
                <label htmlFor="subject">
                  Placement Date<span>*</span>
                </label>
                <input type="text" id="subject" />
              </div>
              <div className="forminput">
                <label htmlFor="subject">
                  House Deposit<span>*</span>
                </label>
                <input type="text" id="subject" />
              </div>
              <div className="forminput">
                <label htmlFor="subject">
                  House No<span>*</span>
                </label>
                <input type="text" id="subject" />
              </div>
              <div className="forminput">
                <label htmlFor="subject">
                  Rent Payable<span>*</span>
                </label>
                <input type="text" id="subject" />
              </div>
              <div>
                <button className="btn">Register</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Tenant
