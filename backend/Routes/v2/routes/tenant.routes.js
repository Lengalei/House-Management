import express from 'express';
import {
  createTenant,
  //add deposits
  addDeposits,
  addSingleAmountDeposit,
  tenantsWithIncompleteDeposits,
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

// Route to delete a tenant by ID
router.delete('/deleteTenant/:id', deleteTenant);

export default router;
