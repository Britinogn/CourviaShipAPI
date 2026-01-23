// utils/emailConfig.ts
import nodemailer from 'nodemailer';

// Email configuration from environment variables
const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || '587');
const EMAIL_USER = process.env.EMAIL_USER || '';
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD || ''; 
const EMAIL_FROM = process.env.EMAIL_FROM || 'Courvia Shipping <noreply@courvia.com>';

// Create reusable transporter
export const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: EMAIL_PORT === 465, // true for 465, false for other ports
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD,
    },
});

// Verify connection configuration
export const verifyEmailConnection = async () => {
    try {
        await transporter.verify();
        console.log('✅ Email server is ready to send messages');
        return true;
    } catch (error) {
        console.error('❌ Email server connection failed:', error);
        return false;
    }
};

// Default email options
export const defaultEmailOptions = {
    from: EMAIL_FROM,
};

export default transporter;