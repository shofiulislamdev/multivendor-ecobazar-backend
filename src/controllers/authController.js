const User = require('../models/User')
const VerificationToken = require('../models/verificationToken')
const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator')
const nodemailer = require('nodemailer')
const { v4: uuidv4 } = require('uuid')

exports.register = async (req, res) => {
    try {
        const { name, email, password, phone, role } = req.body

        // Simple Validation
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, Email and Password are required'
            })
        }

        //Check if user already exixts
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Email already registered'
            })
        }

        //create user 
        const user = new User({
            name: name,
            email: email,
            password: password,
            phone: phone || undefined,
            role: role || 'customer'
        })

        // save user 
        await user.save()

        // Create verification token 
        const token = uuidv4()
        await new VerificationToken({ userId: user._id, token }).save()

        // Send Email
        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,

            }
        })

        // ========= Url generate korechi niche code e 
        const verificationUrl = `${process.env.APP_URL}/api/v1/auth/verify-email?token=${token}&email=${user.email}`

        const mailOption = {
            from: `"Multivendor Shop", <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: 'Verify Your Email - Multivendor Ecommerce',
            html: `
                <h2>Welcome to our platform</h2>
                <p>Hi ${user.name}</p>
                <p>Thank you for registration. Please verify your email by clicking the link below</p>
                <a href=${verificationUrl}>Verify Email</a>
                <p>This link will be expire in 24 hours</p>
                <p>Best regards, <br> Team Multivendor</p> 
            `
        }

        try {
            await transporter.sendMail(mailOption)
            console.log('Email send')
        } catch (error) {
            console.error('Email send error: ', error)
        }

        res.status(201).json({
            success: true,
            message: 'Registration successful! Please Login',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        })


    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        })
    }
}


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and Password required' })
        }

        // Find user and select password
        const user = await User.findOne({ email }).select('+password')
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' })
        }

        const isMatch = await user.comparePassword(password)
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' })
        }

        // Generate tokens
        const accessToken = jwt.sign(
            { id: user._id, role: user.role, email: user.email },
            process.env.JWT_ACCESS_SECRET,
            { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
        )

        const refreshToken = jwt.sign(
            { id: user._id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
        )

        // Save refresh token to user 
        user.refreshTokens.push({
            token: refreshToken,
            createdAt: new Date(),
            // expiresAt: new Date(Date.now() + 7*24*60*60*1000)
        })

        await user.save()

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            samSite: 'strict',
            maxAge: 7*24*60*60*1000,
            path: '/'
        })

        res.status(200).json({
            success: true,
            message: 'Login successful',
            accesstoken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isEmailVerified: user.isEmailVerified
            }

        })


    } catch (error) {
        console.log('Login Error: ', error)
        res.status(500).json({success: false, message: 'Server Error'})
    }
}