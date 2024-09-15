import { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import './TenantUpdateDeposits.scss';
import apiRequest from '../../../lib/apiRequest';

const TenantUpdateDeposit = () => {
  const { state } = useLocation();
  const tenant = state?.tenant;

  const [toggleUpdate, setToggleUpdate] = useState(false);

  const calculateTotalDeficit = useMemo(() => {
    return (
      (tenant?.deposits?.rentDepositDeficit || 0) +
      (tenant?.deposits?.waterDepositDeficit || 0) +
      (tenant?.deposits?.initialRentPaymentDeficit || 0)
    );
  }, [tenant]);

  const [formData, setFormData] = useState({
    totalAmount: '',
    referenceNumber: '',
    paymentDate: '',
    rentDepositDeficit: '',
    waterDepositDeficit: '',
    initialRentPaymentDeficit: '',
  });

  const handleToggle = () => {
    setToggleUpdate(!toggleUpdate);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmitTotal = async (e) => {
    e.preventDefault();
    try {
      await apiRequest.put('/updateTotal', formData);
      // Handle success (e.g., redirect or show a success message)
    } catch (error) {
      console.error('Error updating total deposit deficit:', error);
    }
  };

  const handleSubmitIndividual = async (e) => {
    e.preventDefault();
    try {
      await apiRequest.put('/updateIndividual', formData);
      // Handle success (e.g., redirect or show a success message)
    } catch (error) {
      console.error('Error updating individual deficits:', error);
    }
  };

  const renderToggleForm = () => {
    if (toggleUpdate) {
      return (
        <div className="toggle-form update-individual">
          <h3>Update Individual Deficits</h3>
          <form onSubmit={handleSubmitIndividual}>
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
                  value={formData.rentDepositDeficit}
                  onChange={handleInputChange}
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
                  value={formData.waterDepositDeficit}
                  onChange={handleInputChange}
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
                  value={formData.initialRentPaymentDeficit}
                  onChange={handleInputChange}
                />
              </div>
            )}
            <div className="form-group">
              <label>Current Total Deficit:</label>
              <div>
                <strong>KSH {calculateTotalDeficit}</strong>
              </div>
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
                value={formData.totalAmount}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Reference Number:</label>
              <input
                type="text"
                name="referenceNumber"
                placeholder="Enter Reference Number"
                value={formData.referenceNumber}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Payment Date:</label>
              <input
                type="date"
                name="paymentDate"
                value={formData.paymentDate}
                onChange={handleInputChange}
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
          <p>
            <strong>Rent Deposit Deficit:</strong> KSH{' '}
            {tenant?.deposits?.rentDepositDeficit}
          </p>
          <p>
            <strong>Water Deposit Deficit:</strong> KSH{' '}
            {tenant?.deposits?.waterDepositDeficit}
          </p>
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
