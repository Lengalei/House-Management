import { MdDelete } from 'react-icons/md';
import { FaEdit } from 'react-icons/fa';
import { CgPlayListRemove } from 'react-icons/cg';
import { MdOutlineNotListedLocation } from 'react-icons/md';
import { GiHazardSign } from 'react-icons/gi';
import './TenantProfile.scss';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import apiRequest from '../../lib/apiRequest';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { TailSpin } from 'react-loader-spinner';

function TenantProfile() {
  const { _id } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState(null);

  useEffect(() => {
    const fetchTenant = async () => {
      setLoading(true);
      try {
        const res = await apiRequest(`/v2/tenants/getSingleTenant/${_id}`);
        if (res.status) {
          // console.log(res.data);
          setTenant(res.data);
          // console.log(res.data);
          // toast.success('Tenant data fetched successfully');
        }
      } catch (error) {
        setError(error.response.data.message || 'Error getting Tenant');
        toast.error(error.response.data.message || 'Error getting Tenant');
      } finally {
        setLoading(false);
      }
    };
    fetchTenant();
  }, [_id]);

  const [deleteConfirmationPopup, setDeleteConfirmationPopup] = useState(false);
  const handleDeleteBtnClick = () => {
    setDeleteConfirmationPopup(true);
  };
  const handleCloseDeletePopup = () => {
    setDeleteConfirmationPopup(false);
  };

  const handleDeleteTenant = async () => {
    setLoading(true);
    try {
      const res = await apiRequest.delete(`/v2/tenants/deleteTenant/${_id}`);
      if (res.status) {
        handleCloseDeletePopup();
        toast.success('Tenant deleted successfully');
        setTimeout(() => {
          navigate(`/listAllTenants`);
        }, 1000);
      }
    } catch (error) {
      setError(error.response.data.message || 'Error deleting Tenant');
      toast.error(error.response.data.message || 'Error deleting Tenant');
    } finally {
      setLoading(false);
    }
  };

  const handleEditTenant = async () => {
    console.log(_id);
    navigate(`/tenant/edit/${_id}`);
  };

  const handleBlackListTenant = async () => {
    setLoading(true);
    try {
      const res = await apiRequest.patch(`/v2/tenants/blackListTenant/${_id}`);
      if (res.status) {
        toast.success('Tenant blacklisted successfully');
        setTimeout(() => {
          navigate(`/tenantProfile/${_id}`);
        }, 1000);
      }
    } catch (error) {
      setError(error.response.data.message || 'Error blacklisting Tenant');
      toast.error(error.response.data.message || 'Error blacklisting Tenant');
    } finally {
      setLoading(false);
    }
  };

  const handleWhiteListTenant = async () => {
    setLoading(true);
    try {
      const res = await apiRequest.patch(`/v2/tenants/whiteListTenant/${_id}`);
      if (!res.status) {
        setError(res.data.error);
        toast.error(res.data.error);
      } else {
        // console.log('tenant whitelisted!');
        toast.success('Tenant whitelisted successfully');
        setTimeout(() => {
          navigate(`/tenantProfile/${_id}`);
        }, 1000);
      }
    } catch (error) {
      setError(error.response.data.message || 'Error whitelisting Tenant');
      toast.error(error.response.data.message || 'Error whitelisting Tenant');
    }

    setLoading(false);
  };

  return (
    <div className="TenantProfile">
      <ToastContainer />
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
      {error && <span>{error}</span>}
      <div className="summary2">
        <div className="profile">
          <div className="personal-details">
            <div className="user">
              <div className="profile-image">
                {tenant?.blackListTenant == true ? (
                  <img
                    src={
                      tenant?.blackListTenant
                        ? '/blacklisted.png'
                        : '/profile1.jfif'
                    }
                    alt="profile"
                  />
                ) : (
                  <img
                    src={tenant?.profile ? tenant.profile : '/profile1.jfif'}
                    alt="profile"
                  />
                )}
              </div>

              <div className="userinfo">
                <h3>{tenant ? tenant.name : 'Linda Kamau'}</h3>

                <p>Tenant Id:{tenant ? tenant.nationalId : '1'}</p>
                <p>
                  Joining Date:{' '}
                  {tenant
                    ? new Date(tenant.placementDate).toLocaleDateString()
                    : '24-06-2024'}
                </p>
              </div>
            </div>
            <div className="user-details">
              <p>
                Phone {`(+254)`}:{tenant ? tenant.phoneNo : ' 078129324'}
              </p>
              <p>Email : {tenant ? tenant.email : 'linda@gmail.com'}</p>
              <p>
                HouseNo:{' '}
                {tenant ? tenant.houseDetails.houseNo : 'Not Asssigned'}
              </p>
              {tenant?.blackListTenant == true ? (
                <span>Blacklisted Status:True</span>
              ) : (
                ''
              )}
              {tenant?.whiteListTenant == true ? (
                <span>whiteListed Status:True</span>
              ) : (
                ''
              )}
            </div>
          </div>

          <div className="payment">
            <div className="payment-details">
              <h3>Total Deposit</h3>
              <div className="dets">
                <p>Amount</p>
                <p>
                  {tenant
                    ? tenant.deposits.rentDeposit +
                      tenant.deposits.waterDeposit +
                      tenant.deposits.initialRentPayment
                    : '0'}
                </p>
              </div>
            </div>
            <div className="payment-details">
              <h3>Emergency Contact</h3>
              <div className="dets">
                <p>Name: {tenant ? tenant.emergencyContactName : 'Jane'}</p>
                <p>
                  Contact: {tenant ? tenant.emergencyContactNumber : '1234'}
                </p>
              </div>
            </div>
          </div>

          <div className="deposits">
            <div className=" pd">
              <h3>Tenant{`'`}s Deposits</h3>
              <table className="tenant-table">
                <thead>
                  <tr>
                    <th>Deposits</th>
                    <th>
                      {tenant
                        ? tenant.deposits.rentDeposit +
                          tenant.deposits.waterDeposit
                        : 'amount'}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td>Rent Deposit</td>
                    <td>{tenant ? tenant.deposits.rentDeposit : '12000'}</td>
                  </tr>
                  <tr>
                    <td>Water Deposit</td>
                    <td>{tenant ? tenant.deposits.waterDeposit : '2500'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className=" pd">
              <span className="GiHazardSign">
                <GiHazardSign size={50} color="red" />
              </span>

              <div className="details-container">
                <p>Delete Tenant</p>{' '}
                <button onClick={handleDeleteBtnClick}>
                  <MdDelete size={20} color="red" />
                </button>
              </div>
              <div className="details-container">
                <p>Edit Tenant</p>{' '}
                <button onClick={handleEditTenant}>
                  <FaEdit size={20} color="var(--primary-color)" />
                </button>
              </div>
              <div className="details-container">
                <p>Blacklist Tenant</p>{' '}
                <button onClick={handleBlackListTenant}>
                  <CgPlayListRemove size={20} color="black" />
                </button>
              </div>
              <div className="details-container">
                <p>Whitelist Tenant</p>{' '}
                <button onClick={handleWhiteListTenant}>
                  <MdOutlineNotListedLocation size={20} color="var(--yellow)" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {deleteConfirmationPopup && (
        <div className="confirmation-popup-overlay">
          <div className="confirmation-popup">
            <h3>Are you sure you want to delete this Tenant?</h3>
            <p>{tenant?.name}</p>
            {error && <p>{error}</p>}
            <div className="confirmation-actions">
              <button className="submit-btn" onClick={handleDeleteTenant}>
                Yes, Delete
              </button>
              <button className="cancel-btn" onClick={handleCloseDeletePopup}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TenantProfile;
