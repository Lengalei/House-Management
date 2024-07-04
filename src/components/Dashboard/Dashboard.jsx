import React from 'react'
import Navbar from '../Navbar/Navbar'
import Sidebar from '../Navbar/Sidebar'
import { FaHouseUser } from "react-icons/fa";
import "./Dashboard.css";

function Dashboard() {
  return (
    <div>
      <Navbar />
      <div className="summary">
        <Sidebar />
        <div className="dashboardcontent">
          <div className="dashboardheading">
            <h1>Dashboard</h1>
            <p>Welcome to your dashboard</p>
          </div>

          <div className="container-info">
            <div className="box">
              <FaHouseUser
                size={80}
                color="var(--primary-color)"
                className="fa"
              />
              <p>40 Total house</p>
            </div>
            <div className="box">
              <FaHouseUser
                size={80}
                color="var(--primary-color)"
                className="fa"
              />
              <p>40 Total house</p>
            </div>
            <div className="box">
              <FaHouseUser
                size={80}
                color="var(--primary-color)"
                className="fa"
              />
              <p>40 Total house</p>
            </div>
            <div className="box">
              <FaHouseUser
                size={80}
                color="var(--primary-color)"
                className="fa"
              />
              <p>40 Total house</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard
