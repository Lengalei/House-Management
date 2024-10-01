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
import { TailSpin } from 'react-loader-spinner';

function LandLordProfile() {
  const { _id } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [landlord, setlandlord] = useState(null);

  useEffect(() => {
    fetchlandlord();
  }, [_id]);
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
  const handleDeletelandlord = async () => {
    setLoading(true);
    const res = await apiRequest.delete(`/landlords/deleteLandlord/${_id}`);
    if (!res.status) {
      setError(res.data.error);
      toast.error(res.data.error);
    } else {
      // console.log('landlord deleted!');
      handleCloseDeletePopup();
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
      await fetchlandlord();
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
      await fetchlandlord();
    }
    setLoading(false);
  };

  const [deleteConfirmationPopup, setDeleteConfirmationPopup] = useState(false);

  const handleDeleteBtnClick = () => {
    setDeleteConfirmationPopup(true);
  };
  const handleCloseDeletePopup = () => {
    setDeleteConfirmationPopup(false);
  };

  return (
    <div className="TenantProfile">
      <ToastContainer />

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
                  Caretaker Id:{landlord ? landlord.nationalId : '1'}
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
              <h3>Monthly Pay</h3>
              <div className="dets">
                <p>Amount: {landlord ? landlord.monthlyPay : '0'}</p>
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
              <h3>Caretaker Status</h3>
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
                <p>Delete Caretaker</p>{' '}
                <button onClick={handleDeleteBtnClick}>
                  <MdDelete size={20} color="red" />
                </button>
              </div>
              <div className="details-container">
                <p>Edit Caretaker</p>{' '}
                <button onClick={handleEditlandlord}>
                  <FaEdit size={20} color="var(--primary-color)" />
                </button>
              </div>
              <div className="details-container">
                <p>Blacklist Caretaker</p>{' '}
                <button onClick={handleBlackListlandlord}>
                  <CgPlayListRemove size={20} color="black" />
                </button>
              </div>
              <div className="details-container">
                <p>Whitelist Caretaker</p>{' '}
                <button onClick={handleWhiteListlandlord}>
                  <MdOutlineNotListedLocation size={20} color="var(--yellow)" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
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
      {deleteConfirmationPopup && (
        <div className="confirmation-popup-overlay">
          <div className="confirmation-popup">
            <h3>Are you sure you want to delete this Caretaker?</h3>
            <p>{landlord?.name}</p>
            {error && <p>{error}</p>}
            <div className="confirmation-actions">
              <button className="submit-btn" onClick={handleDeletelandlord}>
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

export default LandLordProfile;
