'use strict'
const notificationService = require('../services/notificationService')

async function list(req, res, next) {
  try {
    const { userId } = req.query
    if (!userId) {
      const e = new Error('userId is required'); e.status = 400; return next(e)
    }
    const notifications = await notificationService.getForUser(userId)
    res.json(notifications)
  } catch (err) { next(err) }
}

async function markAllRead(req, res, next) {
  try {
    const { userId } = req.query
    if (!userId) {
      const e = new Error('userId is required'); e.status = 400; return next(e)
    }
    await notificationService.markAllRead(userId)
    res.status(204).end()
  } catch (err) { next(err) }
}

module.exports = { list, markAllRead }
