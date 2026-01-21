import express from 'express';
const router = express.Router();

import authController from '../controller/authController';
import { authMiddleware } from "../middleware/authMiddleware";


//private routes
router.post('/register', authController.register);
router.post('/login', authController.login);
// router.post('/refresh', authController.refresh);
// router.post('/logout', authController.logout);

export default router;
