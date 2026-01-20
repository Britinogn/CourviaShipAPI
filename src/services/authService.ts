import User from "../models/Users"
import jwt, { SignOptions } from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { IUser } from "../types"

const JWT_SECRET = process.env.JWT_SECRET!
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "2h"
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d"

const generateToken = (userId: string): string => {
    const options: SignOptions = { expiresIn: JWT_EXPIRES_IN as any }
    return jwt.sign({ userId }, JWT_SECRET, options)
}

const generateRefreshToken = (userId: string): string => {
    const options: SignOptions = { expiresIn: JWT_REFRESH_EXPIRES_IN as any }
    return jwt.sign({ userId }, JWT_SECRET, options)
}

export const registerUser = async (
    username: string,
    email: string,
    password: string
) => {
    if (!username || !email || !password) {
        throw new Error("All fields are required")
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
        throw new Error("User already exists")
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const newUser: Partial<IUser> = {
        username,
        email,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
    }

    const user = await User.create(newUser)

    return {
        token: generateToken(user._id.toString()),
        user
    }
}

export const loginUser = async (
    email: string,
    password: string
) => {
    if (!email || !password) {
        throw new Error("Email and password are required")
    }

    const user = await User.findOne({ email })
    if (!user) {
        throw new Error("User not found")
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
        throw new Error("Invalid password")
    }

    return {
        token: generateToken(user._id.toString()),
        refreshToken: generateRefreshToken(user._id.toString()),
        user
    }
}
