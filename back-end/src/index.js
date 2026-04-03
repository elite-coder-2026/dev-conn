'use strict'
require('dotenv').config()

const http         = require('http')
const express      = require('express')
const cors         = require('cors')
const pool         = require('./db')
const errorHandler = require('./middleware/errorHandler')
const { init: initSocket } = require('./socket')

const authRoutes     = require('./routes/auth')
const userRoutes     = require('./routes/users')
const feedRoutes     = require('./routes/feed')
const postRoutes     = require('./routes/posts')
const contactRoutes        = require('./routes/contacts')
const connectionRoutes     = require('./routes/connections')
const directMessageRoutes  = require('./routes/directMessages')
const notificationRoutes   = require('./routes/notifications')

const app  = express()
const PORT = process.env.PORT || 3001

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }))
app.use(express.json())

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes)
app.use('/api/users',    userRoutes)
app.use('/api/feed',     feedRoutes)
app.use('/api/posts',    postRoutes)
app.use('/api/contacts',    contactRoutes)
app.use('/api/connections', connectionRoutes)
app.use('/api/dm',            directMessageRoutes)
app.use('/api/notifications', notificationRoutes)

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ status: 'ok', db: 'connected' })
  } catch {
    res.status(503).json({ status: 'error', db: 'unreachable' })
  }
})

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// ── Central error handler (must be last) ─────────────────────────────────────
app.use(errorHandler)

const httpServer = http.createServer(app)
initSocket(httpServer)

httpServer.listen(PORT, () => {
  console.log(`devconn API running at http://localhost:${PORT}`)
})
