import { useEffect, useState } from 'react';
import ReactPaginate from 'react-js-pagination';
import './AdminPage.scss';
import apiRequest from '../../../lib/apiRequest';
import { FaTrashAlt, FaUser } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { TailSpin } from 'react-loader-spinner';

const AdminPage = () => {
  const [admins, setAdmins] = useState([
    { _id: 1, name: 'Randy Septimus', email: 'abcd@email.com', role: 1 },
    { _id: 2, name: 'Mira Donin', email: 'abcd@email.com', role: 4 },
    { _id: 3, name: 'Charlie Bator', email: 'abcd@email.com', role: 6 },
    // Add more dummy data as necessary
  ]);
  // console.log(admins);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [showPopup, setShowPopup] = useState(false);
  const [showClearancePopup, setShowClearancePopup] = useState(false); // New state for clearance popup
  const [activePage, setActivePage] = useState(1);
  const itemsPerPage = 6;

  // New state for paginating tenants in the clearance queue
  const [clearancePage, setClearancePage] = useState(1);
  const itemsPerPageForClearance = 5;

  const [toBeClearedTenants, setToBeClearedTenants] = useState([]);

  useEffect(() => {
    const fetchTBeClearedTenantTrue = async () => {
      const response = await apiRequest.get(
        `/v2/tenants/getToBeClearedTenantsTrue`
      );
      if (response.status) {
        setToBeClearedTenants(response.data);
      }
    };

    const fetchAdmins = async () => {
      try {
        const response = await apiRequest.get('/auth/getAdmins');
        if (response.status) {
          setAdmins(response.data);
          // toast.success('Success Fetching Admins');
        }
      } catch (error) {
        toast.error(error.response.data.message || 'Error Fetching Admins');
      }
    };
    fetchAdmins();
    fetchTBeClearedTenantTrue();
  }, []);

  const handlePageChange = (pageNumber) => {
    setActivePage(pageNumber);
  };

  const handleClearancePageChange = (pageNumber) => {
    setClearancePage(pageNumber);
  };

  const handleAddAdmin = () => {
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  const handleClearanceQueue = () => {
    setShowClearancePopup(true);
  };

  const closeClearancePopup = () => {
    setShowClearancePopup(false);
  };

  const [showConfirmDelete, setShowConfirmDelete] = useState(false); // State for Delete Confirmation
  const [showConfirmDeleteAdmin, setShowConfirmDeleteAdmin] = useState(false); // State for Delete Confirmation// State for Restore Confirmation
  const [selectedTenant, setSelectedTenant] = useState(null); // Store tenant selected for action (restore/delete)
  const [selectedAdmin, setSelectedAdmin] = useState(null); // Store tenant selected for action (restore/delete)

  const confirmDelete = (tenant) => {
    setSelectedTenant(tenant);
    setShowConfirmDelete(true);
  };
  const confirmDeleteAdmin = (tenant) => {
    setSelectedAdmin(tenant);
    setShowConfirmDeleteAdmin(true);
  };

  const closeConfirmDelete = () => {
    setShowConfirmDelete(false);
    setSelectedTenant(null);
    // handleDeleteTenant()
  };
  const closeConfirmDeleteAdmin = () => {
    setShowConfirmDeleteAdmin(false);
    setSelectedAdmin(null);
    //call function to delete admin
  };

  const handleDeleteTenant = async () => {
    if (selectedTenant) {
      setLoading(true);
      try {
        const response = await apiRequest.delete(
          `/v2/tenants/deleteTenant/${selectedTenant._id}`
        );

        if (response.status === 200) {
          toast.success('Tenant Deleted Successfully!');
          closeConfirmDelete();
          setToBeClearedTenants((prevTenants) =>
            prevTenants.filter((tenant) => tenant._id !== selectedTenant._id)
          );
        }
      } catch (error) {
        toast.error(error.response.data.message || 'Error Deleting Tenant!');
        console.error('Error deleting tenant:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleViewTenant = (tenant) => {
    navigate(`/tenantProfile/${tenant._id}`);
  };
  const handleEditAdmin = (admin) => {
    navigate(`/editAdmin/${admin._id}`, {
      state: admin,
    });
  };
  return (
    <div className="admin-container">
      <div className="header">
        <h2>Manage Admins</h2>
        <div className="adminButtons">
          <button className="add-btn" onClick={handleAddAdmin}>
            Add Admin
          </button>
          <button className="add-btn" onClick={handleClearanceQueue}>
            Clearance Queue
          </button>
        </div>
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
                <tr key={admin._id}>
                  <td>{(activePage - 1) * itemsPerPage + index + 1}</td>
                  <td>{admin.username}</td>
                  <td>{admin.email}</td>
                  <td>{admin.role}</td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => handleEditAdmin(admin)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => confirmDeleteAdmin(admin)}
                    >
                      <FaTrashAlt /> Delete
                    </button>
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
          <div className="popup">
            <div className="popup-header">
              <h3>Add Admin</h3>
              <button className="popup-close-btn" onClick={closePopup}>
                Close
              </button>
            </div>
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

      {/* Clearance Queue Popup */}
      {showClearancePopup && (
        <div className="clearance-popup-overlay">
          <div className="clearance-popup clearance-popup">
            <div className="clearance-popup-header">
              <div className="innerHeader">
                <h3>Clearance Queue.</h3>
                <h5>Below Tenants will dissapear in 48hrs</h5>
              </div>
              <button
                className="clearance-close-btn"
                onClick={closeClearancePopup}
              >
                X
              </button>
            </div>
            <table className="clearance-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>House No</th>
                  <th>Refund</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {toBeClearedTenants
                  ?.slice(
                    (clearancePage - 1) * itemsPerPageForClearance,
                    clearancePage * itemsPerPageForClearance
                  )
                  ?.map((tenant, index) => (
                    <tr key={tenant?.id}>
                      <td>
                        {(clearancePage - 1) * itemsPerPageForClearance +
                          index +
                          1}
                      </td>
                      <td>{tenant?.name}</td>
                      <td>{tenant?.email}</td>
                      <td>{tenant?.houseDetails?.houseNo}</td>
                      <td>
                        {tenant?.deposits?.rentDeposit +
                          tenant?.deposits?.waterDeposit}
                      </td>
                      <td>
                        <button
                          className="restore-btn"
                          onClick={() => handleViewTenant(tenant)}
                        >
                          <FaUser /> View Tenant
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() => confirmDelete(tenant)}
                        >
                          <FaTrashAlt /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            {/* Pagination for Clearance Queue */}
            <div className="pagination">
              <ReactPaginate
                activePage={clearancePage}
                itemsCountPerPage={itemsPerPageForClearance}
                totalItemsCount={toBeClearedTenants?.length}
                pageRangeDisplayed={5}
                onChange={handleClearancePageChange}
                itemClass="page-item"
                linkClass="page-link"
              />
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Popup */}
      {showConfirmDelete && (
        <div className="confirmation-popup-overlay">
          <div className="confirmation-popup">
            <h3>Are you sure you want to delete this tenant?</h3>
            <p>{selectedTenant?.name}</p>
            <div className="confirmation-actions">
              <button className="submit-btn" onClick={handleDeleteTenant}>
                Yes, Delete
              </button>
              <button className="cancel-btn" onClick={closeConfirmDelete}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="loader-overlay">
          <TailSpin
            height="100"
            width="100"
            color="#4fa94d"
            ariaLabel="loading"
            visible={true}
          />
        </div>
      )}
      {showConfirmDeleteAdmin && (
        <div className="confirmation-popup-overlay">
          <div className="confirmation-popup">
            <h3>Are you sure you want to delete this Admin?</h3>
            <p>{selectedAdmin?.name}</p>
            <div className="confirmation-actions">
              <button className="submit-btn" onClick={confirmDeleteAdmin}>
                Yes, Delete
              </button>
              <button className="cancel-btn" onClick={closeConfirmDeleteAdmin}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default AdminPage;
