import express from "express";
const router = express.Router()

import shipmentController from  "../controller/shipmentController";
import { authMiddleware } from "../middleware/authMiddleware";

//admin only
router.post('/', shipmentController.createShipment)
router.patch('/:trackingId', shipmentController.updateShipment)
router.delete('/:id', authMiddleware, shipmentController.deleteShipment)


export default router;