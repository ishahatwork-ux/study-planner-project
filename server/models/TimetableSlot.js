const mongoose = require('mongoose')

const TimetableSlotSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  day:       { type: String, required: true },
  time:      { type: String, required: true },
  subject:   { type: String, required: true },
  color:     { type: String, default: '#7b8a7c' },
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('TimetableSlot', TimetableSlotSchema)
