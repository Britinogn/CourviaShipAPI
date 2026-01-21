import express from "express";
const router = express.Router()

import shipmentController from  "../controller/shipmentController";
import { authMiddleware } from "../middleware/authMiddleware";

//admin only
router.post('/', authMiddleware, shipmentController.registerShipment)
router.put('/:id',authMiddleware, shipmentController.updateShipment)
router.delete('/:id', authMiddleware, shipmentController.deleteShipment)