import { Link } from 'react-router-dom';
import { FaTrashAlt } from 'react-icons/fa';
import '../Tenants/Tenant.css';
import { useEffect, useState } from 'react';
import apiRequest from '../../lib/apiRequest';
import { useDispatch, useSelector } from 'react-redux';
import { setLandLord } from '../../features/Landlords/LandLordSlice';

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
  const dispatch = useDispatch();
  const landlords = useSelector((store) => store.landlordsData.landLords);

  useEffect(() => {
    const fetchAlllandlords = async () => {
      setError('');
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
      }
    };
    fetchAlllandlords();
  }, [dispatch]);

  const handleDelete = async (_id) => {
    try {
      const res = await apiRequest.delete(`/landlords/deleteLandlord/${_id}`);
      if (res.status === 200) {
        dispatch(setLandLord(landlords.filter((tenant) => tenant._id !== _id)));
      } else {
        console.error('Failed to delete tenant');
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <div className="summary2">
      <div className="tenantslist">
        <h2 className="title">Landlord List</h2>

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
                        onClick={() => handleDelete(landlord._id)}
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
        {error && <span>{error}</span>}
      </div>
    </div>
  );
};

export default ListLandlord;
