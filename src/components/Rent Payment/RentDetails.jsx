import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiRequest from '../../lib/apiRequest';

function RentDetails() {
  const { _id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    monthlyRent: 17000,
    waterBill: 1200,
    garbageFee: 500,
    extraBills: 0,
    totalAmount: 0,
    amountPaid: 0,
    balance: 0,
  });

  // Fetch tenant data
  useEffect(() => {
    const fetchTenantData = async () => {
      try {
        const response = await apiRequest.get(
          `/tenants/getSingleTenant/${_id}`
        );
        console.log('Tenant Details: ', response.data);

        if (response.data) {
          const {
            monthlyRent = 17000,
            waterBill = 1200,
            garbageFee = 500,
            extraBills = 0,
            amountPaid = 0,
          } = response.data;

          const calculatedTotalAmount = (
            parseFloat(monthlyRent) +
            parseFloat(waterBill) +
            parseFloat(garbageFee) +
            parseFloat(extraBills)
          ).toFixed(2);

          setFormData({
            ...response.data,
            totalAmount: calculatedTotalAmount,
            balance: (calculatedTotalAmount - amountPaid).toFixed(2),
          });
        }
      } catch (error) {
        console.error('Error fetching tenant data:', error);
      }
    };

    fetchTenantData();
  }, [_id]);

  // Update totalAmount and balance whenever formData changes
  useEffect(() => {
    const totalAmount =
      parseFloat(formData.monthlyRent) +
        parseFloat(formData.waterBill) +
        parseFloat(formData.garbageFee) +
        parseFloat(formData.extraBills) || 0;

    setFormData((prevData) => ({
      ...prevData,
      totalAmount: totalAmount.toFixed(2),
      balance: (totalAmount - parseFloat(prevData.amountPaid || 0)).toFixed(2),
    }));
  }, [
    formData.monthlyRent,
    formData.waterBill,
    formData.garbageFee,
    formData.extraBills,
    formData.amountPaid,
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: parseFloat(value) || 0,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await apiRequest.put(
        `/tenants/updateSingleTenant/${_id}`,
        formData
      );
      if (response.status === 200) {
        navigate('/rentpayment');
      }
    } catch (error) {
      console.error('Error updating tenant data:', error);
    }
  };

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
              readOnly
            />
          </div>
          <div className="forminput">
            <label htmlFor="waterBill">Water Bill</label>
            <input
              type="number"
              name="waterBill"
              value={formData.waterBill}
              onChange={handleChange}
              readOnly
            />
          </div>
          <div className="forminput">
            <label htmlFor="garbageFee">Garbage Fee</label>
            <input
              type="number"
              name="garbageFee"
              value={formData.garbageFee}
              onChange={handleChange}
              readOnly
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
          <button type="submit" className="btn">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}

export default RentDetails;
