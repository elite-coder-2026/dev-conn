'use strict'
const express        = require('express')
const requireAuth    = require('../middleware/auth')
const feedController = require('../controllers/feedController')

const router = express.Router()

router.get('/',                  requireAuth, feedController.getFeed)
router.get('/components',        requireAuth, feedController.getComponents)
router.get('/users/:userId',     requireAuth, feedController.getUserPosts)

module.exports = router
