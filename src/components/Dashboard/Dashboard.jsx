import { FaHouseUser } from 'react-icons/fa';
import './Dashboard.scss';
import Navbar from '../Navbar/Navbar';
import Sidebar from '../sidebar/Sidebar';
import Charts from './Charts';

function Dashboard() {
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
              <p>60 Total Tenants</p>
            </div>
            <div className="box">
              <FaHouseUser
                size={80}
                color="var(--primary-color)"
                className="fa"
              />
              <p>61 Total houses</p>
            </div>
            <div className="box">
              <FaHouseUser
                size={80}
                color="var(--primary-color)"
                className="fa"
              />
              <p>45000 Total earnings</p>
            </div>
            <div className="box">
              <FaHouseUser
                size={80}
                color="var(--primary-color)"
                className="fa"
              />
              <p>10 Vacant Houses</p>
            </div>
          </div>
          <Charts />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
