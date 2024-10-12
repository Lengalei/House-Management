import { useEffect, useState } from 'react';
import apiRequest from '../../../lib/apiRequest';

function TopSumarry() {
  const [houses, setHouses] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [payments, setPayments] = useState();
  const vacantHouses = houses.filter((house) => !house.isOccupied);
  useEffect(() => {
    //fetchHouses
    const fetchHouses = async () => {
      const response = await apiRequest.get('/houses/getAllHouses');
      if (response.status) {
        // console.log('houses', response.data);
        setHouses(response.data);
      }
    };

    //fetchTenants
    const fetchTenants = async () => {
      const response = await apiRequest.get('/v2/tenants/getAllTenants');
      if (response.status) {
        // console.log('AllTenants: ', response.data);
        setTenants(response.data);
      }
    };

    //fetchAllPayments
    const fetchAllPayments = async () => {
      const response = await apiRequest.get('/v2/payments/getAllPayments');
      if (response.status) {
        // console.log('allPayments: ', response.data);
        setPayments(response.data);
      }
    };

    fetchAllPayments();
    fetchTenants();
    fetchHouses();
  }, []);
  return (
    <div className="topSummary">
      <div className="summaryCard">
        <div className="currentTotal">
          <div>
            <h3>
              {vacantHouses?.length}/{houses?.length}
            </h3>
          </div>
          <div className="glassy"></div>
        </div>
        <div className="details">
          <p>Vacant Houses</p>
        </div>
      </div>
      <div className="summaryCard">
        <div className="currentTotal c2">
          <div>
            <h3>2</h3>
          </div>
          <div className="glassy"></div>
        </div>
        <div className="details">
          <p>Total Appartments</p>
        </div>
      </div>
      <div className="summaryCard">
        <div className="currentTotal">
          <div>
            {' '}
            <h3>{payments}</h3>
          </div>

          <div className="glassy"></div>
        </div>
        <div className="details">
          <p>Total Earnings</p>
        </div>
      </div>
      <div className="summaryCard">
        <div className="currentTotal c2">
          <div>
            <h3>{tenants.length > 0 ? tenants.length : '0'}</h3>
          </div>
          <div className="glassy"></div>
        </div>
        <div className="details">
          <p>Active Tenants</p>
        </div>
      </div>
    </div>
  );
}

export default TopSumarry;
