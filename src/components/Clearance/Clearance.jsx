import './Clearance.scss';
import { useLocation } from 'react-router-dom';

function Clearance() {
  const location = useLocation();
  const { tenant } = location.state || {};

  return (
    <div className="clearance">
      <h1>CLEAR TENANT</h1>
      <div className="forms">
        <form className="form1">
          <h1>Tenant{`'`}s Details</h1>
          <div className="clear">
            <label htmlFor="">Name: {tenant?.name}</label>
          </div>
          <div className="clear">
            <label htmlFor="">House No: {tenant?.houseDetails?.houseNo}</label>
          </div>
          <div className="clear">
            <label htmlFor="">
              House Deposit: {tenant?.houseDetails.rentDeposit}{' '}
            </label>
            <label htmlFor="">
              Water Deposit{tenant?.houseDetails?.waterDeposit}
            </label>
            <label htmlFor="">
              Cash at Hand
              {tenant?.houseDetails.rentDeposit +
                tenant?.houseDetails?.waterDeposit}
            </label>
          </div>
        </form>

        <form className="form2">
          <h1>Tenant{`'`}s bills</h1>
          <div className="clear">
            <label htmlFor="">Water Bill</label>
            <input type="number" />
          </div>
          <div className="clear">
            <label htmlFor="">Garbage fee</label>
            <input type="number" />
          </div>
          <div className="clear">
            <label htmlFor="">painting fee</label>
            <input type="number" />
          </div>
          <div className="clear">
            <label htmlFor="">Miscelleneous</label>
            <input type="number" />
          </div>
        </form>
      </div>

      <div className="cleardiv">
        <div className="clear">
          <label htmlFor="">Refund</label>
          <input type="number" />
        </div>
        <button className="btn">Clear</button>
      </div>
    </div>
  );
}

export default Clearance;
