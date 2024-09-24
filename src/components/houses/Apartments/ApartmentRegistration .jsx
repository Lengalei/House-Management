import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Pagination from 'react-js-pagination';
import './ApartmentRegistration.scss';

const ApartmentRegistration = () => {
  const navigate = useNavigate();
  //   const [apartments, setApartments] = useState([]);
  const [apartmentName, setApartmentName] = useState('');
  const [numOfHouses, setNumOfHouses] = useState('');
  const [location, setLocation] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(3);

  const dummyApartments = [
    {
      id: 1,
      name: 'Maple Heights',
      houses: 12,
      location: 'Downtown, Nairobi',
    },
    {
      id: 2,
      name: 'Oakwood Apartments',
      houses: 8,
      location: 'Westlands, Nairobi',
    },
    {
      id: 3,
      name: 'Pinecrest Towers',
      houses: 20,
      location: 'Kilimani, Nairobi',
    },
    {
      id: 4,
      name: 'Cedar Ridge',
      houses: 15,
      location: 'Lavington, Nairobi',
    },
    {
      id: 5,
      name: 'Elm Grove',
      houses: 10,
      location: 'Kilimani, Nairobi',
    },
    {
      id: 6,
      name: 'Birchwood Flats',
      houses: 18,
      location: 'Kileleshwa, Nairobi',
    },
    {
      id: 7,
      name: 'Spruce Villas',
      houses: 22,
      location: 'Runda, Nairobi',
    },
    {
      id: 8,
      name: 'Aspen Heights',
      houses: 14,
      location: 'Muthaiga, Nairobi',
    },
    {
      id: 9,
      name: 'Chestnut Court',
      houses: 9,
      location: 'Kasarani, Nairobi',
    },
    {
      id: 10,
      name: 'Willow Park',
      houses: 16,
      location: "Lang'ata, Nairobi",
    },
  ];

  // In the useState hook, replace the empty array with this dummy data
  const [apartments, setApartments] = useState(dummyApartments);

  // Handle form submission
  const handleRegisterApartment = (e) => {
    e.preventDefault();

    const newApartment = {
      id: apartments.length + 1,
      name: apartmentName,
      houses: numOfHouses,
      location: location,
    };

    setApartments([...apartments, newApartment]);
    setApartmentName('');
    setNumOfHouses('');
    setLocation('');
  };

  // Handle pagination
  const indexOfLastApartment = currentPage * itemsPerPage;
  const indexOfFirstApartment = indexOfLastApartment - itemsPerPage;
  const currentApartments = apartments.slice(
    indexOfFirstApartment,
    indexOfLastApartment
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="apartment-registration-container">
      <div className="card card-left">
        <h2>Register Apartment</h2>
        <form onSubmit={handleRegisterApartment}>
          <div className="form-group">
            <label>Apartment Name</label>
            <input
              type="text"
              value={apartmentName}
              onChange={(e) => setApartmentName(e.target.value)}
              placeholder="Enter apartment name"
              required
            />
          </div>
          <div className="form-group">
            <label>Number of Houses</label>
            <input
              type="number"
              value={numOfHouses}
              onChange={(e) => setNumOfHouses(e.target.value)}
              placeholder="Enter number of houses"
              required
            />
          </div>
          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter location"
              required
            />
          </div>
          <button type="submit" className="btn-primary">
            Register Apartment
          </button>
        </form>
      </div>

      <div className="card card-right">
        <h2>Registered Apartments</h2>
        {currentApartments.map((apartment) => (
          <div key={apartment.id} className="apartment-card">
            <h3>{apartment.name}</h3>
            <p>Houses: {apartment.houses}</p>
            <p>Location: {apartment.location}</p>
            <button
              className="btn-secondary"
              onClick={() => navigate(`/addHouse`)}
            >
              View Houses
            </button>
          </div>
        ))}

        <Pagination
          activePage={currentPage}
          itemsCountPerPage={itemsPerPage}
          totalItemsCount={apartments.length}
          pageRangeDisplayed={3}
          onChange={handlePageChange}
          itemClass="page-item"
          linkClass="page-link"
        />
      </div>
    </div>
  );
};

export default ApartmentRegistration;
