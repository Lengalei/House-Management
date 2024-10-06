import express from 'express';
import {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  deleteManyInvoices,
} from '../../../controllers/v2/controllers/invoiceController.js';
import { authorizeRoles } from '../../../middleware/authorizeRoles.js';

const router = express.Router();

// Create a new invoice
router.post('/postInvoice', authorizeRoles('super_admin'), createInvoice);

// Get all invoices
router.get('/allInvoices', getInvoices);

// Get a specific invoice by ID
router.get('/:id', getInvoiceById);

// Update an invoice
router.put('/updateInvoice/:id', authorizeRoles('super_admin'), updateInvoice);

// Delete an invoice
router.delete(
  '/deleteInvoice/:id',
  authorizeRoles('super_admin'),
  deleteInvoice
);

// Delete an invoice
router.delete(
  '/deleteManyInvoices',
  authorizeRoles('super_admin'),
  deleteManyInvoices
);

export default router;
