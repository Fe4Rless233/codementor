const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
require('dotenv').config()

const collaborationHandler = require('./handlers/collaboration')
const chatHandler = require('./handlers/chat')

const app = express()
app.use(cors()) // Enable CORS for all origins

const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.NEXT_PUBLIC_SOCKET_URL ? new URL(process.env.NEXT_PUBLIC_SOCKET_URL).origin : "*", // Allow Next.js app to connect, or '*' for development
    methods: ["GET", "POST"]
  }
})

const PORT = process.env.SOCKET_PORT || 3001

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`)

  collaborationHandler(io, socket)
  chatHandler(io, socket)

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`)
  })
})

server.listen(PORT, () => {
  console.log(`Socket server listening on port ${PORT}`)
})