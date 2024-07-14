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

const router = express.Router();

// POST /api/landlords
router.post('/', registerLandlord);
router.get('/allLandlords', getAllLandlords);
router.get('/getSingleLandlord/:id', getSingleLandlord);
router.put('/updateSingleLandlord/:id', updateSingleLandlord);
router.delete('/deleteLandlord/:id', deleteLandlordById);
router.patch('/blackListLandlord/:id', blackListLandlord);
router.patch('/whiteListLandlord/:id', whiteListLandlord);

export default router;
