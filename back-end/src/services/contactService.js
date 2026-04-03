'use strict'
const pool = require('../db')

const { contact_sql } = require('./queries')
function fmtHandle(handle) {
  return handle.startsWith('@') ? handle : `@${handle}`
}

async function getFollowing(userId) {
  const { rows } = await pool.query(
    contact_sql.following,
    [userId]
  )
  return rows.map(r => ({ ...r, handle: fmtHandle(r.handle) }))
}

async function getFollowers(userId) {
  const { rows } = await pool.query(
    contact_sql.get_followers_sql,
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
    contact_sql.follow,
    [followerId, followingId]
  )

  const { rows } = await pool.query(
    contact_sql.followers_count_sql,
    [followingId]
  )
  return rows[0]
}

async function unfollow(followerId, followingId) {
  await pool.query(
    contact_sql.unfollow,
    [followerId, followingId]
  )

  const { rows } = await pool.query(
    contact_sql.followers_count_sql,
    [followingId]
  )
  return rows[0]
}

async function isFollowing(followerId, followingId) {
  const { rows } = await pool.query(
    contact_sql.is_following_sql,
    [followerId, followingId]
  )
  return rows.length > 0
}

module.exports = { getFollowing, getFollowers, follow, unfollow, isFollowing }
