'use strict'
const express        = require('express')
const requireAuth    = require('../middleware/auth')
const userController = require('../controllers/userController')

const router = express.Router()

router.post('/',       requireAuth, userController.createUser)
router.get('/search',  requireAuth, userController.searchUsers)
router.get('/me',      requireAuth, userController.getMe)
router.put('/me',      requireAuth, userController.updateMe)
router.delete('/me',   requireAuth, userController.deleteMe)
router.get('/:id',                  userController.getById)

module.exports = router
