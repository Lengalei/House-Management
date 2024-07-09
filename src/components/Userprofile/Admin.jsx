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
                <div className="profile2">
                    <div className="admin-image">
                        <img src="/profile3.jfif" alt="" />
                    </div>
                    <div className="buttons">
                        <button className='btn'>Upload Image</button>
                        <button className='btn'>Delete Photo</button>
                    </div>

                    <div className="admin-details">
                        <p>Name: John Hariet</p>
                        <p>Email: johnhariet@gmail.com</p>
                        <p>Role : Admin </p>
                    </div>
                </div>

          </div>

          <div className="change-password">
            <h2 className="h2">Change Your Password</h2>
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
