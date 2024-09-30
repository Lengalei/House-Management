import { Link, useNavigate } from 'react-router-dom';
import { FaTrashAlt } from 'react-icons/fa';
import './Listall.scss';
import { useEffect, useState } from 'react';
import apiRequest from '../../lib/apiRequest';
import { useDispatch, useSelector } from 'react-redux';
import { setTenants } from '../../features/Tenants/TenantsSlice';
import { ThreeDots } from 'react-loader-spinner';
import { toast, ToastContainer } from 'react-toastify';

const Listall = () => {
  const fallbackTenants = [
    {
      _id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      phone: '123-456-7890',
    },
    {
      _id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '234-567-8901',
    },
    {
      _id: 3,
      name: 'Bob Johnson',
      email: 'bob@example.com',
      phone: '345-678-9012',
    },
    {
      _id: 4,
      name: 'Alice Brown',
      email: 'alice@example.com',
      phone: '456-789-0123',
    },
    {
      _id: 5,
      name: 'Tom White',
      email: 'tom@example.com',
      phone: '567-890-1234',
    },
    {
      _id: 6,
      name: 'Mary Green',
      email: 'mary@example.com',
      phone: '678-901-2345',
    },
    {
      _id: 7,
      name: 'James Black',
      email: 'james@example.com',
      phone: '789-012-3456',
    },
    {
      _id: 8,
      name: 'Patricia Williams',
      email: 'patricia@example.com',
      phone: '890-123-4567',
    },
    {
      _id: 9,
      name: 'Michael Scott',
      email: 'michael@example.com',
      phone: '901-234-5678',
    },
    {
      _id: 10,
      name: 'Linda Martinez',
      email: 'linda@example.com',
      phone: '012-345-6789',
    },
  ];

  const navigate = useNavigate();

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false); // State for modal visibility
  const [tenantToDelete, setTenantToDelete] = useState(null); // State for selected tenant
  const dispatch = useDispatch();
  const tenants = useSelector((store) => store.tenantsData.tenants);

  useEffect(() => {
    const fetchAllTenants = async () => {
      setError('');
      setLoading(true);
      try {
        const res = await apiRequest.get('/v2/tenants/getToBeClearedFalse');
        if (res.status) {
          if (res?.data?.length === 0) {
            dispatch(setTenants(fallbackTenants));
          } else {
            dispatch(setTenants(res.data));
            setError('');
            toast.success('Tenants fetched ');
          }
        } else {
          setError('Failed to fetch tenants. Using fallback data.');
          dispatch(setTenants(fallbackTenants));
        }
      } catch (error) {
        setError('Error fetching tenants. Using fallback data.');
        toast.error(error.response.data.message);
        dispatch(setTenants(fallbackTenants));
      } finally {
        setLoading(false);
      }
    };
    fetchAllTenants();
  }, [dispatch]);

  const handleDelete = async (_id) => {
    setLoading(true);
    try {
      const res = await apiRequest.delete(`/v2/tenants/deleteTenant/${_id}`);
      if (res.status === 200) {
        dispatch(setTenants(tenants.filter((tenant) => tenant._id !== _id)));
        toast.success('Tenant deleted Successfully!');
      }
    } catch (error) {
      console.error(error.message);
      toast.error(error.response.data.message || 'Error Deleting Tenant!');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (_id) => {
    setTenantToDelete(_id);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setTenantToDelete(null);
  };

  const handleConfirmDelete = () => {
    if (tenantToDelete) {
      handleDelete(tenantToDelete);
      handleCloseModal();
    }
  };

  const handleTenantClearance = (tenant) => {
    navigate(`/clearTenant/${tenant._id}`, {
      state: { tenant },
    });
  };
  return (
    <div className="summary2">
      <div className="tenantslist">
        <h2 className="title">Tenants List</h2>
        {error && <span>{error}</span>}
        {loading ? (
          <div className="loader">
            <ThreeDots
              height="80"
              width="80"
              radius="9"
              color="#4fa94d"
              ariaLabel="three-dots-loading"
              visible={true}
            />
          </div>
        ) : (
          <div className="table-container">
            <table className="tenant-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>House No</th>
                  <th>To Be Cleared</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tenants &&
                  tenants.map((tenant) => (
                    <tr key={tenant._id}>
                      <td>{tenant.name}</td>
                      <td>{tenant.email}</td>
                      <td>
                        {tenant?.houseDetails?.houseNo
                          ? tenant.houseDetails?.houseNo
                          : ''}
                      </td>
                      <td>{tenant.toBeCleared ? 'yes' : 'No'}</td>
                      <td className="actions">
                        <Link
                          to={`/tenantProfile/${tenant._id}`}
                          className="edit-btn"
                        >
                          More Details
                        </Link>
                        <button
                          onClick={() => {
                            handleTenantClearance(tenant);
                          }}
                          className="edit-btn"
                        >
                          Clear Tenant
                        </button>
                        <button
                          onClick={() => handleOpenModal(tenant._id)}
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
        )}
      </div>
      {showModal && (
        <div className="confirmation-modal">
          <div className="modal-content">
            <p>Are you sure you want to delete this tenant?</p>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={handleCloseModal}>
                Cancel
              </button>
              <button className="confirm-btn" onClick={handleConfirmDelete}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default Listall;
