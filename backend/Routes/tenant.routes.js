import express from 'express';

import {
  registerTenant,
  getAllTenants,
  deleteTenantById,
} from '../controllers/tenant.controller.js';

const router = express.Router();

// POST /api/tenants
router.post('/', registerTenant);
router.get('/allTenants', getAllTenants);
router.delete('/:id', deleteTenantById);

export default router;
