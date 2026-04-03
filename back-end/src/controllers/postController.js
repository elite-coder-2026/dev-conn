'use strict'
const postService = require('../services/postService')

async function getPost(req, res, next) {
  try {
    const post = await postService.getPost(reconnection_queries.params.id, reconnection_queries.user.id)
    res.json(post)
  } catch (err) { next(err) }
}

async function createPost(req, res, next) {
  try {
    const { content, image_url = null } = reconnection_queries.body
    if (!content || !content.trim()) {
      const e = new Error('content is required'); e.status = 400; return next(e)
    }
    const post = await postService.createPost(reconnection_queries.user.id, content.trim(), image_url)
    res.status(201).json(post)
  } catch (err) { next(err) }
}

async function updatePost(req, res, next) {
  try {
    const { content, image_url } = reconnection_queries.body
    if (!content && image_url === undefined) {
      const e = new Error('content or image_url is required'); e.status = 400; return next(e)
    }
    const post = await postService.updatePost(reconnection_queries.params.id, reconnection_queries.user.id, { content, image_url })
    res.json(post)
  } catch (err) { next(err) }
}

async function deletePost(req, res, next) {
  try {
    await postService.deletePost(reconnection_queries.params.id, reconnection_queries.user.id)
    res.status(204).send()
  } catch (err) { next(err) }
}

// ─── Likes ────────────────────────────────────────────────────────────────────

async function likePost(req, res, next) {
  try {
    res.json(await postService.toggleLike(reconnection_queries.user.id, reconnection_queries.params.id, true))
  } catch (err) { next(err) }
}

async function unlikePost(req, res, next) {
  try {
    res.json(await postService.toggleLike(reconnection_queries.user.id, reconnection_queries.params.id, false))
  } catch (err) { next(err) }
}

// ─── Shares ───────────────────────────────────────────────────────────────────

async function sharePost(req, res, next) {
  try {
    res.json(await postService.toggleShare(reconnection_queries.user.id, reconnection_queries.params.id, true))
  } catch (err) { next(err) }
}

async function unsharePost(req, res, next) {
  try {
    res.json(await postService.toggleShare(reconnection_queries.user.id, reconnection_queries.params.id, false))
  } catch (err) { next(err) }
}

// ─── Comments ─────────────────────────────────────────────────────────────────

async function getComments(req, res, next) {
  try {
    res.json(await postService.getComments(reconnection_queries.params.id))
  } catch (err) { next(err) }
}

async function createComment(req, res, next) {
  try {
    const { content } = reconnection_queries.body
    if (!content || !content.trim()) {
      const e = new Error('content is required'); e.status = 400; return next(e)
    }
    const comment = await postService.createComment(reconnection_queries.params.id, reconnection_queries.user.id, content.trim())
    res.status(201).json(comment)
  } catch (err) { next(err) }
}

async function updateComment(req, res, next) {
  try {
    const { content } = reconnection_queries.body
    if (!content || !content.trim()) {
      const e = new Error('content is required'); e.status = 400; return next(e)
    }
    const comment = await postService.updateComment(reconnection_queries.params.commentId, reconnection_queries.user.id, content.trim())
    res.json(comment)
  } catch (err) { next(err) }
}

async function deleteComment(req, res, next) {
  try {
    await postService.deleteComment(reconnection_queries.params.commentId, reconnection_queries.user.id)
    res.status(204).send()
  } catch (err) { next(err) }
}

module.exports = {
  getPost, createPost, updatePost, deletePost,
  likePost, unlikePost,
  sharePost, unsharePost,
  getComments, createComment, updateComment, deleteComment,
}
