'use strict'

/** @layer Controller — Direct Messages request handling */

const dmService = require('../services/directMessageService')

// ── Conversations ─────────────────────────────────────────────────────────────

async function getOrCreateConversation(req, res, next) {
  try {
    const { target_user_id } = req.body
    if (!target_user_id) {
      const e = new Error('target_user_id is required'); e.status = 400; return next(e)
    }
    const conversation = await dmService.getOrCreateConversation(req.user.id, target_user_id)
    res.status(201).json(conversation)
  } catch (err) { next(err) }
}

// ── Inbox ─────────────────────────────────────────────────────────────────────

async function getUserInbox(req, res, next) {
  try {
    const threads = await dmService.getUserInbox(req.user.id)
    res.json(threads)
  } catch (err) { next(err) }
}

// ── Messages ──────────────────────────────────────────────────────────────────

async function getMessages(req, res, next) {
  try {
    const { id: conversationId } = req.params
    if (!conversationId) {
      const e = new Error('conversationId is required'); e.status = 400; return next(e)
    }
    const { limit, before } = req.query
    const result = await dmService.readConversation(req.user.id, conversationId, limit, before)
    res.json(result)
  } catch (err) { next(err) }
}

async function sendMessage(req, res, next) {
  try {
    const { id: conversationId } = req.params
    if (!conversationId) {
      const e = new Error('conversationId is required'); e.status = 400; return next(e)
    }
    const { body } = req.body
    if (!body || !body.trim()) {
      const e = new Error('body is required'); e.status = 400; return next(e)
    }
    if (body.trim().length > 5000) {
      const e = new Error('body exceeds 5000 characters'); e.status = 400; return next(e)
    }
    const message = await dmService.sendMessage(req.user.id, conversationId, body)
    res.status(201).json(message)
  } catch (err) { next(err) }
}

async function markRead(req, res, next) {
  try {
    const { id: conversationId } = req.params
    if (!conversationId) {
      const e = new Error('conversationId is required'); e.status = 400; return next(e)
    }
    const result = await dmService.readConversation(req.user.id, conversationId)
    res.json(result)
  } catch (err) { next(err) }
}

// ── Delete ────────────────────────────────────────────────────────────────────

async function deleteMessage(req, res, next) {
  try {
    const { id: messageId } = req.params
    if (!messageId) {
      const e = new Error('messageId is required'); e.status = 400; return next(e)
    }
    const result = await dmService.deleteMessage(req.user.id, messageId)
    res.json(result)
  } catch (err) { next(err) }
}

module.exports = {
  getOrCreateConversation,
  getUserInbox,
  getMessages,
  sendMessage,
  markRead,
  deleteMessage,
}
