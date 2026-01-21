import {Request, Response, NextFunction} from 'express';
import jwt, {TokenExpiredError, JwtPayload, verify} from 'jsonwebtoken';
import type {IUser} from '../types';
import User from '../models/Users';

interface AuthRequest extends Request {
    user?: IUser;
}

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized. No token provided.' });
        }

        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized. User not found.' });
        }
        req.user = user;
        next();
    } catch (error) {
        if(error instanceof TokenExpiredError) {
            return res.status(401).json({ message: 'Unauthorized. Token expired.' });
        }
        return res.status(401).json({ message: 'Unauthorized. Invalid token.' });
    }
}