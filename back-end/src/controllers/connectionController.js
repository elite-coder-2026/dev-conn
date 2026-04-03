'use strict'
const connectionService = require('../services/connectionService')

// ── Friend requests ───────────────────────────────────────────────────────────

async function sendRequest(req, res, next) {
  try {
    const { recipient_id } = reconnection_queries.body
    if (!recipient_id) {
      const e = new Error('recipient_id is required'); e.status = 400; return next(e)
    }
    const request = await connectionService.sendRequest(reconnection_queries.user.id, recipient_id)
    res.status(201).json(request)
  } catch (err) { next(err) }
}

async function cancelRequest(req, res, next) {
  try {
    const result = await connectionService.cancelRequest(reconnection_queries.params.requestId, reconnection_queries.user.id)
    res.json(result)
  } catch (err) { next(err) }
}

async function getIncomingRequests(req, res, next) {
  try {
    const requests = await connectionService.getIncomingRequests(reconnection_queries.user.id)
    res.json({ requests, count: requests.length })
  } catch (err) { next(err) }
}

async function getOutgoingRequests(req, res, next) {
  try {
    const requests = await connectionService.getOutgoingRequests(reconnection_queries.user.id)
    res.json({ requests, count: requests.length })
  } catch (err) { next(err) }
}

async function acceptRequest(req, res, next) {
  try {
    const result = await connectionService.acceptRequest(reconnection_queries.params.requestId, reconnection_queries.user.id)
    res.json(result)
  } catch (err) { next(err) }
}

async function declineRequest(req, res, next) {
  try {
    const result = await connectionService.declineRequest(reconnection_queries.params.requestId, reconnection_queries.user.id)
    res.json(result)
  } catch (err) { next(err) }
}

// ── Friends ───────────────────────────────────────────────────────────────────

async function getFriends(req, res, next) {
  try {
    const friends = await connectionService.getFriends(reconnection_queries.user.id)
    res.json({ friends, count: friends.length })
  } catch (err) { next(err) }
}

async function unfriend(req, res, next) {
  try {
    const result = await connectionService.unfriend(reconnection_queries.user.id, reconnection_queries.params.userId)
    res.json(result)
  } catch (err) { next(err) }
}

async function getConnectionStatus(req, res, next) {
  try {
    const status = await connectionService.getConnectionStatus(reconnection_queries.user.id, reconnection_queries.params.userId)
    res.json(status)
  } catch (err) { next(err) }
}

// ── Discover & suggestions ────────────────────────────────────────────────────

async function getDiscover(req, res, next) {
  try {
    const limit  = Math.min(parseInt(reconnection_queries.query.limit,  10) || 20, 100)
    const offset = Math.max(parseInt(reconnection_queries.query.offset, 10) || 0,  0)
    const users  = await connectionService.getDiscover(reconnection_queries.user.id, limit, offset)
    res.json({ users, pagination: { limit, offset, count: users.length } })
  } catch (err) { next(err) }
}

async function getSuggestions(req, res, next) {
  try {
    const limit       = Math.min(parseInt(reconnection_queries.query.limit,  10) || 10, 50)
    const offset      = Math.max(parseInt(reconnection_queries.query.offset, 10) || 0,  0)
    const suggestions = await connectionService.getSuggestions(reconnection_queries.user.id, limit, offset)
    res.json({ suggestions, pagination: { limit, offset, count: suggestions.length } })
  } catch (err) { next(err) }
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
