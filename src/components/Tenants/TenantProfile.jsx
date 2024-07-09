import React from 'react'
import Navbar from '../Navbar/Navbar'
import Sidebar from '../sidebar/Sidebar'
import { MdDelete } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import { CgPlayListRemove } from "react-icons/cg";
import { MdOutlineNotListedLocation } from "react-icons/md";
import { GiHazardSign } from "react-icons/gi";

function TenantProfile() {
  return (
    <div className="TenantProfile">
      <Navbar />

      <div className="summary2">
        <Sidebar />

        <div className="profile">
          <div className="personal-details">
            <div className="user">
              <div className="profile-image">
                <img src="/profile1.jfif" alt="profile" />
              </div>

              <div className="userinfo">
                <h3>Linda Kamau</h3>
                <p>Tenant Id: 1</p>
                <p> Joining Date: 24-06-2024 </p>
              </div>
            </div>
            <div className="user-details">
              <p>Phone : 078129324</p>
              <p>Email : linda@gmail.com</p>
              <p>Age : 23</p>
              <p>Address</p>
            </div>
          </div>

          <div className="payment">
            <div className="payment-details">
              <h3>Current Balance</h3>
              <div className="dets">
                <p>Amount</p>
                <p>0</p>
              </div>
            </div>
            <div className="payment-details">
              <h3>Emergency Contact</h3>
              <div className="dets">
                <p>Name: Jane</p>
                <p>Contact: 1234</p>
              </div>
            </div>
          </div>

          <div className="deposits">
            <div className="payment-details">
              <h3>Tenant's Deposits</h3>
              <table className="tenant-table">
                <thead>
                  <tr>
                    <th>Deposits</th>
                    <th>Amount</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td>Rent Deposit</td>
                    <td>12000</td>
                  </tr>
                  <tr>
                    <td>Water Deposit</td>
                    <td>2500</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="payment-details">
              <GiHazardSign size={70} color="red" />
              <div className="details-container">
                <p>Delete Tenant</p>{" "}
                <button>
                  <MdDelete size={20} color="red" />
                </button>
              </div>
              <div className="details-container">
                <p>Edit Tenant</p>{" "}
                <button>
                  <FaEdit size={20} color="var(--primary-color)" />
                </button>
              </div>
              <div className="details-container">
                <p>Blacklist Tenant</p>{" "}
                <button>
                  <CgPlayListRemove size={20} color="black" />
                </button>
              </div>
              <div className="details-container">
                <p>Whitelist Tenant</p>{" "}
                <button>
                  <MdOutlineNotListedLocation size={20} color="var(--yellow)" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TenantProfile
