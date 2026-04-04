'use strict'
const authService = require('../services/authService')

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000,
}

async function register(req, res, next) {
  try {
    const { name, handle, password, avatar_url = null, cover_color = null } = req.body
    if (!name || !handle || !password) {
      const e = new Error('name, handle, and password are required'); e.status = 400; return next(e)
    }
    const { token, user } = await authService.register({ name, handle, password, avatar_url, cover_color })
    res.cookie('token', token, COOKIE_OPTS)
    res.status(201).json({ user })
  } catch (err) { next(err) }
}

async function login(req, res, next) {
  try {
    const { handle, password } = req.body
    if (!handle || !password) {
      const e = new Error('handle and password are required'); e.status = 400; return next(e)
    }
    const { token, user } = await authService.login({ handle, password })
    res.cookie('token', token, COOKIE_OPTS)
    res.json({ user })
  } catch (err) { next(err) }
}

async function logout(req, res) {
  res.clearCookie('token', COOKIE_OPTS)
  res.json({ ok: true })
}

async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) {
      const e = new Error('currentPassword and newPassword are required'); e.status = 400; return next(e)
    }
    if (newPassword.length < 8) {
      const e = new Error('newPassword must be at least 8 characters'); e.status = 400; return next(e)
    }
    await authService.changePassword(req.user.id, { currentPassword, newPassword })
    res.json({ message: 'Password updated successfully' })
  } catch (err) { next(err) }
}

async function deleteAccount(req, res, next) {
  try {
    const { password } = req.body
    if (!password) {
      const e = new Error('password is required to delete account'); e.status = 400; return next(e)
    }
    await authService.deleteAccount(req.user.id, password)
    res.status(204).send()
  } catch (err) { next(err) }
}

module.exports = { register, login, logout, changePassword, deleteAccount }
