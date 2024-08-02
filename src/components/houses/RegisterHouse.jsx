import { useState, useEffect } from 'react';
import './RegisterHouse.scss';
import { ThreeDots } from 'react-loader-spinner';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import apiRequest from '../../lib/apiRequest';
import { useNavigate } from 'react-router-dom';

const floorOptions = [
  { label: 'Ground Floor', value: 0 },
  { label: 'First Floor', value: 1 },
  { label: 'Second Floor', value: 2 },
  { label: 'Third Floor', value: 3 },
  { label: 'Fourth Floor', value: 4 },
  { label: 'Fifth Floor', value: 5 },
  { label: 'Sixth Floor', value: 6 },
];

const houseLetterOptions = ['A', 'B', 'C', 'D'];

const RegisterHouse = () => {
  // eslint-disable-next-line no-unused-vars
  const [floor, setFloor] = useState('');
  const [houseName, setHouseName] = useState('');
  const [loading, setLoading] = useState(false);
  const [houses, setHouses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [housesPerPage] = useState(5);
  const [showHouseNamePopup, setShowHouseNamePopup] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [registeredHouseNames, setRegisteredHouseNames] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    fetchHouses();
  }, []);

  const fetchHouses = async () => {
    setLoading(true);
    try {
      const response = await apiRequest.get('/houses/getAllHouses');
      const houseData = response.data;
      setHouses(houseData);

      // Extract registered house names
      const registeredNames = houseData.map((house) => house.houseName);
      setRegisteredHouseNames(registeredNames);
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiRequest.post('/houses/postHouse', {
        houseName,
        floor: selectedFloor.value,
      });
      if (response.status === 200) {
        toast.success('House registered successfully!');
        setHouseName('');
        setFloor('');
        fetchHouses();
        navigate('/');
      } else {
        toast.error('Failed to register house.');
      }
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFloorChange = (e) => {
    const selected = floorOptions.find(
      (option) => option.value === Number(e.target.value)
    );
    setSelectedFloor(selected);
    setShowHouseNamePopup(true);
  };

  const handleHouseNameSelect = (letter) => {
    const houseName = `House ${selectedFloor.value}${letter}`;
    if (!registeredHouseNames.includes(houseName)) {
      setHouseName(houseName);
      setShowHouseNamePopup(false);
    }
  };

  const closeHouseNamePopup = () => {
    setShowHouseNamePopup(false);
  };

  const indexOfLastHouse = currentPage * housesPerPage;
  const indexOfFirstHouse = indexOfLastHouse - housesPerPage;
  const currentHouses = houses.slice(indexOfFirstHouse, indexOfLastHouse);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="register-house-container">
      <ToastContainer />
      {loading && (
        <div className="loader">
          <ThreeDots
            className="threeDots"
            height="100"
            width="100"
            radius="9"
            color="#4fa94d"
            ariaLabel="three-dots-loading"
            visible={true}
          />
        </div>
      )}
      <div className="register-house">
        <h2>Register House</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="floor">Floor</label>
            <select
              id="floor"
              value={selectedFloor ? selectedFloor.value : ''}
              onChange={handleFloorChange}
              required
            >
              <option value="" disabled>
                Select Floor
              </option>
              {floorOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {showHouseNamePopup && (
            <div className="house-name-popup">
              <h3>Select House Name</h3>
              <div className="house-name-options">
                {houseLetterOptions.map((letter) => {
                  const houseNameOption = `House ${selectedFloor.value}${letter}`;
                  const isRegistered =
                    registeredHouseNames.includes(houseNameOption);
                  return (
                    <button
                      key={letter}
                      type="button"
                      onClick={() => handleHouseNameSelect(letter)}
                      disabled={isRegistered}
                      className={isRegistered ? 'registered' : ''}
                    >
                      {isRegistered && '🚫 '}
                      {houseNameOption}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                className="close-popup-btn"
                onClick={closeHouseNamePopup}
              >
                Close
              </button>
            </div>
          )}
          <div className="form-group">
            <label htmlFor="houseName">House Name</label>
            <input
              type="text"
              id="houseName"
              placeholder="House Name"
              value={houseName}
              onChange={(e) => setHouseName(e.target.value)}
              readOnly
              required
            />
          </div>

          <button type="submit" className="submit-btn">
            Register
          </button>
        </form>
      </div>
      <div className="house-list">
        <h2>Registered Houses</h2>
        {currentHouses.map((house) => (
          <div className="house-card" key={house._id}>
            <div className="house-icon">🏠</div>
            <div className="house-details">
              <p>
                <strong>{house.houseName}</strong>
              </p>
              <p>Floor: {house.floor}</p>
              <p>Status: {house.isOccupied ? 'Occupied' : 'Available'}</p>
              {house.isOccupied && <p>Occupied by: {house.tenantName}</p>}
            </div>
          </div>
        ))}
        <div className="pagination">
          {Array.from(
            { length: Math.ceil(houses.length / housesPerPage) },
            (_, index) => (
              <button key={index} onClick={() => paginate(index + 1)}>
                {index + 1}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterHouse;
