'use strict'
const notificationService = require('../services/notificationService')

async function list(req, res, next) {
  try {
    const notifications = await notificationService.getForUser(req.user.id)
    res.json(notifications)
  } catch (err) { next(err) }
}

async function markAllRead(req, res, next) {
  try {
    await notificationService.markAllRead(req.user.id)
    res.status(204).end()
  } catch (err) { next(err) }
}

module.exports = { list, markAllRead }
