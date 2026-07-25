import bcrypt from "bcryptjs";
import User from "../models/Users";
import CompanySettings from "../models/CompanySettings";
import type { ICompanySettings, IUser } from "../types";

export interface ProfileUpdateInput {
    username?: string;
    email?: string;
    avatarUrl?: string;
}

export interface PasswordUpdateInput {
    currentPassword: string;
    newPassword: string;
}

export interface CompanySettingsInput {
    companyName?: string;
    supportEmail?: string;
    supportPhone?: string;
    websiteUrl?: string;
    address?: string;
    logoUrl?: string;
}

const sanitizeUser = (user: any): Partial<IUser> => ({
    _id: user._id,
    username: user.username,
    email: user.email,
    avatarUrl: user.avatarUrl,
});

const normalizeEmail = (email: string) => email.trim().toLowerCase();
const normalizeUsername = (username: string) => username.trim().toLowerCase();

const assertValidUrl = (value: string) => {
    try {
        new URL(value);
    } catch {
        throw new Error("Website URL must be a valid URL");
    }
};

const getCompanySettingsDocument = async () => {
    let settings = await CompanySettings.findOne();

    if (!settings) {
        settings = await CompanySettings.create({});
    }

    return settings;
};

export const getProfileSettings = async (userId: string) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    return sanitizeUser(user);
};

export const updateProfileSettings = async (
    userId: string,
    data: ProfileUpdateInput
) => {
    const updateOps: Record<string, string> = {};

    if (data.username !== undefined) {
        const username = normalizeUsername(data.username);
        if (!username) throw new Error("Name is required");

        const existingUsername = await User.findOne({
            username,
            _id: { $ne: userId },
        });

        if (existingUsername) {
            throw new Error("Username is already in use");
        }

        updateOps.username = username;
    }

    if (data.email !== undefined) {
        const email = normalizeEmail(data.email);
        if (!email) throw new Error("Email is required");

        const existingEmail = await User.findOne({
            email,
            _id: { $ne: userId },
        });

        if (existingEmail) {
            throw new Error("Email is already in use");
        }

        updateOps.email = email;
    }

    if (data.avatarUrl !== undefined) {
        updateOps.avatarUrl = data.avatarUrl;
    }

    if (Object.keys(updateOps).length === 0) {
        throw new Error("No profile updates provided");
    }

    const user = await User.findByIdAndUpdate(
        userId,
        { $set: updateOps },
        { new: true, runValidators: true }
    );

    if (!user) {
        throw new Error("User not found");
    }

    return sanitizeUser(user);
};

export const updatePasswordSettings = async (
    userId: string,
    data: PasswordUpdateInput
) => {
    if (!data.currentPassword || !data.newPassword) {
        throw new Error("Current password and new password are required");
    }

    if (data.newPassword.length < 6) {
        throw new Error("New password must be at least 6 characters");
    }

    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    const isCurrentPasswordValid = await bcrypt.compare(data.currentPassword, user.password);

    if (!isCurrentPasswordValid) {
        throw new Error("Current password is incorrect");
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(data.newPassword, salt);
    await user.save();

    return { message: "Password updated successfully" };
};

export const getCompanySettings = async (): Promise<ICompanySettings> => {
    return getCompanySettingsDocument();
};

export const updateCompanySettings = async (data: CompanySettingsInput) => {
    const updateOps: Record<string, string> = {};

    if (data.companyName !== undefined) {
        const companyName = data.companyName.trim();
        if (!companyName) throw new Error("Company name is required");
        updateOps.companyName = companyName;
    }

    if (data.supportEmail !== undefined) {
        const supportEmail = normalizeEmail(data.supportEmail);
        if (!supportEmail) throw new Error("Support email is required");
        updateOps.supportEmail = supportEmail;
    }

    if (data.supportPhone !== undefined) {
        updateOps.supportPhone = data.supportPhone.trim();
    }

    if (data.websiteUrl !== undefined) {
        const websiteUrl = data.websiteUrl.trim();
        if (!websiteUrl) throw new Error("Website URL is required");
        assertValidUrl(websiteUrl);
        updateOps.websiteUrl = websiteUrl;
    }

    if (data.address !== undefined) {
        updateOps.address = data.address.trim();
    }

    if (data.logoUrl !== undefined) {
        updateOps.logoUrl = data.logoUrl;
    }

    if (Object.keys(updateOps).length === 0) {
        throw new Error("No company settings updates provided");
    }

    const settings = await getCompanySettingsDocument();
    settings.set(updateOps);
    await settings.save();

    return settings;
};
