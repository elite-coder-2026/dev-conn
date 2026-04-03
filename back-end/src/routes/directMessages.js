'use strict'

/**
 * @layer Routes — Direct Messages
 *
 * Socket.io — expected client-side event listeners:
 *
 *   socket.on('new_message', (message) => { ... })
 *     Fired when a new message is sent to a conversation the client has joined.
 *     Payload: { id, conversation_id, sender_id, body, created_at }
 *
 *   socket.on('messages_read', ({ userId, conversationId, readAt }) => { ... })
 *     Fired when a participant marks a conversation as read.
 *
 * Client must emit 'join_conversation' with a conversationId string after
 * opening a thread to receive real-time events for that conversation:
 *   socket.emit('join_conversation', conversationId)
 */

const express    = require('express')
const requireAuth = require('../middleware/auth')
const dmController = require('../controllers/directMessageController')

const router = express.Router()

router.post('/conversations',                 requireAuth, dmController.getOrCreateConversation)
router.get('/inbox',                          requireAuth, dmController.getUserInbox)
router.get('/conversations/:id/messages',     requireAuth, dmController.getMessages)
router.post('/conversations/:id/messages',    requireAuth, dmController.sendMessage)
router.post('/conversations/:id/read',        requireAuth, dmController.markRead)
router.delete('/messages/:id',                requireAuth, dmController.deleteMessage)

module.exports = router
