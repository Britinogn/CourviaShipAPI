import { Request, Response } from "express";
import { IShipment } from "../types";
import { registerShipmentServices } from "../services/shipmentService";

// response interfaces 

export interface IShipmentRes{
    status: boolean
    message:string
    data?: {
        shipment?:Partial<IShipment>;
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
export const createShipment = async (req: Request, res: Response) => {
  try {
    const result = await registerShipmentServices(req.body);

    // res.set({
    //   'Content-Type': 'application/pdf',
    //   'Content-Disposition': `attachment; filename="receipt-${result.trackingId}.pdf"`,
    //   'Content-Length': result.receiptPdf.data.length,
    // });

    // res.send(Buffer.from(result.receiptPdf.data));
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
export const updateShipment = async (req: Request, res: Response) => {
  try {
    const result = await registerShipmentServices(req.body);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
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
