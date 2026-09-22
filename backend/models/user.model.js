import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minLength: [3, "Name must be at least 3 characters"],
            maxLength: [30, "Name cannot exceed 30 characters"]
        },

        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            minLength: [6, "Email must be at least 6 characters"],
            maxLength: [50, "Email cannot exceed 50 characters"]
        },

        password: {
            type: String,
            select: false
        },

        isVerified: {
            type: Boolean,
            default: false
        },

        // Used to identify the public CodeForge demo account
        isDemo: {
            type: Boolean,
            default: false
        },

        avatar: {
            type: String,
            default: ""
        },

        emailChangeOTP: {
            type: String
        },

        emailChangeOTPExpiry: {
            type: Date
        },

        pendingEmail: {
            type: String
        },

        resetPasswordOTP: {
            type: String
        },

        resetPasswordOTPExpiry: {
            type: Date
        },

        googleId: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true
    }
);


// Hash password
userSchema.statics.hashPassword = async function (password) {
    return await bcrypt.hash(password, 10);
};


// Check password
userSchema.methods.isValidPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};


// Generate JWT
userSchema.methods.generateJWT = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            name: this.name,
            isDemo: this.isDemo
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "24h"
        }
    );
};


const User = mongoose.model("user", userSchema);

export default User;