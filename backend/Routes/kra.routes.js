import express from 'express';
import {
  createKraRecord,
  getAllKraRecords,
  deleteKraRecord,
} from '../controllers/kra.controller.js';

const router = express.Router();

router.post('/', createKraRecord);
router.get('/allKra', getAllKraRecords);
router.delete('/deleteKraRecord/:id', deleteKraRecord);

export default router;
