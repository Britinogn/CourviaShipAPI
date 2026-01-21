// src/services/trackingService.ts
import { Tracking } from "../models/TrackingShipment"; // adjust to your actual model name

/**
 * Public service to lookup tracking info by tracking ID.
 * Returns only the minimal/safe public data.
 */
export const getTrackingInfo = async (trackingId: any) => {
  if (!trackingId?.trim()) {
    throw new Error("Tracking ID is required");
  }

  // Find the tracking document
  const tracking = await Tracking.findOne({ trackingId })
    .select("-_id -__v -createdAt -updatedAt") // remove internal Mongoose fields
    .lean(); // faster, returns plain JS object

  if (!tracking) {
    throw new Error("Tracking number not found");
  }

  // Optional: format dates nicely if you want (client can do this too)
  const formatted = {
    ...tracking,
    registeredAt: tracking.registeredAt?.toISOString().split("T")[0],
    estimatedDelivery: tracking.estimatedDelivery?.toISOString().split("T")[0],
  };

  return {
    success: true,
    data: formatted,
  };
};

export default {
  getTrackingInfo,
};