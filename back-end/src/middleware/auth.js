'use strict'
const jwt = require('jsonwebtoken')
const pool = require('../db')
const { auth_queries } = require('../services/queries')

module.exports = async function requireAuth(req, res, next) {
  const token = req.cookies && req.cookies.token
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' })
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)

    const { rows } = await pool.query(auth_queries.password_changed_at, [payload.sub])
    if (!rows.length) {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }
    const changedAt = rows[0].password_changed_at
    if (changedAt && payload.iat * 1000 < new Date(changedAt).getTime()) {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }

    req.user = { id: payload.sub, handle: payload.handle }
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}
