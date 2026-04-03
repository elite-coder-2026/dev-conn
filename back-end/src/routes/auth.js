'use strict'
const express        = require('express')
const requireAuth    = require('../middleware/auth')
const authController = require('../controllers/authController')

const router = express.Router()

router.post('/register',         authController.register)
router.post('/login',            authController.login)
router.put('/password',          requireAuth, authController.changePassword)
router.delete('/account',        requireAuth, authController.deleteAccount)

module.exports = router
