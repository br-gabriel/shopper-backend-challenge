import express, { Router } from "express"; 
const { uploadMeasurement, confirmMeasurement, getListOfMeasurements } = require("../controllers/measurementController");

const router: Router = express.Router();

router.post("/upload", uploadMeasurement);
router.patch("/confirm", confirmMeasurement);
router.get("/:id/list", getListOfMeasurements);

export default router;
