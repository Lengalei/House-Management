import { useDispatch, useSelector } from 'react-redux';
import './Admin.scss';
import apiRequest from '../../lib/apiRequest';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UploadWidget from '../../components/uploadWidget/UploadWidget';
import { ThreeDots } from 'react-loader-spinner'; // Import loader
import { setAdmin } from '../../features/Admin/adminSlice';

function Admin() {
  const navigate = useNavigate();
  //const admin = useSelector((store) => store.adminData.adminDataValue);
  const admin = JSON.parse(localStorage.getItem('adminData'));
  console.log(admin);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState('');

  const [avatar, setAvatar] = useState('');
  const [loading, setLoading] = useState(false); // State for loader

  const handleAdminChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      const res = await apiRequest.put('/auth/adminChangePassword', {
        adminId: admin._id,
        currentPassword,
        newPassword,
      });
      console.log('logged res: ', res);
      if (!res.status) {
        console.log(res);
        setError(res.error.error);
      } else {
        console.log(res.data);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        setError('');
        localStorage.removeItem('adminData');
        navigate('/login');
      }
    } catch (error) {
      console.log(error);
      setError(error.response.data.error);
    }
  };

  const dispatch = useDispatch();

  const updateProfile = async (imageUrl) => {
    try {
      const res = await apiRequest.put(
        `/auth/adminUpdateProfile/${admin._id}`,
        {
          profile: imageUrl,
        }
      );
      if (res.status) {
        console.log(res.data);
        dispatch(setAdmin({ ...admin, profile: imageUrl }));
        localStorage.setItem('adminData', JSON.stringify(res.data));
      } else {
        console.log('error: ', res.data.error);
        setError(res.data.error);
      }
    } catch (error) {
      setError(error.response.data.error);
    }
  };

  const handleUploadSuccess = (imageUrl) => {
    setAvatar(imageUrl);
    updateProfile(imageUrl);
  };

  return (
    <div className="admin">
      <div className="profile-details">
        <div className="personalinfo">
          <h2 className="h2">Personal Information</h2>
          <div className="profile2">
            <div className="admin-image">
              {loading ? (
                <ThreeDots color="#333" height={80} width={80} /> // Display loader while uploading
              ) : (
                <img
                  src={admin?.profile || avatar || '/profile3.jfif'} // Display the uploaded image or default image
                  alt="Profile"
                />
              )}
            </div>
            <div className="btn2 ">
              <UploadWidget
                uwConfig={{
                  cloudName: 'victorkib',
                  uploadPreset: 'estate',
                  multiple: false,
                  maxImageFileSize: 2000000,
                  folder: 'avatars',
                }}
                onUploadSuccess={handleUploadSuccess}
                setLoading={setLoading} // Pass setLoading to manage loading state in UploadWidget
              />
            </div>

            <div className="adminDetails">
              <p>Name: {admin ? admin.username : 'John Hariet'}</p>
              <p>Email: {admin ? admin.email : 'johnhariet@gmail.com'}</p>
              <p>Role: {admin?.role ? admin.role : 'Admin'}</p>
              <button>Request Role Change</button>
            </div>
          </div>
        </div>

        <div className="changePassword">
          <form onSubmit={handleAdminChangePassword}>
            <h2 className="h2">Change Your Password</h2>
            <div className="forminput">
              <label htmlFor="currentPassword">
                Current Password<span>*</span>
              </label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="forminput">
              <label htmlFor="newPassword">
                New Password<span>*</span>
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="forminput">
              <label htmlFor="confirmNewPassword">
                Confirm Password<span>*</span>
              </label>
              <input
                type="password"
                id="confirmNewPassword"
                name="confirmNewPassword"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
              />
            </div>
            {error && <span className="ChangePassError">{error}</span>}
            <button type="submit" className="changePassbtn">
              Change Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Admin;
