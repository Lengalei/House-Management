import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Pagination from 'react-js-pagination';
import './ApartmentListPage.scss';

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

  const [activePage, setActivePage] = useState(1);
  const apartmentsPerPage = 6;

  // Calculate the apartments to display on the current page
  const indexOfLastApartment = activePage * apartmentsPerPage;
  const indexOfFirstApartment = indexOfLastApartment - apartmentsPerPage;
  const currentApartments = apartments.slice(
    indexOfFirstApartment,
    indexOfLastApartment
  );

  const navigate = useNavigate();

  const handlePageChange = (pageNumber) => {
    setActivePage(pageNumber);
  };

  const navigateToApartmentDetail = (apartmentId) => {
    navigate(`/addHouse`);
  };

  return (
    <div className="apartment-list-page">
      <h2>Apartments</h2>
      <div className="apartment-cards-container">
        {currentApartments.map((apartment) => (
          <div key={apartment.id} className="apartment-card">
            <div className="apartment-name">{apartment.name}</div>
            <button
              className="arrow-button"
              onClick={() => navigateToApartmentDetail(apartment.id)}
            >
              →
            </button>
          </div>
        ))}
      </div>

      <div className="pagination-container">
        <Pagination
          activePage={activePage}
          itemsCountPerPage={apartmentsPerPage}
          totalItemsCount={apartments.length}
          pageRangeDisplayed={5}
          onChange={handlePageChange}
          itemClass="page-item"
          linkClass="page-link"
        />
      </div>
    </div>
  );
};

export default ApartmentListPage;
