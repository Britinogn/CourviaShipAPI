// utils/emailConfig.ts
import nodemailer from 'nodemailer';

// Email configuration from environment variables
const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || '465');
const EMAIL_USER = process.env.EMAIL_USER || '';
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD || ''; 
const EMAIL_FROM = process.env.EMAIL_FROM || 'Courvia Shipping <noreply@courvia.com>';
const EMAIL_SECURE = process.env.EMAIL_SECURE || 'true';

// Create reusable transporter
export const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD,
    },

    connectionTimeout: 10000, // fail fast instead of hanging
    greetingTimeout: 10000,
    socketTimeout: 10000,
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