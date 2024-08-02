import express from 'express';
import {
  deleteHouse,
  fetchALlHouses,
  fetchSingleHouse,
  registerHouse,
} from '../controllers/house.controller.js';

const router = express.Router();

router.post('/postHouse', registerHouse);
router.get('/getAllHouses', fetchALlHouses);
router.post('/getSingleHouse', fetchSingleHouse);
router.delete('/deleteHouse', deleteHouse);

export default router;
