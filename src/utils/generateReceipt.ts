import PDFDocument from 'pdfkit';
import { HydratedDocument } from 'mongoose';
import { IShipment } from '../types'; 
import { IShipmentDocument } from '../models/Shipment'

export const generateReceiptPDF = async (
    shipment: IShipment | HydratedDocument<IShipmentDocument>
): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 0, size: 'A4' });
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        const green = '#16a34a';
        const black = '#0f172a';
        const gray = '#64748b';
        const lightGray = '#e2e8f0';
        const white = '#ffffff';
        const pageWidth = 595.28;
        const pageHeight = 841.89;
        const margin = 40;
        const contentWidth = pageWidth - margin * 2;

        // ─── White background ─────────────────────────────────────────
        doc.rect(0, 0, pageWidth, pageHeight).fill(white);

        // ─── Top green accent bar ─────────────────────────────────────
        doc.rect(0, 0, pageWidth, 6).fill(green);

        // ─── Logo / Company Name ──────────────────────────────────────
        doc.fontSize(22).fillColor(green).font('Helvetica-Bold')
            .text('COURVIA', margin, 24, { continued: true })
            .fillColor(black)
            .text('SHIP');

        doc.fontSize(8).fillColor(gray).font('Helvetica')
            .text('GLOBAL LOGISTICS & SHIPPING', margin, 50);

        // ─── "APPROVED FOR DELIVERY" top right ───────────────────────
        doc.fontSize(9).fillColor(gray).font('Helvetica-Bold')
            .text('APPROVED FOR DELIVERY', pageWidth - margin - 160, 24, { width: 160, align: 'right' });

        // ─── Divider ──────────────────────────────────────────────────
        doc.rect(margin, 68, contentWidth, 1).fill(lightGray);

        // ─── Three column header: SENDER | RECIPIENT | PACKAGE ────────
        const colW = contentWidth / 3;
        const col1x = margin;
        const col2x = margin + colW;
        const col3x = margin + colW * 2;
        let headerY = 82;

        const boldLabel = (label: string, value: string, x: number, y: number, width: number = colW - 10) => {
            doc.fontSize(9).fillColor(black).font('Helvetica-Bold')
                .text(`${label}: `, x, y, { continued: true, width })
                .font('Helvetica').fillColor(black)
                .text(value || 'N/A');
        };

        const sectionTitle = (title: string, x: number, y: number) => {
            doc.fontSize(8).fillColor(gray).font('Helvetica-Bold')
                .text(title, x, y);
        };

        // SENDER column
        sectionTitle('SENDER', col1x, headerY);
        doc.fontSize(13).fillColor(black).font('Helvetica-Bold')
            .text(shipment.sender.name, col1x, headerY + 14, { width: colW - 10 });

        let senderY = headerY + 36;
        boldLabel('Phone', shipment.sender.phoneNumber, col1x, senderY, colW - 10); senderY += 18;
        boldLabel('Address', shipment.sender.address, col1x, senderY, colW - 10); senderY += 18;
        boldLabel('City', shipment.sender.city, col1x, senderY, colW - 10); senderY += 18;
        boldLabel('Country', shipment.sender.country, col1x, senderY, colW - 10); senderY += 18;
        if (shipment.sender.companyName) {
            boldLabel('Company', shipment.sender.companyName, col1x, senderY, colW - 10); senderY += 18;
        }
        boldLabel('Email', shipment.sender.email, col1x, senderY, colW - 10);

        // RECIPIENT column
        sectionTitle('RECIPIENT', col2x, headerY);
        doc.fontSize(13).fillColor(black).font('Helvetica-Bold')
            .text(shipment.receiver.name, col2x, headerY + 14, { width: colW - 10 });

        let receiverY = headerY + 36;
        boldLabel('Phone', shipment.receiver.phoneNumber, col2x, receiverY, colW - 10); receiverY += 18;
        boldLabel('Address', shipment.receiver.address, col2x, receiverY, colW - 10); receiverY += 18;
        boldLabel('City', shipment.receiver.city, col2x, receiverY, colW - 10); receiverY += 18;
        boldLabel('Country', shipment.receiver.country, col2x, receiverY, colW - 10); receiverY += 18;
        boldLabel('Email', shipment.receiver.email, col2x, receiverY, colW - 10); receiverY += 18;
        boldLabel('Est. Delivery', shipment.estimatedDelivery.toLocaleDateString('en-US'), col2x, receiverY, colW - 10);

        // PACKAGE / TRACKING column
        sectionTitle('TRACKING', col3x, headerY);

        // Barcode-style tracking ID box
        doc.rect(col3x, headerY + 14, colW - 10, 36).stroke(lightGray);
        doc.fontSize(7).fillColor(gray).font('Helvetica')
            .text('* ' + shipment.trackingId + ' *', col3x, headerY + 20, { width: colW - 10, align: 'center' });
        doc.fontSize(11).fillColor(black).font('Helvetica-Bold')
            .text(shipment.trackingId, col3x, headerY + 30, { width: colW - 10, align: 'center' });

        let packageY = headerY + 60;
        boldLabel('Weight', `${shipment.package.weightKg} Kg`, col3x, packageY, colW - 10); packageY += 18;
        boldLabel('Quantity', `${shipment.package.quantity || 1}`, col3x, packageY, colW - 10); packageY += 18;
        boldLabel('Dimensions', shipment.package.dimensions, col3x, packageY, colW - 10); packageY += 18;
        if (shipment.package.declaredValue) {
            boldLabel('Est. Value', `USD ${shipment.package.declaredValue}`, col3x, packageY, colW - 10); packageY += 18;
        }
        boldLabel('Fragile', shipment.package.isFragile ? 'Yes' : 'No', col3x, packageY, colW - 10); packageY += 18;
        boldLabel('Signature', shipment.package.requiresSignature ? 'Required' : 'Not Required', col3x, packageY, colW - 10);

        // ─── Divider ──────────────────────────────────────────────────
        const tableY = Math.max(senderY, receiverY, packageY) + 30;
        doc.rect(margin, tableY, contentWidth, 1).fill(lightGray);

        // ─── Package Table (like Panex) ───────────────────────────────
        const tY = tableY + 10;
        const tableHeaders = ['Package Type', 'Delivery Status', 'Description', 'Delivery Cost'];
        // const tableColW = [100, 110, contentWidth - 310, 100];
        const tableColW: number[] = [100, 110, contentWidth - 310, 100];
        let tx = margin;

        // Table header row
        doc.rect(margin, tY, contentWidth, 24).fill(black);
        // tableHeaders.forEach((h, i) => {
        //     doc.fontSize(8).fillColor(white).font('Helvetica-Bold')
        //         .text(h, tx + 6, tY + 8, { width: tableColW[i] - 6 });
        //     tx += tableColW[i];
        // });
        tableHeaders.forEach((h, i) => {
            doc.fontSize(8).fillColor(white).font('Helvetica-Bold')
                .text(h, tx + 6, tY + 8, { width: (tableColW[i] ?? 100) - 6 });
            tx += tableColW[i] ?? 100;
        });

        // Table data row
        const rowY = tY + 24;
        doc.rect(margin, rowY, contentWidth, 28).fill(white).stroke(lightGray);
        tx = margin;

        const rowData = [
            shipment.package.dimensions || 'Custom',
            shipment.status,
            shipment.package.description,
            shipment.package.declaredValue ? `USD ${shipment.package.declaredValue}` : 'N/A'
        ];

        // rowData.forEach((val, i) => {
        //     if (i === 1) {
        //         // Status badge
        //         doc.rect(tx + 4, rowY + 6, tableColW[i] - 14, 16).fill('#dcfce7').stroke('#16a34a');
        //         doc.fontSize(8).fillColor(green).font('Helvetica-Bold')
        //             .text(val, tx + 6, rowY + 10, { width: tableColW[i] - 16 });
        //     } else {
        //         doc.fontSize(8).fillColor(black).font('Helvetica')
        //             .text(val || 'N/A', tx + 6, rowY + 10, { width: tableColW[i] - 10, lineBreak: false });
        //     }
        //     tx += tableColW[i];
        // });

        rowData.forEach((val, i) => {
            const colWidth = tableColW[i] ?? 100;
            if (i === 1) {
                doc.rect(tx + 4, rowY + 6, colWidth - 14, 16).fill('#dcfce7').stroke('#16a34a');
                doc.fontSize(8).fillColor(green).font('Helvetica-Bold')
                    .text(val, tx + 6, rowY + 10, { width: colWidth - 16 });
            } else {
                doc.fontSize(8).fillColor(black).font('Helvetica')
                    .text(val || 'N/A', tx + 6, rowY + 10, { width: colWidth - 10, lineBreak: false });
            }
            tx += colWidth;
        });

        // ─── Route section ────────────────────────────────────────────
        const routeY = rowY + 44;
        doc.rect(margin, routeY, contentWidth, 1).fill(lightGray);

        doc.fontSize(8).fillColor(gray).font('Helvetica-Bold')
            .text('ORIGIN', margin, routeY + 10);
        doc.fontSize(9).fillColor(black).font('Helvetica')
            .text(`${shipment.origin.address}, ${shipment.origin.city}, ${shipment.origin.country}`, margin, routeY + 22, { width: contentWidth / 2 - 20 });

        doc.fontSize(14).fillColor(green).font('Helvetica-Bold')
            .text('-->', pageWidth / 2 - 15, routeY + 18);

        doc.fontSize(8).fillColor(gray).font('Helvetica-Bold')
            .text('DESTINATION', pageWidth / 2 + 20, routeY + 10);
        doc.fontSize(9).fillColor(black).font('Helvetica')
            .text(`${shipment.destination.address}, ${shipment.destination.city}, ${shipment.destination.country}`, pageWidth / 2 + 20, routeY + 22, { width: contentWidth / 2 - 20 });

        // ─── Signature / stamp area ───────────────────────────────────
        const signY = routeY + 70;
        doc.rect(margin, signY, contentWidth, 1).fill(lightGray);

        doc.fontSize(8).fillColor(gray).font('Helvetica')
            .text('Issued: ' + shipment.registeredAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), margin, signY + 12);

        // Signature box
        doc.rect(pageWidth - margin - 160, signY + 8, 160, 55).stroke(lightGray);
        doc.fontSize(8).fillColor(gray).font('Helvetica-Bold')
            .text('COURVIASHIP', pageWidth - margin - 155, signY + 14, { width: 150, align: 'center' });
        doc.fontSize(7).fillColor(gray).font('Helvetica')
            .text('SIGN: ................................', pageWidth - margin - 155, signY + 30)
            .text('DATE: ................................', pageWidth - margin - 155, signY + 44);

        // ─── Customs notice ───────────────────────────────────────────
        const customsY = signY + 80;
        doc.fontSize(9).fillColor(black).font('Helvetica-Bold')
            .text('Customs Duty/Tax Payable By Recipient.', margin, customsY, { align: 'center', width: contentWidth });

        // ─── Footer ───────────────────────────────────────────────────
        doc.rect(0, pageHeight - 40, pageWidth, 40).fill(black);
        doc.rect(0, pageHeight - 40, pageWidth, 3).fill(green);
        doc.fontSize(8).fillColor(gray).font('Helvetica')
            .text('support@courviaship.com  |  www.courviaship.com  |  Thank you for choosing CourviaShip!', margin, pageHeight - 24, { align: 'center', width: contentWidth });

        doc.end();
    });
};