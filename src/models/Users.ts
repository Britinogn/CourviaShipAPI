import mongoose,{Schema, Model} from "mongoose";
import type {IUser} from '../types';

const userSchema: Schema<IUser> = new Schema<IUser>({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
        // select: false,
        minlength: 6,
    },
    avatarUrl: {
        type: String,
        trim: true,
    }
} , { timestamps: true });

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default User;
