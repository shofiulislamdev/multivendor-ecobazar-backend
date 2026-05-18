const { z } = require('zod')

// ekhane amra validation korbo zod diye
//Registration Schema
const registrationSchema = z.object({
    name: z.string()
        .min(2, { message: 'Name must be at least 2 characters' })
        .max(50, { message: 'Name too long' })
        .trim(),

    email: z.string()
        .email({ message: "Invalid email" })
        .toLowerCase()
        .trim(),

    password: z.string()
        .min(8, { message: 'Password must be at least 8 characters' })
        .regex(/[a-z]/, { message: 'Must contain at least one lowercase letter' })
        .regex(/[A-Z]/, { message: 'Must contain at least one uppercase letter' })
        .regex(/[0-9]/, { message: 'Must contain at least one number' })
        .regex(/[^a-zA-Z0-9]/, { message: 'Must contain at least one special character' }),

    phone: z.string()
        .regex(/^\+?8801[3-9]\d{8}$/, { message: 'Invalid Bangladeshi Phone number' })
        .optional(),

    role: z.enum(['customer', 'vendor'], { message: 'Invalid role' })
        .optional()
        .default('customer')
})

const loginSchema = z.object({
    email: z.string()
        .email({ message: "Invalid email" })
        .toLowerCase()
        .trim(),

    password: z.string()
        .min(8, { message: 'Password must be at least 8 characters' })
        .regex(/[a-z]/, { message: 'Must contain at least one lowercase letter' })
        .regex(/[A-Z]/, { message: 'Must contain at least one uppercase letter' })
        .regex(/[0-9]/, { message: 'Must contain at least one number' })
        .regex(/[^a-zA-Z0-9]/, { message: 'Must contain at least one special character' }),
})

module.exports = {
    registrationSchema,
    loginSchema
}