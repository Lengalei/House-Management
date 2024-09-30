import express from 'express';
import {
  deleteHouse,
  fetchALlHouses,
  fetchAllHousesInApartment,
  fetchSingleHouse,
  registerHouse,
} from '../controllers/house.controller.js';

const router = express.Router();

router.post('/postHouse/:apartmentId', registerHouse);
router.get('/getAllHouses', fetchALlHouses);
router.get('/getAllHouses/:apartmentId', fetchAllHousesInApartment);
router.post('/getSingleHouse', fetchSingleHouse);
router.delete('/deleteHouse', deleteHouse);

export default router;
