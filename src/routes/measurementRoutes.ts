import express, { Router } from "express"; 
import { uploadMeasurement, confirmMeasurement, getListOfMeasurements } from "../controllers/measurementController";

const router: Router = express.Router();

router.post("/upload", uploadMeasurement);
router.patch("/confirm", confirmMeasurement);
router.get("/:id/list", getListOfMeasurements);

export default router;
