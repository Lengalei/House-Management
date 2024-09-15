import { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './TenantUpdateDeposits.scss';
import apiRequest from '../../../../lib/apiRequest';

const TenantUpdateDeposit = () => {
  const { state } = useLocation();
  const tenant = state?.tenant;
  const navigate = useNavigate();

  const [toggleUpdate, setToggleUpdate] = useState(false);

  const calculateTotalDeficit = useMemo(() => {
    return (
      (tenant?.deposits?.rentDepositDeficit || 0) +
      (tenant?.deposits?.waterDepositDeficit || 0) +
      (tenant?.deposits?.initialRentPaymentDeficit || 0)
    );
  }, [tenant]);

  // Form data states
  const [totalFormData, setTotalFormData] = useState({
    totalAmount: '',
    referenceNumber: '',
    paymentDate: '',
    tenantId: tenant?._id, // Add tenantId to form data
  });

  const [individualFormData, setIndividualFormData] = useState({
    rentDepositDeficit: '',
    waterDepositDeficit: '',
    initialRentPaymentDeficit: '',
    referenceNumber: '',
    paymentDate: '',
    tenantId: tenant?._id, // Add tenantId to form data
  });

  // Toggle between forms
  const handleToggle = () => {
    setToggleUpdate(!toggleUpdate);
  };

  // Input change handlers
  const handleTotalInputChange = (e) => {
    setTotalFormData({
      ...totalFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleIndividualInputChange = (e) => {
    setIndividualFormData({
      ...individualFormData,
      [e.target.name]: e.target.value,
    });
  };

  // Submit handlers
  const handleSubmitTotal = async (e) => {
    e.preventDefault();
    try {
      const response = await apiRequest.put(
        '/v2/tenants/updateWithIndividualDepoAmount',
        totalFormData
      );
      if (response.status == 200) {
        if (response.data.tenant.isCleared) {
          navigate('/listAllTenants');
        } else {
          console.log(response);
          navigate('/v2/incompleteDeposits');
        }
      } else {
        console.log(response);
        navigate('/v2/incompleteDeposits');
      }
    } catch (error) {
      console.error('Error updating total deposit deficit:', error);
    }
  };

  const handleSubmitMultiple = async (e) => {
    e.preventDefault();
    try {
      const response = await apiRequest.put(
        '/v2/tenants/updateWithMultipleDeposits',
        individualFormData
      );
      if (response.status == 200) {
        if (response.data.tenant.deposits.isCleared) {
          navigate('/listAllTenants');
        } else {
          console.log(response);
          navigate('/v2/incompleteDeposits');
        }
      } else {
        console.log(response);
        navigate('/v2/incompleteDeposits');
      }
      // Handle success (e.g., redirect or show a success message)
    } catch (error) {
      console.error('Error updating individual deficits:', error);
    }
  };

  // Form rendering logic
  const renderToggleForm = () => {
    if (toggleUpdate) {
      return (
        <div className="toggle-form update-individual">
          <h3>Update Individual Deficits</h3>
          <form onSubmit={handleSubmitMultiple}>
            <div className="form-group">
              <label>Current Total Deficit:</label>
              <div>
                <strong>KSH {calculateTotalDeficit}</strong>
              </div>
            </div>
            {tenant?.deposits?.rentDepositDeficit > 0 && (
              <div className="form-group">
                <label>Rent Deposit Deficit:</label>
                <div>
                  <strong>Deficit:</strong> KSH{' '}
                  {tenant?.deposits?.rentDepositDeficit}
                </div>
                <input
                  type="number"
                  name="rentDepositDeficit"
                  placeholder="Enter Amount"
                  value={individualFormData.rentDepositDeficit}
                  onChange={handleIndividualInputChange}
                />
              </div>
            )}
            {tenant?.deposits?.waterDepositDeficit > 0 && (
              <div className="form-group">
                <label>Water Deposit Deficit:</label>
                <div>
                  <strong>Deficit:</strong> KSH{' '}
                  {tenant?.deposits?.waterDepositDeficit}
                </div>
                <input
                  type="number"
                  name="waterDepositDeficit"
                  placeholder="Enter Amount"
                  value={individualFormData.waterDepositDeficit}
                  onChange={handleIndividualInputChange}
                />
              </div>
            )}
            {tenant?.deposits?.initialRentPaymentDeficit > 0 && (
              <div className="form-group">
                <label>Initial Rent Payment Deficit:</label>
                <div>
                  <strong>Deficit:</strong> KSH{' '}
                  {tenant?.deposits?.initialRentPaymentDeficit}
                </div>
                <input
                  type="number"
                  name="initialRentPaymentDeficit"
                  placeholder="Enter Amount"
                  value={individualFormData.initialRentPaymentDeficit}
                  onChange={handleIndividualInputChange}
                />
              </div>
            )}
            <div className="form-group">
              <label>Reference Number:</label>
              <input
                type="text"
                name="referenceNumber"
                placeholder="Enter Reference Number"
                value={individualFormData.referenceNumber}
                onChange={handleIndividualInputChange}
              />
            </div>
            <div className="form-group">
              <label>Payment Date:</label>
              <input
                type="date"
                name="paymentDate"
                value={individualFormData.paymentDate}
                onChange={handleIndividualInputChange}
              />
            </div>
            <button type="submit">Update Individual</button>
          </form>
        </div>
      );
    } else {
      return (
        <div className="toggle-form update-total">
          <h3>Update Total Deposit Deficit</h3>
          <form onSubmit={handleSubmitTotal}>
            <div className="form-group">
              <label>Expected Amount:</label>
              <div>
                <strong>KSH {calculateTotalDeficit}</strong>
              </div>
            </div>
            <div className="form-group">
              <label>Enter Amount:</label>
              <input
                type="number"
                name="totalAmount"
                placeholder="Enter Amount"
                value={totalFormData.totalAmount}
                onChange={handleTotalInputChange}
              />
            </div>
            <div className="form-group">
              <label>Reference Number:</label>
              <input
                type="text"
                name="referenceNumber"
                placeholder="Enter Reference Number"
                value={totalFormData.referenceNumber}
                onChange={handleTotalInputChange}
              />
            </div>
            <div className="form-group">
              <label>Payment Date:</label>
              <input
                type="date"
                name="paymentDate"
                value={totalFormData.paymentDate}
                onChange={handleTotalInputChange}
              />
            </div>
            <button type="submit">Update Total</button>
          </form>
        </div>
      );
    }
  };

  return (
    <div className="tenant-update-page">
      <div className="tenant-info">
        <div className="card">
          <h2>{tenant?.name}</h2>
          <p>
            <strong>House No:</strong> {tenant?.houseDetails?.houseNo}
          </p>
          {tenant?.deposits?.rentDepositDeficit ? (
            <p>
              <strong>Rent Deposit Deficit:</strong> KSH{' '}
              {tenant?.deposits?.rentDepositDeficit}
            </p>
          ) : (
            ''
          )}

          {tenant?.deposits?.waterDepositDeficit ? (
            <p>
              <strong>Water Deposit Deficit:</strong> KSH{' '}
              {tenant?.deposits?.waterDepositDeficit}
            </p>
          ) : (
            ''
          )}

          {tenant?.deposits?.initialRentPaymentDeficit ? (
            <p>
              <strong>Initial rent Deficit:</strong> KSH{' '}
              {tenant?.deposits?.initialRentPaymentDeficit}
            </p>
          ) : (
            ''
          )}

          <p>
            <strong>Total Deficit:</strong> KSH {calculateTotalDeficit}
          </p>
        </div>
      </div>
      <div className="tenant-update-form">
        <div className="card">
          <div className="form-header">
            <h2>Update Deposit Information</h2>
            <button onClick={handleToggle} className="toggle-button">
              {toggleUpdate
                ? 'Switch to Total Update'
                : 'Switch to Individual Update'}
            </button>
          </div>
          {renderToggleForm()}
        </div>
      </div>
    </div>
  );
};

export default TenantUpdateDeposit;
