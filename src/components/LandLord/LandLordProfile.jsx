import { MdDelete } from 'react-icons/md';
import { FaEdit } from 'react-icons/fa';
import { CgPlayListRemove } from 'react-icons/cg';
import { MdOutlineNotListedLocation } from 'react-icons/md';
import { GiHazardSign } from 'react-icons/gi';
import './LandLordProfile.scss';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import apiRequest from '../../lib/apiRequest';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThreeDots } from 'react-loader-spinner';

function LandLordProfile() {
  const { _id } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [landlord, setlandlord] = useState(null);

  useEffect(() => {
    const fetchlandlord = async () => {
      setLoading(true);
      const res = await apiRequest(`/landlords/getSingleLandlord/${_id}`);
      if (!res.status) {
        setError(res.data.error);
        toast.error(res.data.error);
      } else {
        console.log(res.data);
        setlandlord(res.data);
        // toast.success('landlord data fetched successfully');
      }
      setLoading(false);
    };
    fetchlandlord();
  }, [_id]);

  const handleDeletelandlord = async () => {
    setLoading(true);
    const res = await apiRequest.delete(`/landlords/deleteLandlord/${_id}`);
    if (!res.status) {
      setError(res.data.error);
      toast.error(res.data.error);
    } else {
      console.log('landlord deleted!');

      toast.success('landlord deleted successfully');
      setTimeout(() => {
        navigate(`/landlordProfile/${_id}`);
      }, 500);
    }
    setLoading(false);
  };

  const handleEditlandlord = async () => {
    navigate(`/landlord/edit/${_id}`);
  };

  const handleBlackListlandlord = async () => {
    setLoading(true);
    const res = await apiRequest.patch(`/landlords/blackListLandlord/${_id}`);
    if (!res.status) {
      setError(res.data.error);
      toast.error(res.data.error);
    } else {
      console.log('landlord blacklisted!');
      toast.success('landlord blacklisted successfully');
      navigate(`/landlordProfile/${_id}`);
    }
    setLoading(false);
  };

  const handleWhiteListlandlord = async () => {
    setLoading(true);
    const res = await apiRequest.patch(`/landlords/whiteListLandlord/${_id}`);
    if (!res.status) {
      setError(res.data.error);
      toast.error(res.data.error);
    } else {
      console.log('landlord whitelisted!');
      toast.success('landlord whitelisted successfully');
      setTimeout(() => {
        navigate(`/landlordProfile/${_id}`);
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
                {landlord?.blackListTenant == true ? (
                  <img
                    src={
                      landlord?.blackListTenant
                        ? '/blacklisted.png'
                        : '/profile1.jfif'
                    }
                    alt="profile"
                  />
                ) : (
                  <img
                    src={
                      landlord?.profile ? landlord.profile : '/profile1.jfif'
                    }
                    alt="profile"
                  />
                )}
              </div>

              <div className="userinfo">
                <h3 className="nId">
                  {landlord ? landlord.name : 'Linda Kamau'}
                </h3>

                <p className="nId">
                  Landlord Id:{landlord ? landlord.nationalId : '1'}
                </p>
                <p className="nId">
                  Joining Date:{' '}
                  {landlord
                    ? new Date(landlord.createdAt).toLocaleDateString()
                    : '24-06-2024'}
                </p>
              </div>
            </div>
            <div className="user-details">
              <p className="nId">
                Phone {`(+254)`}:{landlord ? landlord.phoneNo : ' 078129324'}
              </p>
              <p className="nId">
                Email : {landlord ? landlord.email : 'linda@gmail.com'}
              </p>
              <p className="nId">
                Age : {landlord?.age > 0 ? landlord.age : 'Not Provided'}
              </p>
              <p className="nId">
                HouseNo: {landlord ? landlord.assignedHouseNo : 'Not Asssigned'}
              </p>
            </div>
          </div>

          <div className="payment">
            <div className="payment-details">
              <h3>Current Balance</h3>
              <div className="dets">
                <p>Monthly Pay</p>
                <p>{landlord ? landlord.monthlyPay : '0'}</p>
              </div>
            </div>
            <div className="payment-details">
              <h3>Emergency Contact</h3>
              <div className="dets">
                <p>Name: {landlord ? landlord.emergencyContactName : 'Jane'}</p>
                <p>
                  Contact: {landlord ? landlord.emergencyContactNumber : '1234'}
                </p>
              </div>
            </div>
          </div>

          <div className="deposits">
            <div className=" pd">
              <h3>LandLord{`'`}s Deposits</h3>
              <table className="tenant-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Value</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td>Blacklisted </td>
                    <td>
                      {' '}
                      {landlord?.blackListLandlord == true ? (
                        <span>True</span>
                      ) : (
                        <span>False</span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td>WhiteListed </td>
                    <td>
                      {' '}
                      {landlord?.whiteListLandlord == true ? (
                        <span>True</span>
                      ) : (
                        <span>False</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className=" pd">
              <span className="GiHazardSign">
                <GiHazardSign size={50} color="red" />
              </span>

              <div className="details-container">
                <p>Delete Landlord</p>{' '}
                <button onClick={handleDeletelandlord}>
                  <MdDelete size={20} color="red" />
                </button>
              </div>
              <div className="details-container">
                <p>Edit Landlord</p>{' '}
                <button onClick={handleEditlandlord}>
                  <FaEdit size={20} color="var(--primary-color)" />
                </button>
              </div>
              <div className="details-container">
                <p>Blacklist Landlord</p>{' '}
                <button onClick={handleBlackListlandlord}>
                  <CgPlayListRemove size={20} color="black" />
                </button>
              </div>
              <div className="details-container">
                <p>Whitelist Landlord</p>{' '}
                <button onClick={handleWhiteListlandlord}>
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

export default LandLordProfile;
