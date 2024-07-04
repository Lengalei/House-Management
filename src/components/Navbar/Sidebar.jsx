import React from "react";
import "./Navbar.css";
import { Link } from "react-router-dom";

const Sidebar = () => {
    
  return (
    <div className="sidebar">
      <div className="overview">
        <div className="h2">Overview</div>
        <hr className="h" />
        <Link to="dashboard" className="dash">
          {" "}
          Dashboard{" "}
        </Link>
        <Link to="dashboard" className="dash">
          {" "}
          Notifications
        </Link>
        <Link to="dashboard" className="dash">
          {" "}
          Messages{" "}
        </Link>
      </div>

      <div className="management">
        <h4 className="h2">Manage Property</h4>
        <hr className="h" />
        <Link to="dashboard" className="dash">
          {" "}
          Tenants
        </Link>
        <Link to="dashboard" className="dash">
          {" "}
          Landlords
        </Link>
        <Link to="dashboard" className="dash">
          {" "}
          Asign House
        </Link>
        <Link to="dashboard" className="dash">
          {" "}
          Add Landlord
        </Link>
      </div>
      <div className="management">
        <h4 className="h2">Your Details</h4>
        <hr className="h" />
        <Link to="dashboard" className="dash">
          {" "}
          Personal Information
        </Link>
        <Link to="dashboard" className="dash">
          {" "}
          Change Password
        </Link>
        <Link to="dashboard" className="dash">
          {" "}
          Profile Settings
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
