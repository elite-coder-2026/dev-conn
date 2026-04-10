'use strict'
const express         = require('express')
const requireAuth     = require('../middleware/auth')
const videoController = require('../controllers/videoController')

const router = express.Router()

router.get('/',     requireAuth, videoController.getVideos)
router.get('/:id',  requireAuth, videoController.getVideo)
router.post('/',    requireAuth, videoController.createVideo)
router.put('/:id',  requireAuth, videoController.updateVideo)
router.delete('/:id', requireAuth, videoController.deleteVideo)

module.exports = router
