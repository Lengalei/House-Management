import express from 'express';

import {
  createApartment,
  allApartments,
  apartment,
  deleteApartment,
  updateApartment,
} from '../../../controllers/v2/controllers/apartment.controller.js';
import { authorizeRoles } from '../../../middleware/authorizeRoles.js';

const router = express.Router();

router.post(
  '/registerApartment',
  authorizeRoles('super_admin'),
  createApartment
);
router.get('/getAllApartments', allApartments);
router.get('/:id', apartment);
router.put('/:id', authorizeRoles('super_admin'), updateApartment);
router.delete('/:id', authorizeRoles('super_admin'), deleteApartment);

export default router;
