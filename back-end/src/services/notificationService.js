'use strict'
const pool    = require('../db')
const { notification_queries: q } = require('./queries')
const timeAgo = require('../utils/timeAgo')

async function getForUser(userId) {
  const { rows } = await pool.query(q.list, [userId])
  return rows.map(r => ({
    id:        r.id,
    type:      r.type,
    name:      r.actor_name       ?? 'Someone',
    avatarSrc: r.actor_avatar_url ?? null,
    message:   r.message,
    timeAgo:   timeAgo(r.created_at),
    read:      r.read,
  }))
}

async function markAllRead(userId) {
  await pool.query(q.mark_all_read, [userId])
}

module.exports = { getForUser, markAllRead }
