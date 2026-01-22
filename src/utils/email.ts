// export const sendTrackingEmail = async (to: string, trackingCode: string) => {
//   // your email sending logic
// }

// export const sendShipmentCreatedEmail = async (to: string, shipmentDetails: any) => {
//   // your email sending logic
// }


import nodemailer from 'nodemailer';

// After const receiptBuffer = await generateReceiptPDF(plainShipment);

const transporter = nodemailer.createTransport({
  service: 'gmail', // or sendgrid, mailgun, etc.
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// await transporter.sendMail({
//   from: '"CourviaShip" <no-reply@courviaship.com>',
//   to: [shipment.sender.email, shipment.receiver.email].filter(Boolean).join(', '),
//   subject: `Your Shipment Receipt - ${shipment.trackingId}`,
//   text: `Thank you for shipping with us!\nTracking: ${shipment.trackingId}\nEstimated delivery: ${shipment.estimatedDelivery.toDateString()}`,
//   attachments: [
//     {
//       filename: `receipt-${shipment.trackingId}.pdf`,
//       content: receiptBuffer,
//       contentType: 'application/pdf',
//     },
//   ],
// });