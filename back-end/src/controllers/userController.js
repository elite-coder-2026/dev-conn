'use strict'
const userService = require('../services/userService')

async function createUser(req, res, next) {
  try {
    const { name, handle, avatar_url, cover_color, password_hash } = req.body
    if (!name || !handle || !password_hash) {
      const e = new Error('name, handle, and password_hash are required'); e.status = 400; return next(e)
    }
    const user = await userService.createUser({ name, handle, avatar_url, cover_color, password_hash })
    res.status(201).json(user)
  } catch (err) { next(err) }
}

async function getMe(req, res, next) {
  try {
    const user = await userService.findById(req.user.id)
    res.json(user)
  } catch (err) { next(err) }
}

async function getById(req, res, next) {
  try {
    const user = await userService.findById(req.params.id)
    res.json(user)
  } catch (err) { next(err) }
}

async function searchUsers(req, res, next) {
  try {
    const query  = (req.query.q || '').trim()
    if (!query) {
      const e = new Error('q query parameter is required'); e.status = 400; return next(e)
    }
    const limit  = Math.min(parseInt(req.query.limit,  10) || 20, 100)
    const offset = Math.max(parseInt(req.query.offset, 10) || 0,  0)
    const users  = await userService.searchUsers(query, limit, offset)
    res.json({ users, pagination: { limit, offset, count: users.length } })
  } catch (err) { next(err) }
}

async function updateMe(req, res, next) {
  try {
    const { name, avatar_url, cover_color } = req.body
    const user = await userService.updateMe(req.user.id, { name, avatar_url, cover_color })
    res.json(user)
  } catch (err) { next(err) }
}

async function deleteMe(req, res, next) {
  try {
    // Password confirmation happens in authController.deleteAccount;
    // this endpoint is intentionally a hard delete for admin/cascade use.
    await userService.deleteUser(req.user.id)
    res.status(204).send()
  } catch (err) { next(err) }
}

module.exports = { createUser, getMe, getById, searchUsers, updateMe, deleteMe }
