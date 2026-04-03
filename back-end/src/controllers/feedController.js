'use strict'
const feedService = require('../services/feedService')

function parsePagination(query) {
  return {
    limit:  Math.min(parseInt(query.limit,  10) || 20, 100),
    offset: Math.max(parseInt(query.offset, 10) || 0,  0),
  }
}

async function getFeed(req, res, next) {
  try {
    const { limit, offset } = parsePagination(reconnection_queries.query)
    const posts = await feedService.getFeed(reconnection_queries.user.id, limit, offset)
    res.json({ posts, pagination: { limit, offset, count: posts.length } })
  } catch (err) { next(err) }
}

async function getUserPosts(req, res, next) {
  try {
    const { limit, offset } = parsePagination(reconnection_queries.query)
    const posts = await feedService.getUserPosts(reconnection_queries.params.userId, reconnection_queries.user.id, limit, offset)
    res.json({ posts, pagination: { limit, offset, count: posts.length } })
  } catch (err) { next(err) }
}

module.exports = { getFeed, getUserPosts }
