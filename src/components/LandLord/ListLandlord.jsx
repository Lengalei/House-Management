import { Link } from 'react-router-dom';
import { FaTrashAlt } from 'react-icons/fa';
import '../Tenants/Tenant.scss';
import { useEffect, useState } from 'react';
import apiRequest from '../../lib/apiRequest';
import { useDispatch, useSelector } from 'react-redux';
import { setLandLord } from '../../features/Landlords/LandLordSlice';
import { TailSpin } from 'react-loader-spinner';

const ListLandlord = () => {
  const fallbacklandlords = [
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

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const landlords = useSelector((store) => store.landlordsData.landLords);

  useEffect(() => {
    fetchAlllandlords();
  }, [dispatch]);
  const fetchAlllandlords = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await apiRequest.get('/landlords/allLandlords');
      console.log(res.data);
      if (res.status) {
        if (res?.data?.length == 0) {
          dispatch(setLandLord(fallbacklandlords));
        } else {
          dispatch(setLandLord(res.data));
        }
      } else {
        setError('Failed to fetch landlords. Using fallback data.');
        dispatch(setLandLord(fallbacklandlords));
      }
    } catch (error) {
      setError('Error fetching landlords. Using fallback data.');
      dispatch(setLandLord(fallbacklandlords));
    } finally {
      setLoading(false);
    }
  };

  const [selectedlandlord, setSelectedLandlord] = useState('');
  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await apiRequest.delete(
        `/landlords/deleteLandlord/${selectedlandlord._id}`
      );
      if (res.status === 200) {
        dispatch(
          setLandLord(
            landlords.filter((tenant) => tenant._id !== selectedlandlord._id)
          )
        );
        setDeleteConfirmationPopup(false);
        setSelectedLandlord('');
      } else {
        console.error('Failed to delete tenant');
      }
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const [deleteConfirmationPopup, setDeleteConfirmationPopup] = useState(false);

  const handleDeleteBtnClick = (landlord) => {
    setSelectedLandlord(landlord);
    setDeleteConfirmationPopup(true);
  };
  const handleCloseDeletePopup = () => {
    setDeleteConfirmationPopup(false);
    setSelectedLandlord('');
  };
  return (
    <div className="summary2">
      <div className="tenantslist">
        <h2 className="title">Landlord List</h2>
        {error && <span>{error}</span>}
        <div className="table-container">
          <table className="tenant-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {landlords &&
                landlords.map((landlord) => (
                  <tr key={landlord._id}>
                    <td>{landlord.name}</td>
                    <td>{landlord.email}</td>
                    <td>{landlord.phone || landlord.phoneNo}</td>
                    <td className="actions">
                      <Link
                        to={`/landlordProfile/${landlord._id}`}
                        className="edit-btn"
                      >
                        More Details
                      </Link>
                      <button
                        onClick={() => handleDeleteBtnClick(landlord)}
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
            <p>{selectedlandlord?.name}</p>
            {error && <p>{error}</p>}
            <div className="confirmation-actions">
              <button className="submit-btn" onClick={handleDelete}>
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
};

export default ListLandlord;
