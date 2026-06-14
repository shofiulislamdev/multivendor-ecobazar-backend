const express = require('express')
const router = express.Router()
const { register, login, refreshToken } = require('../controllers/authController')
const { verifyEmail } = require('../controllers/verifyEmail')
const validate = require('../middlewares/validate')
const { registrationSchema, loginSchema } = require('../validations/auth.validation')
// const { protect, restrictTo } = require('../middlewares/auth')

/**
 * @swagger
 * /api/v1/auth/register:
 *  post:
 *      summary: Register a new user (customer or vendor)
 *      tags: [Auth]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      required:
 *                          - name
 *                          - email
 *                          - password
 *                      properties:
 *                          name:
 *                              type: string
 *                          email:
 *                              type: string
 *                              format: email
 *                          password:
 *                              type: string
 *                          role:
 *                              type: string
 *                              enum: [customer, vendor]
 *      responses:
 *          201:
 *              description: User registration succesful
 *          400:
 *              description: Bad Request
 */
router.post('/register', validate(registrationSchema), register)
router.get('/verify-email', validate(loginSchema), verifyEmail)
router.post('/login', login)
router.post('/refresh-token', refreshToken)

module.exports = router