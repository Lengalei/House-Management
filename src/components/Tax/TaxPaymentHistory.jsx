import { Link } from 'react-router-dom';
import './TaxPaymentHistory.css';
import { useEffect, useState } from 'react';
import apiRequest from '../../lib/apiRequest';
import jsPDF from 'jspdf';
import 'jspdf-autotable'; // Ensure you import the autotable plugin

const TaxPaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false); // State for modal visibility
  const [paymentToDelete, setPaymentToDelete] = useState(null); // State for selected payment
  const [logoImage, setLogoImage] = useState(null); // State for logo image

  useEffect(() => {
    const fetchAllKra = async () => {
      try {
        const response = await apiRequest.get('/kra/allKra');
        if (response.status === 200) {
          setPayments(response.data);
        }
      } catch (error) {
        setError(error.response.data.message);
      }
    };

    // Fetch the logo image (assuming you have the image URL or path)
    const fetchLogo = async () => {
      const img = new Image();
      img.src = '/houselogo1.png';
      img.onload = () => setLogoImage(img);
    };

    fetchAllKra();
    fetchLogo();
  }, []);

  // Function to convert the payment date to local time
  const convertToLocalDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(); // Converts to local date string format
  };

  const handleTaxDelete = async (_id) => {
    try {
      const response = await apiRequest.delete(`/kra/deleteKraRecord/${_id}`);
      if (response.status === 200) {
        setPayments(payments.filter((payment) => payment._id !== _id));
        setShowModal(false); // Close modal on successful deletion
      }
    } catch (error) {
      setError(error.response.data.message);
    }
  };

  const handleOpenModal = (_id) => {
    setPaymentToDelete(_id);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setPaymentToDelete(null);
  };

  // Function to download KRA history as PDF
  const downloadKraHistory = () => {
    if (!logoImage) return; // Ensure logo image is loaded

    const doc = new jsPDF();
    doc.setFont('helvetica', 'normal');

    // Add the logo to the document
    const logoWidth = 50;
    const aspectRatio = logoImage.width / logoImage.height;
    const logoHeight = logoWidth / aspectRatio;
    doc.addImage(logoImage, 'PNG', 10, 10, logoWidth, logoHeight);

    // Company Details
    const detailsX = 70; // X position for company details
    let detailsY = 20; // Starting Y position for company details

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Sleek Abode Apartments', detailsX, detailsY);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    detailsY += 6; // Spacing between lines
    doc.text('Kimbo, Ruiru.', detailsX, detailsY);
    detailsY += 5; // Spacing between lines
    doc.text('Contact: your-email@example.com', detailsX, detailsY);
    detailsY += 5; // Spacing between lines
    doc.text('Phone: (+254) 88-413-323', detailsX, detailsY);

    // Records title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('KRA Tax Payment History', 14, detailsY + 15);

    // Adding table
    doc.autoTable({
      head: [
        ['Date', 'Month', 'Total Rents Obtained', 'Tax Paid', 'Reference No'],
      ],
      body: payments.map((payment) => [
        convertToLocalDate(payment.date),
        payment.month,
        payment.rent,
        payment.tax,
        payment.referenceNo,
      ]),
      startY: detailsY + 30, // Start below the title
      theme: 'striped', // Adding a striped theme for better visibility
      headStyles: { fillColor: [0, 51, 102], textColor: [255, 255, 255] }, // Custom header colors
      styles: { cellPadding: 3, fontSize: 12 }, // Custom cell styles
    });

    // Save the document
    doc.save('kra-tax-payment-history.pdf');
  };

  return (
    <div className="maintaxbox">
      <div className="tax-payment-history-container">
        {error && <span>{error}</span>}
        <h2>Tax Payment History</h2>
        <button onClick={downloadKraHistory} className="download-btn">
          Download KRA History
        </button>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Month</th>
              <th>Total Rents Obtained</th>
              <th>Tax Paid</th>
              <th>Reference No</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments?.map((payment, index) => (
              <tr key={index}>
                <td>{convertToLocalDate(payment.date)}</td>
                <td>{payment.month}</td>
                <td>{payment.rent}</td>
                <td>{payment.tax}</td>
                <td>{payment.referenceNo}</td>
                <td>
                  <button
                    className="btn"
                    onClick={() => handleOpenModal(payment._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Link to="/taxpayment" className="back-button">
          Back to Tax Payment
        </Link>
        {showModal && (
          <div className="confirmation-modal">
            <div className="modal-content">
              <p>Are you sure you want to delete this record?</p>
              <div className="modal-actions">
                <button className="cancel-btn" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button
                  className="confirm-btn"
                  onClick={() =>
                    paymentToDelete && handleTaxDelete(paymentToDelete)
                  }
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaxPaymentHistory;
