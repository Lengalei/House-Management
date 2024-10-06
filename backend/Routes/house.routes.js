import express from 'express';
import {
  deleteHouse,
  fetchALlHouses,
  fetchAllHousesInApartment,
  fetchSingleHouse,
  registerHouse,
} from '../controllers/house.controller.js';
import { authorizeRoles } from '../middleware/authorizeRoles.js';

const router = express.Router();

router.post(
  '/postHouse/:apartmentId',
  authorizeRoles('super_admin'),
  registerHouse
);
router.get('/getAllHouses', fetchALlHouses);
router.get('/getAllHouses/:apartmentId', fetchAllHousesInApartment);
router.post('/getSingleHouse', authorizeRoles('super_admin'), fetchSingleHouse);
router.delete('/deleteHouse', authorizeRoles('super_admin'), deleteHouse);

export default router;
