import React, { useState } from 'react';
import jsPDF from 'jspdf'; // PDF generation library
import 'jspdf-autotable'; // To generate tables in PDFs
import './TenantDataPopup.scss'; // SCSS file for styling

const TenantDataPopup = ({ tenantData, onClose }) => {
  const [showPopup, setShowPopup] = useState(false);

  // Function to handle document download
  const handleDownload = () => {
    const doc = new jsPDF();

    // Add logo and company details
    const img = new Image();
    img.src = '/houselogo1.png'; // Path to your logo image

    // Add an onLoad event to ensure the image is loaded before PDF generation
    img.onload = function () {
      const logoWidth = 50; // Desired logo width
      const aspectRatio = img.width / img.height;
      const logoHeight = logoWidth / aspectRatio; // Calculate height based on aspect ratio

      // Add the logo
      doc.addImage(img, 'PNG', 10, 10, logoWidth, logoHeight);

      // Add company details
      // Set font for the letterhead
      doc.setFontSize(14);
      doc.text('Sleek Abode Apartments', 70, 20);
      doc.setFontSize(10);
      doc.text('Kimbo, Ruiru.', 70, 30);
      doc.text('Contact: your-email@example.com', 70, 35);
      doc.text('Phone: (+254) 88-413-323', 70, 40);

      // Add the title for the tenant data
      doc.setFontSize(16);
      doc.text('Tenant Data Report', 10, 70);

      // Adding professional date and time
      const today = new Date();
      const date = `${today.getDate()}/${
        today.getMonth() + 1
      }/${today.getFullYear()}`;
      const time = `${today.getHours()}:${today.getMinutes()}`;
      doc.setFontSize(12);
      doc.text(`Generated on: ${date} at ${time}`, 100, 70); // Right-aligned date

      // Creating a table for the tenant data
      const tableColumnHeaders = [
        'Name',
        'PhoneNo',
        'House No',
        'Move-in Date',
        'Rent Payable',
      ];
      const tableRows = tenantData.map((tenant) => [
        tenant.name,
        tenant.phoneNo,
        tenant.houseDetails.houseNo,
        new Date(tenant.placementDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),

        tenant.houseDetails.rent,
      ]);

      // Add table using autoTable
      doc.autoTable({
        head: [tableColumnHeaders],
        body: tableRows,
        startY: 80, // Start below the title
        theme: 'grid', // Adds grid lines for professional look
        styles: { fontSize: 12, cellPadding: 3 }, // General styling
        headStyles: {
          fillColor: [22, 160, 133], // Teal header background
          textColor: [255, 255, 255], // White text for headers
          fontStyle: 'bold',
        },
        margin: { top: 10 },
      });

      // Footer
      doc.setFontSize(10);
      doc.text(
        'Thank you for your continued partnership with Sleek Abode Apartments.',
        10,
        doc.internal.pageSize.height - 10
      ); // Add at bottom of page

      // Save the document as PDF
      doc.save('TenantData_Report.pdf');
    };

    // Optional error handler
    img.onerror = function () {
      alert('Failed to load logo image.');
    };
  };

  return (
    <div className="downloadDataPopupContainer">
      <div className="downloadPopupContent">
        <div className="downloadPopupHeader">
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

        <table className="donwload-tenant-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>PhoneNo</th>
              <th>HouseNo</th>
              <th>Move-in Date</th>
              <th>Rent Payable</th>
            </tr>
          </thead>
          <tbody>
            {tenantData.map((tenant, index) => (
              <tr key={index}>
                <td>{tenant.name}</td>
                <td>{tenant.phoneNo}</td>
                <td>{tenant.houseDetails.houseNo}</td>
                <td>
                  {new Date(tenant.placementDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </td>
                <td>{tenant.houseDetails.rent}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <button className="download-btn" onClick={handleDownload}>
          Download Document
        </button>
        <button className="closeDownloadbtn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default TenantDataPopup;
