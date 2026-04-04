'use strict'
const postService = require('../services/postService')

async function getPost(req, res, next) {
  try {
    const post = await postService.getPost(req.params.id, req.user.id)
    res.json(post)
  } catch (err) { next(err) }
}

async function createPost(req, res, next) {
  try {
    const { content, image_url = null } = req.body
    if (!content || !content.trim()) {
      const e = new Error('content is required'); e.status = 400; return next(e)
    }
    const post = await postService.createPost(req.user.id, content.trim(), image_url)
    res.status(201).json(post)
  } catch (err) { next(err) }
}

async function updatePost(req, res, next) {
  try {
    const { content, image_url } = req.body
    if (!content && image_url === undefined) {
      const e = new Error('content or image_url is required'); e.status = 400; return next(e)
    }
    const post = await postService.updatePost(req.params.id, req.user.id, { content, image_url })
    res.json(post)
  } catch (err) { next(err) }
}

async function deletePost(req, res, next) {
  try {
    await postService.deletePost(req.params.id, req.user.id)
    res.status(204).send()
  } catch (err) { next(err) }
}

// ─── Likes ────────────────────────────────────────────────────────────────────

async function likePost(req, res, next) {
  try {
    res.json(await postService.toggleLike(req.user.id, req.params.id, true))
  } catch (err) { next(err) }
}

async function unlikePost(req, res, next) {
  try {
    res.json(await postService.toggleLike(req.user.id, req.params.id, false))
  } catch (err) { next(err) }
}

// ─── Shares ───────────────────────────────────────────────────────────────────

async function sharePost(req, res, next) {
  try {
    res.json(await postService.toggleShare(req.user.id, req.params.id, true))
  } catch (err) { next(err) }
}

async function unsharePost(req, res, next) {
  try {
    res.json(await postService.toggleShare(req.user.id, req.params.id, false))
  } catch (err) { next(err) }
}

// ─── Comments ─────────────────────────────────────────────────────────────────

async function getComments(req, res, next) {
  try {
    res.json(await postService.getComments(req.params.id))
  } catch (err) { next(err) }
}

async function createComment(req, res, next) {
  try {
    const { content } = req.body
    if (!content || !content.trim()) {
      const e = new Error('content is required'); e.status = 400; return next(e)
    }
    const comment = await postService.createComment(req.params.id, req.user.id, content.trim())
    res.status(201).json(comment)
  } catch (err) { next(err) }
}

async function updateComment(req, res, next) {
  try {
    const { content } = req.body
    if (!content || !content.trim()) {
      const e = new Error('content is required'); e.status = 400; return next(e)
    }
    const comment = await postService.updateComment(req.params.commentId, req.user.id, content.trim())
    res.json(comment)
  } catch (err) { next(err) }
}

async function deleteComment(req, res, next) {
  try {
    await postService.deleteComment(req.params.commentId, req.user.id)
    res.status(204).send()
  } catch (err) { next(err) }
}

module.exports = {
  getPost, createPost, updatePost, deletePost,
  likePost, unlikePost,
  sharePost, unsharePost,
  getComments, createComment, updateComment, deleteComment,
}
