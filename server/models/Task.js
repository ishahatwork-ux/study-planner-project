const mongoose = require('mongoose')

const TaskSchema = new mongoose.Schema({
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:    { type: String, required: true },
  subject:  { type: String, default: '' },
  priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  status:   { type: String, enum: ['pending', 'completed'], default: 'pending' },
  deadline: { type: String, default: '' },
  tag:      { type: String, default: '' },
  createdAt:{ type: Date, default: Date.now }
})

module.exports = mongoose.model('Task', TaskSchema)
