import { FaHouseUser } from 'react-icons/fa';
import './Dashboard.scss';
// import Charts from './Charts';
import { useEffect, useState } from 'react';
import apiRequest from '../../lib/apiRequest';

function Dashboard() {
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
    <div className="dashboard">
      <div className="summary">
        <div className="dashboardcontent">
          <div className="dashboardheading">
            <div className="h1">
              <h1>Dashboard</h1>
              <div className="rentimage">
                <img src="/rents.png" alt="" />
              </div>
            </div>

            <p>Welcome to your dashboard</p>
          </div>

          <div className="container-info">
            <div className="box">
              <FaHouseUser
                size={80}
                color="var(--primary-color)"
                className="fa"
              />
              <p>Total Tenants:{tenants?.length}</p>
            </div>
            <div className="box">
              <FaHouseUser
                size={80}
                color="var(--primary-color)"
                className="fa"
              />
              <p>Total houses: {houses?.length}</p>
            </div>
            <div className="box">
              <FaHouseUser
                size={80}
                color="var(--primary-color)"
                className="fa"
              />
              <p>Vacant Houses:{vacantHouses?.length}</p>
            </div>
            <div className="box">
              <FaHouseUser
                size={80}
                color="var(--primary-color)"
                className="fa"
              />
              <p>Total earnings: {payments}</p>
            </div>
          </div>
          <div className="charts">
            <div className="chart1"></div>
            <div className="chart2"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
