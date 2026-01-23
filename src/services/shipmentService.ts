import { Shipment } from "../models/Shipment";
import { Tracking } from "../models/TrackingShipment"; 
import { IPerson, IPackage, IAddress, ShipmentStatus } from "../types";
import { Country } from "../utils/countries";
import { generateTrackingCode } from "../utils/trackingId"; 
import { generateReceiptPDF } from "../utils/generateReceipt";
import { sendRegistrationEmail, sendUpdateEmail } from '../utils/emailService';

/**
 * Registers a new shipment (admin action).
 * @param data Full shipment payload from admin form/request
 * @param trackingId - The tracking ID of the shipment to update
 * @returns The created shipment document
 */


// ─── GET ALL SHIPMENTS (with optional filters) ───
export const getAllShipments = async (filters?: {
    status?: string;
    senderName?: string;
    receiverName?: string;
    senderEmail?: string;
    receiverEmail?: string;
    limit?: number;
    skip?: number;
}) => {
    const query: any = {};

    // Build query from filters
    if (filters?.status) query.status = filters.status;
    if (filters?.senderName) query["sender.name"] = filters.senderName;
    if (filters?.receiverName) query["receiver.name"] = filters.receiverName;
    if (filters?.senderEmail) query["sender.email"] = filters.senderEmail;
    if (filters?.receiverEmail) query["receiver.email"] = filters.receiverEmail;

    const limit = filters?.limit || 50; // Default 50 results
    const skip = filters?.skip || 0;

    // Get shipments
    const shipments = await Shipment.find(query)
        .select("-__v")
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 })
        .lean();

    // Get total count
    const total = await Shipment.countDocuments(query);

    return {
        success: true,
        data: shipments,
        pagination: {
            total,
            limit,
            skip,
            hasMore: skip + shipments.length < total,
        },
    };
};

// ─── GET SHIPMENT BY TRACKING ID ───
export const getShipmentByTrackingId = async (trackingId: string) => {
    // Validation
    if (!trackingId?.trim()) {
        throw new Error("Tracking ID is required");
    }

    // Find shipment
    const shipment = await Shipment.findOne({ trackingId })
        .select("-__v") // Remove version key
        .lean(); // Return plain JS object (faster)

    if (!shipment) {
        throw new Error("Shipment not found");
    }

    // Format response
    return {
        success: true,
        message: "Shipment ID fetched successfully",
        trackingId,
    };
};


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

    const websiteUrl = process.env.WEBSITE_URL as string;

    const trackingUrl = `${websiteUrl}/track?code=${trackingId}`;


    // ✅ SEND REGISTRATION EMAIL
    try {
        await sendRegistrationEmail({
            to: receiverEmail,
            trackingCode: trackingId,
            senderName: sender.name,
            receiverName: receiver.name,
            receiverEmail: receiver.email,
            receiverPhone: receiver.phoneNumber,
            receiverAddress: receiver.address,
            receiverCity: receiver.city,
            receiverCountry: receiver.country,
            estimatedDelivery: new Date(estimatedDelivery).toISOString().split('T')[0], // ✅ Fixed
            //estimatedDelivery: estimatedDelivery?.toISOString().split('T')[0] || 'N/A',
            packageDescription: packageInfo.description,
            packageWeight: packageInfo.weightKg.toString(),
            packageQuantity: packageInfo.quantity || 1,
            trackingUrl:trackingUrl
        });
        console.log('✅ Registration email sent successfully');
    } catch (emailError: any) {
        console.error('⚠️ Failed to send registration email:', emailError.message);
        // Don't throw - shipment is already created
    }

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
        status?: ShipmentStatus;
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
    } = data;

    // ─── Validation ───
    if (!trackingId?.trim()) {
        throw new Error("Tracking ID is required to update shipment");
    }

    if (Object.keys(data).length === 0) {
        throw new Error("No update data provided");
    }

    if (status && !Object.values(ShipmentStatus).includes(status)) {
        throw new Error(`Invalid status. Must be one of: ${Object.values(ShipmentStatus).join(', ')}`);
    }

    // ─── Find the shipment ───
    const shipment = await Shipment.findOne({ trackingId });

    if (!shipment) {
        throw new Error("Shipment not found");
    }

    // ─── Prepare update object (dot notation for nested fields) ───
    const updateOps: Record<string, any> = {};

    // Sender updates - FIXED: phoneNumber not phone
    if (senderName !== undefined) updateOps["sender.name"] = senderName;
    if (senderEmail !== undefined) updateOps["sender.email"] = senderEmail;
    if (senderPhone !== undefined) updateOps["sender.phoneNumber"] = senderPhone; // ✅ phoneNumber
    if (senderAddress !== undefined) updateOps["sender.address"] = senderAddress;
    if (senderCity !== undefined) updateOps["sender.city"] = senderCity;
    if (senderCountry !== undefined) updateOps["sender.country"] = senderCountry;
    if (senderZipCode !== undefined) updateOps["sender.zipCode"] = senderZipCode;
    if (senderCompanyName !== undefined) updateOps["sender.companyName"] = senderCompanyName;
    if (senderAlternatePhone !== undefined) updateOps["sender.alternatePhone"] = senderAlternatePhone;

    // Receiver updates - FIXED: phoneNumber not phone
    if (receiverName !== undefined) updateOps["receiver.name"] = receiverName;
    if (receiverEmail !== undefined) updateOps["receiver.email"] = receiverEmail;
    if (receiverPhone !== undefined) updateOps["receiver.phoneNumber"] = receiverPhone; // ✅ phoneNumber
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
    if (status !== undefined) updateOps.status = status;

    // Debug: Log what we're trying to update
    console.log("Update operations:", JSON.stringify(updateOps, null, 2));

    // ─── Apply update to Shipment ───
    let updatedShipment;
    
    try {
        updatedShipment = await Shipment.findOneAndUpdate(
            { trackingId },
            { $set: updateOps },
            { 
                new: true, 
                runValidators: true,
                // Don't validate fields that aren't being updated
                context: 'query'
            }
        );

        if (!updatedShipment) {
            throw new Error("Failed to update shipment");
        }
    } catch (error: any) {
        console.error("Shipment update error:", error);
        throw new Error(`Failed to update shipment: ${error.message}`);
    }

    // ─── Sync relevant fields to Tracking table ───
    const trackingUpdateOps: Record<string, any> = {};

    // Only sync fields that exist in Tracking schema
    if (status !== undefined) trackingUpdateOps.status = status;
    if (estimatedDelivery !== undefined) trackingUpdateOps.estimatedDelivery = estimatedDelivery;

    // Sender (only name, city, country in Tracking)
    if (senderName !== undefined) trackingUpdateOps["sender.name"] = senderName;
    if (senderCity !== undefined) trackingUpdateOps["sender.city"] = senderCity;
    if (senderCountry !== undefined) trackingUpdateOps["sender.country"] = senderCountry;

    // Receiver (only name, phoneNumber, city, country in Tracking)
    if (receiverName !== undefined) trackingUpdateOps["receiver.name"] = receiverName;
    if (receiverPhone !== undefined) trackingUpdateOps["receiver.phoneNumber"] = receiverPhone;
    if (receiverCity !== undefined) trackingUpdateOps["receiver.city"] = receiverCity;
    if (receiverCountry !== undefined) trackingUpdateOps["receiver.country"] = receiverCountry;

    // Destination
    if (destinationAddress !== undefined) trackingUpdateOps["destination.address"] = destinationAddress;
    if (destinationCity !== undefined) trackingUpdateOps["destination.city"] = destinationCity;
    if (destinationCountry !== undefined) trackingUpdateOps["destination.country"] = destinationCountry;
    if (destinationZipCode !== undefined) trackingUpdateOps["destination.zipCode"] = destinationZipCode;

    // Update Tracking table if there are changes
    if (Object.keys(trackingUpdateOps).length > 0) {
        try {
            const updatedTracking = await Tracking.findOneAndUpdate(
                { trackingId },
                { $set: trackingUpdateOps },
                { new: true, runValidators: true }
            );

            if (!updatedTracking) {
                console.warn(`⚠️ Tracking record not found for trackingId: ${trackingId}`);
            } else {
                console.log("✅ Tracking synced successfully");
            }
        } catch (error: any) {
            console.error("❌ Tracking sync error:", error.message);
            // Don't throw - shipment is already updated
        }
    }

    const websiteUrl = process.env.WEBSITE_URL as string;

    const trackingUrl = `${websiteUrl}/track?code=${trackingId}`;
    // ✅ SEND UPDATE EMAIL (only if status or delivery date changed)
    if (status !== undefined || estimatedDelivery !== undefined) {
        try {
            await sendUpdateEmail({
                to: updatedShipment.receiver.email,
                trackingCode: trackingId,
                receiverName: updatedShipment.receiver.name,
                receiverCity: updatedShipment.receiver.city,
                receiverCountry: updatedShipment.receiver.country,
                oldStatus: shipment.status, // Old status before update
                newStatus: status || updatedShipment.status,
                estimatedDelivery: new Date(
                    estimatedDelivery ?? updatedShipment.estimatedDelivery
                ).toISOString().split('T')[0],
                updateMessage: status 
                    ? `Your package status has been updated to ${status}.`
                    : 'Your package delivery information has been updated.',
                trackingUrl:trackingUrl
            });

             //estimatedDelivery: new Date(estimatedDelivery).toISOString().split('T')[0],

            console.log('✅ Update email sent successfully');
        } catch (emailError: any) {
            console.error('⚠️ Failed to send update email:', emailError.message);
            // Don't throw - shipment is already updated
        }
    }

    // ─── Return result ───
    return {
        success: true,
        message: "Shipment updated successfully",
        trackingId,
        updatedShipmentId: updatedShipment._id.toString(),
    };
};

// ─── DELETE SHIPMENT (also deletes from Tracking) ───
export const deleteShipmentByTrackingId = async (trackingId: string) => {
    // Validation
    if (!trackingId?.trim()) {
        throw new Error("Tracking ID is required");
    }

    // Find shipment first to check if it exists
    const shipment = await Shipment.findOne({ trackingId });

    if (!shipment) {
        throw new Error("Shipment not found");
    }

    // Delete from Shipment table
    const deletedShipment = await Shipment.findOneAndDelete({ trackingId });

    if (!deletedShipment) {
        throw new Error("Failed to delete shipment");
    }

    // ─── Sync: Delete from Tracking table too ───
    try {
        const deletedTracking = await Tracking.findOneAndDelete({ trackingId });

        if (!deletedTracking) {
            console.warn(`⚠️ Tracking record not found for trackingId: ${trackingId}`);
        } else {
            console.log("✅ Tracking record deleted successfully");
        }
    } catch (error: any) {
        console.error("❌ Error deleting tracking record:", error.message);
        // Don't throw - shipment is already deleted
    }

    return {
        success: true,
        message: "Shipment and tracking record deleted successfully",
        trackingId,
    };
};

// ─── DELETE MULTIPLE SHIPMENTS (by IDs) ───
export const deleteMultipleShipments = async (trackingId: string[]) => {
    // Validation
    if (!trackingId || trackingId.length === 0) {
        throw new Error("At least one tracking ID is required");
    }

    // Delete from Shipment table
    const deletedShipments = await Shipment.deleteMany({
        trackingId: { $in: trackingId }
    });

    // ─── Sync: Delete from Tracking table too ───
    try {
        const deletedTrackings = await Tracking.deleteMany({
            trackingId: { $in: trackingId }
        });

        console.log(`✅ Deleted ${deletedTrackings.deletedCount} tracking records`);
    } catch (error: any) {
        console.error("❌ Error deleting tracking records:", error.message);
        // Don't throw - shipments are already deleted
    }

    return {
        success: true,
        message: `Deleted ${deletedShipments.deletedCount} shipment(s) and their tracking records`,
        deletedCount: deletedShipments.deletedCount,
    };
};