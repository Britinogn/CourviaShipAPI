import { Request, Response } from "express";
import type { IUser } from "../types";
import {
    getCompanySettings,
    getProfileSettings,
    updateCompanySettings,
    updatePasswordSettings,
    updateProfileSettings,
} from "../services/settingsService";
import { getPublicUploadUrl } from "../middleware/uploadMiddleware";

interface AuthRequest extends Request {
    user?: IUser;
    file?: Express.Multer.File;
}

const getAuthenticatedUserId = (req: AuthRequest): string => {
    const userId = req.user?._id?.toString();

    if (!userId) {
        throw new Error("Authenticated user is required");
    }

    return userId;
};

const sendError = (res: Response, error: any, fallbackMessage: string) => {
    const message = error.message || fallbackMessage;
    const status = message.includes("not found") ? 404 : 400;

    res.status(status).json({
        status: false,
        message,
    });
};

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = getAuthenticatedUserId(req);
        const profile = await getProfileSettings(userId);

        res.status(200).json({
            status: true,
            message: "Profile retrieved successfully",
            data: { profile },
        });
    } catch (error: any) {
        sendError(res, error, "Failed to retrieve profile");
    }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = getAuthenticatedUserId(req);
        const profile = await updateProfileSettings(userId, req.body);

        res.status(200).json({
            status: true,
            message: "Profile updated successfully",
            data: { profile },
        });
    } catch (error: any) {
        sendError(res, error, "Failed to update profile");
    }
};

export const updatePassword = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = getAuthenticatedUserId(req);
        const result = await updatePasswordSettings(userId, req.body);

        res.status(200).json({
            status: true,
            message: result.message,
        });
    } catch (error: any) {
        sendError(res, error, "Failed to update password");
    }
};

export const uploadProfileAvatar = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = getAuthenticatedUserId(req);

        if (!req.file) {
            res.status(400).json({
                status: false,
                message: "Avatar image is required",
            });
            return;
        }

        const avatarUrl = getPublicUploadUrl(req.file);
        const profile = await updateProfileSettings(userId, { avatarUrl });

        res.status(200).json({
            status: true,
            message: "Avatar uploaded successfully",
            data: { profile },
        });
    } catch (error: any) {
        sendError(res, error, "Failed to upload avatar");
    }
};

export const getCompany = async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
        const company = await getCompanySettings();

        res.status(200).json({
            status: true,
            message: "Company settings retrieved successfully",
            data: { company },
        });
    } catch (error: any) {
        sendError(res, error, "Failed to retrieve company settings");
    }
};

export const updateCompany = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const company = await updateCompanySettings(req.body);

        res.status(200).json({
            status: true,
            message: "Company settings updated successfully",
            data: { company },
        });
    } catch (error: any) {
        sendError(res, error, "Failed to update company settings");
    }
};

export const uploadCompanyLogo = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({
                status: false,
                message: "Logo image is required",
            });
            return;
        }

        const logoUrl = getPublicUploadUrl(req.file);
        const company = await updateCompanySettings({ logoUrl });

        res.status(200).json({
            status: true,
            message: "Company logo uploaded successfully",
            data: { company },
        });
    } catch (error: any) {
        sendError(res, error, "Failed to upload company logo");
    }
};

export const getPublicCompany = async (_req: Request, res: Response): Promise<void> => {
    try {
        const company = await getCompanySettings();

        res.status(200).json({
            status: true,
            message: "Company info retrieved successfully",
            data: {
                companyName: company.companyName,
                websiteUrl: company.websiteUrl,
                logoUrl: company.logoUrl,
                supportEmail: company.supportEmail,
            },
        });
    } catch (error: any) {
        sendError(res, error, "Failed to retrieve company info");
    }
};

export default {
    getProfile,
    updateProfile,
    updatePassword,
    uploadProfileAvatar,
    getCompany,
    updateCompany,
    uploadCompanyLogo,
    getPublicCompany
};
