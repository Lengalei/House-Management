import express from 'express';
import {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
} from '../../../controllers/v2/controllers/invoiceController.js';

const router = express.Router();

// Create a new invoice
router.post('/postInvoice', createInvoice);

// Get all invoices
router.get('/allInvoices', getInvoices);

// Get a specific invoice by ID
router.get('/:id', getInvoiceById);

// Update an invoice
router.put('/:id', updateInvoice);

// Delete an invoice
router.delete('/deleteInvoice/:id', deleteInvoice);

export default router;
