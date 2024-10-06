import express from 'express';
import {
  createPayment,
  getPaymentByDate,
  getAllPayments,
  getAllRentsPaid,
  getAllWaterRecords,
  getAllGarbageRecords,
  getGroupedPaymentsByTenant,
  getPaymentsByTenantId,
  getPreviousPayment,
  getPaymentsByTenant,
  updatePayment,
  deletePayment,
  deletePaymentsByTenant,
} from '../controllers/payment.controller.js';
import { authorizeRoles } from '../middleware/authorizeRoles.js';

const router = express.Router();

// Route to create a new payment record
router.post('/create', authorizeRoles('super_admin'), createPayment);

// Route to get a specific payment record by ID
router.get('/getPaymentByDate/:tenantId/', getPaymentByDate);

// Route to get a specific payment record by ID
router.get('/getAllPayments', getAllPayments);

// Route to get a specific payment record by ID
router.get('/allRents', getAllRentsPaid);

//get water and garbage records
router.get('/waterRecords', getAllWaterRecords);
router.get('/garbageRecords', getAllGarbageRecords);

// Get all payments grouped by tenantId
router.get('/getGroupedPaymentsByTenant', getGroupedPaymentsByTenant);

// Route to get Payments By TenantId
router.get('/getPaymentsByTenantId/:tenantId', getPaymentsByTenantId);

// Route to get a specific payment record by ID
router.get('/previousPayment/:tenantId', getPreviousPayment);

// Route to get all payment records
router.get('/paymentsByTenant/:tenantId', getPaymentsByTenant);

// Route to update a specific payment record by ID
router.put(
  '/updatePayment/:paymentId',
  authorizeRoles('super_admin'),
  updatePayment
);

// Route to delete a specific payment record by ID
router.delete(
  '/deletePayment/:paymentId',
  authorizeRoles('super_admin'),
  deletePayment
);

// Route to delete all payment records
router.delete(
  '/deletePayments/:tenantId',
  authorizeRoles('super_admin'),
  deletePaymentsByTenant
);

export default router;
