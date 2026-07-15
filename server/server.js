require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

const app = express()

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }))
app.use(express.json())

// Routes
app.use('/api/auth',      require('./routes/auth'))
app.use('/api/tasks',     require('./routes/tasks'))
app.use('/api/exams',     require('./routes/exams'))
app.use('/api/timetable', require('./routes/timetable'))
app.use('/api/rooms',     require('./routes/rooms'))
app.use('/api/ai',        require('./routes/ai'))

// Health check
app.get('/', (req, res) => res.json({ message: 'StudySyncAI API is running!' }))

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected')
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message)
  })

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
  })
}

module.exports = app
