import React from "react";
import "./GreyList.css";
import { Link } from "react-router-dom";
import { FaTrashAlt } from "react-icons/fa";

const GreyList = () => {
  const tenants = [
    {
      _id: 1,
      name: "John Doe",
      phoneNumber: "555-1234",
      houseNumber: "2B",
      amountPaid: "1,200",
    },
    {
      _id: 2,
      name: "Jane Smith",
      phoneNumber: "555-5678",
      houseNumber: "1A",
      amountPaid: "950",
    },
    {
      _id: 3,
      name: "David Johnson",
      phoneNumber: "555-8765",
      houseNumber: "6C",
      amountPaid: "1,500",
    },
    {
      _id: 4,
      name: "Emily Davis",
      phoneNumber: "555-4321",
      houseNumber: "4D",
      amountPaid: "1,100",
    },
  ];

  const handleDelete = async (_id) => {
    setLoading(true);
    try {
      const res = await apiRequest.delete(`/tenants/deleteTenant/${_id}`);
      if (res.status === 200) {
        dispatch(setTenants(tenants.filter((tenant) => tenant._id !== _id)));
      } else {
        console.error("Failed to delete tenant");
      }
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="tenant-table-container">
      <h2>Grey List</h2>
      <table className="tenant-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone Number</th>
            <th>House Number</th>
            <th>Amount Paid</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tenants.map((tenant, index) => (
            <tr key={index}>
              <td>{tenant.name}</td>
              <td>{tenant.phoneNumber}</td>
              <td>{tenant.houseNumber}</td>
              <td>{tenant.amountPaid}</td>
              <td className="actions">
                        <Link
                          
                          className="edit-btn"
                        >
                          Edit Payment
                        </Link>
                        <button
                          onClick={() => handleDelete(tenant._id)}
                          className="delete-btn"
                        >
                          <FaTrashAlt />
                        </button>
                        </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GreyList;
