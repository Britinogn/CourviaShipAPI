import mongoose, { Schema, Model } from "mongoose";
import type { ICompanySettings } from "../types";

const companySettingsSchema = new Schema<ICompanySettings>({
    companyName: {
        type: String,
        required: true,
        trim: true,
        default: "Courvia Ship",
    },
    supportEmail: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        default: "support@courviaship.com",
    },
    supportPhone: {
        type: String,
        trim: true,
        default: "",
    },
    websiteUrl: {
        type: String,
        required: true,
        trim: true,
        default: "https://courviaship.onrender.com",
    },
    address: {
        type: String,
        trim: true,
        default: "",
    },
    logoUrl: {
        type: String,
        trim: true,
    },
}, { timestamps: true });

const CompanySettings: Model<ICompanySettings> = mongoose.model<ICompanySettings>(
    "CompanySettings",
    companySettingsSchema
);

export default CompanySettings;
