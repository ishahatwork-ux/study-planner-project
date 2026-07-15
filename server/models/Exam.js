const mongoose = require('mongoose')

const ExamSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:      { type: String, required: true },
  subject:   { type: String, default: '' },
  date:      { type: String, required: true },
  notes:     { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Exam', ExamSchema)
