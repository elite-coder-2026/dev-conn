'use strict'
const pool = require('../db')

const { post_queries } = require('./queries')
// ─── Posts ────────────────────────────────────────────────────────────────────

async function getPost(postId, requestingUserId) {
  const { rows } = await pool.query(
    post_queries.get_post,
    [postId, requestingUserId]
  )
  if (!rows.length) { const e = new Error('Post not found'); e.status = 404; throw e }
  const row = rows[0]
  return {
    ...row,
    author_handle: row.author_handle.startsWith('@') ? row.author_handle : `@${row.author_handle}`,
  }
}

async function createPost(authorId, content, imageUrl) {
  const { rows } = await pool.query(post_queries.create_post, [authorId, content, imageUrl])

  const { rows: userRows } = await pool.query(post_queries.get_comment_author, [authorId])
  const author = userRows[0]

  return {
    ...rows[0],
    author_name:       author.name,
    author_handle:     `@${author.handle}`,
    author_avatar_url: author.avatar_url,
    likes_count:       0,
    comments_count:    0,
    shares_count:      0,
    liked_by_me:       false,
    shared_by_me:      false,
  }
}

async function updatePost(postId, userId, { content, image_url }) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const { rows: existing } = await client.query(
      post_queries.exists,
      [postId]
    )
    if (!existing.length) { const e = new Error('Post not found'); e.status = 404; throw e }
    if (existing[0].author_id !== userId) { const e = new Error('Forbidden'); e.status = 403; throw e }

    const { rows } = await client.query(
      post_queries.update_post,
      [content ?? null, image_url ?? null, postId]
    )

    await client.query('COMMIT')
    return rows[0]
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

async function deletePost(postId, userId) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const { rows } = await client.query(
      'SELECT author_id FROM posts WHERE id = $1 FOR UPDATE',
      [postId]
    )
    if (!rows.length) { const e = new Error('Post not found'); e.status = 404; throw e }
    if (rows[0].author_id !== userId) { const e = new Error('Forbidden'); e.status = 403; throw e }

    await client.query(post_queries.delete_post, [postId])
    await client.query('COMMIT')
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

// ─── Likes ────────────────────────────────────────────────────────────────────

async function toggleLike(userId, postId, add) {
  if (add) {
    await pool.query(post_queries.add_like, [userId, postId])
  } else {
    await pool.query(post_queries.remove_like, [userId, postId])
  }
  const { rows } = await pool.query(post_queries.likes_count, [postId])
  return rows[0]
}

// ─── Shares ───────────────────────────────────────────────────────────────────

async function toggleShare(userId, postId, add) {
  if (add) {
    await pool.query(post_queries.add_share, [userId, postId])
  } else {
    await pool.query(post_queries.remove_share, [userId, postId])
  }
  const { rows } = await pool.query(post_queries.shares_count, [postId])
  return rows[0]
}

// ─── Comments ─────────────────────────────────────────────────────────────────

async function getComments(postId) {
  const { rows } = await pool.query(post_queries.get_comments, [postId])
  return rows.map(r => ({
    ...r,
    author_handle: r.author_handle.startsWith('@') ? r.author_handle : `@${r.author_handle}`,
  }))
}

async function createComment(postId, authorId, content) {
  const { rows } = await pool.query(post_queries.create_comment, [postId, authorId, content])

  const { rows: userRows } = await pool.query(post_queries.get_comment_author, [authorId])
  const author = userRows[0]

  return {
    ...rows[0],
    author_name:       author.name,
    author_handle:     `@${author.handle}`,
    author_avatar_url: author.avatar_url,
  }
}

async function updateComment(commentId, userId, content) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const { rows: existing } = await client.query(post_queries.comment_exists, [commentId])
    if (!existing.length) { const e = new Error('Comment not found'); e.status = 404; throw e }
    if (existing[0].author_id !== userId) { const e = new Error('Forbidden'); e.status = 403; throw e }

    const { rows } = await client.query(post_queries.update_comment, [content, commentId])

    await client.query('COMMIT')
    return rows[0]
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

async function deleteComment(commentId, userId) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const { rows } = await client.query(post_queries.comment_exists, [commentId])
    if (!rows.length) { const e = new Error('Comment not found'); e.status = 404; throw e }
    if (rows[0].author_id !== userId) { const e = new Error('Forbidden'); e.status = 403; throw e }

    await client.query(post_queries.delete_comment, [commentId])
    await client.query('COMMIT')
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

module.exports = {
  getPost,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
  toggleShare,
  getComments,
  createComment,
  updateComment,
  deleteComment,
}
