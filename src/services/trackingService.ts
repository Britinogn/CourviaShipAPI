import { Tracking } from "../models/TrackingShipment"; 

export const getTrackingInfo = async (trackingId: string) => {
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