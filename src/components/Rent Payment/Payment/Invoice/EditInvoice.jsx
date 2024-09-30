/* eslint-disable react/prop-types */
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import './Invoice.scss';
import { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { TailSpin } from 'react-loader-spinner';

const EditInvoice = ({ invoiceData, onClose }) => {
  // Added tenantId as a prop
  const { clientName, HouseNo, items, invoiceNumber } = invoiceData;

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

  const handleDownload = async () => {
    // Prepare the invoice data to send

    setLoading(true); // Show loader while posting
    try {
      // Proceed to generate the PDF after successful save
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text('Invoice', 14, 22);
      doc.setFontSize(12);
      doc.text(`Invoice Number: ${generatedInvoiceNumber}`, 14, 32);
      doc.text(`Client Name: ${clientName}`, 14, 42);
      doc.text(`House No: ${HouseNo}`, 14, 52);

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
          tableRows.push(['Garbage', item.description, item.price.toFixed(2)]);
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

      doc.autoTable(tableColumn, tableRows, { startY: 62 });
      doc.text(
        `Total Amount: KSH ${totalAmount.toFixed(2)}`,
        14,
        doc.lastAutoTable.finalY + 10
      );

      doc.save(`invoice_${generatedInvoiceNumber}.pdf`);

      // Show success toast
      toast.success('Invoice downloaded successfully!');
    } catch (error) {
      // Show error toast if there was an error
      toast.error(
        'There was an issue downloading the invoice: ' + error.message
      );
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
            <strong>Client Name:</strong> {clientName}
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

export default EditInvoice;
