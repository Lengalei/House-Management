/* eslint-disable react/prop-types */
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import './Invoice.scss';
import { useState, useEffect } from 'react';
import apiRequest from '../../../../lib/apiRequest';
import { toast, ToastContainer } from 'react-toastify';
import { TailSpin } from 'react-loader-spinner';

const Invoice = ({ invoiceData, onClose, tenantId }) => {
  // Added tenantId as a prop
  const { clientData, HouseNo, items, invoiceNumber, selectedPayment } =
    invoiceData;

  const [loading, setLoading] = useState(false);
  const generatedInvoiceNumber =
    invoiceNumber || `INV-${Math.floor(Math.random() * 1000) + 1}`;

  // State to hold editable items
  const [editableItems, setEditableItems] = useState(items);

  // State for new charge visibility and new charge inputs
  const [showNewCharge, setShowNewCharge] = useState(false);
  const [newChargeDescription, setNewChargeDescription] = useState('');
  const [newChargePrice, setNewChargePrice] = useState(0);

  // State for total amount
  const [totalAmount, setTotalAmount] = useState(calculateTotalAmount(items));

  // Calculate total amount based on editable items
  function calculateTotalAmount(items) {
    return items.reduce((total, item) => total + (item.price || 0), 0);
  }

  const handleEditChange = (index, field, value) => {
    const updatedItems = [...editableItems];
    if (field === 'description') {
      updatedItems[index].description = value;
    } else if (field === 'price') {
      updatedItems[index].price = parseFloat(value) || 0; // Parse to float and default to 0 if NaN
    }
    setEditableItems(updatedItems);
  };

  const handleAddNewCharge = () => {
    if (newChargeDescription && newChargePrice > 0) {
      const newCharge = {
        name: 'Monthly Extra Charges Transaction', // Name for new charge
        description: newChargeDescription,
        price: newChargePrice,
      };
      const updatedItems = [...editableItems, newCharge];
      setEditableItems(updatedItems);
      setTotalAmount(calculateTotalAmount(updatedItems)); // Update total amount
      // Reset new charge inputs
      setNewChargeDescription('');
      setNewChargePrice(0);
      setShowNewCharge(false); // Hide new charge input after adding
    }
  };

  // Update total amount when editable items change
  useEffect(() => {
    setTotalAmount(calculateTotalAmount(editableItems));
  }, [editableItems]);

  // New function to send POST request
  const sendInvoiceToServer = async (invoiceData) => {
    try {
      const response = await apiRequest.post(
        '/v2/invoices/postInvoice',
        invoiceData
      );
      return response.data;
    } catch (error) {
      console.error('Error saving invoice:', error);
      throw new Error('Failed to save invoice');
    }
  };

  const handleDownload = async () => {
    // Prepare the invoice data to send
    const invoiceToSend = {
      invoiceNumber: generatedInvoiceNumber,
      clientData,
      HouseNo,
      items: editableItems,
      totalAmount,
      tenantId,
      selectedPayment,
    };

    setLoading(true); // Show loader while posting
    try {
      // Send invoice data to the server
      await sendInvoiceToServer(invoiceToSend);

      // Proceed to generate the PDF after successful save
      const doc = new jsPDF();

      // Set up the logo
      const logo = new Image();
      logo.src = '/homelogo.png'; // Path to the logo

      // Wait for the logo to load
      logo.onload = () => {
        // Add the letterhead (logo and company info)
        const logoWidth = 50; // Desired logo width
        const aspectRatio = logo.width / logo.height;
        const logoHeight = logoWidth / aspectRatio; // Calculate height based on aspect ratio

        doc.addImage(logo, 'PNG', 10, 10, logoWidth, logoHeight);

        // Set font for the letterhead
        doc.setFontSize(14);
        doc.text('Sleek Abode Apartments', 70, 20);
        doc.setFontSize(10);
        doc.text('Kimbo, Ruiru.', 70, 30);
        doc.text('Contact: your-email@example.com', 70, 35);
        doc.text('Phone: (+254) 88-413-323', 70, 40);

        // Add a line to separate the letterhead from the invoice details
        doc.setLineWidth(1);
        doc.line(10, 45, 200, 45);

        // Add invoice title and details
        doc.setFontSize(20);
        doc.text('Invoice', 14, 60); // Adjust position to fit below the letterhead
        doc.setFontSize(12);
        doc.text(`Invoice Number: ${generatedInvoiceNumber}`, 14, 70);
        doc.text(`Client Name: ${clientData.name}`, 14, 80);
        doc.text(`House No: ${HouseNo}`, 14, 90);

        // Prepare the invoice items
        const tableColumn = ['Item', 'Description', 'Price'];
        const tableRows = [];

        editableItems.forEach((item) => {
          if (item.name === 'Monthly Rent Transaction' && item.price > 0) {
            tableRows.push(['Rent', item.description, item.price.toFixed(2)]);
          }
          if (item.name === 'Monthly Water Transaction' && item.price > 0) {
            tableRows.push(['Water', item.description, item.price.toFixed(2)]);
          }
          if (item.name === 'Monthly Garbage Transaction' && item.price > 0) {
            tableRows.push([
              'Garbage',
              item.description,
              item.price.toFixed(2),
            ]);
          }
          if (
            item.name === 'Monthly Extra Charges Transaction' &&
            item.price > 0
          ) {
            tableRows.push([
              'Extra Charges',
              item.description,
              item.price.toFixed(2),
            ]);
          }
        });

        // Create the autoTable for the invoice items
        doc.autoTable(tableColumn, tableRows, { startY: 100 }); // Adjust startY based on your layout
        doc.text(
          `Total Amount: KSH ${totalAmount.toFixed(2)}`,
          14,
          doc.lastAutoTable.finalY + 10
        );

        // Save the PDF
        doc.save(`invoice_${generatedInvoiceNumber}.pdf`);

        // Show success toast
        toast.success('Invoice posted and downloaded successfully!');
      };

      // Handle image loading error
      logo.onerror = () => {
        toast.error('Error loading logo image.');
      };
    } catch (error) {
      // Show error toast if there was an error
      toast.error('There was an issue posting the invoice: ' + error.message);
    } finally {
      setLoading(false); // Hide loader after processing
    }
  };

  return (
    <div className="invoice-popup">
      <div className="invoice">
        {/* Close Button */}
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <h1>Invoice</h1>
        <div className="invoice-details">
          <p>
            <strong>Invoice Number:</strong> {generatedInvoiceNumber}
          </p>
          <p>
            <strong>Client Name:</strong> {clientData.name}
          </p>
          <p>
            <strong>House No:</strong> {HouseNo}
          </p>
        </div>
        <table className="invoice-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Description</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {editableItems.map((item, index) => (
              <tr key={index}>
                <td>
                  {item.name
                    .replace('Monthly ', '')
                    .replace(' Transaction', '')}
                </td>
                <td>
                  <input
                    type="text"
                    value={item.description}
                    placeholder={item.description}
                    onChange={(e) =>
                      handleEditChange(index, 'description', e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={item.price}
                    placeholder={item.price}
                    onChange={(e) =>
                      handleEditChange(index, 'price', e.target.value)
                    }
                  />
                </td>
              </tr>
            ))}
            {/* New Charge Row Toggle */}
            <tr>
              <td colSpan={3}>
                <button
                  onClick={() => setShowNewCharge(!showNewCharge)}
                  className="add-charge-button"
                >
                  {showNewCharge ? '▲' : '+'}
                </button>
                {showNewCharge && (
                  <div className="new-charge-inputs">
                    <input
                      type="text"
                      value={newChargeDescription}
                      placeholder="Description"
                      onChange={(e) => setNewChargeDescription(e.target.value)}
                    />
                    <input
                      type="number"
                      value={newChargePrice}
                      placeholder="Price"
                      onChange={(e) =>
                        setNewChargePrice(parseFloat(e.target.value) || 0)
                      }
                    />
                    <button onClick={handleAddNewCharge}>Add Charge</button>
                  </div>
                )}
              </td>
            </tr>
          </tbody>
        </table>
        <div className="invoice-total">
          <strong>Total Amount: KSH{totalAmount.toFixed(2)}</strong>
        </div>
        <button className="download-button" onClick={handleDownload}>
          Download Invoice
        </button>
      </div>

      {loading && (
        <div className="loader-overlay">
          <TailSpin
            height="100"
            width="100"
            color="#4fa94d"
            ariaLabel="loading"
            visible={true}
          />
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default Invoice;
