import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Pagination from 'react-js-pagination';
import './ApartmentRegistration.scss';
import { toast, ToastContainer } from 'react-toastify';
import apiRequest from '../../../lib/apiRequest';
import { TailSpin } from 'react-loader-spinner';

const ApartmentRegistration = () => {
  const navigate = useNavigate();
  //   const [apartments, setApartments] = useState([]);
  const [name, setApartmentName] = useState('');
  const [noHouses, setNumOfHouses] = useState('');
  const [location, setLocation] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(3);

  const dummyApartments = [
    {
      _id: 1,
      name: 'Maple Heights',
      noHouses: 12,
      location: 'Downtown, Nairobi',
    },
    {
      _id: 2,
      name: 'Oakwood Apartments',
      noHouses: 8,
      location: 'Westlands, Nairobi',
    },
    {
      _id: 3,
      name: 'Pinecrest Towers',
      noHouses: 20,
      location: 'Kilimani, Nairobi',
    },
    {
      _id: 4,
      name: 'Cedar Ridge',
      noHouses: 15,
      location: 'Lavington, Nairobi',
    },
    {
      _id: 5,
      name: 'Elm Grove',
      noHouses: 10,
      location: 'Kilimani, Nairobi',
    },
    {
      _id: 6,
      name: 'Birchwood Flats',
      noHouses: 18,
      location: 'Kileleshwa, Nairobi',
    },
    {
      _id: 7,
      name: 'Spruce Villas',
      noHouses: 22,
      location: 'Runda, Nairobi',
    },
    {
      _id: 8,
      name: 'Aspen Heights',
      noHouses: 14,
      location: 'Muthaiga, Nairobi',
    },
    {
      _id: 9,
      name: 'Chestnut Court',
      noHouses: 9,
      location: 'Kasarani, Nairobi',
    },
    {
      _id: 10,
      name: 'Willow Park',
      noHouses: 16,
      location: "Lang'ata, Nairobi",
    },
  ];

  // In the useState hook, replace the empty array with this dummy data
  const [apartments, setApartments] = useState(dummyApartments);
  const [loading, setLoading] = useState(false);
  // Handle form submission
  const handleRegisterApartment = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await apiRequest.post(
        '/v2/apartments/registerApartment',
        { name, noHouses, location }
      );
      if (response.status) {
        toast.success('Success apartment registration');

        await fetchApartments();
        setApartmentName('');
        setNumOfHouses('');
        setLocation('');
        setLoading(false);
      }
    } catch (error) {
      toast.error(error.response.data.message || 'Error Registering Apartment');
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };
  const fetchApartments = async () => {
    try {
      const response = await apiRequest.get('/v2/apartments/getAllApartments');
      if (response.status) {
        // toast.success('Apartments fetched Succesfully!');
        setApartments(response.data);
      }
    } catch (error) {
      toast.error(error.response.data.message || 'Error Fetching apartments');
    }
  };
  useEffect(() => {
    fetchApartments();
  }, []);

  // Handle pagination
  const indexOfLastApartment = currentPage * itemsPerPage;
  const indexOfFirstApartment = indexOfLastApartment - itemsPerPage;
  const currentApartments =
    apartments.length > 0 &&
    apartments?.slice(indexOfFirstApartment, indexOfLastApartment);

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
              value={name}
              onChange={(e) => setApartmentName(e.target.value)}
              placeholder="Enter apartment name"
              required
            />
          </div>
          <div className="form-group">
            <label>Number of Houses</label>
            <input
              type="number"
              value={noHouses}
              onChange={(e) => setNumOfHouses(e.target.value)}
              placeholder="Enter number of houses"
              required
            />
          </div>
          <div className="form-group">
            <label>location</label>
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
        {currentApartments.length > 0 &&
          currentApartments?.map((apartment) => (
            <div key={apartment?._id} className="apartment-card">
              <h3>{apartment?.name}</h3>
              <p>Houses: {apartment?.noHouses}</p>
              <p>location: {apartment?.location}</p>
              <button
                className="btn-secondary"
                onClick={() =>
                  navigate(`/apartment/${apartment._id}`, {
                    state: { apartmentData: apartment },
                  })
                }
              >
                View Houses
              </button>
            </div>
          ))}

        <Pagination
          activePage={currentPage}
          itemsCountPerPage={itemsPerPage}
          totalItemsCount={apartments?.length}
          pageRangeDisplayed={3}
          onChange={handlePageChange}
          itemClass="page-item"
          linkClass="page-link"
        />
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
      <ToastContainer />
    </div>
  );
};

export default ApartmentRegistration;
