import userModel from '../models/user.model.js'
import { validationResult } from 'express-validator'
import bcrypt from 'bcrypt'
import { sendOTP } from '../services/email.service.js'
import { generateOTP, storeOTP, verifyOTP } from '../services/otp.service.js'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)


// ==================== CREATE USER ====================

export const createUserController = async (req, res) => {
    try {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: errors.array()
            })
        }

        const { name, email, password } = req.body

        const existingUser = await userModel.findOne({ email })

        if (existingUser && existingUser.isVerified) {
            return res.status(409).json({
                message: 'User already exists'
            })
        }

        const hashedPassword = await userModel.hashPassword(password)

        let user

        if (existingUser) {
            existingUser.name = name
            existingUser.password = hashedPassword
            existingUser.isVerified = false
            existingUser.isDemo = false
            user = await existingUser.save()
        } else {
            user = await userModel.create({
                name,
                email,
                password: hashedPassword,
                isVerified: false,
                isDemo: false
            })
        }

        const otp = generateOTP()

        await storeOTP(`signup:${email}`, otp)

        await sendOTP(email, otp)

        return res.status(200).json({
            message: 'OTP sent successfully',
            email
        })

    } catch (error) {
        console.error('Create user error:', error)

        return res.status(500).json({
            message: error.message || 'Registration failed'
        })
    }
}


// ==================== VERIFY SIGNUP OTP ====================

export const verifySignupOTPController = async (req, res) => {
    try {
        const { email, otp } = req.body

        const result = await verifyOTP(`signup:${email}`, otp)

        if (!result.valid) {
            return res.status(400).json({
                message: result.message
            })
        }

        const user = await userModel.findOne({ email })

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            })
        }

        user.isVerified = true
        user.isDemo = false

        await user.save()

        const token = user.generateJWT()

        return res.status(200).json({
            message: 'Account verified successfully',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                isVerified: user.isVerified,
                isDemo: false
            },
            token
        })

    } catch (error) {
        console.error('Verify signup OTP error:', error)

        return res.status(500).json({
            message: 'OTP verification failed'
        })
    }
}


// ==================== LOGIN ====================

export const loginController = async (req, res) => {
    try {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: errors.array()
            })
        }

        const { email, password } = req.body

        const user = await userModel.findOne({ email })

        if (!user) {
            return res.status(401).json({
                message: 'Invalid email or password'
            })
        }

        if (!user.isVerified) {
            return res.status(403).json({
                message: 'Please verify your account first'
            })
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        )

        if (!isPasswordValid) {
            return res.status(401).json({
                message: 'Invalid email or password'
            })
        }

        const otp = generateOTP()

        await storeOTP(`login:${email}`, otp)

        await sendOTP(email, otp)

        return res.status(200).json({
            message: 'OTP sent successfully',
            email
        })

    } catch (error) {
        console.error('Login error:', error)

        return res.status(500).json({
            message: error.message || 'Login failed'
        })
    }
}


// ==================== VERIFY LOGIN OTP ====================

export const verifyLoginOTPController = async (req, res) => {
    try {
        const { email, otp } = req.body

        const result = await verifyOTP(`login:${email}`, otp)

        if (!result.valid) {
            return res.status(400).json({
                message: result.message
            })
        }

        const user = await userModel.findOne({ email })

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            })
        }

        const token = user.generateJWT()

        return res.status(200).json({
            message: 'Login successful',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                isVerified: user.isVerified,
                isDemo: user.isDemo
            },
            token
        })

    } catch (error) {
        console.error('Verify login OTP error:', error)

        return res.status(500).json({
            message: 'OTP verification failed'
        })
    }
}


// ==================== DEMO LOGIN ====================

export const demoLoginController = async (req, res) => {
    try {
        const DEMO_EMAIL = 'demo@codeforge.ai'
        const DEMO_NAME = 'CodeForge Demo User'

        let user = await userModel.findOne({
            email: DEMO_EMAIL
        })

        if (!user) {
            const demoPassword = await userModel.hashPassword(
                'CodeForgeDemo@123'
            )

            user = await userModel.create({
                name: DEMO_NAME,
                email: DEMO_EMAIL,
                password: demoPassword,
                isVerified: true,
                isDemo: true
            })
        } else {
            user.isDemo = true
            user.isVerified = true

            await user.save()
        }

        const token = user.generateJWT()

        const safeUser = {
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            isVerified: user.isVerified,
            isDemo: true
        }

        return res.status(200).json({
            message: 'Demo login successful',
            user: safeUser,
            token,
            isDemo: true
        })

    } catch (error) {
        console.error('Demo login error:', error)

        return res.status(500).json({
            message: 'Demo login failed'
        })
    }
}


// ==================== GET PROFILE ====================

export const getProfileController = async (req, res) => {
    try {
        const user = await userModel
            .findById(req.user._id)
            .select('-password')

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            })
        }

        return res.status(200).json({
            user
        })

    } catch (error) {
        console.error('Get profile error:', error)

        return res.status(500).json({
            message: 'Failed to get profile'
        })
    }
}


// ==================== UPDATE PROFILE ====================

export const updateProfileController = async (req, res) => {
    try {
        if (req.user?.isDemo) {
            return res.status(403).json({
                message: 'Demo account is read-only'
            })
        }

        const { name } = req.body

        const user = await userModel.findById(req.user._id)

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            })
        }

        if (name) {
            user.name = name
        }

        await user.save()

        return res.status(200).json({
            message: 'Profile updated successfully',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                isVerified: user.isVerified,
                isDemo: user.isDemo
            }
        })

    } catch (error) {
        console.error('Update profile error:', error)

        return res.status(500).json({
            message: 'Failed to update profile'
        })
    }
}


// ==================== UPDATE AVATAR ====================

export const updateAvatarController = async (req, res) => {
    try {
        if (req.user?.isDemo) {
            return res.status(403).json({
                message: 'Demo account is read-only'
            })
        }

        const user = await userModel.findById(req.user._id)

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            })
        }

        if (!req.file) {
            return res.status(400).json({
                message: 'Avatar file is required'
            })
        }

        user.avatar = req.file.path

        await user.save()

        return res.status(200).json({
            message: 'Avatar updated successfully',
            avatar: user.avatar
        })

    } catch (error) {
        console.error('Update avatar error:', error)

        return res.status(500).json({
            message: 'Failed to update avatar'
        })
    }
}


// ==================== UPDATE PASSWORD ====================

export const updatePasswordController = async (req, res) => {
    try {
        if (req.user?.isDemo) {
            return res.status(403).json({
                message: 'Demo account is read-only'
            })
        }

        const { oldPassword, newPassword } = req.body

        const user = await userModel.findById(req.user._id)

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            })
        }

        const isValid = await bcrypt.compare(
            oldPassword,
            user.password
        )

        if (!isValid) {
            return res.status(400).json({
                message: 'Current password is incorrect'
            })
        }

        user.password = await userModel.hashPassword(newPassword)

        await user.save()

        return res.status(200).json({
            message: 'Password updated successfully'
        })

    } catch (error) {
        console.error('Update password error:', error)

        return res.status(500).json({
            message: 'Failed to update password'
        })
    }
}


// ==================== CHANGE EMAIL ====================

export const changeEmailController = async (req, res) => {
    try {
        if (req.user?.isDemo) {
            return res.status(403).json({
                message: 'Demo account is read-only'
            })
        }

        const { newEmail } = req.body

        const existingUser = await userModel.findOne({
            email: newEmail
        })

        if (existingUser) {
            return res.status(409).json({
                message: 'Email already in use'
            })
        }

        const user = await userModel.findById(req.user._id)

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            })
        }

        const otp = generateOTP()

        await storeOTP(
            `email-change:${req.user._id}:${newEmail}`,
            otp
        )

        await resend.emails.send({
            from: 'CodeForge AI <onboarding@resend.dev>',
            to: newEmail,
            subject: 'CodeForge AI - Email Change OTP',
            html: `
                <h2>CodeForge AI</h2>
                <p>Your OTP for changing your email address is:</p>
                <h1>${otp}</h1>
                <p>This OTP expires in 5 minutes.</p>
            `
        })

        return res.status(200).json({
            message: 'OTP sent successfully'
        })

    } catch (error) {
        console.error('Change email error:', error)

        return res.status(500).json({
            message: 'Failed to change email'
        })
    }
}


// ==================== FORGOT PASSWORD ====================

export const forgotPasswordController = async (req, res) => {
    try {
        const { email } = req.body

        const user = await userModel.findOne({ email })

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            })
        }

        if (user.isDemo) {
            return res.status(403).json({
                message: 'Demo account is read-only'
            })
        }

        const otp = generateOTP()

        await storeOTP(`reset:${email}`, otp)

        await resend.emails.send({
            from: 'CodeForge AI <onboarding@resend.dev>',
            to: email,
            subject: 'CodeForge AI - Password Reset OTP',
            html: `
                <h2>CodeForge AI</h2>
                <p>Your password reset OTP is:</p>
                <h1>${otp}</h1>
                <p>This OTP expires in 5 minutes.</p>
            `
        })

        return res.status(200).json({
            message: 'OTP sent successfully'
        })

    } catch (error) {
        console.error('Forgot password error:', error)

        return res.status(500).json({
            message: 'Failed to process password reset'
        })
    }
}


// ==================== RESET PASSWORD ====================

export const resetPasswordController = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body

        const result = await verifyOTP(`reset:${email}`, otp)

        if (!result.valid) {
            return res.status(400).json({
                message: result.message
            })
        }

        const user = await userModel.findOne({ email })

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            })
        }

        if (user.isDemo) {
            return res.status(403).json({
                message: 'Demo account is read-only'
            })
        }

        user.password = await userModel.hashPassword(newPassword)

        await user.save()

        return res.status(200).json({
            message: 'Password reset successfully'
        })

    } catch (error) {
        console.error('Reset password error:', error)

        return res.status(500).json({
            message: 'Failed to reset password'
        })
    }
}


// ==================== GET ALL USERS ====================

export const getAllUsersController = async (req, res) => {
    try {
        if (req.user?.isDemo) {
            return res.status(403).json({
                message: 'Demo account cannot access other users'
            })
        }

        const users = await userModel
            .find({
                isVerified: true,
                isDemo: false
            })
            .select('-password')

        return res.status(200).json({
            users
        })

    } catch (error) {
        console.error('Get all users error:', error)

        return res.status(500).json({
            message: 'Failed to get users'
        })
    }
}


// ==================== SEARCH USER ====================

export const searchUserController = async (req, res) => {
    try {
        if (req.user?.isDemo) {
            return res.status(403).json({
                message: 'Demo account cannot search users'
            })
        }

        const { query } = req.query

        if (!query) {
            return res.status(400).json({
                message: 'Search query is required'
            })
        }

        const users = await userModel
            .find({
                $or: [
                    {
                        name: {
                            $regex: query,
                            $options: 'i'
                        }
                    },
                    {
                        email: {
                            $regex: query,
                            $options: 'i'
                        }
                    }
                ],
                isVerified: true,
                isDemo: false
            })
            .select('-password')

        return res.status(200).json({
            users
        })

    } catch (error) {
        console.error('Search users error:', error)

        return res.status(500).json({
            message: 'Failed to search users'
        })
    }
}


// ==================== LOGOUT ====================

export const logoutController = async (req, res) => {
    try {
        return res.status(200).json({
            message: 'Logged out successfully'
        })

    } catch (error) {
        console.error('Logout error:', error)

        return res.status(500).json({
            message: 'Logout failed'
        })
    }
}