import express from "express";
import settingsController from "../controller/settingsController";
import { authMiddleware } from "../middleware/authMiddleware";
import {
    handleUploadError,
    uploadAvatar,
    uploadCompanyLogo,
} from "../middleware/uploadMiddleware";

const router = express.Router();

router.get("/profile", authMiddleware, settingsController.getProfile);
router.patch("/profile", authMiddleware, settingsController.updateProfile);
router.patch("/password", authMiddleware, settingsController.updatePassword);
router.patch(
    "/profile/avatar",
    authMiddleware,
    uploadAvatar.single("avatar"),
    handleUploadError,
    settingsController.uploadProfileAvatar
);

router.get("/company", authMiddleware, settingsController.getCompany);
router.patch("/company", authMiddleware, settingsController.updateCompany);
router.patch(
    "/company/logo",
    authMiddleware,
    uploadCompanyLogo.single("logo"),
    handleUploadError,
    settingsController.uploadCompanyLogo
);

export default router;
