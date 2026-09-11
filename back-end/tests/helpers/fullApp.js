'use strict'
// Mounts every API router with the same front-line middleware as index.js,
// minus cors / socket.io / listen — so supertest can drive the whole surface.
const express      = require('express')
const helmet       = require('helmet')
const cookieParser = require('cookie-parser')

module.exports = function makeFullApp() {
  const app = express()
  app.use(helmet())
  app.use(cookieParser())
  app.use(express.json())

  app.use('/api/auth',          require('../../src/routes/auth'))
  app.use('/api/users',         require('../../src/routes/users'))
  app.use('/api/feed',          require('../../src/routes/feed'))
  app.use('/api/posts',         require('../../src/routes/posts'))
  app.use('/api/contacts',      require('../../src/routes/contacts'))
  app.use('/api/connections',   require('../../src/routes/connections'))
  app.use('/api/dm',            require('../../src/routes/directMessages'))
  app.use('/api/notifications', require('../../src/routes/notifications'))
  app.use('/api/videos',        require('../../src/routes/videos'))

  app.use(require('../../src/middleware/errorHandler'))
  return app
}
