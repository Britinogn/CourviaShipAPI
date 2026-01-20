
import { ShipmentStatus } from './index';

export interface IShipmentReceipt {
  _id?: string                  // MongoDB ObjectId of the receipt
  shipmentId: string             // Reference to shipment

  trackingCode: string           // Shipment tracking code

  senderName: string
  senderPhone: string
  senderAddress: string

  receiverName: string
  receiverPhone: string
  receiverAddress: string

  originCity: string
  originCountry: string
  destinationCity: string
  destinationCountry: string

  packageWeight: number
  packageDimensions: string
  packageDescription: string

  status: ShipmentStatus         // Current shipment status
  estimatedDelivery: Date        // Estimated delivery at registration
  registeredAt: Date             // When shipment was registered

  receiptGeneratedAt: Date       // Timestamp for when the receipt was created
  signature?: string             // Digital signature (base64 or URL for signature image)
}

