import express from 'express';

import {
  registerTenant,
  getAllTenants,
  getGreyTenants,
  deleteTenantById,
  updateAmountPaid,
  getSingleTenant,
  updateSingleTenant,
  blackListTenant,
  whiteListTenant,
} from '../controllers/tenant.controller.js';

const router = express.Router();

// POST /api/tenants
router.post('/', registerTenant);
router.get('/allTenants', getAllTenants);
router.get('/allGreyTenants', getGreyTenants);
router.get('/getSingleTenant/:id', getSingleTenant);
router.put('/updateAmountPaid/:tenantId', updateAmountPaid);
router.put('/updateSingleTenant/:id', updateSingleTenant);
router.delete('/deleteTenant/:id', deleteTenantById);
router.patch('/blackListTenant/:id', blackListTenant);
router.patch('/whiteListTenant/:id', whiteListTenant);

export default router;
