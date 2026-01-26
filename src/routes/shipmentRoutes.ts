// routes/shipmentRoutes.ts
import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import shipmentController from "../controller/shipmentController";

const router = express.Router();

// ─── PUBLIC ROUTES (No authentication) ───
// None for shipments - all operations require auth

// ─── PROTECTED ROUTES (Admin only) ───
router.use(authMiddleware);

// Create
router.post("/", shipmentController.createShipment);

// Read
router.get("/", shipmentController.getAllShipmentsController);
router.get("/:trackingId", shipmentController.getShipment);

// Update
router.patch("/:trackingId", shipmentController.updateShipment);

// Delete
router.delete("/bulk", shipmentController.deleteMultipleShipmentsController);
router.delete("/:trackingId", shipmentController.deleteShipment);

export default router;