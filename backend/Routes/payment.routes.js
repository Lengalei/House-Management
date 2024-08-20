import express from 'express';
import {
  createPayment,
  getPaymentByDate,
  getAllPayments,
  getAllRentsPaid,
  getGroupedPaymentsByTenant,
  getPaymentsByTenantId,
  getPreviousPayment,
  getPaymentsByTenant,
  updatePayment,
  deletePayment,
  deletePaymentsByTenant,
} from '../controllers/payment.controller.js';

const router = express.Router();

// Route to create a new payment record
router.post('/create', createPayment);

// Route to get a specific payment record by ID
router.get('/getPaymentByDate/:tenantId/', getPaymentByDate);

// Route to get a specific payment record by ID
router.get('/getAllPayments', getAllPayments);

// Route to get a specific payment record by ID
router.get('/allRents', getAllRentsPaid);

// Get all payments grouped by tenantId
router.get('/getGroupedPaymentsByTenant', getGroupedPaymentsByTenant);

// Route to get Payments By TenantId
router.get('/getPaymentsByTenantId/:tenantId', getPaymentsByTenantId);

// Route to get a specific payment record by ID
router.get('/previousPayment/:tenantId', getPreviousPayment);

// Route to get all payment records
router.get('/paymentsByTenant/:tenantId', getPaymentsByTenant);

// Route to update a specific payment record by ID
router.put('/updatePayment/:paymentId', updatePayment);

// Route to delete a specific payment record by ID
router.delete('/deletePayment/:paymentId', deletePayment);

// Route to delete all payment records
router.delete('/deletePayments/:tenantId', deletePaymentsByTenant);

export default router;
