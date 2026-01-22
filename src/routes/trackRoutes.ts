import express from "express";
const router = express.Router()

import trackingController from "../controller/trackingController";


//public track
router.get('/:trackingId' , trackingController.trackShipment)

export default router;