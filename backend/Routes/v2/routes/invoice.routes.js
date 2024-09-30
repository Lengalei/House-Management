import express from 'express';
import {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  deleteManyInvoices,
} from '../../../controllers/v2/controllers/invoiceController.js';

const router = express.Router();

// Create a new invoice
router.post('/postInvoice', createInvoice);

// Get all invoices
router.get('/allInvoices', getInvoices);

// Get a specific invoice by ID
router.get('/:id', getInvoiceById);

// Update an invoice
router.put('/updateInvoice/:id', updateInvoice);

// Delete an invoice
router.delete('/deleteInvoice/:id', deleteInvoice);

// Delete an invoice
router.delete('/deleteManyInvoices', deleteManyInvoices);

export default router;
