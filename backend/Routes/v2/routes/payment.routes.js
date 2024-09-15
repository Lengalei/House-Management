import express from 'express';
import {
  getFullyPaidTenantPayments,
  getUnpaidTenantPayments,
  updatePayment,
  monthlyPayProcessing,
  //
  getGroupedPaymentsByTenant,
  getPaymentsByTenantId,
  getAllRentsPaid,
  getPaymentsByTenant,
  deletePayment,
} from '../../../controllers/v2/controllers/payment.controller.js';
const router = express.Router();

router.get('/unpaidPayments/:tenantId', getUnpaidTenantPayments);
router.get('/fullyPaidPayments/:tenantId', getFullyPaidTenantPayments);
router.put('/updatePayment/:paymentId', updatePayment);
router.post('/monthlyPayProcessing', monthlyPayProcessing);

// Get all payments grouped by tenantId
router.get('/getGroupedPaymentsByTenant', getGroupedPaymentsByTenant);
// Route to get Payments By TenantId
router.get('/getPaymentsByTenantId/:tenant', getPaymentsByTenantId);
router.get('/allRents', getAllRentsPaid);
router.get('/paymentsByTenant/:tenantId', getPaymentsByTenant);
router.delete('/deletePayment/:paymentId', deletePayment);
export default router;
