'use strict'
// Assembles the same middleware chain index.js puts in front of the auth router,
// without binding a port or starting socket.io — so supertest can drive it.
const express      = require('express')
const helmet       = require('helmet')
const cookieParser = require('cookie-parser')

module.exports = function makeApp() {
  const authRoutes   = require('../../src/routes/auth')
  const errorHandler = require('../../src/middleware/errorHandler')

  const app = express()
  app.use(helmet())
  app.use(cookieParser())
  app.use(express.json())
  app.use('/api/auth', authRoutes)
  app.use(errorHandler)
  return app
}
