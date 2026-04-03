'use strict'
const express           = require('express')
const requireAuth       = require('../middleware/auth')
const contactController = require('../controllers/contactController')

const router = express.Router()

// Current user's follows
router.get('/following',              requireAuth, contactController.getFollowing)
router.get('/followers',              requireAuth, contactController.getFollowers)

// Follow / unfollow / check another user
router.post('/:userId/follow',        requireAuth, contactController.follow)
router.delete('/:userId/follow',      requireAuth, contactController.unfollow)
router.get('/:userId/following',      requireAuth, contactController.checkFollowing)

// Another user's follows/followers
router.get('/users/:userId/following', requireAuth, contactController.getFollowing)
router.get('/users/:userId/followers', requireAuth, contactController.getFollowers)

module.exports = router
