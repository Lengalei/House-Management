import './GreyList.css';
import { Link } from 'react-router-dom';
import { FaTrashAlt } from 'react-icons/fa';
import apiRequest from '../../lib/apiRequest';
import { useEffect, useState } from 'react';
import { ThreeDots } from 'react-loader-spinner';

const GreyList = () => {
  const [loading, setLoading] = useState(false);
  const [tenants, setTenants] = useState([]);
  const [error, setError] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [remainingBalance, setRemainingBalance] = useState(0);

  useEffect(() => {
    const fetchAllTenant = async () => {
      setLoading(true);
      try {
        const response = await apiRequest.get('/tenants/allGreyTenants');
        if (response.status === 200) {
          setTenants(response.data);
        }
      } catch (error) {
        setError(error.response.data.message);
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllTenant();
  }, []);

  const handleDelete = async (_id) => {
    setLoading(true);
    try {
      const res = await apiRequest.delete(`/tenants/deleteTenant/${_id}`);
      if (res.status === 200) {
        setTenants((prevTenants) =>
          prevTenants.filter((tenant) => tenant._id !== _id)
        );
      } else {
        console.error('Failed to delete tenant');
      }
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const openPopup = (tenant) => {
    setSelectedTenant(tenant);
    const expectedPay =
      tenant.houseDeposit + tenant.waterDeposit + tenant.rentPayable;
    const remaining = expectedPay - tenant.amountPaid;
    setRemainingBalance(remaining);
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setSelectedTenant(null);
    setAmountPaid('');
    setPaymentDate('');
    setReferenceNumber('');
    setRemainingBalance(0);
  };

  const handlePaymentUpdate = async (_id) => {
    try {
      const response = await apiRequest.put(
        `/tenants/updateAmountPaid/${_id}`,
        {
          amountPaid,
          paymentDate,
          referenceNumber,
        }
      );
      if (response.status === 200) {
        // Update the tenant data locally
        setTenants((prevTenants) =>
          prevTenants.map((tenant) =>
            tenant._id === _id
              ? {
                  ...tenant,
                  amountPaid: tenant.amountPaid + parseInt(amountPaid),
                }
              : tenant
          )
        );
      }
    } catch (error) {
      setError(error.response.data.message);
    } finally {
      closePopup();
    }
  };

  const capitalizeName = (name) => {
    return name
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <div className="tenant-table-container">
      <h2>Grey List</h2>
      {error && <span>{error}</span>}
      {loading ? (
        <ThreeDots
          height="20"
          width="30"
          radius="9"
          color="white"
          ariaLabel="three-dots-loading"
          wrapperStyle={{}}
          visible={true}
        />
      ) : (
        <>
          <table className="tenant-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone Number</th>
                <th>House Number</th>
                <th>Amount Paid</th>
                <th>Expected Pay</th>
                <th>Balance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((tenant, index) => {
                const expectedPay =
                  tenant.houseDeposit +
                  tenant.waterDeposit +
                  tenant.rentPayable;
                const balance = expectedPay - tenant.amountPaid;
                return (
                  <tr key={index}>
                    <td>{tenant.name}</td>
                    <td>{tenant.phoneNo}</td>
                    <td>{tenant.houseNo}</td>
                    <td>{tenant.amountPaid}</td>
                    <td>{expectedPay}</td>
                    <td>{balance}</td>
                    <td className="actions">
                      <Link
                        onClick={() => openPopup(tenant)}
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
                );
              })}
            </tbody>
          </table>

          {showPopup && selectedTenant && (
            <div className="popup-overlay">
              <div className="popup-container">
                <h3>
                  Update Payment for {capitalizeName(selectedTenant.name)}
                </h3>
                <div className="popup-input">
                  <label>Remaining Balance: {remainingBalance} </label>
                </div>
                <div className="popup-input">
                  <label>Amount:</label>
                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                  />
                </div>
                <div className="popup-input">
                  <label>Date:</label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                  />
                </div>
                <div className="popup-input">
                  <label>Reference Number:</label>
                  <input
                    type="text"
                    placeholder="Enter reference number"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                  />
                </div>
                <div className="popup-actions">
                  <button onClick={closePopup} className="cancel-btn">
                    Cancel
                  </button>
                  <button
                    onClick={() => handlePaymentUpdate(selectedTenant._id)}
                    className="save-btn"
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GreyList;
