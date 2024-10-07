import express from 'express';
import { authorizeRoles } from '../../../middleware/authorizeRoles.js';
import {
  createFloor,
  getAllFloors,
  getAllFloorsInApartment,
} from '../../../controllers/v2/controllers/floors.controller.js';

const router = express.Router();

router.post('/addFloor', authorizeRoles('super_admin'), createFloor);
router.get(
  '/getAllFloorsInApartment/:apartmentId',
  authorizeRoles('super_admin'),
  getAllFloorsInApartment
);
router.get('/getAllFloors', getAllFloors);

export default router;
