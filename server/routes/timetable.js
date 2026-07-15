const express = require('express')
const router = express.Router()
const TimetableSlot = require('../models/TimetableSlot')
const auth = require('../middleware/auth')

// Get all timetable slots for user
router.get('/', auth, async (req, res) => {
  try {
    const slots = await TimetableSlot.find({ user: req.userId })
    res.json(slots)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// Create slot
router.post('/', auth, async (req, res) => {
  try {
    const newSlot = new TimetableSlot({ ...req.body, user: req.userId })
    const slot = await newSlot.save()
    res.json(slot)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// Update slot
router.put('/:id', auth, async (req, res) => {
  try {
    let slot = await TimetableSlot.findById(req.params.id)
    if (!slot) return res.status(404).json({ message: 'Slot not found' })
    if (slot.user.toString() !== req.userId) return res.status(401).json({ message: 'Not authorized' })

    slot = await TimetableSlot.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true })
    res.json(slot)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// Delete slot
router.delete('/:id', auth, async (req, res) => {
  try {
    const slot = await TimetableSlot.findById(req.params.id)
    if (!slot) return res.status(404).json({ message: 'Slot not found' })
    if (slot.user.toString() !== req.userId) return res.status(401).json({ message: 'Not authorized' })

    await TimetableSlot.findByIdAndDelete(req.params.id)
    res.json({ message: 'Slot removed' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
