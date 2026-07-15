const express = require('express')
const router = express.Router()
const Exam = require('../models/Exam')
const auth = require('../middleware/auth')

// Get all exams for user
router.get('/', auth, async (req, res) => {
  try {
    const exams = await Exam.find({ user: req.userId }).sort({ date: 1 })
    res.json(exams)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// Create exam
router.post('/', auth, async (req, res) => {
  try {
    const newExam = new Exam({ ...req.body, user: req.userId })
    const exam = await newExam.save()
    res.json(exam)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// Update exam
router.put('/:id', auth, async (req, res) => {
  try {
    let exam = await Exam.findById(req.params.id)
    if (!exam) return res.status(404).json({ message: 'Exam not found' })
    if (exam.user.toString() !== req.userId) return res.status(401).json({ message: 'Not authorized' })

    exam = await Exam.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true })
    res.json(exam)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// Delete exam
router.delete('/:id', auth, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
    if (!exam) return res.status(404).json({ message: 'Exam not found' })
    if (exam.user.toString() !== req.userId) return res.status(401).json({ message: 'Not authorized' })

    await Exam.findByIdAndDelete(req.params.id)
    res.json({ message: 'Exam removed' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
