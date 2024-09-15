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
import { ThreeDots } from 'react-loader-spinner';

function TenantProfile() {
  const { _id } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState(null);

  useEffect(() => {
    const fetchTenant = async () => {
      setLoading(true);
      const res = await apiRequest(`/v2/tenants/getSingleTenant/${_id}`);
      if (!res.status) {
        setError(res.data.error);
        toast.error(res.data.error);
      } else {
        console.log(res.data);
        setTenant(res.data);
        console.log(res.data);
        // toast.success('Tenant data fetched successfully');
      }
      setLoading(false);
    };
    fetchTenant();
  }, [_id]);

  const handleDeleteTenant = async () => {
    setLoading(true);
    const res = await apiRequest.delete(`/tenants/deleteTenant/${_id}`);
    if (!res.status) {
      setError(res.data.error);
      toast.error(res.data.error);
    } else {
      console.log('tenant deleted!');

      toast.success('Tenant deleted successfully');
      setTimeout(() => {
        navigate(`/tenantProfile/${_id}`);
      }, 1000);
    }
    setLoading(false);
  };

  const handleEditTenant = async () => {
    console.log(_id);
    navigate(`/tenant/edit/${_id}`);
  };

  const handleBlackListTenant = async () => {
    setLoading(true);
    const res = await apiRequest.patch(`/tenants/blackListTenant/${_id}`);
    if (!res.status) {
      setError(res.data.error);
      toast.error(res.data.error);
    } else {
      console.log('tenant blacklisted!');
      toast.success('Tenant blacklisted successfully');
      setTimeout(() => {
        navigate(`/tenantProfile/${_id}`);
      }, 1000);
    }
    setLoading(false);
  };

  const handleWhiteListTenant = async () => {
    setLoading(true);
    const res = await apiRequest.patch(`/tenants/whiteListTenant/${_id}`);
    if (!res.status) {
      setError(res.data.error);
      toast.error(res.data.error);
    } else {
      console.log('tenant whitelisted!');
      toast.success('Tenant whitelisted successfully');
      setTimeout(() => {
        navigate(`/tenantProfile/${_id}`);
      }, 1000);
    }
    setLoading(false);
  };

  return (
    <div className="TenantProfile">
      <ToastContainer />
      {loading && (
        <div className="loader">
          <ThreeDots
            className="threeDots"
            color="#3f51b5"
            height={80}
            width={80}
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
                    ? new Date(tenant.createdAt).toLocaleDateString()
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
                <button onClick={handleDeleteTenant}>
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
    </div>
  );
}

export default TenantProfile;
