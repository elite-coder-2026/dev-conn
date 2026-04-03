'use strict'
const pool = require('../db')
const { connection_queries: q } = require('./queries')

// ── Friend requests ───────────────────────────────────────────────────────────

async function sendRequest(requesterId, recipientId) {
  if (requesterId === recipientId) {
    const e = new Error('Cannot send a friend request to yourself'); e.status = 400; throw e
  }

  // Block if a request already exists in either direction
  const { rows: existing } = await pool.query(q.connection_status, [requesterId, recipientId])
  if (existing.length) {
    const row = existing[0]
    if (row.status === 'accepted') {
      const e = new Error('Already friends'); e.status = 409; throw e
    }
    if (row.status === 'pending') {
      const e = new Error('Friend request already exists'); e.status = 409; throw e
    }
    // declined — allow re-send by deleting the old row first
    await pool.query(
      `DELETE FROM friend_requests WHERE id = $1`,
      [row.id]
    )
  }

  const { rows } = await pool.query(q.send_request, [requesterId, recipientId])
  return rows[0] ?? null
}

async function cancelRequest(requestId, requesterId) {
  const { rows } = await pool.query(q.cancel_request, [requestId, requesterId])
  if (!rows.length) {
    const e = new Error('Request not found or already resolved'); e.status = 404; throw e
  }
  return { cancelled: true }
}

async function getIncomingRequests(userId) {
  const { rows } = await pool.query(q.incoming_requests, [userId])
  return rows.map(formatRequest)
}

async function getOutgoingRequests(userId) {
  const { rows } = await pool.query(q.outgoing_requests, [userId])
  return rows
}

async function acceptRequest(requestId, recipientId) {
  const { rows } = await pool.query(q.accept_request, [requestId, recipientId])
  if (!rows.length) {
    const e = new Error('Request not found or not pending'); e.status = 404; throw e
  }
  return rows[0]
}

async function declineRequest(requestId, recipientId) {
  const { rows } = await pool.query(q.decline_request, [requestId, recipientId])
  if (!rows.length) {
    const e = new Error('Request not found or not pending'); e.status = 404; throw e
  }
  return rows[0]
}

// ── Friends ───────────────────────────────────────────────────────────────────

async function getFriends(userId) {
  const { rows } = await pool.query(q.friends, [userId])
  return rows.map(formatFriend)
}

async function unfriend(userId, targetId) {
  const { rows } = await pool.query(q.unfriend, [userId, targetId])
  if (!rows.length) {
    const e = new Error('Not friends with this user'); e.status = 404; throw e
  }
  return { unfriended: true }
}

async function getConnectionStatus(userId, targetId) {
  const { rows } = await pool.query(q.connection_status, [userId, targetId])
  if (!rows.length) return { status: 'none' }

  const row = rows[0]
  return {
    status:       row.status,
    requestId:    row.id,
    initiatedBy:  row.requester_id === userId ? 'me' : 'them',
  }
}

// ── Discover & suggestions ────────────────────────────────────────────────────

async function getDiscover(userId, limit = 20, offset = 0) {
  const { rows } = await pool.query(q.discover, [userId, limit, offset])
  return rows.map(u => ({
    id:           u.id,
    name:         u.name,
    handle:       `@${u.handle}`,
    avatarUrl:    u.avatar_url,
    isOnline:     u.is_online,
    followersCount: u.followers_count,
    connection: deriveConnectionView(u, userId),
  }))
}

async function getSuggestions(userId, limit = 10, offset = 0) {
  const { rows } = await pool.query(q.suggestions, [userId, limit, offset])
  return rows.map(u => ({
    id:          u.id,
    name:        u.name,
    handle:      `@${u.handle}`,
    avatarUrl:   u.avatar_url,
    isOnline:    u.is_online,
    mutualCount: u.mutual_count,
  }))
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatRequest(row) {
  return {
    id:           row.id,
    createdAt:    row.created_at,
    requester: {
      id:        row.requester_id,
      name:      row.name,
      handle:    `@${row.handle}`,
      avatarUrl: row.avatar_url,
      isOnline:  row.is_online,
    },
    mutualCount:  row.mutual_count,
  }
}

function formatFriend(row) {
  return {
    id:           row.id,
    name:         row.name,
    handle:       `@${row.handle}`,
    avatarUrl:    row.avatar_url,
    isOnline:     row.is_online,
    connectionId: row.connection_id,
    friendsSince: row.friends_since,
  }
}

function deriveConnectionView(row, currentUserId) {
  if (!row.friend_status) {
    return { status: 'none', isFollowing: row.is_following }
  }
  return {
    status:      row.friend_status,
    initiatedBy: row.friend_requester_id === currentUserId ? 'me' : 'them',
    isFollowing: row.is_following,
  }
}

module.exports = {
  sendRequest,
  cancelRequest,
  getIncomingRequests,
  getOutgoingRequests,
  acceptRequest,
  declineRequest,
  getFriends,
  unfriend,
  getConnectionStatus,
  getDiscover,
  getSuggestions,
}
