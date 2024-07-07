import React from "react";
import { Link } from "react-router-dom";
import { FaTrashAlt } from "react-icons/fa";
import Navbar from "../Navbar/Navbar";
import Sidebar from "../sidebar/Sidebar";

const ListAll = () => {
  const tenants = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      phone: "123-456-7890",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "234-567-8901",
    },
    {
      id: 3,
      name: "Bob Johnson",
      email: "bob@example.com",
      phone: "345-678-9012",
    },
    {
      id: 4,
      name: "Alice Brown",
      email: "alice@example.com",
      phone: "456-789-0123",
    },
    {
      id: 5,
      name: "Tom White",
      email: "tom@example.com",
      phone: "567-890-1234",
    },
    {
      id: 6,
      name: "Mary Green",
      email: "mary@example.com",
      phone: "678-901-2345",
    },
    {
      id: 7,
      name: "James Black",
      email: "james@example.com",
      phone: "789-012-3456",
    },
    {
      id: 8,
      name: "Patricia Williams",
      email: "patricia@example.com",
      phone: "890-123-4567",
    },
    {
      id: 9,
      name: "Michael Scott",
      email: "michael@example.com",
      phone: "901-234-5678",
    },
    {
      id: 10,
      name: "Linda Martinez",
      email: "linda@example.com",
      phone: "012-345-6789",
    },
    // Add more tenants as needed
  ];

  const handleDelete = (id) => {
    // Logic to delete tenant by id
    console.log(`Delete tenant with id: ${id}`);
  };

  return (
    <div className="list-all">
      <Navbar />
      <div className="summary2">
        <Sidebar />

        <div className="tenantslist">
          <h2 className="title">Tenants List</h2>
          <div className="table-container">
            <table className="tenant-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((tenant) => (
                  <tr key={tenant.id}>
                    <td>{tenant.name}</td>
                    <td>{tenant.email}</td>
                    <td>{tenant.phone}</td>
                    <td className="actions">
                      <Link
                        to={`/edit-tenant/${tenant.id}`}
                        className="edit-btn"
                      >
                        Edit Details
                      </Link>
                      <button
                        onClick={() => handleDelete(tenant.id)}
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
        </div>
      </div>
    </div>
  );
};

export default ListAll;
