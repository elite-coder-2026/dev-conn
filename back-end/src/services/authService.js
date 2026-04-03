'use strict'
const bcrypt           = require('bcryptjs')
const jwt              = require('jsonwebtoken')
const pool             = require('../db')
const formatUser       = require('../utils/formatUser')
const userService      = require('./userService')
const { auth_queries } = require('./queries')

function signToken(user) {
  return jwt.sign(
    { sub: user.id, handle: user.handle },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

async function register({ name, handle, password, avatar_url, cover_color }) {
  const cleanHandle = handle.replace(/^@/, '')

  const existing = await pool.query(auth_queries.exists, [cleanHandle])
  if (existing.rows.length) {
    const e = new Error('Handle already taken'); e.status = 409; throw e
  }

  const rounds = parseInt(process.env.BCRYPT_ROUNDS, 10) || 12
  const password_hash = await bcrypt.hash(password, rounds)

  const user = await userService.createUser({ name, handle: cleanHandle, avatar_url, cover_color, password_hash })
  return { token: signToken(user), user }
}

async function login({ handle, password }) {
  const cleanHandle = handle.replace(/^@/, '')

  const { rows } = await pool.query(auth_queries.login, [cleanHandle])

  const INVALID = 'Invalid credentials'
  if (!rows.length) { const e = new Error(INVALID); e.status = 401; throw e }

  const match = await bcrypt.compare(password, rows[0].password_hash)
  if (!match) { const e = new Error(INVALID); e.status = 401; throw e }

  const { password_hash: _, ...userRow } = rows[0]
  return { token: signToken(userRow), user: formatUser(userRow) }
}

async function changePassword(userId, { currentPassword, newPassword }) {
  const { rows } = await pool.query(
    'SELECT password_hash FROM users WHERE id = $1',
    [userId]
  )
  if (!rows.length) { const e = new Error('User not found'); e.status = 404; throw e }

  const match = await bcrypt.compare(currentPassword, rows[0].password_hash)
  if (!match) { const e = new Error('Current password is incorrect'); e.status = 401; throw e }

  const rounds = parseInt(process.env.BCRYPT_ROUNDS, 10) || 12
  const password_hash = await bcrypt.hash(newPassword, rounds)

  await pool.query(auth_queries.update, [password_hash, userId])
}

async function deleteAccount(userId, password) {
  const { rows } = await pool.query(
    'SELECT password_hash FROM users WHERE id = $1',
    [userId]
  )
  if (!rows.length) { const e = new Error('User not found'); e.status = 404; throw e }

  const match = await bcrypt.compare(password, rows[0].password_hash)
  if (!match) { const e = new Error('Password is incorrect'); e.status = 401; throw e }

  await pool.query(auth_queries.delete_account_sql, [userId])
}

module.exports = { register, login, changePassword, deleteAccount }
