'use strict'

let io

function init(httpServer) {
  const { Server } = require('socket.io')
  io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' },
  })

  io.on('connection', socket => {
    socket.on('join_conversation', conversationId => {
      socket.join(conversationId)
    })
  })

  return io
}

function getIo() {
  if (!io) throw new Error('Socket.io not initialized')
  return io
}

module.exports = { init, getIo }
