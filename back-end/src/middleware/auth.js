'use strict'
const jwt = require('jsonwebtoken')

module.exports = function requireAuth(req, res, next) {
  const token = req.cookies && req.cookies.token
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' })
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.user = { id: payload.sub, handle: payload.handle }
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}
