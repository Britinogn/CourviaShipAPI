import { Request, Response } from "express"
import { registerUser, loginUser } from "../services/authService"
import { IUser } from "../types"

export interface IAuthResponse {
    status: boolean
    message: string
    data?: {
        token?: string
        refreshToken?: string
        user?: Partial<IUser>
    }
}

export interface IErrorResponse {
    status: boolean
    message: string
}

export const register = async (
    req: Request<{}, IAuthResponse | IErrorResponse, {
        username: string
        email: string
        password: string
    }>,
    res: Response<IAuthResponse | IErrorResponse>
): Promise<void> => {
    try {
        const { username, email, password } = req.body

        const result = await registerUser(username, email, password)

        res.status(201).json({
            status: true,
            message: "User registered successfully",
            data: result
        })
    } catch (error: any) {
        res.status(400).json({
            status: false,
            message: error.message
        })
    }
}

export const login = async (
    req: Request<{}, IAuthResponse | IErrorResponse, {
        email: string
        password: string
    }>,
    res: Response<IAuthResponse | IErrorResponse>
): Promise<void> => {
    try {
        const { email, password } = req.body

        const result = await loginUser(email, password)

        res.status(200).json({
            status: true,
            message: "Login successful",
            data: result
        })
    } catch (error: any) {
        res.status(401).json({
            status: false,
            message: error.message
        })
    }
}

export default {
    register,
    login
}
