import express from 'express';

import {
  registerTenant,
  getAllTenants,
  deleteTenantById,
  getSingleTenant,
  updateSingleTenant,
  blackListTenant,
  whiteListTenant,
} from '../controllers/tenant.controller.js';

const router = express.Router();

// POST /api/tenants
router.post('/', registerTenant);
router.get('/allTenants', getAllTenants);
router.get('/getSingleTenant/:id', getSingleTenant);
router.put('/updateSingleTenant/:id', updateSingleTenant);
router.delete('/deleteTenant/:id', deleteTenantById);
router.patch('/blackListTenant/:id', blackListTenant);
router.patch('/whiteListTenant/:id', whiteListTenant);

export default router;
