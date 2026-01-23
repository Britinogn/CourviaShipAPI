import { transporter, defaultEmailOptions } from './emailConfig';
import fs from 'fs/promises';
import path from 'path';

// Interfaces
export interface RegistrationEmailData {
    to: string;
    trackingCode: string;
    senderName: string;
    receiverName: string;
    receiverEmail: string;
    receiverPhone: string;
    receiverAddress: string;
    receiverCity: string;
    receiverCountry: string;
    estimatedDelivery: string | undefined;
    packageDescription: string;
    packageWeight: string;
    packageQuantity: number;
}

export interface UpdateEmailData {
    to: string;
    trackingCode: string;
    receiverName: string;
    receiverCity: string;
    receiverCountry: string;
    oldStatus?: string;
    newStatus: string;
    estimatedDelivery?: string;
    updateMessage?: string;
}

// Helper: Load HTML template
const loadTemplate = async (templateName: string): Promise<string> => {
    try {
        const templatePath = path.join(__dirname, 'emailTemplates', `${templateName}.html`);
        const template = await fs.readFile(templatePath, 'utf-8');
        return template;
    } catch (error) {
        console.error(`Failed to load email template: ${templateName}`, error);
        throw new Error(`Email template not found: ${templateName}`);
    }
};

// Helper: Replace placeholders in template
const replacePlaceholders = (template: string, data: Record<string, any>): string => {
    let result = template;
    Object.keys(data).forEach(key => {
        const placeholder = new RegExp(`{{${key}}}`, 'g');
        result = result.replace(placeholder, data[key] || '');
    });
    return result;
};

// Send Registration Email
export const sendRegistrationEmail = async (data: RegistrationEmailData): Promise<boolean> => {
    try {
        // Load template
        let htmlTemplate = await loadTemplate('registration');

        // Prepare template data
        const templateData = {
            receiverName: data.receiverName,
            trackingCode: data.trackingCode,
            senderName: data.senderName,
            receiverAddress: data.receiverAddress,
            receiverCity: data.receiverCity,
            receiverCountry: data.receiverCountry,
            receiverPhone: data.receiverPhone,
            packageDescription: data.packageDescription,
            packageWeight: data.packageWeight,
            packageQuantity: data.packageQuantity.toString(),
            estimatedDelivery: data.estimatedDelivery,
            currentYear: new Date().getFullYear().toString(),
        };

        // Replace placeholders
        const htmlContent = replacePlaceholders(htmlTemplate, templateData);

        // Send email
        const mailOptions = {
            ...defaultEmailOptions,
            to: data.to,
            subject: `Package Registered - Tracking ID: ${data.trackingCode}`,
            html: htmlContent,
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Registration email sent to ${data.to}`);
        return true;

    } catch (error: any) {
        console.error('❌ Failed to send registration email:', error.message);
        return false;
    }
};

// Send Update Email
export const sendUpdateEmail = async (data: UpdateEmailData): Promise<boolean> => {
    try {
        // Load template
        let htmlTemplate = await loadTemplate('update');

        // Prepare template data
        const templateData = {
            receiverName: data.receiverName,
            trackingCode: data.trackingCode,
            receiverCity: data.receiverCity,
            receiverCountry: data.receiverCountry,
            oldStatus: data.oldStatus || 'N/A',
            newStatus: data.newStatus,
            estimatedDelivery: data.estimatedDelivery || 'Not updated',
            updateMessage: data.updateMessage || 'Your package status has been updated.',
            currentYear: new Date().getFullYear().toString(),
        };

        // Replace placeholders
        const htmlContent = replacePlaceholders(htmlTemplate, templateData);

        // Send email
        const mailOptions = {
            ...defaultEmailOptions,
            to: data.to,
            subject: `Package Update - Tracking ID: ${data.trackingCode}`,
            html: htmlContent,
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Update email sent to ${data.to}`);
        return true;

    } catch (error: any) {
        console.error('❌ Failed to send update email:', error.message);
        return false;
    }
};

export default {
    sendRegistrationEmail,
    sendUpdateEmail,
};