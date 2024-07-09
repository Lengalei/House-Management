import React from 'react'
import Navbar from '../Navbar/Navbar'
import Sidebar from '../sidebar/Sidebar'
import "./Admin.css";

function Admin() {
  return (
    <div>
      <Navbar />
      <div className="admin">
        <Sidebar />

        <div className="profile-details">
          <div className="personalinfo">
            <h2 className="h2">Personal Information</h2>

            
          </div>

          <div className="change-password">
            <div className="forminput">
              <label htmlFor="currentPassword">
                Current Password<span>*</span>
              </label>
              <input type="password" id="name" name="currentPassword" />
            </div>
            <div className="forminput">
              <label htmlFor="currentPassword">
                New Password<span>*</span>
              </label>
              <input type="password" id="name" name="currentPassword" />
            </div>
            <div className="forminput">
              <label htmlFor="currentPassword">
                Confirm Password<span>*</span>
              </label>
              <input type="password" id="name" name="currentPassword" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin
