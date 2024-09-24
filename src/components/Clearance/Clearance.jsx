import { useState } from 'react';
import './Clearance.css';

function Clearance() {
  const [name, setName] = useState('');
  const [houseno, setHouseno] = useState('');

  return (
    <div className="clearance">
      <h1>CLEAR TENANT</h1>
      <div className="forms">
        <form className="form1">
          <h1>Tenant{`'`}s Details</h1>
          <div className="clear">
            <label htmlFor="">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                e.target.value(setName);
              }}
            />
          </div>
          <div className="clear">
            <label htmlFor="">House No</label>
            <input
              type="text"
              value={houseno}
              onChange={(e) => {
                e.target.value(setHouseno);
              }}
            />
          </div>
          <div className="clear">
            <label htmlFor="">Cash at Hand</label>
            <input type="text" />
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
