import { Shipment } from "../models/Shipment";

/**
 * Generates a unique tracking code with prefix + random alphanumeric part.
 * Checks database to avoid duplicates (retries if collision).
 * 
 * @param prefix - Prefix for the tracking code (default: "NSD")
 * @param length - Length of the random part (default: 6)
 * @param maxRetries - Max retry attempts if collision occurs (default: 5)
 * @returns Promise<string> - Unique tracking code
 */
export const generateTrackingCode = async (
  prefix: string = "DEL-",
  length: number = 6,
  maxRetries: number = 5
): Promise<string> => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let attempts = 0;

  while (attempts < maxRetries) {
    let code = prefix;

    // Generate random part
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Check if this code already exists
    const existing = await Shipment.findOne({ trackingId: code }).lean();

    if (!existing) {
      return code; // Unique → we're done
    }

    attempts++;
    console.warn(`Tracking code collision: ${code} - retrying (${attempts}/${maxRetries})`);
  }

  throw new Error(
    `Failed to generate unique tracking code after ${maxRetries} attempts. ` +
    `Try increasing length or using a different prefix.`
  );
};


// async function createShipment(shipmentData: IShipment) {
//   let trackingCode: string;
//   let exists = true;

//   while (exists) {
//     trackingCode = generateTrackingCode();
//     exists = await ShipmentModel.exists({ trackingCode });
//   }

//   const newShipment = new ShipmentModel({ ...shipmentData, trackingCode });
//   await newShipment.save();
//   return newShipment;
// }
