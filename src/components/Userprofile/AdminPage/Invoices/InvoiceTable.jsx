import React, { useEffect, useState } from 'react';
import ReactPaginate from 'react-js-pagination';
import { FaTrashAlt, FaEdit, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { MdAutorenew } from 'react-icons/md';
import './InvoiceTable.scss';
import apiRequest from '../../../../lib/apiRequest';
import { TailSpin } from 'react-loader-spinner';
import { toast, ToastContainer } from 'react-toastify';
import { Link } from 'react-router-dom';
import EditInvoice from '../../../Rent Payment/Payment/Invoice/EditInvoice';

const InvoiceTable = () => {
  const [invoices, setInvoices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [invoicesPerPage] = useState(5);
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [expandedInvoice, setExpandedInvoice] = useState(null); // State to track expanded invoice

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [editInvoice, setEditInvoice] = useState(null); // New state for invoice being edited
  const [isEditing, setIsEditing] = useState(false); // Popup visibility state

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await apiRequest.get('/v2/invoices/allInvoices');
      if (response.data.length > 0) {
        setInvoices(response.data);
      }
    } catch (error) {
      toast.error(error.response.data.message || 'Error Fetching Invoices!');
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSelectInvoice = (invoiceId) => {
    setSelectedInvoices((prev) =>
      prev.includes(invoiceId)
        ? prev.filter((id) => id !== invoiceId)
        : [...prev, invoiceId]
    );
  };

  const [selectedinvoice, setSelectedInvoice] = useState('');
  const [confirmDeleteInvoice, setConfirmDeleteInvoice] = useState(false);

  const handleDeleteInvoiceBtnClicked = (invoice) => {
    setSelectedInvoice(invoice);
    setConfirmDeleteInvoice(true);
  };

  const handleCloseInvoiceDeletionPopup = () => {
    setSelectedInvoice('');
    setConfirmDeleteInvoice(false);
  };

  const handleDeleteInvoice = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await apiRequest.delete(
        `/v2/invoices/deleteInvoice/${selectedinvoice?._id}`
      );
      if (response.status) {
        await fetchInvoices();
        setError('');
        handleCloseInvoiceDeletionPopup();
        toast.success('Invoice Deleted Successfully!');
      }
    } catch (error) {
      toast.error(error.response.data.message || 'Error deleting Invoice!');
      setError(error.response.data.message || 'Error deleting invoice!');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInvoice = (invoice) => {
    setEditInvoice({ ...invoice });
    setIsEditing(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiRequest.put(
        `/v2/invoices/updateInvoice/${editInvoice._id}`,
        editInvoice
      );
      await fetchInvoices();
      toast.success('Invoice updated successfully!');
      setIsEditing(false);
      setEditInvoice(null);
    } catch (error) {
      toast.error(error.response.data.message || 'Error updating Invoice!');
    } finally {
      setLoading(false);
    }
  };

  // Function to add a new row in the editable table
  const handleAddRow = () => {
    setEditInvoice({
      ...editInvoice,
      items: [...editInvoice.items, { name: '', price: 0 }],
    });
  };

  // Function to remove a row in the editable table
  const handleRemoveRow = (index) => {
    const updatedItems = [...editInvoice.items];
    updatedItems.splice(index, 1);
    setEditInvoice({ ...editInvoice, items: updatedItems });
  };

  const toggleExpandInvoice = (invoiceId) => {
    setExpandedInvoice((prev) => (prev === invoiceId ? null : invoiceId));
  };

  const indexOfLastInvoice = currentPage * invoicesPerPage;
  const indexOfFirstInvoice = indexOfLastInvoice - invoicesPerPage;
  const currentInvoices = invoices?.slice(
    indexOfFirstInvoice,
    indexOfLastInvoice
  );

  const handleDeleteSelected = async () => {
    setLoading(true);
    try {
      // Make a single request with an array of selected invoice IDs
      await apiRequest.delete('/v2/invoices/deleteManyInvoices', {
        data: { ids: selectedInvoices },
      });

      setSelectedInvoices([]); // Clear the selected invoices after deletion
      await fetchInvoices(); // Refresh the invoice list
      toast.success('Success Deleting Invoices');
    } catch (error) {
      console.error('Error deleting selected invoices:', error);
      toast.error(error.response.data.message || 'Error deleting Invoices!');
    } finally {
      setLoading(false);
    }
  };

  //display the invoice generation
  const [isInvoiceDownloadVisible, setIsInvoiceDownloadVisible] =
    useState(false);
  const [regenSelectedInvoice, setRegenSelectedInvoice] = useState('');

  const handleInvoiceRegenerate = (invoice) => {
    setRegenSelectedInvoice(invoice);
    console.log('regenSelectedInvoice: ', regenSelectedInvoice);
    setIsInvoiceDownloadVisible(true);
  };

  const closeInvoice = () => {
    setIsInvoiceDownloadVisible(false);
  };

  const invoiceData = {
    clientName: regenSelectedInvoice?.clientName,
    HouseNo: regenSelectedInvoice?.HouseNo,
    items: regenSelectedInvoice?.items?.filter(Boolean),
    totalAmount: regenSelectedInvoice?.totalAmount,
    invoiceNumber: regenSelectedInvoice?.invoiceNumber,
  };

  return (
    <div className="invoice-table">
      {currentInvoices?.length > 0 ? (
        <>
          <div className="invoice-card">
            <h2>All Invoices</h2>
          </div>
          <div className="invoice-actions">
            <button
              className="delete-selected"
              onClick={handleDeleteSelected}
              disabled={selectedInvoices?.length === 0}
            >
              Delete Selected
            </button>
          </div>
          <table>
            <thead>
              <tr>
                <th>Select</th>
                <th>Invoice Number</th>
                <th>Name</th>
                <th>HouseNo</th>
                <th>Items</th>
                <th>Paid Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentInvoices?.map((invoice) => (
                <React.Fragment key={invoice?._id}>
                  <tr>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedInvoices?.includes(invoice?._id)}
                        onChange={() => handleSelectInvoice(invoice?._id)}
                      />
                    </td>
                    <td>{invoice?.invoiceNumber}</td>
                    <td>{invoice?.tenant.name}</td>
                    <td>{invoice?.HouseNo}</td>
                    <td>
                      <button onClick={() => toggleExpandInvoice(invoice?._id)}>
                        {expandedInvoice === invoice?._id ? (
                          <FaChevronUp />
                        ) : (
                          <FaChevronDown />
                        )}
                      </button>
                      {expandedInvoice === invoice._id
                        ? invoice?.items.map((item, index) => (
                            <div key={index} className="item-detail">
                              <strong>{item?.name}</strong>: KSH
                              {item?.price.toFixed(2)}
                              <br />
                              {item?.description}
                            </div>
                          ))
                        : invoice?.items?.length}
                    </td>
                    <td>{invoice?.isPaid ? 'Paid' : 'Unpaid'}</td>
                    <td>
                      <MdAutorenew
                        onClick={() => handleInvoiceRegenerate(invoice)}
                        className="edit-icon"
                      />
                      <FaEdit
                        onClick={() => handleUpdateInvoice(invoice)}
                        className="edit-icon"
                      />
                      <FaTrashAlt
                        onClick={() => handleDeleteInvoiceBtnClicked(invoice)}
                        className="delete-icon"
                      />
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
          <ReactPaginate
            activePage={currentPage}
            itemsCountPerPage={invoicesPerPage}
            totalItemsCount={invoices?.length}
            pageRangeDisplayed={5}
            onChange={handlePageChange}
            itemClass="pagination-item"
            linkClass="pagination-link"
            activeLinkClass="active-link"
          />
          <div className="back-arrow">
            <button onClick={() => window.history.back()}>&larr; Back</button>
          </div>
        </>
      ) : (
        <div className="nothing">
          <h4>There are no Invoices Generated!</h4>
          <div className="nothingLinks">
            <Link to="/admins">Admin</Link>
          </div>
        </div>
      )}

      {isInvoiceDownloadVisible && (
        <div className="confirmation-popup-overlay">
          <div className="confirmation-popup">
            <EditInvoice invoiceData={invoiceData} onClose={closeInvoice} />
          </div>
        </div>
      )}

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

      {confirmDeleteInvoice && (
        <div className="confirmation-popup-overlay">
          <div className="confirmation-popup">
            <h3>Are you sure you want to delete this Invoice?</h3>
            {error && <p>{error}</p>}
            <div className="confirmation-actions">
              <button className="submit-btn" onClick={handleDeleteInvoice}>
                Yes, Delete
              </button>
              <button
                className="cancel-btn"
                onClick={handleCloseInvoiceDeletionPopup}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup for editing invoice */}
      {isEditing && (
        <div className="edit-invoice-popup-overlay">
          <div className="edit-invoice-popup">
            <h3>Edit Invoice</h3>
            {/* Editable table for items */}
            <table className="editable-items-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Price (KSH)</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {editInvoice.items.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <input
                        type="text"
                        placeholder="Name"
                        value={item.name}
                        onChange={(e) => {
                          const updatedItems = [...editInvoice.items];
                          updatedItems[index].name = e.target.value;
                          setEditInvoice({
                            ...editInvoice,
                            items: updatedItems,
                          });
                        }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => {
                          const updatedItems = [...editInvoice.items];
                          updatedItems[index].description = e.target.value;
                          setEditInvoice({
                            ...editInvoice,
                            items: updatedItems,
                          });
                        }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        placeholder={item.price}
                        value={item.price}
                        onChange={(e) => {
                          const updatedItems = [...editInvoice.items];
                          updatedItems[index].price =
                            parseFloat(e.target.value) || 0;
                          setEditInvoice({
                            ...editInvoice,
                            items: updatedItems,
                          });
                        }}
                      />
                    </td>
                    <td>
                      <button onClick={() => handleRemoveRow(index)}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={handleAddRow}>Add Extra Charge</button>

            <div>
              <label htmlFor="paidStatus">Paid Status:</label>
              <select
                id="paidStatus"
                value={editInvoice.isPaid ? 'Paid' : 'Unpaid'}
                onChange={(e) =>
                  setEditInvoice({
                    ...editInvoice,
                    isPaid: e.target.value === 'Paid',
                  })
                }
              >
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>
            <div className="edit-actions">
              <button onClick={handleSaveEdit}>Save</button>
              <button onClick={() => setIsEditing(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default InvoiceTable;
