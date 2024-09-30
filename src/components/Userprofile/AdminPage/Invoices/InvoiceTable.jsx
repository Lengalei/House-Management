import React, { useEffect, useState } from 'react';
import ReactPaginate from 'react-js-pagination';
import { FaTrashAlt, FaEdit, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import './InvoiceTable.scss';
import apiRequest from '../../../../lib/apiRequest';
import { TailSpin } from 'react-loader-spinner';
import { toast, ToastContainer } from 'react-toastify';
import { Link } from 'react-router-dom';

const InvoiceTable = () => {
  const [invoices, setInvoices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [invoicesPerPage] = useState(5);
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [expandedInvoice, setExpandedInvoice] = useState(null); // State to track expanded invoice

  const [error, setError] = useState('');

  const [loading, setLoading] = useState(false);
  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await apiRequest.get('/v2/invoices/allInvoices');
      if (response.data.length > 0) {
        setInvoices(response.data);
        // toast.success('Invoces Fetched Successfully');
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

  //invoice deletion logic
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
        `/v2/invoices/deleteInvoice/${selectedinvoice._id}`
      );
      if (response.status) {
        await fetchInvoices();
        setError('');
        handleCloseInvoiceDeletionPopup();
        toast.success('Invoice Deleted Successfully!');
      }
    } catch (error) {
      // console.error('Error deleting invoice:', error);
      toast.error(error.response.data.message || 'Error deleting Invoice!');
      setError(error.response.data.message || 'Error deleting invoice!');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSelected = async () => {
    try {
      await Promise.all(
        selectedInvoices.map((id) => apiRequest.delete(`/invoices/${id}`))
      );
      setSelectedInvoices([]);
      fetchInvoices();
    } catch (error) {
      console.error('Error deleting selected invoices:', error);
    }
  };

  const handleUpdateInvoice = (invoiceId) => {
    console.log(`Update invoice with ID: ${invoiceId}`);
  };

  const toggleExpandInvoice = (invoiceId) => {
    setExpandedInvoice((prev) => (prev === invoiceId ? null : invoiceId));
  };

  // Pagination logic
  const indexOfLastInvoice = currentPage * invoicesPerPage;
  const indexOfFirstInvoice = indexOfLastInvoice - invoicesPerPage;
  const currentInvoices = invoices.slice(
    indexOfFirstInvoice,
    indexOfLastInvoice
  );

  return (
    <div className="invoice-table">
      {currentInvoices.length > 0 ? (
        <>
          <div className="invoice-card">
            <h2>All Invoices</h2>
          </div>{' '}
          <div className="invoice-actions">
            <button
              className="delete-selected"
              onClick={handleDeleteSelected}
              disabled={selectedInvoices.length === 0}
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
                <React.Fragment key={invoice._id}>
                  <tr>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedInvoices.includes(invoice._id)}
                        onChange={() => handleSelectInvoice(invoice._id)}
                      />
                    </td>
                    <td>{invoice.invoiceNumber}</td>
                    <td>{invoice.tenant.name}</td>
                    <td>{invoice.HouseNo}</td>
                    <td>
                      <button onClick={() => toggleExpandInvoice(invoice._id)}>
                        {expandedInvoice === invoice._id ? (
                          <FaChevronUp />
                        ) : (
                          <FaChevronDown />
                        )}
                      </button>
                      {expandedInvoice === invoice._id
                        ? invoice.items.map((item, index) => (
                            <div key={index} className="item-detail">
                              <strong>{item.name}</strong>: $
                              {item.price.toFixed(2)}
                              <br />
                              {item.description}
                            </div>
                          ))
                        : invoice.items.length}
                    </td>
                    <td>{invoice.isPaid ? 'Paid' : 'Unpaid'}</td>
                    <td>
                      <FaEdit
                        onClick={() => handleUpdateInvoice(invoice._id)}
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
            totalItemsCount={invoices.length}
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
      <ToastContainer />
    </div>
  );
};

export default InvoiceTable;
