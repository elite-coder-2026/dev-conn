'use strict'
const pool = require('../db')

const { contact_queries } = require('./queries')
function fmtHandle(handle) {
  return handle.startsWith('@') ? handle : `@${handle}`
}

async function getFollowing(userId) {
  const { rows } = await pool.query(
    contact_queries.following,
    [userId]
  )
  return rows.map(r => ({ ...r, handle: fmtHandle(r.handle) }))
}

async function getFollowers(userId) {
  const { rows } = await pool.query(
    contact_queries.get_followers_sql,
    [userId]
  )
  return rows.map(r => ({ ...r, handle: fmtHandle(r.handle) }))
}

async function follow(followerId, followingId) {
  if (followerId === followingId) {
    const e = new Error('Cannot follow yourself'); e.status = 400; throw e
  }

  const { rows: targetRows } = await pool.query(
    'SELECT id FROM users WHERE id = $1',
    [followingId]
  )
  if (!targetRows.length) { const e = new Error('User not found'); e.status = 404; throw e }

  await pool.query(
    contact_queries.follow,
    [followerId, followingId]
  )

  const { rows } = await pool.query(
    contact_queries.followers_count_sql,
    [followingId]
  )
  return rows[0]
}

async function unfollow(followerId, followingId) {
  await pool.query(
    contact_queries.unfollow,
    [followerId, followingId]
  )

  const { rows } = await pool.query(
    contact_queries.followers_count_sql,
    [followingId]
  )
  return rows[0]
}

async function isFollowing(followerId, followingId) {
  const { rows } = await pool.query(
    contact_queries.is_following_sql,
    [followerId, followingId]
  )
  return rows.length > 0
}

module.exports = { getFollowing, getFollowers, follow, unfollow, isFollowing }
