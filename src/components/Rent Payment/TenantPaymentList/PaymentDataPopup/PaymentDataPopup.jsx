import React, { useState } from 'react';
import jsPDF from 'jspdf'; // PDF generation library
import 'jspdf-autotable'; // To generate tables in PDFs
import './PaymentDataPopup.scss'; // SCSS file for styling

const PaymentDataPopup = ({ paymentsData, paymentsDataTenant, onClose }) => {
  // Function to handle document download
  const handleDownload = () => {
    const doc = new jsPDF();

    // Load the logo image
    const img = new Image();
    img.src = '/houselogo1.png'; // Path to your logo image

    img.onload = function () {
      // Define logo dimensions
      const logoWidth = 50;
      const aspectRatio = img.width / img.height;
      const logoHeight = logoWidth / aspectRatio;

      // Add the logo to the document
      doc.addImage(img, 'PNG', 10, 10, logoWidth, logoHeight);

      // Company Details
      doc.setFontSize(14);
      doc.text('Sleek Abode Apartments', 70, 20);
      doc.setFontSize(10);
      doc.text('Kimbo, Ruiru.', 70, 30);
      doc.text('Contact: your-email@example.com', 70, 35);
      doc.text('Phone: (+254) 88-413-323', 70, 40);

      // Title for the payment report
      doc.setFontSize(16);
      doc.setFont('times', 'bold');
      doc.text('Tenant Payment Report', 10, 70);

      // Tenant Name and Total Amount Paid
      doc.setFont('times', 'normal');
      doc.text(`Tenant: ${paymentsDataTenant.name}`, 10, 80);
      doc.text(
        `Total Amount Paid: Ksh ${paymentsDataTenant.totalAmountPaid}`,
        10,
        90
      ); // Total Amount Paid

      // Date and Time
      const today = new Date();
      const date = `${today.getDate()}/${
        today.getMonth() + 1
      }/${today.getFullYear()}`;
      const time = `${today.getHours()}:${today.getMinutes()}`;
      doc.setFontSize(12);
      doc.text(`Generated on: ${date} at ${time}`, 100, 70); // Right-aligned date

      // Creating a table for the payment data
      const tableColumnHeaders = [
        'Payment Date',
        'Rent',
        'Water Bill',
        'Garbage Fee',
        'Extra Charges',
        'Amount Paid',
        'Reference No',
        'Status',
      ];

      const tableRows = paymentsData.map((payment) => [
        `${payment.month} ${payment.year}`, // Format the date
        payment.rent.amount,
        payment.waterBill.amount,
        payment.garbageFee.amount,
        payment.extraCharges.amount,
        payment.totalAmountPaid,
        payment.referenceNumber,
        payment.isCleared ? 'Cleared' : 'Pending',
      ]);

      // Adding table with improved styling
      doc.autoTable({
        head: [tableColumnHeaders],
        body: tableRows,
        startY: 100, // Start below the title and tenant name
        theme: 'grid', // Use grid lines for better readability
        styles: { fontSize: 12, cellPadding: 3, overflow: 'linebreak' },
        headStyles: {
          fillColor: [22, 160, 133], // Teal header background
          textColor: [255, 255, 255], // White text for headers
          fontStyle: 'bold',
        },
        columnStyles: {
          0: { cellWidth: 'auto' }, // Adjust width for the first column
          1: { halign: 'right' }, // Align numeric columns to the right
          2: { halign: 'right' },
          3: { halign: 'right' },
          4: { halign: 'right' },
          5: { halign: 'right' },
          6: { halign: 'right' },
          7: { halign: 'center' },
        },
        margin: { top: 10 },
      });

      // Footer
      doc.setFontSize(10);
      doc.setFont('times', 'italic');
      doc.text(
        'Thank you for your continued partnership with Sleek Abode Apartments.',
        10,
        doc.internal.pageSize.height - 10
      ); // Add at bottom of page

      // Save the document as PDF
      doc.save('TenantPayment_Report.pdf');
    };

    // Error handler for logo loading
    img.onerror = function () {
      alert('Failed to load logo image.');
    };
  };

  return (
    <div className="paymentDataPopupContainer">
      <div className="paymentPopupContent">
        <div className="paymentPopupHeader">
          <img
            src="/houselogo1.png"
            alt="Sleek Abode Apartments Logo"
            className="logo"
          />
          <div className="letterhead">
            <h2>Sleek Abode Apartments</h2>
            <p>Location: 123 Elegant Lane, Cityville</p>
            <p>Email: contact@sleekabode.com</p>
            <p>Phone: +123 456 7890</p>
          </div>
        </div>
        <h3>Tenant: {paymentsDataTenant.name}</h3>
        <p>Total Amount Paid: Ksh {paymentsDataTenant.totalAmountPaid}</p>{' '}
        {/* Display total amount paid */}
        <table className="payment-tenant-table">
          <thead>
            <tr>
              <th>Payment Date</th>
              <th>Rent</th>
              <th>Water Bill</th>
              <th>Garbage Fee</th>
              <th>Extra Charges</th>
              <th>Amount Paid</th>
              <th>Reference No</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {paymentsData.map((payment, index) => (
              <tr key={index}>
                <td>{payment.month + payment.year}</td>
                <td>{payment.rent.amount}</td>
                <td>{payment.waterBill.amount}</td>
                <td>{payment.garbageFee.amount}</td>
                <td>{payment.extraCharges.amount}</td>
                <td>{payment.totalAmountPaid}</td>
                <td>{payment.referenceNumber}</td>
                <td>{payment.isCleared ? 'Cleared' : 'Pending'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="download-btn" onClick={handleDownload}>
          Download Document
        </button>
        <button className="closePaymentbtn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default PaymentDataPopup;
