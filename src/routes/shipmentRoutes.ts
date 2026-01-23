import express from "express";
const router = express.Router()

import shipmentController from  "../controller/shipmentController";
import { authMiddleware } from "../middleware/authMiddleware";

// Create
router.post('/', shipmentController.createShipment)

// Read
router.get('/:trackingId', authMiddleware, shipmentController.getShipment);
router.get('/', authMiddleware, shipmentController.getAllShipmentsController);

// Update
router.patch('/:trackingId', shipmentController.updateShipment)

// Delete
//router.delete('/bulk', authMiddleware, shipmentController.deleteMultipleShipmentsController);
router.delete('/:trackingId',  shipmentController.deleteShipment);

export default router;