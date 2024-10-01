/* eslint-disable react/prop-types */
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import './Receipt.scss';
import moment from 'moment';

const DepoReceipt = ({ receiptData, onClose }) => {
  const { tenant, rent, waterDeposit, rentDeposit } = receiptData;

  const handleDownload = () => {
    const doc = new jsPDF();

    // Load the logo image to get its dimensions
    const logo = new Image();
    logo.src = '/public/homelogo.png'; // Path to the logo

    logo.onload = function () {
      // Get original dimensions
      const originalWidth = logo.width;
      const originalHeight = logo.height;

      // Calculate aspect ratio
      const aspectRatio = originalWidth / originalHeight;

      // Set desired width
      const desiredWidth = 50; // You can set your desired width here
      const newWidth = desiredWidth; // Use desired width
      const newHeight = desiredWidth / aspectRatio; // Calculate height based on aspect ratio

      // Add letterhead
      doc.addImage(logo, 'PNG', 10, 10, newWidth, newHeight);
      doc.setFontSize(16);
      doc.text('Sleek Abode Apartments', 70, 20);
      doc.setFontSize(12);
      doc.text('Kimbo, Ruiru.', 70, 30);
      doc.text('Phone: (+254) 88-413-323', 70, 40);

      doc.setLineWidth(1);
      doc.line(10, 45, 200, 45);

      doc.setFontSize(20);
      doc.text('Deposit Receipt', 14, 60);
      doc.setFontSize(12);
      doc.text(`Tenant Name: ${tenant.name}`, 14, 70);
      doc.text(`Email: ${tenant.email}`, 14, 80);
      doc.text(`Phone No: ${tenant.phoneNo}`, 14, 90);
      doc.text(
        `Deposit Date: ${moment(tenant.depositDate).toLocaleString()}`,
        14,
        100
      );

      // Payment summary table
      const details = [
        ['Rent Deposit ', `KSH ${rentDeposit.amount.toFixed(2)}`],
        ['Water Deposit', `KSH ${waterDeposit.amount.toFixed(2)}`],
        ['Rent Payable', `KSH ${rent.amount.toFixed(2)}`],
        ['Total Amount Paid', `KSH ${receiptData.totalAmountPaid.toFixed(2)}`],
      ];

      doc.autoTable({
        head: [['Description', 'Amount']],
        body: details,
        startY: 110,
        theme: 'grid',
        styles: { fontSize: 12 },
      });

      // Save the PDF
      doc.save(`receipt_${receiptData.referenceNumber}.pdf`);
    };
  };

  return (
    <div className="receipt">
      <div className="holderOfClosebtn">
        {' '}
        <button className="close-button" onClick={onClose}>
          close
        </button>
      </div>

      <div className="header">
        <img src="/public/homelogo.png" alt="Logo" className="logo" />
        <h1>Sleek Abode Apartments</h1>
        <p className="company-info">Kimbo, Ruiru</p>
        <p className="company-info">Phone: (254) 88-413-323</p>
      </div>
      <div className="tenant-details">
        <h2>Tenant Details</h2>
        <p>
          <strong>Name:</strong> {tenant.name}
        </p>
        <p>
          <strong>Email:</strong> {tenant.email}
        </p>
        <p>
          <strong>Phone No:</strong> {tenant.phoneNo}
        </p>
        <p>
          <strong>Deposit Date:</strong>{' '}
          {moment(tenant.depositDate).toLocaleString()}
        </p>
      </div>
      <hr />
      <div className="payment-summary">
        <h2>Payment Summary</h2>
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Rent Deposit</td>
              <td>KSH {rentDeposit.amount.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Water Deposit</td>
              <td>KSH {waterDeposit.amount.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Rent Payable</td>
              <td>KSH {rent.amount.toFixed(2)}</td>
            </tr>
            <tr className="total">
              <td>
                <strong>Total Amount Paid</strong>
              </td>
              <td>
                <strong>KSH {receiptData.totalAmountPaid.toFixed(2)}</strong>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <button className="download-button" onClick={handleDownload}>
        Download Receipt
      </button>
    </div>
  );
};

export default DepoReceipt;
