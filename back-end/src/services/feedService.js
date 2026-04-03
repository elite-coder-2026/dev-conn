'use strict'
const pool = require('../db')

const { feed_queries } = require('./queries')

function formatPosts(rows) {
  return rows.map(row => ({
    ...row,
    author_handle: row.author_handle.startsWith('@') ? row.author_handle : `@${row.author_handle}`,
  }))
}

async function getFeed(userId, limit, offset) {
  const { rows } = await pool.query(
    `${feed_queries.get_user_posts_sql}
     WHERE p.author_id = $1
        OR p.author_id IN (SELECT following_id FROM follows WHERE follower_id = $1)
     ORDER BY p.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  )
  return formatPosts(rows)
}

async function getUserPosts(profileUserId, requestingUserId, limit, offset) {
  const { rows } = await pool.query(
    `${feed_queries.get_user_posts_sql}
     WHERE p.author_id = $2
     ORDER BY p.created_at DESC
     LIMIT $3 OFFSET $4`,
    [requestingUserId, profileUserId, limit, offset]
  )
  return formatPosts(rows)
}

module.exports = { getFeed, getUserPosts }
