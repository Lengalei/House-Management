import { useState, useEffect } from 'react';
import './TenantPaymentForm.scss';
import { useNavigate, useParams } from 'react-router-dom';
import apiRequest from '../../../lib/apiRequest';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TenantPaymentForm = () => {
  const { tenantId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    date: '',
    extraBills: 0,
    rent: 0,
    waterBill: 0,
    garbageFee: 0,
    referenceNo: '',
    amountPaid: 0,
  });

  const [outstandingPayments, setOutstandingPayments] = useState([]);
  const [showOutstandingPayments, setShowOutstandingPayments] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  useEffect(() => {
    const fetchTenant = async () => {
      try {
        const response = await apiRequest.get(
          `/tenants/getSingleTenant/${tenantId}`
        );
        if (response.status) {
          const tenant = response.data;
          setFormData((prevData) => ({
            ...prevData,
            rent: tenant.rentPayable || 1700,
            waterBill: tenant.waterDeposit || 1200,
            garbageFee: tenant.garbageFee || 500,
          }));
        }
      } catch (error) {
        console.error('Error fetching tenant details:', error);
        toast.error('Error fetching tenant details.');
      }
    };

    fetchTenant();
    fetchOutstandingPayments();
  }, [tenantId]);

  const fetchOutstandingPayments = async () => {
    try {
      const response = await apiRequest.get(
        `/payments/paymentsByTenant/${tenantId}`
      );
      const unpaid = response.data.filter((payment) => !payment.isCleared);
      setOutstandingPayments(unpaid);
    } catch (error) {
      console.error('Error fetching outstanding payments:', error);
      toast.error('Error fetching outstanding payments.');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await apiRequest.post('/payments/create', {
        tenantId,
        ...formData,
      });
      if (response.status) {
        toast.success('Payment record created successfully');
        setFormData((prevData) => ({
          ...prevData,
          date: '',
          extraBills: 0,
          amountPaid: 0,
        }));
        setOutstandingPayments([]);
        navigate(`/tenantPaymentList/${tenantId}`);
      }
    } catch (error) {
      console.error('Error creating payment record:', error);
      toast.error('Error creating payment record.');
    }
  };

  const handleUpdateDefaultValues = async (e) => {
    e.preventDefault();
    try {
      const response = await apiRequest.put(
        `/tenants/updateSingleTenant/${tenantId}`,
        {
          rentPayable: formData.rent,
          waterDeposit: formData.waterBill,
          garbageFee: formData.garbageFee,
        }
      );
      if (response.status) {
        toast.success('Default values updated successfully');
        setShowUpdateForm(!showUpdateForm);
      }
    } catch (error) {
      console.error('Error updating default values:', error);
      toast.error('Error updating default values.');
    }
  };

  const handleEditPayment = (payment) => {
    setSelectedPayment(payment);
  };

  const handleUpdatePayment = async (e) => {
    e.preventDefault();
    try {
      const response = await apiRequest.put(
        `/payments/updatePayment/${selectedPayment._id}`,
        {
          amountPaid: formData.amountPaid,
        }
      );
      if (response.status) {
        toast.success('Payment updated successfully');
        setSelectedPayment(null);
        await fetchOutstandingPayments();
      }
    } catch (error) {
      console.error('Error updating payment:', error);
      toast.error('Error updating payment.');
    }
  };

  const handleClosePopup = () => {
    setSelectedPayment(null);
    setShowOutstandingPayments(false);
  };

  return (
    <div className="tenant-payment-form">
      <ToastContainer />
      <h2>Create Payment</h2>
      <div className="outstanding-payments-header">
        <button
          onClick={() => setShowOutstandingPayments(!showOutstandingPayments)}
        >
          {showOutstandingPayments ? 'Hide' : 'View'} Outstanding Payments
        </button>
      </div>

      {showOutstandingPayments && (
        <div className="popup outstanding-payments-popup">
          <div className="popup-content1">
            <button className="close-button" onClick={handleClosePopup}>
              X
            </button>
            <h3>Outstanding Payments</h3>
            {outstandingPayments.length > 0 ? (
              outstandingPayments.map((payment) => (
                <div key={payment._id} className="mini-card">
                  <p>Date: {new Date(payment.date).toLocaleDateString()}</p>
                  <p>Balance: {payment.balance}</p>
                  <button onClick={() => handleEditPayment(payment)}>
                    Edit Payment
                  </button>
                </div>
              ))
            ) : (
              <p>No outstanding payments.</p>
            )}
          </div>
        </div>
      )}

      <div className="form-container">
        <div className="form-card left-card">
          <form onSubmit={handleSubmit}>
            <label>Date:</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
            <label className="extra-bills">Extra Bills:</label>
            <input
              type="number"
              name="extraBills"
              value={formData.extraBills}
              onChange={handleChange}
            />
            <label className="amountPaid">Amount Paid:</label>
            <input
              type="number"
              name="amountPaid"
              value={formData.amountPaid}
              onChange={handleChange}
            />
            <label>Reference Number:</label>
            <input
              type="text"
              name="referenceNo"
              value={formData.referenceNo}
              onChange={handleChange}
              required
            />
            <button type="submit">Submit</button>
          </form>
        </div>

        <div className="form-card right-card">
          <div className="default-values">
            <p>Rent: {formData.rent}</p>
            <p>Water Bill: {formData.waterBill}</p>
            <p>Garbage Fee: {formData.garbageFee}</p>
            <button onClick={() => setShowUpdateForm(!showUpdateForm)}>
              Update Default Values
            </button>
          </div>
          {showUpdateForm && (
            <form onSubmit={handleUpdateDefaultValues} className="update-form">
              <label>Rent:</label>
              <input
                type="number"
                name="rent"
                value={formData.rent}
                onChange={handleChange}
                required
              />
              <label>Water Bill:</label>
              <input
                type="number"
                name="waterBill"
                value={formData.waterBill}
                onChange={handleChange}
                required
              />
              <label>Garbage Fee:</label>
              <input
                type="number"
                name="garbageFee"
                value={formData.garbageFee}
                onChange={handleChange}
                required
              />
              <button type="submit">Update Values</button>
            </form>
          )}
        </div>
      </div>

      {selectedPayment && (
        <div className="popup">
          <div className="popup-content">
            <button className="close-button" onClick={handleClosePopup}>
              X
            </button>
            <h3>Edit Payment</h3>
            <form onSubmit={handleUpdatePayment}>
              <label>
                Amount Paid:
                <input
                  type="number"
                  name="amountPaid"
                  value={formData.amountPaid}
                  onChange={handleChange}
                  required
                />
              </label>
              <button type="submit">Update</button>
              <button type="button" onClick={handleClosePopup}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantPaymentForm;
