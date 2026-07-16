require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

const app = express()

// Middleware
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
].filter(Boolean)

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true)
    // Allow any Vercel preview deployment
    if (origin.endsWith('.vercel.app') || allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    callback(new Error('Not allowed by CORS'))
  },
  credentials: true
}))
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

// Debug Env check
app.get('/api/debug-env', (req, res) => {
  res.json({
    mongo_uri_loaded: !!process.env.MONGO_URI,
    jwt_secret_loaded: !!process.env.JWT_SECRET,
    node_env: process.env.NODE_ENV
  })
})

// Direct DB connection test from Vercel
app.get('/api/test-db', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    // Force a new connection with a short timeout to see the exact error
    await mongoose.createConnection(process.env.MONGO_URI, { 
      serverSelectionTimeoutMS: 5000 
    }).asPromise();
    res.json({ success: true, message: "Connected successfully!" });
  } catch (error) {
    res.json({ 
      success: false, 
      error_name: error.name,
      error_message: error.message,
      error_code: error.code
    });
  }
})

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 10000,
  bufferCommands: false
})
.then(() => {
  console.log('✅ MongoDB connected')
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err)
})

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
  })
}

module.exports = app
