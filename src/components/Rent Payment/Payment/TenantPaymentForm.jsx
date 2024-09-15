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

  const [monthInQuestionPay, setMonthInQuestionPay] = useState('');
  const [tenantName, setTenantName] = useState('');

  const [outstandingPayments, setOutstandingPayments] = useState([]);
  const [showOutstandingPayments, setShowOutstandingPayments] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false); // New state for confirmation popup

  useEffect(() => {
    const fetchTenant = async () => {
      try {
        const response = await apiRequest.get(
          `/tenants/getSingleTenant/${tenantId}`
        );

        console.log('singleTenantDt:', response.data);
        if (response.status) {
          const tenant = response.data;
          setFormData((prevData) => ({
            ...prevData,
            rent: tenant.rentPayable || 1700,
            waterBill: tenant.waterDeposit || 1200,
            garbageFee: tenant.garbageFee || 500,
          }));
          setMonthInQuestionPay(response.data.monthInQuestionPay);
          setTenantName(response.data.name);
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
      const unpaid = response.data.payments.filter(
        (payment) => !payment.isCleared
      );
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirmationPopup(true); // Show confirmation popup
  };

  const handleConfirm = async () => {
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
      setShowConfirmationPopup(false); // Close confirmation popup
    } catch (error) {
      console.error('Error creating payment record:', error);
      toast.error('Error creating payment record.');
      setShowConfirmationPopup(false); // Close confirmation popup
    }
  };

  const handleCancel = () => {
    setShowConfirmationPopup(false); // Close confirmation popup
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
          date: formData.date,
          referenceNo: formData.referenceNo,
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

  // New functionality to calculate the next month
  const getNextMonth = (currentMonth) => {
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const currentIndex = monthNames.indexOf(currentMonth);
    return monthNames[(currentIndex + 1) % 12];
  };

  const nextMonthPay = getNextMonth(monthInQuestionPay);

  return (
    <div className="tenant-payment-form">
      <ToastContainer />
      <h2>{tenantName + `'s`} Payment</h2>
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
          <div className="innerLeftCard">
            {' '}
            <form onSubmit={handleSubmit} className="innerLeftCardForm">
              <label>Transaction Payment Date:</label>
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
            <div className="inneRightCard">
              <h5>
                Last Pay Month: <span>{monthInQuestionPay} </span>{' '}
              </h5>
              <h5>
                New Expected Pay Month: <span>{nextMonthPay}</span>{' '}
              </h5>
            </div>
          </div>
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
              <label>Date:</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
              <label>Reference Number:</label>
              <input
                type="text"
                name="referenceNo"
                value={formData.referenceNo}
                onChange={handleChange}
                required
              />
              <label>Amount Paid:</label>
              <input
                type="number"
                name="amountPaid"
                value={formData.amountPaid}
                onChange={handleChange}
                required
              />
              <button type="submit">Update Payment</button>
            </form>
          </div>
        </div>
      )}

      {showConfirmationPopup && (
        <div className="confirmation-popup">
          <div className="popup-content">
            <p>Are you sure you want to submit this payment?</p>
            <button onClick={handleConfirm}>Yes</button>
            <button onClick={handleCancel}>No</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantPaymentForm;
