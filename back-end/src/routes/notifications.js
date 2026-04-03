'use strict'
const express                = require('express')
const notificationController = require('../controllers/notificationController')

const router = express.Router()

router.get('/',           notificationController.list)
router.patch('/read-all', notificationController.markAllRead)

module.exports = router
