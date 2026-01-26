// controllers/dashboardController.ts
import { Request, Response } from "express";
import {
    getTotalShipmentsCount,
    getShipmentsByStatus,
    getRecentShipments,
    getShipmentsByCountry,
    getShipmentsByTimePeriod,
    getPopularRoutes,
    getDashboardOverview,
} from "../services/dashboardService";

// ─── GET DASHBOARD OVERVIEW (All stats in one call) ───
export const getDashboardOverviewController = async (req: Request, res: Response) => {
    try {
        const result = await getDashboardOverview();
        res.status(200).json(result);
    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message || "Failed to fetch dashboard overview",
        });
    }
};

// ─── GET TOTAL SHIPMENTS COUNT ───
export const getTotalShipmentsController = async (req: Request, res: Response) => {
    try {
        const result = await getTotalShipmentsCount();
        res.status(200).json(result);
    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message || "Failed to fetch total shipments",
        });
    }
};

// ─── GET SHIPMENTS BY STATUS ───
export const getShipmentsByStatusController = async (req: Request, res: Response) => {
    try {
        const result = await getShipmentsByStatus();
        res.status(200).json(result);
    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message || "Failed to fetch shipments by status",
        });
    }
};

// ─── GET RECENT SHIPMENTS ───
export const getRecentShipmentsController = async (req: Request, res: Response) => {
    try {
        const limit = parseInt(req.query.limit as string) || 10;
        const result = await getRecentShipments(limit);
        res.status(200).json(result);
    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message || "Failed to fetch recent shipments",
        });
    }
};

// ─── GET SHIPMENTS BY COUNTRY ───
export const getShipmentsByCountryController = async (req: Request, res: Response) => {
    try {
        const result = await getShipmentsByCountry();
        res.status(200).json(result);
    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message || "Failed to fetch shipments by country",
        });
    }
};

// ─── GET SHIPMENTS BY TIME PERIOD ───
export const getShipmentsByTimePeriodController = async (req: Request, res: Response) => {
    try {
        const result = await getShipmentsByTimePeriod();
        res.status(200).json(result);
    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message || "Failed to fetch shipments by time period",
        });
    }
};

// ─── GET POPULAR ROUTES ───
export const getPopularRoutesController = async (req: Request, res: Response) => {
    try {
        const limit = parseInt(req.query.limit as string) || 10;
        const result = await getPopularRoutes(limit);
        res.status(200).json(result);
    } catch (err: any) {
        res.status(500).json({
            success: false,
            message: err.message || "Failed to fetch popular routes",
        });
    }
};

export default {
    getDashboardOverviewController,
    getTotalShipmentsController,
    getShipmentsByStatusController,
    getRecentShipmentsController,
    getShipmentsByCountryController,
    getShipmentsByTimePeriodController,
    getPopularRoutesController,
};