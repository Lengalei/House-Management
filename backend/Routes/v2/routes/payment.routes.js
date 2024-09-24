import express from 'express';
import {
  getFullyPaidTenantPayments,
  getUnpaidTenantPayments,
  updatePayment,
  monthlyPayProcessing,
  ExtraAmountGivenInAmonth,
  //
  getGroupedPaymentsByTenant,
  getPaymentsByTenantId,
  getAllPayments,
  getAllRentsPaid,
  getAllWaterRecords,
  getAllGarbageRecords,
  getPaymentsByTenant,
  deletePayment,
} from '../../../controllers/v2/controllers/payment.controller.js';
const router = express.Router();

router.get('/unpaidPayments/:tenantId', getUnpaidTenantPayments);
router.get('/fullyPaidPayments/:tenantId', getFullyPaidTenantPayments);
router.put('/updatePayment/:paymentId', updatePayment);
router.post('/monthlyPayProcessing', monthlyPayProcessing);
router.put('/ExtraAmountGivenInAmonth/:paymentId', ExtraAmountGivenInAmonth);

// Get all payments grouped by tenantId
router.get('/getGroupedPaymentsByTenant', getGroupedPaymentsByTenant);
// Route to get Payments By TenantId
router.get('/getPaymentsByTenantId/:tenant', getPaymentsByTenantId);
router.get('/getAllPayments', getAllPayments);
router.get('/allRents', getAllRentsPaid);
router.get('/waterRecords', getAllWaterRecords);
router.get('/garbageRecords', getAllGarbageRecords);
router.get('/paymentsByTenant/:tenantId', getPaymentsByTenant);
router.delete('/deletePayment/:paymentId', deletePayment);
export default router;
