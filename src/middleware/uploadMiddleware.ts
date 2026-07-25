import fs from "fs";
import path from "path";
import multer from "multer";
import type { NextFunction, Request, Response } from "express";

const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;
const allowedMimeTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
]);

const uploadsRoot = path.join(process.cwd(), "uploads");

const ensureDirectoryExists = (directory: string) => {
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }
};

const buildStorage = (folderName: "avatars" | "company") => multer.diskStorage({
    destination: (_req, _file, cb) => {
        const uploadDirectory = path.join(uploadsRoot, folderName);
        ensureDirectoryExists(uploadDirectory);
        cb(null, uploadDirectory);
    },
    filename: (_req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase();
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
        cb(null, uniqueName);
    },
});

const imageFileFilter = (
    _req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
        cb(new Error("Only JPG, PNG, and WEBP images are allowed"));
        return;
    }

    cb(null, true);
};

export const uploadAvatar = multer({
    storage: buildStorage("avatars"),
    fileFilter: imageFileFilter,
    limits: { fileSize: MAX_IMAGE_SIZE_BYTES },
});

export const uploadCompanyLogo = multer({
    storage: buildStorage("company"),
    fileFilter: imageFileFilter,
    limits: { fileSize: MAX_IMAGE_SIZE_BYTES },
});

export const getPublicUploadUrl = (file: Express.Multer.File): string => {
    const relativePath = path.relative(uploadsRoot, file.path).replace(/\\/g, "/");
    return `/uploads/${relativePath}`;
};

export const handleUploadError = (
    error: Error,
    _req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!error) {
        next();
        return;
    }

    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
        res.status(400).json({
            status: false,
            message: "Image must be 2MB or smaller",
        });
        return;
    }

    res.status(400).json({
        status: false,
        message: error.message || "Failed to upload image",
    });
};
