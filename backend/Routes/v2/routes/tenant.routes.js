import express from 'express';
import {
  createTenant,
  //add deposits
  addDeposits,
  addSingleAmountDeposit,
  tenantsWithIncompleteDeposits,
  updateTenantHouseDetails,
  checkTenantPaymentRecord,
  getMostRecentPaymentByTenantId,
  // updateWithMultipleDeposits,
  //
  getTenants,
  getTenantById,
  updateTenant,
  deleteTenant,
  updateWithIndividualDepoAmount,
} from '../../../controllers/v2/controllers/tenant.controller.js';

const router = express.Router();

// Route to create a new tenant
router.post('/createTenant', createTenant);
router.post('/addDeposits', addDeposits);
router.post('/addSingleAmountDeposit', addSingleAmountDeposit);

//get incomplete deposit
router.get('/tenantWithIncompleteDepo', tenantsWithIncompleteDeposits);
//update deposits
//first with a single depost amount
router.put('/updateWithIndividualDepoAmount', updateWithIndividualDepoAmount);
//then with multiple deposits
// router.put('/updateWithMultipleDeposits', updateWithMultipleDeposits);

// Route to get all tenants
router.get('/getAllTenants', getTenants);

// Route to get a tenant by ID
router.get('/getSingleTenant/:id', getTenantById);

// Route to update a tenant by ID
router.put('/updateTenant/:id', updateTenant);

router.put('/updateTenantHouseDetails/:tenantId', updateTenantHouseDetails);
// Route to delete a tenant by ID
router.delete('/deleteTenant/:id', deleteTenant);

router.get('/checkTenantPaymentRecord/:tenantId', checkTenantPaymentRecord);
router.get(
  '/getMostRecentPaymentByTenantId/:tenantId',
  getMostRecentPaymentByTenantId
);

export default router;
