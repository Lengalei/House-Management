import express from 'express';
import {
  getTenantClearData,
  updateClearanceData,
  deleteClearanceData,
} from '../../../controllers/v2/controllers/clearance.controller.js';
import { authorizeRoles } from '../../../middleware/authorizeRoles.js';

const router = express.Router();

router.get(
  '/tenantClearData/:tenantId',
  authorizeRoles('super_admin'),
  getTenantClearData
);
router.put(
  '/updateClearanceData/:clearDataId',
  authorizeRoles('super_admin'),
  updateClearanceData
);

router.delete(
  '/deleteClearance/:id',
  authorizeRoles('super_admin'),
  deleteClearanceData
);

export default router;
