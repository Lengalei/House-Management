/* eslint-disable react/prop-types */
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import './Receipt.scss';

const Receipt = ({ receiptData }) => {
  const { tenant, rent, waterBill, garbageFee, extraCharges } = receiptData;

  const handleDownload = () => {
    const doc = new jsPDF();

    // Load the logo image to get its dimensions
    const logo = new Image();
    logo.src = 'public/homelogo.png'; // Path to the logo

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

      doc.setFontSize(20);
      doc.text('Receipt', 14, 70);
      doc.setFontSize(12);
      doc.text(`Tenant Name: ${tenant.name}`, 14, 90);
      doc.text(`Email: ${tenant.email}`, 14, 100);
      doc.text(`Phone No: ${tenant.phoneNo}`, 14, 110);
      doc.text(`Reference Number: ${receiptData.referenceNumber}`, 14, 120);

      // Payment summary table
      const details = [
        ['Rent', `KSH ${rent.amount.toFixed(2)}`],
        ['Water Bill', `KSH ${waterBill.amount.toFixed(2)}`],
        ['Garbage Fee', `KSH ${garbageFee.amount.toFixed(2)}`],
        ['Extra Charges', `KSH ${extraCharges.amount.toFixed(2)}`],
        ['Total Amount Paid', `KSH ${receiptData.totalAmountPaid.toFixed(2)}`],
      ];

      doc.autoTable({
        head: [['Description', 'Amount']],
        body: details,
        startY: 130,
        theme: 'grid',
        styles: { fontSize: 12 },
      });

      // Save the PDF
      doc.save(`receipt_${receiptData.referenceNumber}.pdf`);
    };
  };

  return (
    <div className="receipt">
      <div className="header">
        <img src="public/homelogo.png" alt="Logo" className="logo" />
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
              <td>Rent</td>
              <td>KSH {rent.amount.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Water Bill</td>
              <td>KSH {waterBill.amount.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Garbage Fee</td>
              <td>KSH {garbageFee.amount.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Extra Charges</td>
              <td>KSH {extraCharges.amount.toFixed(2)}</td>
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

export default Receipt;
