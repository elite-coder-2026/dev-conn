'use strict'
const express        = require('express')
const rateLimit      = require('express-rate-limit')
const requireAuth    = require('../middleware/auth')
const authController = require('../controllers/authController')

const router = express.Router()

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts, please try again later' },
})

router.post('/register',         authLimiter, authController.register)
router.post('/login',            authLimiter, authController.login)
router.post('/logout',           authController.logout)
router.put('/password',          requireAuth, authController.changePassword)
router.delete('/account',        requireAuth, authController.deleteAccount)

module.exports = router
