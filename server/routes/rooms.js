const express = require('express')
const router = express.Router()
const Room = require('../models/Room')
const auth = require('../middleware/auth')

// Get all rooms for user
router.get('/', auth, async (req, res) => {
  try {
    const rooms = await Room.find({ user: req.userId })
    res.json(rooms)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// Create room
router.post('/', auth, async (req, res) => {
  try {
    const newRoom = new Room({ ...req.body, user: req.userId })
    const room = await newRoom.save()
    res.json(room)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// Update room
router.put('/:id', auth, async (req, res) => {
  try {
    let room = await Room.findById(req.params.id)
    if (!room) return res.status(404).json({ message: 'Room not found' })
    if (room.user.toString() !== req.userId) return res.status(401).json({ message: 'Not authorized' })

    room = await Room.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true })
    res.json(room)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// Delete room
router.delete('/:id', auth, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
    if (!room) return res.status(404).json({ message: 'Room not found' })
    if (room.user.toString() !== req.userId) return res.status(401).json({ message: 'Not authorized' })

    await Room.findByIdAndDelete(req.params.id)
    res.json({ message: 'Room removed' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
