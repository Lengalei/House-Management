import { useState } from 'react';
import ReactPaginate from 'react-js-pagination';
import './AdminPage.scss';

const AdminPage = () => {
  const [admins, setAdmins] = useState([
    { id: 1, name: 'Randy Septimus', email: 'abcd@email.com', role: 1 },
    { id: 2, name: 'Mira Donin', email: 'abcd@email.com', role: 4 },
    { id: 3, name: 'Charlie Bator', email: 'abcd@email.com', role: 6 },
    { id: 4, name: 'Charlie Bator', email: 'abcd@email.com', role: 6 },
    { id: 5, name: 'Charlie Bator', email: 'abcd@email.com', role: 6 },
    // Add more dummy data as necessary
  ]);
  const [showPopup, setShowPopup] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const itemsPerPage = 6;

  const handlePageChange = (pageNumber) => {
    setActivePage(pageNumber);
  };

  const handleAddAdmin = () => {
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  return (
    <div className="admin-container">
      <div className="header">
        <h2>Manage Admins</h2>
        <button className="add-btn" onClick={handleAddAdmin}>
          Add Admin
        </button>
      </div>

      <div className="table-container">
        <table className="user-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Profile</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins
              .slice((activePage - 1) * itemsPerPage, activePage * itemsPerPage)
              .map((admin, index) => (
                <tr key={admin.id}>
                  <td>{(activePage - 1) * itemsPerPage + index + 1}</td>
                  <td>{admin.name}</td>
                  <td>{admin.email}</td>
                  <td>{admin.role}</td>
                  <td>
                    <button className="edit-btn">Edit</button>
                    <button className="delete-btn">Delete</button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <ReactPaginate
          activePage={activePage}
          itemsCountPerPage={itemsPerPage}
          totalItemsCount={admins.length}
          pageRangeDisplayed={5}
          onChange={handlePageChange}
          itemClass="page-item"
          linkClass="page-link"
        />
      </div>

      {/* Add Admin Popup */}
      {showPopup && (
        <div className="popup-overlay">
          <button className="close-btn" onClick={closePopup}>
            Close
          </button>
          <div className="popup">
            <h3>Add Admin</h3>
            <form className="admin-form">
              <div className="form-group">
                <label>Name</label>
                <input type="text" placeholder="Enter name" />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" placeholder="Enter email" />
              </div>
              <div className="form-group">
                <label>Role</label>
                <input type="number" placeholder="Enter role" />
              </div>
              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  Add
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={closePopup}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
