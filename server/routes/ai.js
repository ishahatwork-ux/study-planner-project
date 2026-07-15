const express = require('express')
const router = express.Router()
const { GoogleGenerativeAI } = require('@google/generative-ai')
const auth = require('../middleware/auth')

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// Generate Summary
router.post('/summarize', auth, async (req, res) => {
  try {
    const { text } = req.body
    if (!text) return res.status(400).json({ message: 'Text to summarize is required' })

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
    
    const prompt = `Please provide a concise and clear summary of the following study notes:\n\n${text}`
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    const summary = response.text()

    res.json({ summary })
  } catch (err) {
    console.error('Gemini API Error:', err)
    res.status(500).json({ message: 'Failed to generate summary' })
  }
})

module.exports = router
