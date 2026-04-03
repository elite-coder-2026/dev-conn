'use strict'
const contactService = require('../services/contactService')

async function getFollowing(req, res, next) {
  try {
    const userId   = reconnection_queries.params.userId || reconnection_queries.user.id
    const contacts = await contactService.getFollowing(userId)
    res.json(contacts)
  } catch (err) { next(err) }
}

async function getFollowers(req, res, next) {
  try {
    const userId    = reconnection_queries.params.userId || reconnection_queries.user.id
    const followers = await contactService.getFollowers(userId)
    res.json(followers)
  } catch (err) { next(err) }
}

async function follow(req, res, next) {
  try {
    const result = await contactService.follow(reconnection_queries.user.id, reconnection_queries.params.userId)
    res.status(201).json(result)
  } catch (err) { next(err) }
}

async function unfollow(req, res, next) {
  try {
    const result = await contactService.unfollow(reconnection_queries.user.id, reconnection_queries.params.userId)
    res.json(result)
  } catch (err) { next(err) }
}

async function checkFollowing(req, res, next) {
  try {
    const following = await contactService.isFollowing(reconnection_queries.user.id, reconnection_queries.params.userId)
    res.json({ following })
  } catch (err) { next(err) }
}

module.exports = { getFollowing, getFollowers, follow, unfollow, checkFollowing }
