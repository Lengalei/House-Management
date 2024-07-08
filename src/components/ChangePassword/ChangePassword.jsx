import React from 'react'
import Navbar from '../Navbar/Navbar'
import Sidebar from '../sidebar/Sidebar'

function ChangePassword() {
  return (
    <div>
      <Navbar/>

      <div className="changePassword">
        <Sidebar/>

        <div className="password">
            <div className="form">
            <h2 className="h2">Change Your Password</h2>
            <form action="">
              <div className="forminput">
                <label htmlFor="currentPassword">
                  Name <span>*</span>
                </label>
                <input type="password" id="name" name="currentPassword" />
              </div>
              <div className="forminput">
                <label htmlFor="currentPassword">
                  Name <span>*</span>
                </label>
                <input type="password" id="name" name="currentPassword" />
              </div>
              <div className="forminput">
                <label htmlFor="currentPassword">
                  Name <span>*</span>
                </label>
                <input type="password" id="name" name="currentPassword" />
              </div>
              </form>
            </div>
        </div>
      </div>
    </div>
  )
}

export default ChangePassword
