<template>
  <div style="max-width:900px;padding-bottom:3rem">
    <div class="flex justify-between items-center page-header">
      <div>
        <p class="page-eyebrow">Gemini Powered</p>
        <h1 class="page-title">AI Notes Summarizer</h1>
        <p class="page-sub">Paste your messy notes and let AI organize them into a clean summary.</p>
      </div>
    </div>

    <div class="grid-2" style="gap:2rem">
      <!-- Input Section -->
      <div class="card" style="padding:1.5rem">
        <h3 class="mb-4">Original Notes</h3>
        <textarea v-model="inputText" class="form-input mb-4" rows="12" placeholder="Paste your study materials, lecture transcripts, or textbook excerpts here..."></textarea>
        
        <button class="btn btn-primary w-full" style="justify-content:center" @click="summarizeNotes" :disabled="isSummarizing || !inputText.trim()">
          <span v-if="isSummarizing">✨ Summarizing with Gemini...</span>
          <span v-else>✨ Summarize Now</span>
        </button>
      </div>

      <!-- Output Section -->
      <div class="card" style="padding:1.5rem; background: rgba(123, 138, 124, 0.05); border: 1px solid var(--primary)">
        <h3 class="mb-4">AI Summary</h3>
        <div v-if="isSummarizing" class="skeleton-loader" style="height:250px; border-radius:var(--r-md)"></div>
        <div v-else-if="summary" class="summary-content">
          <p style="white-space: pre-wrap; line-height: 1.6; font-size: 0.95rem;">{{ summary }}</p>
          <button class="btn btn-outline btn-sm mt-4" @click="copySummary">📋 Copy to Clipboard</button>
        </div>
        <div v-else style="text-align:center; padding: 3rem 0; color: var(--muted)">
          <p>Your AI-generated summary will appear here.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useToast } from '../composables/useToast'
import api from '../api'

const toast = useToast()
const inputText = ref('')
const summary = ref('')
const isSummarizing = ref(false)

async function summarizeNotes() {
  if (!inputText.value.trim()) return
  
  isSummarizing.value = true
  summary.value = ''
  
  try {
    const res = await api.post('/ai/summarize', { text: inputText.value })
    summary.value = res.data.summary
    toast.success('Summary generated successfully! ✨')
  } catch (err) {
    toast.error('Failed to generate summary. Please try again.')
  } finally {
    isSummarizing.value = false
  }
}

function copySummary() {
  navigator.clipboard.writeText(summary.value)
  toast.success('Copied to clipboard! 📋')
}
</script>

<style scoped>
.skeleton-loader {
  background: linear-gradient(90deg, var(--bg) 25%, rgba(123,138,124,0.1) 50%, var(--bg) 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.summary-content p {
  color: var(--text);
}
</style>
