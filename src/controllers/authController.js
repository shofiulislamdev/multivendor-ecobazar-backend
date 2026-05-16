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