import { Request, Response } from "express";
import { IShipment } from "../types";
import { registerShipmentServices, updateShipmentServices } from "../services/shipmentService";

// response interfaces 

export interface IShipmentRes{
    status: boolean
    message:string
    data?: {
        shipment?:Partial<IShipment>;
        receiptPdf?: Buffer; // include PDF if generated
        shipments?:Partial<IShipment> [];
    }
}

export interface IErrorRes {
    status: boolean
    message: string
}

// controllers/shipment.controller.ts
export const getShipment = async (req: Request, res: Response) => {
  try {
    const result = await registerShipmentServices(req.body);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};


export const createShipment = async (
  req: Request<{}, IShipmentRes | IErrorRes, any>,
  res: Response < IShipmentRes | IErrorRes>
): Promise<void> => {
  try {
    const result = await registerShipmentServices(req.body);

    if (!result) {
      
    }
    
    // Format response
    res.status(201).json({
      status: true,
      message: result.message,
      data: {
        shipment: result,
        receiptPdf: result.receiptPdf, // raw buffer, can encode to base64 if needed
      },
    });
  
  } catch (err: any) {
    const status = err.message?.includes("not found") ? 404 : 400;

    res.status(status).json({
      status: false,
      message: err.message || "Failed to register  shipment",
    });
  }
};


/**
 * Updates an existing shipment by tracking ID (admin/authorized only)
 */
export const updateShipment = async (
  req: Request<{ trackingId: string }, IShipmentRes | IErrorRes, any>,
  res: Response<IShipmentRes | IErrorRes>
): Promise<void> => {
  try {
    const { trackingId } = req.params;

    if (!trackingId?.trim()) {
      throw new Error("Tracking ID is required in the URL");
    }

    // Optional: add auth check if not already in middleware
    // if (!req.user || req.user.role !== 'admin') {
    //   throw new Error("Unauthorized - Admin access required");
    // }

    const result = await updateShipmentServices(trackingId, req.body);

    res.status(200).json({
      status: true,
      message: result.message || "Shipment updated successfully",
      data: {
        shipment: result,
        //   shipment: {
        //   _id: result.shipmentId,
        //   trackingId: result.trackingId, // if you want it here
        //   // add other fields if needed
        // },
      },
    });
  } catch (err: any) {
    const status = err.message?.includes("not found") ? 404 : 400;

    res.status(status).json({
      status: false,
      message: err.message || "Failed to update shipment",
    });
  }
};

export const deleteShipment = async (req: Request, res: Response) => {
  try {
    const result = await registerShipmentServices(req.body);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};


export default {
    getShipment,
    createShipment,
    updateShipment,
    deleteShipment
}
