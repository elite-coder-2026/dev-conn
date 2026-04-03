'use strict'
const express              = require('express')
const requireAuth          = require('../middleware/auth')
const connectionController = require('../controllers/connectionController')

const router = express.Router()

// ── Discover & suggestions ────────────────────────────────────────────────────
router.get('/discover',              requireAuth, connectionController.getDiscover)
router.get('/suggestions',           requireAuth, connectionController.getSuggestions)

// ── Friends ───────────────────────────────────────────────────────────────────
router.get('/friends',               requireAuth, connectionController.getFriends)
router.delete('/friends/:userId',    requireAuth, connectionController.unfriend)
router.get('/status/:userId',        requireAuth, connectionController.getConnectionStatus)

// ── Friend requests ───────────────────────────────────────────────────────────
router.post('/requests',                          requireAuth, connectionController.sendRequest)
router.get('/requests/incoming',                  requireAuth, connectionController.getIncomingRequests)
router.get('/requests/outgoing',                  requireAuth, connectionController.getOutgoingRequests)
router.delete('/requests/:requestId',             requireAuth, connectionController.cancelRequest)
router.post('/requests/:requestId/accept',        requireAuth, connectionController.acceptRequest)
router.post('/requests/:requestId/decline',       requireAuth, connectionController.declineRequest)

module.exports = router
