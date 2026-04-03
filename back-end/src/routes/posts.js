'use strict'
const express        = require('express')
const requireAuth    = require('../middleware/auth')
const postController = require('../controllers/postController')

const router = express.Router()

// Posts CRUD
router.get('/:id',              requireAuth, postController.getPost)
router.post('/',                requireAuth, postController.createPost)
router.put('/:id',              requireAuth, postController.updatePost)
router.delete('/:id',          requireAuth, postController.deletePost)

// Likes
router.post('/:id/like',       requireAuth, postController.likePost)
router.delete('/:id/like',     requireAuth, postController.unlikePost)

// Shares
router.post('/:id/share',      requireAuth, postController.sharePost)
router.delete('/:id/share',    requireAuth, postController.unsharePost)

// Comments CRUD
router.get('/:id/comments',                    requireAuth, postController.getComments)
router.post('/:id/comments',                   requireAuth, postController.createComment)
router.put('/:id/comments/:commentId',         requireAuth, postController.updateComment)
router.delete('/:id/comments/:commentId',      requireAuth, postController.deleteComment)

module.exports = router
