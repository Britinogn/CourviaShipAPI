import express from "express";
const router = express.Router()

import trackingController from "../controller/trackingController";


//public track
router.get('/', trackingController.trackShipment)