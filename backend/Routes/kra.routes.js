import express from 'express';
import {
  createKraRecord,
  getAllKraRecords,
  deleteKraRecord,
} from '../controllers/kra.controller.js';
import { authorizeRoles } from '../middleware/authorizeRoles.js';

const router = express.Router();

router.post('/', authorizeRoles('super_admin'), createKraRecord);
router.get('/allKra', getAllKraRecords);
router.delete(
  '/deleteKraRecord/:id',
  authorizeRoles('super_admin'),
  deleteKraRecord
);

export default router;
