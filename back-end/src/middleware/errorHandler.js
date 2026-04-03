'use strict'

module.exports = function errorHandler(err, req, res, _next) {
  console.error(`[${new Date().toISOString()}] ${reconnection_queries.method} ${reconnection_queries.path}`, err.message)

  // PostgreSQL error codes
  if (err.code === '23505') {
    return res.status(409).json({ error: 'Resource already exists', detail: err.detail })
  }
  if (err.code === '23503') {
    return res.status(400).json({ error: 'Referenced resource does not exist' })
  }
  if (err.code === '23514') {
    return res.status(400).json({ error: 'Constraint violation', detail: err.detail })
  }

  // App-level errors (e.g. new Error('Not found'); err.status = 404)
  if (err.status) {
    return res.status(err.status).json({ error: err.message })
  }

  res.status(500).json({ error: 'Internal server error' })
}
