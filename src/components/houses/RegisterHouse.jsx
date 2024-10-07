import { useState, useEffect } from 'react';
import './RegisterHouse.scss';
import { ThreeDots } from 'react-loader-spinner';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import apiRequest from '../../lib/apiRequest';
import { useLocation, useParams } from 'react-router-dom';

// Function to map floor number to floor name with dynamic ordinal suffix generation
const getFloorName = (floorNumber) => {
  if (floorNumber === 0) return 'Ground Floor';

  const ordinalSuffix = (n) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };

  return `${floorNumber}${ordinalSuffix(floorNumber)} Floor`;
};

const houseLetterOptions = ['A', 'B', 'C', 'D'];

const RegisterHouse = () => {
  const { apartmentId } = useParams();
  const location = useLocation();
  const apartment = location?.state?.apartmentData || {};
  const [floorOptions, setFloorOptions] = useState([]);
  const [floor, setFloor] = useState('');
  const [houseName, setHouseName] = useState('');
  const [loading, setLoading] = useState(false);
  const [houses, setHouses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [housesPerPage] = useState(5);
  const [showHouseNamePopup, setShowHouseNamePopup] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [registeredHouseNames, setRegisteredHouseNames] = useState([]);
  const [showAddFloorPopup, setShowAddFloorPopup] = useState(false);
  const [newFloorNumber, setNewFloorNumber] = useState('');

  useEffect(() => {
    fetchFloors(); // Fetch available floors on component mount
    fetchHouses();
  }, []);

  // Fetch available floors from backend
  const fetchFloors = async () => {
    setLoading(true);
    try {
      const response = await apiRequest.get(
        `/v2/floors/getAllFloorsInApartment/${apartmentId}`
      );
      const floorsData = response.data.map((floor) => ({
        label: getFloorName(floor.floorNumber),
        value: floor.floorNumber,
      }));
      setFloorOptions(floorsData);
    } catch (error) {
      toast.error('Error fetching floors');
    } finally {
      setLoading(false);
    }
  };

  // Fetch houses
  const fetchHouses = async () => {
    setLoading(true);
    try {
      const response = await apiRequest.get(
        `/houses/getAllHouses/${apartmentId}`
      );
      const houseData = response.data;
      setHouses(houseData);

      const registeredNames = houseData.map((house) => house.houseName);
      setRegisteredHouseNames(registeredNames);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error getting Houses');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiRequest.post(
        `/houses/postHouse/${apartmentId}`,
        {
          houseName,
          floor: selectedFloor.value,
        }
      );
      if (response.status === 200) {
        toast.success('House registered successfully!');
        setHouseName('');
        setFloor('');
        setSelectedFloor(null);
        await fetchHouses();
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

  const handleAddFloor = async () => {
    if (newFloorNumber === '') return;
    const floorNumber = Number(newFloorNumber);
    const floorName = getFloorName(floorNumber);

    try {
      const response = await apiRequest.post('/v2/floors/addFloor', {
        floorNumber,
        floorName,
        apartmentId,
      });
      if (response.status === 200) {
        toast.success('Floor added successfully!');
        setShowAddFloorPopup(false);
        setNewFloorNumber('');
        await fetchFloors(); // Refetch floors after adding a new one
      }
    } catch (error) {
      toast.error('Error adding floor');
    }
  };

  const indexOfLastHouse = currentPage * housesPerPage;
  const indexOfFirstHouse = indexOfLastHouse - housesPerPage;
  const currentHouses = houses.slice(indexOfFirstHouse, indexOfLastHouse);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="register-house-container">
      <div className="register-house">
        <h2>{apartment?.name + `'s`} House Registration</h2>
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
            <button
              type="button"
              onClick={() => setShowAddFloorPopup(true)}
              className="add-floor-btn"
            >
              +
            </button>
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

      {showAddFloorPopup && (
        <div className="add-floor-popup">
          <h3>Add New Floor</h3>
          <input
            type="number"
            placeholder="Enter floor number"
            value={newFloorNumber}
            onChange={(e) => setNewFloorNumber(e.target.value)}
          />
          <button type="button" onClick={handleAddFloor}>
            Add Floor
          </button>
          <button type="button" onClick={() => setShowAddFloorPopup(false)}>
            Close
          </button>
        </div>
      )}

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
    </div>
  );
};

export default RegisterHouse;
