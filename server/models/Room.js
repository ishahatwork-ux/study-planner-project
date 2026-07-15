const mongoose = require('mongoose')

const RoomSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  code:        { type: String },
  name:        { type: String, required: true },
  subject:     { type: String, default: '' },
  goal:        { type: String, default: '' },
  description: { type: String, default: '' },
  tags:        { type: String, default: '' },
  visibility:  { type: String, default: 'public' },
  maxMembers:  { type: Number, default: 4 },
  createdBy:   { type: String, default: '' },
  members:     { type: Array, default: [] },
  messages:    { type: Array, default: [] },
  tasks:       { type: Array, default: [] },
  events:      { type: Array, default: [] },
  files:       { type: Array, default: [] },
  announcements: { type: Array, default: [] },
  activity:    { type: Array, default: [] },
  createdAt:   { type: Date, default: Date.now }
})

module.exports = mongoose.model('Room', RoomSchema)
