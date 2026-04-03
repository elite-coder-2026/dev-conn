'use strict'

/** @layer Service — Direct Messages business logic */

const pool           = require('../db')
const { dm_queries: q } = require('./queries')
const { getIo }      = require('../socket')

// ── Conversations ─────────────────────────────────────────────────────────────

async function getOrCreateConversation(requestingUserId, targetUserId) {
  if (requestingUserId === targetUserId) {
    const e = new Error('Cannot start a conversation with yourself'); e.status = 400; throw e
  }

  const { rows: existing } = await pool.query(q.findExistingConversation, [requestingUserId, targetUserId])
  if (existing.length) return existing[0]

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const { rows } = await client.query(q.createConversation)
    const conversation = rows[0]
    await client.query(q.addParticipant, [conversation.id, requestingUserId])
    await client.query(q.addParticipant, [conversation.id, targetUserId])
    await client.query('COMMIT')
    return conversation
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

// ── Messages ──────────────────────────────────────────────────────────────────

async function sendMessage(requestingUserId, conversationId, body) {
  const { rows: p } = await pool.query(q.isParticipant, [conversationId, requestingUserId])
  if (!p.length) {
    const e = new Error('Not a participant in this conversation'); e.status = 403; throw e
  }

  const trimmed = (body ?? '').trim()
  if (!trimmed) {
    const e = new Error('Message body cannot be empty'); e.status = 400; throw e
  }
  if (trimmed.length > 5000) {
    const e = new Error('Message body exceeds 5000 characters'); e.status = 400; throw e
  }

  const { rows } = await pool.query(q.insertMessage, [conversationId, requestingUserId, trimmed])
  const message = rows[0]

  try {
    getIo().to(conversationId).emit('new_message', message)
  } catch (_) { /* socket not initialized in test environments */ }

  return message
}

async function readConversation(requestingUserId, conversationId, limit = 30, before = null) {
  const { rows: p } = await pool.query(q.isParticipant, [conversationId, requestingUserId])
  if (!p.length) {
    const e = new Error('Not a participant in this conversation'); e.status = 403; throw e
  }

  const safeLimit = Math.min(parseInt(limit, 10) || 30, 100)
  const { rows: messages } = await pool.query(q.getMessages, [conversationId, safeLimit, before || null])

  await pool.query(q.markReadReceipts, [conversationId, requestingUserId])
  const { rows: readRows } = await pool.query(q.updateLastReadAt, [conversationId, requestingUserId])
  const readAt = readRows[0]?.last_read_at ?? new Date().toISOString()

  try {
    getIo().to(conversationId).emit('messages_read', { userId: requestingUserId, conversationId, readAt })
  } catch (_) { /* socket not initialized in test environments */ }

  const nextCursor = messages.length === safeLimit ? messages[messages.length - 1].id : null
  return { messages, nextCursor }
}

// ── Inbox ─────────────────────────────────────────────────────────────────────

async function getUserInbox(userId) {
  const { rows } = await pool.query(q.getInbox, [userId])
  return rows
}

async function getUnreadCount(userId) {
  const { rows } = await pool.query(q.getUnreadCount, [userId])
  return rows[0].unread_count
}

// ── Delete ────────────────────────────────────────────────────────────────────

async function deleteMessage(requestingUserId, messageId) {
  const { rows } = await pool.query(q.softDeleteMessage, [messageId, requestingUserId])
  if (!rows.length) {
    const e = new Error('Message not found or not owned by you'); e.status = 404; throw e
  }
  return { deleted: true }
}

module.exports = {
  getOrCreateConversation,
  sendMessage,
  readConversation,
  getUserInbox,
  getUnreadCount,
  deleteMessage,
}
