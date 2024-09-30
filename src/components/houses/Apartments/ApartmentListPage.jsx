import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Pagination from 'react-js-pagination';
import './ApartmentListPage.scss';
import { toast, ToastContainer } from 'react-toastify';
import apiRequest from '../../../lib/apiRequest';
import { TailSpin } from 'react-loader-spinner';

const ApartmentListPage = () => {
  const [apartments, setApartments] = useState([
    {
      id: 1,
      name: 'Maple Heights',
    },
    {
      id: 2,
      name: 'Oakwood Apartments',
    },
    {
      id: 3,
      name: 'Pinecrest Towers',
    },
    {
      id: 4,
      name: 'Cedar Ridge',
    },
    {
      id: 5,
      name: 'Elm Grove',
    },
    {
      id: 6,
      name: 'Birchwood Flats',
    },
    {
      id: 7,
      name: 'Spruce Villas',
    },
    {
      id: 8,
      name: 'Aspen Heights',
    },
    {
      id: 9,
      name: 'Chestnut Court',
    },
    {
      id: 10,
      name: 'Willow Park',
    },
    // Add more apartments as needed
  ]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchApartments = async () => {
      setLoading(true);
      try {
        const response = await apiRequest.get(
          '/v2/apartments/getAllApartments'
        );
        if (response.status) {
          // toast.success('Apartments fetched Succesfully!');
          setApartments(response.data);
        }
      } catch (error) {
        toast.error(error.response.data.message || 'Error Fetching apartments');
      } finally {
        setLoading(false);
      }
    };
    fetchApartments();
  }, []);

  const [activePage, setActivePage] = useState(1);
  const apartmentsPerPage = 6;

  // Calculate the apartments to display on the current page
  const indexOfLastApartment = activePage * apartmentsPerPage;
  const indexOfFirstApartment = indexOfLastApartment - apartmentsPerPage;
  const currentApartments = apartments?.slice(
    indexOfFirstApartment,
    indexOfLastApartment
  );

  const navigate = useNavigate();

  const handlePageChange = (pageNumber) => {
    setActivePage(pageNumber);
  };

  const navigateToApartmentDetail = (apartment) => {
    console.log(apartment);
    navigate(`/apartment/${apartment._id}`, {
      state: { apartmentData: apartment },
    });
  };

  return (
    <div className="apartment-list-page">
      <h2>Apartments</h2>
      <div className="apartment-cards-container">
        {currentApartments?.length > 0 ? (
          <>
            {currentApartments &&
              currentApartments?.map((apartment) => (
                <div key={apartment?._id} className="apartment-card">
                  <div className="apartment-name">
                    <h4>Name: {apartment?.name}</h4>
                    <h4>location: {apartment?.location}</h4>
                  </div>
                  <button
                    className="arrow-button"
                    onClick={() => navigateToApartmentDetail(apartment)}
                  >
                    →
                  </button>
                </div>
              ))}
          </>
        ) : (
          <div className="nothing">
            <h4>No Registered Apartments!</h4>
            <div className="nothingLinks">
              <Link to="/addAppartment">Add Apartment</Link>
            </div>
          </div>
        )}
      </div>

      <div className="pagination-container">
        <Pagination
          activePage={activePage}
          itemsCountPerPage={apartmentsPerPage}
          totalItemsCount={apartments?.length}
          pageRangeDisplayed={5}
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

export default ApartmentListPage;
