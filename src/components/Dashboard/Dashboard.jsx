import { FaHouseUser } from 'react-icons/fa';
import './Dashboard.css';

function Dashboard() {
  return (
    <div>
      <div className="dashboardcontent">
        <div className="dashboardheading">
          <h1>Dashboard</h1>
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
            <p>45000 Total Monthly earnings</p>
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
      </div>
    </div>
  );
}

export default Dashboard;
