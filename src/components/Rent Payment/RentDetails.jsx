import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiRequest from '../../lib/apiRequest';

function RentDetails() {
  const { _id } = useParams();
  const navigate = useNavigate();

  // State to manage form inputs
  const [formData, setFormData] = useState({
    monthlyRent: '',
    extraBills: '',
    totalAmount: '',
    amountPaid: '',
    balance: '',
  });

  // Update state when form inputs change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Calculate totalAmount whenever monthlyRent or extraBills changes
  useEffect(() => {
    const monthlyRent = parseFloat(formData.monthlyRent) || 0;
    const extraBills = parseFloat(formData.extraBills) || 0;
    setFormData((prevData) => ({
      ...prevData,
      totalAmount: (monthlyRent + extraBills).toFixed(2),
    }));
  }, [formData.monthlyRent, formData.extraBills]);

  // Calculate balance whenever totalAmount or amountPaid changes
  useEffect(() => {
    const totalAmount = parseFloat(formData.totalAmount) || 0;
    const amountPaid = parseFloat(formData.amountPaid) || 0;
    setFormData((prevData) => ({
      ...prevData,
      balance: (totalAmount - amountPaid).toFixed(2),
    }));
  }, [formData.totalAmount, formData.amountPaid]);

  // Fetch existing tenant data and populate the form
  useEffect(() => {
    const fetchTenantData = async () => {
      try {
        const response = await apiRequest.get(
          `/tenants/getSingleTenant/${_id}`
        );
        console.log('tenantDetails: ', response.data);
        if (response.data) {
          setFormData({
            monthlyRent: response.data.monthlyRent || '',
            extraBills: response.data.extraBills || '',
            totalAmount: (
              parseFloat(response.data.monthlyRent || 0) +
              parseFloat(response.data.extraBills || 0)
            ).toFixed(2),
            amountPaid: response.data.amountPaid || '',
            balance: (
              parseFloat(response.data.monthlyRent || 0) +
              parseFloat(response.data.extraBills || 0) -
              parseFloat(response.data.amountPaid || 0)
            ).toFixed(2),
          });
        }
      } catch (error) {
        console.error('Error fetching tenant data:', error);
      }
    };

    fetchTenantData();
  }, [_id]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data
    const { monthlyRent, extraBills, totalAmount, amountPaid, balance } =
      formData;
    if (
      monthlyRent !== '' &&
      extraBills !== '' &&
      totalAmount !== '' &&
      amountPaid !== '' &&
      balance !== ''
    ) {
      // Prepare the data to be sent
      const data = {
        monthlyRent: parseFloat(monthlyRent),
        extraBills: parseFloat(extraBills),
        totalAmount: parseFloat(totalAmount),
        amountPaid: parseFloat(amountPaid),
        balance: parseFloat(balance),
      };

      // Make the PUT request to update the record
      try {
        const response = await apiRequest.put(
          `/tenants/updateSingleTenant/${_id}`,
          data
        );

        if (response.status) {
          console.log(response.data);
          navigate('/rentpayment');
        }
      } catch (error) {
        console.error('Error updating tenant data:', error);
      }
    } else {
      // Handle validation error (e.g., show an error message)
      alert('Please fill in all fields.');
    }
  };

  // Check if first form is filled
  const isFirstFormFilled =
    formData.monthlyRent !== '' && formData.extraBills !== '';

  return (
    <div className="rent">
      <div className="form">
        <h2>Rent Records</h2>
        <form>
          <div className="forminput">
            <label htmlFor="monthlyRent">Monthly Rent</label>
            <input
              type="number"
              name="monthlyRent"
              value={formData.monthlyRent}
              onChange={handleChange}
            />
          </div>
          <div className="forminput">
            <label htmlFor="extraBills">Extra Bills</label>
            <input
              type="number"
              name="extraBills"
              value={formData.extraBills}
              onChange={handleChange}
            />
          </div>
          <div className="forminput">
            <label htmlFor="totalAmount">Total Amount</label>
            <input
              type="number"
              name="totalAmount"
              value={formData.totalAmount}
              readOnly
            />
          </div>
        </form>
      </div>
      <div className="form">
        <h2>Payment Records</h2>
        <form onSubmit={handleSubmit}>
          <div className="forminput">
            <label htmlFor="amountPaid">Amount Paid</label>
            <input
              type="number"
              name="amountPaid"
              value={formData.amountPaid}
              onChange={handleChange}
              disabled={!isFirstFormFilled}
            />
          </div>
          <div className="forminput">
            <label htmlFor="balance">Balance</label>
            <input
              type="number"
              name="balance"
              value={formData.balance}
              readOnly
            />
          </div>
          <button type="submit" className="btn" disabled={!isFirstFormFilled}>
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}

export default RentDetails;
