import { Link, useNavigate } from 'react-router-dom';
import { FaTrashAlt } from 'react-icons/fa';
import './Rent.css';
import { useEffect, useState } from 'react';
import apiRequest from '../../lib/apiRequest';
import { useDispatch, useSelector } from 'react-redux';
import { setTenants } from '../../features/Tenants/TenantsSlice';
import { TailSpin } from 'react-loader-spinner';

const Rent = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false); // State for modal visibility
  const [tenantToDelete, setTenantToDelete] = useState(null); // State for selected tenant
  const dispatch = useDispatch();
  const tenants = useSelector((store) => store.tenantsData.tenants);

  const fallbackTenants = [
    {
      _id: 1,
      name: 'John Doe',
      totalAmount: '20000',
      houseNo: 'A6',
      balance: '-100',
      status: 'cleared',
    },
    {
      _id: 2,
      name: 'Jane Smith',
      totalAmount: '25000',
      houseNo: 'B3',
      balance: '500',
      status: 'pending',
    },
    {
      _id: 3,
      name: 'Michael Johnson',
      totalAmount: '15000',
      houseNo: 'C2',
      balance: '300',
      status: 'cleared',
    },
    {
      _id: 4,
      name: 'Emily Davis',
      totalAmount: '18000',
      houseNo: 'D4',
      balance: '-200',
      status: 'pending',
    },
    {
      _id: 5,
      name: 'Chris Brown',
      totalAmount: '22000',
      houseNo: 'A1',
      balance: '0',
      status: 'cleared',
    },
    {
      _id: 6,
      name: 'Olivia Wilson',
      totalAmount: '21000',
      houseNo: 'B5',
      balance: '100',
      status: 'cleared',
    },
    {
      _id: 7,
      name: 'Daniel Martinez',
      totalAmount: '17000',
      houseNo: 'C7',
      balance: '-50',
      status: 'pending',
    },
    {
      _id: 8,
      name: 'Sophia Garcia',
      totalAmount: '19000',
      houseNo: 'D9',
      balance: '200',
      status: 'cleared',
    },
  ];

  useEffect(() => {
    const fetchAllTenants = async () => {
      setError('');
      setLoading(true);
      try {
        const res = await apiRequest.get('/v2/tenants/getToBeClearedFalse');
        console.log('allTenantsRes: ', res.data);
        if (res.status) {
          if (res?.data?.length === 0) {
            dispatch(setTenants(fallbackTenants));
          } else {
            dispatch(setTenants(res.data));
          }
        } else {
          setError('Failed to fetch tenants. Using fallback data.');
          dispatch(setTenants(fallbackTenants));
        }
      } catch (error) {
        setError('Error fetching tenants. Using fallback data.');
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
        setShowModal(false); // Close modal on successful deletion
      } else {
        console.error('Failed to delete tenant');
      }
    } catch (error) {
      console.error(error.message);
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

  // const getStatus = (balance, monthInQuestionPay) => {
  //   if (balance <= 0) {
  //     return <span> {monthInQuestionPay} Cleared ✅</span>;
  //   } else {
  //     return <span>Not Cleared ❌</span>;
  //   }
  // };

  const handleSingleTenantClick = (tenant) => {
    navigate(`/v2/tenantPaymentsV2/${tenant._id}`, {
      state: {
        tenantDetails: tenant,
      },
    });
  };

  return (
    <div className="summary2">
      <div className="tenantslist">
        <h2 className="title">Tenants List</h2>
        {error && <span>{error}</span>}
        {loading ? (
          <div className="loader">
            <TailSpin
              height="100"
              width="100"
              color="#4fa94d"
              ariaLabel="loading"
              visible={true}
            />
          </div>
        ) : (
          <div className="table-container">
            <table className="tenant-table">
              <thead>
                <tr>
                  <th>Tenant{`'`}s Name</th>
                  <th>House No.</th>
                  {/* <th>All Payments</th> */}
                  {/* <th>Month</th> */}
                  {/* <th>{} Status</th> */}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tenants &&
                  tenants.map((tenant) => (
                    <tr key={tenant._id}>
                      <td>{tenant.name}</td>
                      <td>
                        {tenant?.houseDetails
                          ? tenant?.houseDetails?.houseNo
                          : ''}
                      </td>
                      {/* <td>{tenant.totalAmount}</td> */}
                      {/* <td>{tenant.balance}</td>
                      <td>
                        {getStatus(tenant.balance, tenant.monthInQuestionPay)}
                      </td> */}
                      <td className="actions">
                        <p
                          onClick={() => {
                            handleSingleTenantClick(tenant);
                          }}
                          className="edit-btn"
                        >
                          Add-Payment
                        </p>
                        <Link
                          to={`/tenantPaymentList/${tenant._id}`}
                          className="edit-btn"
                        >
                          Payments
                        </Link>
                        <button
                          onClick={() => handleOpenModal(tenant._id)} // Open modal instead of directly deleting
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
              <button
                className="confirm-btn"
                onClick={() => tenantToDelete && handleDelete(tenantToDelete)}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rent;
