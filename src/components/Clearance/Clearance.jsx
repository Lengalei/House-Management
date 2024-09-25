import './Clearance.scss';
import { useLocation } from 'react-router-dom';

function Clearance() {
  const location = useLocation();
  const { tenant } = location.state || {};

  return (
    <div className="clearance">
      <h1>CLEAR TENANT</h1> <hr className="h" />
      <div className="forms">
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

        <div className="formright">
          <form className="form1">
            <h1>Tenant{`'`}s Details</h1>
            <div className="clear title">
              <h4>
                Name : <span>{tenant?.name}</span>
              </h4>
            </div>
            <div className="clear title2">
              <h5>
                House No : <span>{tenant?.houseDetails?.houseNo}</span>
              </h5>
            </div>
            <div className="form1Clear">
              <label htmlFor="">
                House Deposit :{" "}
                <span className="clearspan">
                  {tenant?.houseDetails.rentDeposit}{" "}
                </span>
              </label>{" "}
              <hr />
              <label htmlFor="">
                Water Deposit :{" "}
                <span className="clearspan">
                  {tenant?.houseDetails?.waterDeposit}
                </span>
              </label>
              <hr />
              <label htmlFor="">
                Cash at Hand :
                <span className="clearspan">
                  {tenant?.houseDetails.rentDeposit +
                    tenant?.houseDetails?.waterDeposit}
                </span>
              </label>
            </div>
          </form>

          <div className="cleardiv">
            <div className="clear">
              <label htmlFor="">Refund</label>
              <input type="number" />
            </div>
            <button className="btn">Clear</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Clearance;
