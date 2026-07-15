const express = require('express')
const router = express.Router()
const Task = require('../models/Task')
const auth = require('../middleware/auth')

// Get all tasks for user
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.userId }).sort({ createdAt: -1 })
    res.json(tasks)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// Create task
router.post('/', auth, async (req, res) => {
  try {
    const newTask = new Task({ ...req.body, user: req.userId })
    const task = await newTask.save()
    res.json(task)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// Update task
router.put('/:id', auth, async (req, res) => {
  try {
    let task = await Task.findById(req.params.id)
    if (!task) return res.status(404).json({ message: 'Task not found' })
    if (task.user.toString() !== req.userId) return res.status(401).json({ message: 'Not authorized' })

    task = await Task.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true })
    res.json(task)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
    if (!task) return res.status(404).json({ message: 'Task not found' })
    if (task.user.toString() !== req.userId) return res.status(401).json({ message: 'Not authorized' })

    await Task.findByIdAndDelete(req.params.id)
    res.json({ message: 'Task removed' })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
