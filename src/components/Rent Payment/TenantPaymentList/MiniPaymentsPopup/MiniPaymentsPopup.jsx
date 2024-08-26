/* eslint-disable react/prop-types */
import { useState } from 'react';
import html2pdf from 'html2pdf.js';
import { ThreeDots } from 'react-loader-spinner'; // Import ThreeDots loader
import './MiniPaymentsPopup.scss';

const MiniPaymentsPopup = ({ payment, onClose }) => {
  console.log('miniPayment: ', payment);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false); // State to control loader visibility
  const paymentsPerPage = 5;

  // Pagination calculations
  const indexOfLastPayment = currentPage * paymentsPerPage;
  const indexOfFirstPayment = indexOfLastPayment - paymentsPerPage;
  const currentPayments = payment.paymentHistory.slice(
    indexOfFirstPayment,
    indexOfLastPayment
  );

  const totalPages = Math.ceil(payment.paymentHistory.length / paymentsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const generatePDF = (miniPayment, type) => {
    setLoading(true); // Show loader

    const content = `
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          h1 {
            text-align: center;
            color: #333;
          }
          .details {
            margin-bottom: 20px;
          }
          .details p {
            margin: 5px 0;
            font-size: 16px;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 14px;
            color: #555;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>${type === 'invoice' ? 'Invoice' : 'Receipt'}</h1>
          <div class="details">
            <p><strong>Date:</strong> ${new Date(
              miniPayment.timestamp
            ).toLocaleDateString()}</p>
            <p><strong>Amount:</strong> $${miniPayment.amount.toFixed(2)}</p>
            <p><strong>Reference No:</strong> ${miniPayment.referenceNo}</p>
          </div>
          <div class="footer">
            <p>${
              type === 'invoice'
                ? 'Thank you for your business!'
                : 'Thank you for your payment!'
            }</p>
          </div>
        </div>
      </body>
      </html>
    `;

    html2pdf()
      .from(content)
      .toPdf()
      .get('pdf')
      .then((pdf) => {
        const pdfUrl = URL.createObjectURL(pdf.output('blob'));
        const newWindow = window.open('', '_blank');
        newWindow.location.href = pdfUrl;
        setLoading(false); // Hide loader
      });
  };

  return (
    <div className="mini-payments-popup">
      {loading && (
        <div className="loader-overlay">
          <ThreeDots color="#3498db" height={80} width={80} />{' '}
          {/* Loader from react-loader-spinner */}
        </div>
      )}
      <div className="popup-content">
        <button className="closeBtnPopup" onClick={onClose}>
          Close
        </button>
        <div className="card-container">
          <div className="left-card">
            {currentPayments.map((miniPayment, index) => (
              <div className="payment-card" key={index}>
                <div>
                  Date: {new Date(miniPayment.timestamp).toLocaleDateString()}
                </div>
                <div>Amount: ${miniPayment.amount.toFixed(2)}</div>
                <div>ReferenceNo: {miniPayment.referenceNo}</div>
                <button
                  className="generation"
                  onClick={() => generatePDF(miniPayment, 'invoice')}
                >
                  Generate Invoice
                </button>
                <br />
                <button
                  className="generation"
                  onClick={() => generatePDF(miniPayment, 'receipt')}
                >
                  Generate Receipt
                </button>
              </div>
            ))}
          </div>
          <div className="right-card"></div>
        </div>
        <div className="pagination">
          {[...Array(totalPages).keys()].map((page) => (
            <button
              key={page + 1}
              onClick={() => handlePageChange(page + 1)}
              className={currentPage === page + 1 ? 'active' : ''}
            >
              {page + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MiniPaymentsPopup;
