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
  getListAllTenants,
  getToBeClearedTenants,
  getTenantById,
  updateTenant,
  deleteTenant,
  updateWithIndividualDepoAmount,
  clearTenant,
  clearance,
  blackListTenant,
  whiteListTenant,
  updateSingleTenantData,
  sendTenantAndOwnerEmails,
} from '../../../controllers/v2/controllers/tenant.controller.js';
import { authorizeRoles } from '../../../middleware/authorizeRoles.js';

const router = express.Router();

// Route to create a new tenant
router.post('/createTenant', authorizeRoles('super_admin'), createTenant);
router.post('/addDeposits', authorizeRoles('super_admin'), addDeposits);
router.post(
  '/addSingleAmountDeposit',
  authorizeRoles('super_admin'),
  addSingleAmountDeposit
);

//get incomplete deposit
router.get('/tenantWithIncompleteDepo', tenantsWithIncompleteDeposits);
//update deposits
//first with a single depost amount
router.put(
  '/updateWithIndividualDepoAmount',
  authorizeRoles('super_admin'),
  updateWithIndividualDepoAmount
);
//then with multiple deposits
// router.put('/updateWithMultipleDeposits', updateWithMultipleDeposits);

// Route to get all tenants
router.get('/getAllTenants', getListAllTenants);
router.get('/getToBeClearedFalse', getTenants); //getToBeClearedFalse
router.get('/getToBeClearedTenantsTrue', getToBeClearedTenants); //getToBeClearedTenantsTrue

// Route to get a tenant by ID
router.get('/getSingleTenant/:id', getTenantById);

// Route to update a tenant by ID
router.put('/updateTenant/:id', authorizeRoles('super_admin'), updateTenant);

router.put(
  '/updateTenantHouseDetails/:tenantId',
  authorizeRoles('super_admin'),
  updateTenantHouseDetails
);
// Route to delete a tenant by ID
router.delete('/deleteTenant/:id', authorizeRoles('super_admin'), deleteTenant);
router.patch(
  '/blackListTenant/:id',
  authorizeRoles('super_admin'),
  blackListTenant
);
router.patch(
  '/whiteListTenant/:id',
  authorizeRoles('super_admin'),
  whiteListTenant
);
router.put(
  '/updateSingleTenantData/:id',
  authorizeRoles('super_admin'),
  updateSingleTenantData
);

router.get('/checkTenantPaymentRecord/:tenantId', checkTenantPaymentRecord);

//clear tenant
router.put(
  '/clearTenant/:tenantId',
  authorizeRoles('super_admin'),
  clearTenant
);
//clear tenant 2.0
router.put('/clearance/:tenantId', authorizeRoles('super_admin'), clearance);

router.post(
  '/sendEmails/:id',
  authorizeRoles('super_admin'),
  sendTenantAndOwnerEmails
);
//not sure if we are going to use the below any more
router.get(
  '/getMostRecentPaymentByTenantId/:tenantId',
  getMostRecentPaymentByTenantId
);

export default router;
