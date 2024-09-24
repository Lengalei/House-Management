import express from "express";

import {
  createApartment,
  allApartments,
  apartment,
  deleteApartment,
  updateApartment,
} from "../../../controllers/v2/controllers/apartment.controller.js";

const router = express.Router();

router.post("/registerApartment", createApartment);
router.get("/getAllApartments", allApartments);
router.get("/:id", apartment);
router.put("/:id", updateApartment);
router.delete("/:id", deleteApartment);

export default router;
