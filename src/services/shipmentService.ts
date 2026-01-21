import { Shipment } from "../models/Shipment";
import { Tracking } from "../models/TrackingShipment"; // your public tracking model
import { IShipment, IPerson, IPackage, IAddress, ShipmentStatus } from "../types";
import { Country } from "../utils/countries";
import { generateTrackingCode } from "../utils/trackingId"; // ← create this helper
import { generateReceiptPDF } from "../utils/generateReceipt";


/**
 * Registers a new shipment (admin action).
 * @param data Full shipment payload from admin form/request
 * @returns The created shipment document
 */
export const registerShipmentServices = async (data: {
    // Sender
    senderName: string;
    senderEmail: string;
    senderPhone: string;
    senderAddress: string;
    senderCity: string;
    senderCountry: Country;
    senderZipCode?: string;
    senderCompanyName?: string;
    senderAlternatePhone?: string;

  // Receiver
    receiverName: string;
    receiverEmail: string;
    receiverPhone: string;
    receiverAddress: string;
    receiverCity: string;
    receiverCountry: Country;
    receiverZipCode?: string;
    receiverCompanyName?: string;
    receiverAlternatePhone?: string;

    // Package
    packageWeightKg: number;
    packageDimensions: string;
    packageDescription: string;
    packageDeclaredValue?: number;
    packageQuantity?: number;
    packageIsFragile?: boolean;
    packageRequiresSignature?: boolean;

    // Origin / Destination (can differ from sender/receiver)
    originAddress: string;
    originCity: string;
    originCountry: Country;
    originZipCode?: string;

    destinationAddress: string;
    destinationCity: string;
    destinationCountry: Country;
    destinationZipCode?: string;

    // Optional
    estimatedDelivery: Date;
}) => {
  const {
    senderName, senderEmail, senderPhone, senderAddress, senderCity, senderCountry,
    senderZipCode,

    receiverName, receiverEmail, receiverPhone, receiverAddress, receiverCity, receiverCountry,
    receiverZipCode,

    packageWeightKg, packageDimensions, packageDescription, packageDeclaredValue,
    packageQuantity = 1, packageIsFragile = false, packageRequiresSignature = false,

    originAddress, originCity, originCountry, originZipCode,
    destinationAddress, destinationCity, destinationCountry, destinationZipCode,

    estimatedDelivery,
  } = data;

  // ─── Validation ────────────────────────────────────────
    if (!senderName || !senderEmail || !senderPhone || !senderAddress || !senderCity || !senderCountry) {
        throw new Error("All sender fields are required");
    }
    if (!receiverName || !receiverEmail || !receiverPhone || !receiverAddress || !receiverCity || !receiverCountry) {
        throw new Error("All receiver fields are required");
    }
    if (!packageWeightKg || !packageDimensions || !packageDescription) {
        throw new Error("Package details are required");
    }
    if (!originAddress || !originCity || !originCountry) {
        throw new Error("Origin address is required");
    }
    if (!destinationAddress || !destinationCity || !destinationCountry) {
        throw new Error("Destination address is required");
    }
    if (!estimatedDelivery || estimatedDelivery <= new Date()) {
        throw new Error("Valid future estimated delivery date is required");
    }

  // ─── Generate unique tracking ID ───────────────────────
    const trackingId = await generateTrackingCode();
    

  // ─── Build sender & receiver objects ───────────────────
    const sender: IPerson = {
        name: senderName,
        email: senderEmail,
        phoneNumber: senderPhone,
        address: senderAddress,
        city: senderCity,
        country: senderCountry,
        zipCode: senderZipCode,
        //...(senderZipCode !== undefined && { zipCode: senderZipCode }),
    };

    const receiver: IPerson = {
        name: receiverName,
        email: receiverEmail,
        phoneNumber: receiverPhone,
        address: receiverAddress,
        city: receiverCity,
        country: receiverCountry,
        zipCode: senderZipCode,
        //...(senderZipCode !== undefined && { zipCode: senderZipCode }),
    };

    // ─── Package object ────────────────────────────────────
    const packageInfo: IPackage = {
        weightKg: packageWeightKg,
        dimensions: packageDimensions,
        description: packageDescription,
        declaredValue: packageDeclaredValue,
        //...(packageDeclaredValue !== undefined && { declaredValue: packageDeclaredValue }),
        quantity: packageQuantity,
        isFragile: packageIsFragile,
        requiresSignature: packageRequiresSignature,
    };

    // ─── Origin & Destination ──────────────────────────────
    const origin: IAddress = {
        address: originAddress,
        city: originCity,
        country: originCountry,
        zipCode: senderZipCode
        //...(originZipCode !== undefined && { zipCode: originZipCode }),
    };

    const destination: IAddress = {
        address: destinationAddress,
        city: destinationCity,
        country: destinationCountry,
        zipCode: senderZipCode
        //...(destinationZipCode !== undefined && { zipCode: destinationZipCode }),
    };

    // ─── Create full shipment ──────────────────────────────
    const shipment = new Shipment({
        trackingId,
        sender,
        receiver,
        package: packageInfo,
        origin,
        destination,
        status: ShipmentStatus.InTransit,
        registeredAt: new Date(),
        estimatedDelivery,
        // currentLocation: undefined, // starts empty
    });

    await shipment.save();

    // ─── Create public tracking record ─────────────────────
    await Tracking.create({
        trackingId,
        sender: {
        name: sender.name,
        city: sender.city,
        country: sender.country,
        },
        receiver: {
        name: receiver.name,
        phoneNumber: receiver.phoneNumber,
        city: receiver.city,
        country: receiver.country,
        },
        status: shipment.status,
        destination,
        registeredAt: shipment.registeredAt,
        estimatedDelivery: shipment.estimatedDelivery,
    });

    //const receiptBuffer = await generateReceiptPDF(shipment);

    return {
        trackingId,
        message: "Shipment registered successfully",
        shipmentId: shipment._id,
        //receiptPdf: receiptBuffer,
    };

    
};