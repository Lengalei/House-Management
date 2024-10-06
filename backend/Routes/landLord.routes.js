import express from 'express';
import {
  blackListLandlord,
  deleteLandlordById,
  getAllLandlords,
  getSingleLandlord,
  updateSingleLandlord,
  registerLandlord,
  whiteListLandlord,
} from '../controllers/Landlord.controller.js';
import { authorizeRoles } from '../middleware/authorizeRoles.js';

const router = express.Router();

// POST /api/landlords
router.post('/', authorizeRoles('super_admin'), registerLandlord);
router.get('/allLandlords', getAllLandlords);
router.get('/getSingleLandlord/:id', getSingleLandlord);
router.put(
  '/updateSingleLandlord/:id',
  authorizeRoles('super_admin'),
  updateSingleLandlord
);
router.delete(
  '/deleteLandlord/:id',
  authorizeRoles('super_admin'),
  deleteLandlordById
);
router.patch(
  '/blackListLandlord/:id',
  authorizeRoles('super_admin'),
  blackListLandlord
);
router.patch(
  '/whiteListLandlord/:id',
  authorizeRoles('super_admin'),
  whiteListLandlord
);

export default router;
