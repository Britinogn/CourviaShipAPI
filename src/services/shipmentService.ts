import { Shipment } from "../models/Shipment";
import { Tracking } from "../models/TrackingShipment"; 
import { IPerson, IPackage, IAddress, ShipmentStatus } from "../types";
import { Country } from "../utils/countries";
import { generateTrackingCode } from "../utils/trackingId"; 
import { generateReceiptPDF } from "../utils/generateReceipt";


/**
 * Registers a new shipment (admin action).
 * @param data Full shipment payload from admin form/request
 * @param trackingId - The tracking ID of the shipment to update
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

        packageWeightKg, packageDimensions, packageDescription, packageDeclaredValue,
        packageQuantity = 1, packageIsFragile = false, packageRequiresSignature = false,

        originAddress, originCity, originCountry, originZipCode,
        destinationAddress, destinationCity, destinationCountry, destinationZipCode,

        estimatedDelivery,
    } = data;

    // ─── Validation ────
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

  //  Generate unique tracking ID 
    const trackingId = await generateTrackingCode();
    

  // Build sender & receiver objects 
    const sender: IPerson = {
        name: senderName,
        email: senderEmail,
        phoneNumber: senderPhone,
        address: senderAddress,
        city: senderCity,
        country: senderCountry,
        zipCode: senderZipCode,
    };

    const receiver: IPerson = {
        name: receiverName,
        email: receiverEmail,
        phoneNumber: receiverPhone,
        address: receiverAddress,
        city: receiverCity,
        country: receiverCountry,
        zipCode: senderZipCode,
    };

    // ─── Package object ───────
    const packageInfo: IPackage = {
        weightKg: packageWeightKg,
        dimensions: packageDimensions,
        description: packageDescription,
        declaredValue: packageDeclaredValue,
        quantity: packageQuantity,
        isFragile: packageIsFragile,
        requiresSignature: packageRequiresSignature,
    };

    // Origin & Destination 
    const origin: IAddress = {
        address: originAddress,
        city: originCity,
        country: originCountry,
        zipCode: senderZipCode,
    };

    const destination: IAddress = {
        address: destinationAddress,
        city: destinationCity,
        country: destinationCountry,
        zipCode: senderZipCode
        //...(destinationZipCode !== undefined && { zipCode: destinationZipCode }),
    };

    // Create full shipment 
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

    // Create public tracking record 
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

    const receiptBuffer = await generateReceiptPDF(shipment); 
    
    return {
        trackingId,
        message: "Shipment registered successfully",
        shipmentId: shipment._id,
        receiptPdf: receiptBuffer,
    };
};

export const updateShipmentServices = async(
    trackingId: string,
    data: {
        // Sender
        senderName?: string;
        senderEmail?: string;
        senderPhone?: string;
        senderAddress?: string;
        senderCity?: string;
        senderCountry?: Country;
        senderZipCode?: string;
        senderCompanyName?: string;
        senderAlternatePhone?: string;

        // Receiver
        receiverName?: string;
        receiverEmail?: string;
        receiverPhone?: string;
        receiverAddress?: string;
        receiverCity?: string;
        receiverCountry?: Country;
        receiverZipCode?: string;
        receiverCompanyName?: string;
        receiverAlternatePhone?: string;

        // Package
        packageWeightKg?: number;
        packageDimensions?: string;
        packageDescription?: string;
        packageDeclaredValue?: number;
        packageQuantity?: number;
        packageIsFragile?: boolean;
        packageRequiresSignature?: boolean;

        // Origin / Destination
        originAddress?: string;
        originCity?: string;
        originCountry?: Country;
        originZipCode?: string;

        destinationAddress?: string;
        destinationCity?: string;
        destinationCountry?: Country;
        destinationZipCode?: string;

        // Optional
        estimatedDelivery?: Date;
        status?: ShipmentStatus;           // ← correct name (no "package" prefix)
    }
) => {
    const {
        senderName, senderEmail, senderPhone, senderAddress, senderCity, senderCountry,
        senderZipCode, senderCompanyName, senderAlternatePhone,

        receiverName, receiverEmail, receiverPhone, receiverAddress, receiverCity, receiverCountry,
        receiverZipCode, receiverCompanyName, receiverAlternatePhone,

        packageWeightKg, packageDimensions, packageDescription, packageDeclaredValue,
        packageQuantity, packageIsFragile, packageRequiresSignature,

        originAddress, originCity, originCountry, originZipCode,
        destinationAddress, destinationCity, destinationCountry, destinationZipCode,

        estimatedDelivery,
        status, 
        
        // ← correct field name
    } = data;

    // ─── Validation 
    if (!trackingId?.trim()) {
        throw new Error("Tracking ID is required to update shipment");
    }

    if (Object.keys(data).length === 0) {
        throw new Error("No update data provided");
    }

    if (status && !Object.values(ShipmentStatus).includes(status)) {
        throw new Error(`Invalid status. Must be one of: ${Object.values(ShipmentStatus).join(', ')}`);
    }

    // ─── Find the shipment 
    const shipment = await Shipment.findOne({ trackingId });

    if (!shipment) {
        throw new Error("Shipment not found");
    }

    // ─── Prepare update object (dot notation for nested fields) ──
    const updateOps: Record<string, any> = {};

    // Sender updates
    if (senderName !== undefined) updateOps["sender.name"] = senderName;
    if (senderEmail !== undefined) updateOps["sender.email"] = senderEmail;
    if (senderPhone !== undefined) updateOps["sender.phoneNumber"] = senderPhone;
    if (senderAddress !== undefined) updateOps["sender.address"] = senderAddress;
    if (senderCity !== undefined) updateOps["sender.city"] = senderCity;
    if (senderCountry !== undefined) updateOps["sender.country"] = senderCountry;
    if (senderZipCode !== undefined) updateOps["sender.zipCode"] = senderZipCode;
    if (senderCompanyName !== undefined) updateOps["sender.companyName"] = senderCompanyName;
    if (senderAlternatePhone !== undefined) updateOps["sender.alternatePhone"] = senderAlternatePhone;

    // Receiver updates
    if (receiverName !== undefined) updateOps["receiver.name"] = receiverName;
    if (receiverEmail !== undefined) updateOps["receiver.email"] = receiverEmail;
    if (receiverPhone !== undefined) updateOps["receiver.phoneNumber"] = receiverPhone;
    if (receiverAddress !== undefined) updateOps["receiver.address"] = receiverAddress;
    if (receiverCity !== undefined) updateOps["receiver.city"] = receiverCity;
    if (receiverCountry !== undefined) updateOps["receiver.country"] = receiverCountry;
    if (receiverZipCode !== undefined) updateOps["receiver.zipCode"] = receiverZipCode;
    if (receiverCompanyName !== undefined) updateOps["receiver.companyName"] = receiverCompanyName;
    if (receiverAlternatePhone !== undefined) updateOps["receiver.alternatePhone"] = receiverAlternatePhone;

    // Package updates
    if (packageWeightKg !== undefined) updateOps["package.weightKg"] = packageWeightKg;
    if (packageDimensions !== undefined) updateOps["package.dimensions"] = packageDimensions;
    if (packageDescription !== undefined) updateOps["package.description"] = packageDescription;
    if (packageDeclaredValue !== undefined) updateOps["package.declaredValue"] = packageDeclaredValue;
    if (packageQuantity !== undefined) updateOps["package.quantity"] = packageQuantity;
    if (packageIsFragile !== undefined) updateOps["package.isFragile"] = packageIsFragile;
    if (packageRequiresSignature !== undefined) updateOps["package.requiresSignature"] = packageRequiresSignature;

    // Origin updates
    if (originAddress !== undefined) updateOps["origin.address"] = originAddress;
    if (originCity !== undefined) updateOps["origin.city"] = originCity;
    if (originCountry !== undefined) updateOps["origin.country"] = originCountry;
    if (originZipCode !== undefined) updateOps["origin.zipCode"] = originZipCode;

    // Destination updates
    if (destinationAddress !== undefined) updateOps["destination.address"] = destinationAddress;
    if (destinationCity !== undefined) updateOps["destination.city"] = destinationCity;
    if (destinationCountry !== undefined) updateOps["destination.country"] = destinationCountry;
    if (destinationZipCode !== undefined) updateOps["destination.zipCode"] = destinationZipCode;

    // Other fields
    if (estimatedDelivery !== undefined) updateOps.estimatedDelivery = estimatedDelivery;
    if (status !== undefined) updateOps.status = status;  // ← correct key (no "package" prefix)

    //  Apply update to Shipment 
    const updatedShipment = await Shipment.findOneAndUpdate(
        { trackingId },
        { $set: updateOps },
        { new: true, runValidators: true }
    );

    if (!updatedShipment) {
        throw new Error("Failed to update shipment");
    }

    //  Sync key fields to Tracking 
    const trackingUpdate: any = {};

    if (status !== undefined) trackingUpdate.status = status;

    // Add more sync if you need (e.g. currentLocation later)
    // if (data.currentLocation) trackingUpdate.currentLocation = data.currentLocation;

    if (Object.keys(trackingUpdate).length > 0) {
        await Tracking.findOneAndUpdate(
        { trackingId },
        { $set: trackingUpdate },
        { new: true }
        );
    }

    //  Return result 
    return {
        success: true,
        message: "Shipment updated successfully",
        trackingId,
        updatedShipmentId: updatedShipment._id.toString(),
    };

    
};