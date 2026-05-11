const User = require('../models/User')
const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator')

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