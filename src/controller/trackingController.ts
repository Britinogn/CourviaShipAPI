// Example: controllers/tracking.controller.ts
import { Request, Response } from "express";
//import { IShipment } from "../types";
import { getTrackingInfo } from "../services/trackingService";

export const trackShipment = async (req: Request, res: Response) => {
  try {
    const { trackingId } = req.params;

    if (!trackingId) {
      return res.status(400).json({ message: 'Tracking ID is required' });
    }

    const result = await getTrackingInfo(trackingId);

    res.status(200).json(result);
  } catch (err: any) {
    const status = err.message.includes("not found") ? 404 : 400;
    res.status(status).json({
      success: false,
      message: err.message || "Failed to fetch tracking info",
    });
  }
};

export default{
  trackShipment
}