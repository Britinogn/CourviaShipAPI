import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { IShipment } from '../types'; // your Shipment type

/**
 * Generates a PDF receipt buffer for a shipment
 * @param shipment - The saved Shipment document
 * @returns Promise<Buffer> - PDF file as buffer (can be sent via email or download)
 */
export const generateReceiptPDF = async (shipment: IShipment): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        // ─── Header ────────────────────────────────────────────────
        doc
        .fontSize(20)
        .text('CourviaShip Receipt', { align: 'center' })
        .moveDown(0.5)
        .fontSize(12)
        .text(`Tracking ID: ${shipment.trackingId}`, { align: 'center' })
        .text(`Registered: ${shipment.registeredAt.toLocaleDateString()}`, { align: 'center' })
        .moveDown(1);

        // ─── Sender & Receiver ─────────────────────────────────────
        doc.fontSize(14).text('Sender:', 50, doc.y);
        doc.fontSize(12)
        .text(`${shipment.sender.name}`)
        .text(`${shipment.sender.address}, ${shipment.sender.city}, ${shipment.sender.country}`)
        .text(`Email: ${shipment.sender.email} | Phone: ${shipment.sender.phoneNumber}`)
        .moveDown(1);

        doc.fontSize(14).text('Receiver:', 50, doc.y);
        doc.fontSize(12)
        .text(`${shipment.receiver.name}`)
        .text(`${shipment.receiver.address}, ${shipment.receiver.city}, ${shipment.receiver.country}`)
        .text(`Email: ${shipment.receiver.email} | Phone: ${shipment.receiver.phoneNumber}`)
        .moveDown(1);

        // ─── Package Details ───────────────────────────────────────
        doc.fontSize(14).text('Package Information:');
        doc.fontSize(12)
        .text(`Weight: ${shipment.package.weightKg} kg`)
        .text(`Dimensions: ${shipment.package.dimensions}`)
        .text(`Description: ${shipment.package.description}`)
        .text(`Quantity: ${shipment.package.quantity || 1}`)
        .text(`Fragile: ${shipment.package.isFragile ? 'Yes' : 'No'}`)
        .text(`Signature Required: ${shipment.package.requiresSignature ? 'Yes' : 'No'}`)
        .moveDown(1);

        // ─── Origin / Destination ──────────────────────────────────
        doc.fontSize(14).text('Route:');
        doc.fontSize(12)
        .text(`From: ${shipment.origin.address}, ${shipment.origin.city}, ${shipment.origin.country}`)
        .text(`To: ${shipment.destination.address}, ${shipment.destination.city}, ${shipment.destination.country}`)
        .moveDown(1);

        // ─── Status & Estimated Delivery ───────────────────────────
        doc.fontSize(14).text('Status & Delivery:');
        doc.fontSize(12)
        .text(`Current Status: ${shipment.status}`)
        .text(`Estimated Delivery: ${shipment.estimatedDelivery.toLocaleDateString()}`)
        .moveDown(2);

        // ─── Footer ────────────────────────────────────────────────
        doc.fontSize(10).text('Thank you for choosing CourviaShip!', 50, doc.y, { align: 'center' });
        doc.text('Contact support: support@courviaship.com | +1-XXX-XXX-XXXX', { align: 'center' });

        doc.end();
    });

    // const receiptPath = path.join(__dirname, `../../receipts/receipt-${trackingId}.pdf`);
    // fs.writeFileSync(receiptPath, receiptBuffer);
};