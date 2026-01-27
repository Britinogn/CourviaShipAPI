// routes/dashboardRoutes.ts
import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import dashboardController from "../controller/dashboardController";

const router = express.Router();

// ─── ALL ROUTES ARE PROTECTED (Admin only) ───
router.use(authMiddleware);

// ─── MAIN DASHBOARD OVERVIEW (Get everything in one call) ───
router.get("/", dashboardController.getDashboardOverviewController);

// ─── INDIVIDUAL STATS ENDPOINTS ───
router.get("/total", dashboardController.getTotalShipmentsController);
router.get("/by-status", dashboardController.getShipmentsByStatusController);
router.get("/recent", dashboardController.getRecentShipmentsController);
router.get("/by-country", dashboardController.getShipmentsByCountryController);
router.get("/by-time", dashboardController.getShipmentsByTimePeriodController);
router.get("/popular-routes", dashboardController.getPopularRoutesController);

export default router;