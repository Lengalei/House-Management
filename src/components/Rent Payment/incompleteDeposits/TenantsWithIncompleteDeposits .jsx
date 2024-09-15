import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactPaginate from 'react-js-pagination';
import './TenantsWithIncompleteDeposits.scss';
import apiRequest from '../../../lib/apiRequest';

const TenantsWithIncompleteDeposits = () => {
  const [tenants, setTenants] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const tenantsPerPage = 6; // Adjust the number of cards per page
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const response = await apiRequest.get(
          '/tenants/tenantWithIncompleteDepo'
        );
        setTenants(response.data.tenants);
      } catch (error) {
        console.error('Error fetching tenants:', error.message);
      }
    };

    fetchTenants();
  }, []);

  const calculateTotalDeficit = (tenant) => {
    return (
      tenant.deposits.rentDepositDeficit + tenant.deposits.waterDepositDeficit
    );
  };

  const formatLocalDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatNumber = (number) => {
    return number.toLocaleString();
  };

  const handleCardClick = (tenant) => {
    console.log('tenantToUpdateDepos: ', tenant);
    navigate('/tenantUpdateDeposit', {
      state: { tenant },
    });
  };

  const indexOfLastTenant = currentPage * tenantsPerPage;
  const indexOfFirstTenant = indexOfLastTenant - tenantsPerPage;
  const currentTenants = tenants.slice(indexOfFirstTenant, indexOfLastTenant);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="tenants-page">
      <h1>Tenants with Incomplete Deposits</h1>
      <div className="tenants-list">
        {currentTenants.map((tenant) => (
          <div
            key={tenant._id}
            className="tenant-card"
            onClick={() => handleCardClick(tenant)}
          >
            <h2>{tenant.name}</h2>
            <p>
              <strong>Total Deficit:</strong> KSH{' '}
              {formatNumber(calculateTotalDeficit(tenant))}
            </p>
            <p>
              <strong>Last Payment Date:</strong>{' '}
              {formatLocalDate(tenant.placementDate)}
            </p>
          </div>
        ))}
      </div>
      <div className="pagination">
        <ReactPaginate
          activePage={currentPage}
          itemsCountPerPage={tenantsPerPage}
          totalItemsCount={tenants.length}
          pageRangeDisplayed={5}
          onChange={handlePageChange}
          itemClass="page-item"
          linkClass="page-link"
        />
      </div>
    </div>
  );
};

export default TenantsWithIncompleteDeposits;
