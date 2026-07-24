import PDFDocument from 'pdfkit';
import { HydratedDocument } from 'mongoose';
import { IShipment } from '../types';
import { IShipmentDocument } from '../models/Shipment';

export const generateReceiptPDF = async (
  shipment: IShipment | HydratedDocument<IShipmentDocument>
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 0, size: 'A4' });
    const buffers: Buffer[] = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    // ─── Colors ─────────────────────────────────────────────────
    const brand = '#16a34a';       // header/logo accent
    const green = '#16a34a';       // "paid" / positive status
    const greenBg = '#dcfce7';
    const amber = '#ea580c';       // "pending" pill
    const amberBg = '#ffedd5';
    const stampRed = '#16a34a';
    const black = '#111827';
    const gray = '#6b7280';
    const lightGray = '#e5e7eb';
    const veryLightGray = '#f9fafb';
    const white = '#ffffff';

    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const margin = 40;
    const contentWidth = pageWidth - margin * 2;

    // Fields not yet on IShipment (locker number, payment method/status).
    // Cast defensively so this compiles even before you add them to the
    // schema/type; they simply won't render until the data is present.
    const senderAny = shipment.sender as any;
    const packageAny = shipment.package as any;

    // ─── Background ─────────────────────────────────────────────
    doc.rect(0, 0, pageWidth, pageHeight).fill(white);

    // ─── Header ─────────────────────────────────────────────────
    doc.fontSize(22).fillColor(green).font('Helvetica-Bold')
    .text('COURVIA', margin, 22, { continued: true })
    .fillColor(black)
    .text('SHIP')

    doc.fontSize(9).fillColor(gray).font('Helvetica-Bold')
      .text('GLOBAL LOGISTICS & SHIPPING', margin, 50, { characterSpacing: 0.6 });

    doc.fontSize(9).fillColor(gray).font('Helvetica-Bold')
      .text('APPROVED FOR DELIVERY', pageWidth - margin - 180, 30, {
        width: 180,
        align: 'right',
      });

    doc.moveTo(margin, 72).lineTo(pageWidth - margin, 72)
      .strokeColor(lightGray).lineWidth(1).stroke();

    // ─── Three columns: Sender / Recipient / Tracking-Package ───
    const col1 = margin;
    const col2 = margin + 175;
    const col3 = margin + 350;
    const colWidth = 155;

    const y = 92;

    const labelValue = (label: string, value: string | null | undefined, x: number, currentY: number, maxWidth = colWidth) => {
      doc.fontSize(9).font('Helvetica-Bold').fillColor(black)
        .text(`${label}: `, x, currentY, { continued: true, width: maxWidth });
      doc.font('Helvetica').fillColor(black)
        .text(value || 'N/A', { width: maxWidth });
      return doc.y + 6;
    };

    // ── SENDER ──
    doc.fontSize(8).fillColor(gray).font('Helvetica-Bold').text('SENDER', col1, y);
    doc.fontSize(13).fillColor(black).font('Helvetica-Bold')
      .text(shipment.sender.name || 'N/A', col1, y + 14, { width: colWidth });

    let y1 = y + 34;
    y1 = labelValue('Phone', shipment.sender.phoneNumber, col1, y1);
    if (shipment.sender.phoneNumber) {
      doc.fontSize(8).fillColor(gray).font('Helvetica')
        .text(`(tel:${shipment.sender.phoneNumber})`, col1, y1, { width: colWidth });
      y1 = doc.y + 6;
    }
    y1 = labelValue('Address', shipment.sender.address, col1, y1);
    y1 = labelValue('Country Origin', shipment.origin?.country, col1, y1);
    y1 = labelValue('City Origin', shipment.origin?.city, col1, y1);
    if (senderAny.lockerNumber) {
      y1 = labelValue('Locker', senderAny.lockerNumber, col1, y1);
    }

    // ── RECIPIENT ──
    doc.fontSize(8).fillColor(gray).font('Helvetica-Bold').text('RECIPIENT', col2, y);
    doc.fontSize(13).fillColor(black).font('Helvetica-Bold')
      .text(shipment.receiver.name || 'N/A', col2, y + 14, { width: colWidth });

    let y2 = y + 34;
    y2 = labelValue('Telephone', shipment.receiver.phoneNumber, col2, y2);
    if (shipment.receiver.phoneNumber) {
      doc.fontSize(8).fillColor(gray).font('Helvetica')
        .text(`(tel:${shipment.receiver.phoneNumber})`, col2, y2, { width: colWidth });
      y2 = doc.y + 6;
    }
    y2 = labelValue('Address', shipment.receiver.address, col2, y2);
    y2 = labelValue('Email', shipment.receiver.email, col2, y2);
    y2 = labelValue('Destination Country', shipment.destination?.country, col2, y2);
    y2 = labelValue('Destination City', shipment.destination?.city, col2, y2);
    y2 = labelValue(
      'Arrival Date',
      shipment.estimatedDelivery
        ? new Date(shipment.estimatedDelivery).toLocaleDateString('en-US')
        : null,
      col2,
      y2
    );

    // ── TRACKING / PACKAGE ──
    const barcodeX = col3;
    const barcodeY = y;
    const barcodeW = 145;
    const barcodeH = 34;
    doc.rect(barcodeX, barcodeY, barcodeW, barcodeH).strokeColor(lightGray).lineWidth(1).stroke();

    const code = String(shipment.trackingId || 'AWB-000000');
    let bx = barcodeX + 8;
    const barTop = barcodeY + 5;
    const barBottom = barcodeY + 24;
    for (let i = 0; i < code.length; i++) {
      const c = code.charCodeAt(i);
      const w = 1 + (c % 3);
      if (c % 2 === 0) {
        doc.rect(bx, barTop, w, barBottom - barTop).fill(black);
      }
      bx += w + 1.4;
      if (bx > barcodeX + barcodeW - 8) break;
    }
    doc.fontSize(7).fillColor(black).font('Helvetica-Bold')
      .text(`* ${code} *`, barcodeX, barcodeY + 24, { width: barcodeW, align: 'center' });

    let y3 = barcodeY + barcodeH + 12;
    y3 = labelValue('Package Weight', `${shipment.package.weightKg} Kg`, col3, y3);

    if (packageAny.paymentMethod || packageAny.paymentStatus) {
      doc.fontSize(9).fillColor(black).font('Helvetica-Bold').text('Payment Method:', col3, y3);
      y3 += 14;
      let px = col3;
      if (packageAny.paymentMethod) {
        const label = packageAny.paymentMethod as string;
        const w = doc.fontSize(8).font('Helvetica-Bold').widthOfString(label) + 24;
        doc.roundedRect(px, y3, w, 18, 9).fill(amberBg);
        doc.fontSize(8).fillColor(amber).font('Helvetica-Bold')
          .text(label, px, y3 + 5, { width: w, align: 'center' });
        px += w + 6;
      }
      if (packageAny.paymentStatus) {
        const label = packageAny.paymentStatus as string;
        const w = doc.fontSize(8).font('Helvetica-Bold').widthOfString(label) + 24;
        doc.roundedRect(px, y3, w, 18, 9).fill(greenBg);
        doc.fontSize(8).fillColor(green).font('Helvetica-Bold')
          .text(label, px, y3 + 5, { width: w, align: 'center' });
      }
      y3 += 28;
    }

    if (shipment.package.declaredValue) {
      doc.fontSize(9).fillColor(black).font('Helvetica-Bold').text('Estimated Insurance', col3, y3);
      y3 += 13;
      y3 = labelValue('Value', `USD ${shipment.package.declaredValue}`, col3, y3);
    }

    // ─── Table ──────────────────────────────────────────────────
    const tableTop = Math.max(y1, y2, y3) + 26;
    const headers = ['Package Type', 'Delivery Status', 'Description', 'Delivery Cost'];
    const colWidths: number[] = [110, 120, contentWidth - 340, 110];

    doc.rect(margin, tableTop, contentWidth, 26).fillAndStroke(veryLightGray, lightGray);

    let x = margin;
    headers.forEach((h, i) => {
      const width = colWidths[i] ?? 100;
      doc.fontSize(8).fillColor(black).font('Helvetica-Bold')
        .text(h, x + 10, tableTop + 9, { width: width - 14 });
      x += width;
      if (i < headers.length - 1) {
        doc.moveTo(x, tableTop).lineTo(x, tableTop + 56)
          .strokeColor(lightGray).lineWidth(1).stroke();
      }
    });

    const rowY = tableTop + 26;
    const rowH = 30;
    doc.rect(margin, rowY, contentWidth, rowH).strokeColor(lightGray).lineWidth(1).stroke();

    const rowValues = [
      shipment.package.dimensions || 'Custom',
      shipment.status,
      shipment.package.description || 'N/A',
      shipment.package.declaredValue ? `USD ${shipment.package.declaredValue}` : 'N/A',
    ];

    x = margin;
    rowValues.forEach((val, i) => {
      const width = colWidths[i] ?? 100;
      if (i === 1) {
        doc.fontSize(8).font('Helvetica-Bold');
        const pillWidth = doc.widthOfString(val) + 20;
        doc.roundedRect(x + 10, rowY + 7, pillWidth, 16, 8).fill(greenBg);
        doc.fillColor(green).text(val, x + 10, rowY + 11, { width: pillWidth, align: 'center' });
      } else {
        doc.fontSize(8).fillColor(black).font('Helvetica')
          .text(val, x + 10, rowY + 11, { width: width - 16 });
      }
      x += width;
    });

    // ─── Methods of Payment ─────────────────────────────────────
    const paymentY = rowY + rowH + 40;

    doc.fontSize(10).fillColor(black).font('Helvetica-Bold')
      .text('Methods of Payment:', margin, paymentY);

    const boxW = 260;
    const boxH = 78;
    doc.roundedRect(margin, paymentY + 16, boxW, boxH, 6)
      .strokeColor(lightGray).lineWidth(1).stroke();

    const badgeRow1 = ['GeoTrust', 'Visa', 'Mastercard'];
    let badgeX = margin + 10;
    const badgeY1 = paymentY + 26;
    badgeRow1.forEach((label) => {
      doc.fontSize(7.5).font('Helvetica-Bold');
      const w = doc.widthOfString(label) + 16;
      doc.roundedRect(badgeX, badgeY1, w, 16, 4).fill(veryLightGray);
      doc.fillColor(black).text(label, badgeX, badgeY1 + 4, { width: w, align: 'center' });
      badgeX += w + 6;
    });

    doc.fontSize(7.5).font('Helvetica-Bold');
    const paypalW = doc.widthOfString('PayPal') + 16;
    doc.roundedRect(margin + 10, badgeY1 + 22, paypalW, 16, 4).fill(veryLightGray);
    doc.fillColor(black).text('PayPal', margin + 10, badgeY1 + 26, { width: paypalW, align: 'center' });

    const safeLabel = 'SAFE SHOPPING';
    doc.fontSize(7.5).font('Helvetica-Bold');
    const safeW = doc.widthOfString(safeLabel) + 20;
    doc.roundedRect(margin + 10, badgeY1 + 44, safeW, 16, 8).fill(greenBg);
    doc.fillColor(green).text(safeLabel, margin + 10, badgeY1 + 48, { width: safeW, align: 'center' });

    doc.fontSize(8).fillColor(gray).font('Helvetica')
      .text(
        'For your convenience we have several reliable, fast and secure payments.',
        margin,
        paymentY + 16 + boxH + 10,
        { width: boxW }
      );

    // ─── Stamp ──────────────────────────────────────────────────
    const stampW = 180;
    const stampH = 100;
    const stampX = pageWidth - margin - stampW;
    const stampCenterY = paymentY + 10 + stampH / 2;

    doc.save();
    doc.translate(stampX + stampW / 2, stampCenterY);
    doc.rotate(-6);

    doc.roundedRect(-stampW / 2, -stampH / 2, stampW, stampH, 4)
      .strokeColor(stampRed).lineWidth(2).stroke();

    doc.fontSize(9).fillColor(stampRed).font('Helvetica-Bold')
      .text('COURVIASHIP INC.', -stampW / 2, -stampH / 2 + 12, {
        width: stampW,
        align: 'center',
        characterSpacing: 0.3,
      });

    doc.fontSize(13).fillColor(stampRed).font('Helvetica-Bold')
      .text('STAMP DUTY', -stampW / 2, -stampH / 2 + 38, { width: stampW, align: 'center' });

    doc.fontSize(9).fillColor(stampRed).font('Helvetica-Bold')
      .text('1 STAMP DUTY', -stampW / 2, -stampH / 2 + 60, { width: stampW, align: 'center' });

    doc.fontSize(15).fillColor(stampRed).font('Helvetica-Oblique')
      .text('Courviaship', -stampW / 2, -stampH / 2 + 78, { width: stampW, align: 'right' });

    doc.restore();

    // ─── Customs notice ─────────────────────────────────────────
    const customsY = paymentY + 16 + boxH + 50;
    doc.fontSize(9).fillColor(black).font('Helvetica-Bold')
      .text('Customs Duty/Tax Payable By Recipient.', margin, customsY, {
        width: contentWidth,
        align: 'center',
      });

    doc.fontSize(8).fillColor(gray).font('Helvetica')
      .text(
        `Issued: ${new Date(shipment.registeredAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}`,
        margin,
        customsY + 26
      );

    doc.end();
  });
};