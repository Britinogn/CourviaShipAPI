export const generateTrackingCode = (prefix = "NSD", length = 6): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return prefix + result
}


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
