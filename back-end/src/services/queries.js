'use strict'

const auth_queries         = require('./queries/auth')
const contact_queries      = require('./queries/contact')
const post_queries         = require('./queries/post')
const user_queries         = require('./queries/user')
const feed_queries         = require('./queries/feed')
const connection_queries   = require('./queries/connection')
const dm_queries           = require('./queries/dm')
const notification_queries = require('./queries/notification')
const video_queries        = require('./queries/video')

module.exports = {
  auth_queries,
  contact_queries,
  post_queries,
  user_queries,
  feed_queries,
  connection_queries,
  dm_queries,
  notification_queries,
  video_queries,
}
