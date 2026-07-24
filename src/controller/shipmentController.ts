import { Request, Response } from "express";
import { IShipment } from "../types";
import { getAllShipments, getShipmentByTrackingId, deleteShipmentByTrackingId, 
  registerShipmentServices, updateShipmentServices, deleteMultipleShipments  
} from "../services/shipmentService";

import {generateReceiptPDF} from '../utils/generateReceipt'

// response interfaces 

export interface IShipmentRes{
    status: boolean
    message:string
    data?: {
      shipment?:Partial<IShipment>;
      shipments?:Partial<IShipment> [] | any;
      receiptPdf?: Buffer; // include PDF if generated
      pagination?: {
        total: number;
        limit: number;
        skip: number;
        hasMore: boolean;
      };
      deletedCount?: number;
      requestedCount?: number;
      notFound?: string[];
    }
}

export interface IErrorRes {
    status: boolean
    message: string
}

export const createShipment = async (
  req: Request<{}, IShipmentRes | IErrorRes, any>,
  res: Response < IShipmentRes | IErrorRes>
): Promise<void> => {
  try {
    const result = await registerShipmentServices(req.body);

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

export const getShipment = async (
  req: Request<{trackingId: string}, IShipmentRes | IErrorRes>,
  res: Response<IShipmentRes | IErrorRes>
): Promise<void> => {
  try {
    const {trackingId} = req.params;

    if (!trackingId?.trim()) {
      res.status(400).json({
        status: false,
        message: "Tracking ID is required"
      })
    }

    const result = await getShipmentByTrackingId(trackingId)

    res.status(200).json({
      status: true,
      message:  "Shipment retrieved successfully",
      data: {
        shipment: result as any
      },
    });

  } catch (err: any) {
    const status = err.message?.includes("not found") ? 404 : 400;

    res.status(status).json({
        status: false,
        message: err.message || "Failed to retrieve shipment",
    });
  }
}

export const getAllShipmentsController = async (
  req: Request<{}, IShipmentRes | IErrorRes>,
  res: Response<IShipmentRes | IErrorRes>
): Promise<void> => {
  try {
    const { status,senderName, receiverName, senderEmail, receiverEmail, limit, skip } = req.query;
    
    const filters = {
      status: status as string | undefined,
      senderName: senderName as string | undefined,
      receiverName: receiverName as string | undefined,
      senderEmail: senderEmail as string | undefined,
      receiverEmail: receiverEmail as string | undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      skip: skip ? parseInt(skip as string) : undefined,
    };

    const result = await getAllShipments(filters);

    res.status(200).json({
      status: true,
      message: "Shipments retrieved successfully",
      data: {
        shipments: result.data,
        pagination: result.pagination,
      },
    });

  } catch (err: any) {
    res.status(400).json({
        status: false,
        message: err.message || "Failed to retrieve shipments",
    });
  }

}

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

// export const deleteShipment = async (req: Request, res: Response) => {
//   try {
//     const result = await registerShipmentServices(req.body);
//     res.status(201).json(result);
//   } catch (err: any) {
//     res.status(400).json({ error: err.message });
//   }
// };


const deleteShipment = async (
    req: Request<{ trackingId: string }, IShipmentRes | IErrorRes>,
    res: Response<IShipmentRes | IErrorRes>
): Promise<void> => {
    try {
        const { trackingId } = req.params;

        if (!trackingId?.trim()) {
            res.status(400).json({
                status: false,
                message: "Tracking ID is required",
            });
            return;
        }

        // Optional: add auth check
        // if (!req.user || req.user.role !== 'admin') {
        //   res.status(403).json({ status: false, message: "Unauthorized" });
        //   return;
        // }

        const result = await deleteShipmentByTrackingId(trackingId);

        res.status(200).json({
            status: true,
            message: result.message || "Shipment deleted successfully",
        });
    } catch (err: any) {
        const status = err.message?.includes("not found") ? 404 : 400;

        res.status(status).json({
            status: false,
            message: err.message || "Failed to delete shipment",
        });
    }
};

// ─── DELETE MULTIPLE SHIPMENTS ───

export const deleteMultipleShipmentsController  = async (
    req: Request<{}, IShipmentRes | IErrorRes, { trackingId?: string[]; trackingIds?: string[] }>,
    res: Response<IShipmentRes | IErrorRes>
): Promise<void> => {
    try {
        const trackingIds = req.body.trackingIds ?? req.body.trackingId;

        if (!trackingIds || !Array.isArray(trackingIds) || trackingIds.length === 0) {
            res.status(400).json({
                status: false,
                message: "Array of tracking IDs is required",
            });
            return;
        }

        // Optional: add auth check
        // if (!req.user || req.user.role !== 'admin') {
        //   res.status(403).json({ status: false, message: "Unauthorized" });
        //   return;
        // }

        const result = await deleteMultipleShipments(trackingIds);

        res.status(200).json({
            status: true,
            message: result.message || "Shipments deleted successfully",
            data: {
                deletedCount: result.deletedCount,
                requestedCount: result.requestedCount,
                notFound: result.notFound,
            },
        });
    } catch (err: any) {
        res.status(400).json({
            status: false,
            message: err.message || "Failed to delete shipments",
        });
    }
};


export const getShipmentReceipt = async (
  req: Request<{ trackingId: string }>,
  res: Response
): Promise<void> => {
  try {
    const { trackingId } = req.params;

    if (!trackingId?.trim()) {
      res.status(400).json({
        status: false,
        message: 'Tracking ID is required',
      });
      return;
    }

    const shipment = await getShipmentByTrackingId(trackingId);

    if (!shipment) {
      res.status(404).json({
        status: false,
        message: 'Shipment not found',
      });
      return;
    }

    // Generate the PDF
    const pdfBuffer = await generateReceiptPDF(shipment as any);

    // Send as downloadable PDF
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="receipt-${trackingId}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    res.send(pdfBuffer);
  } catch (err: any) {
    const statusCode = err.message?.includes('not found') ? 404 : 400;
    res.status(statusCode).json({
      status: false,
      message: err.message || 'Failed to generate receipt',
    });
  }
};


export default {
  getShipment,
  getAllShipmentsController,
  createShipment,
  updateShipment,
  deleteShipment,
  deleteMultipleShipmentsController,
  getShipmentReceipt
}
