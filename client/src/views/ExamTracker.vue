<template>
  <div style="max-width:900px;padding-bottom:3rem">
    <div class="flex justify-between items-center page-header">
      <div>
        <p class="page-eyebrow">Upcoming</p>
        <h1 class="page-title">Exam Tracker</h1>
        <p class="page-sub">Never be caught off guard by an exam again.</p>
      </div>
      <button class="btn btn-primary" @click="openForm()"><Plus :size="18"/> Add Exam</button>
    </div>

    <!-- Form -->
    <div v-if="showForm" class="dashed-card">
      <h3 class="mb-4">{{ editingId ? 'Edit Exam' : 'New Exam' }}</h3>
      <form @submit.prevent="submitForm" class="grid-2">
        <div class="form-group">
          <label class="form-label">Exam Name</label>
          <input v-model="form.name" type="text" class="form-input" :class="{error:fe.name}" placeholder="Midterm Exam" @input="fe.name=''" />
          <p v-if="fe.name" class="form-error">⚠ {{ fe.name }}</p>
        </div>
        <div class="form-group">
          <label class="form-label">Subject</label>
          <input v-model="form.subject" type="text" class="form-input" :class="{error:fe.subject}" placeholder="Biology" @input="fe.subject=''" />
          <p v-if="fe.subject" class="form-error">⚠ {{ fe.subject }}</p>
        </div>
        <div class="form-group">
          <label class="form-label">Exam Date</label>
          <input v-model="form.date" type="date" class="form-input" :class="{error:fe.date}" @input="fe.date=''" />
          <p v-if="fe.date" class="form-error">⚠ {{ fe.date }}</p>
        </div>
        <div class="form-group">
          <label class="form-label">Importance</label>
          <select v-model="form.importance" class="form-input">
            <option>Low</option><option>Medium</option><option>High</option>
          </select>
        </div>
        <div class="form-group" style="grid-column:span 2">
          <label class="form-label" style="display:flex; justify-content:space-between; align-items:center;">
            <span>Exam Notes / Study Material</span>
            <button type="button" class="btn btn-outline btn-sm" @click="summarizeNotes" :disabled="isSummarizing || !form.notes" style="padding:0.3rem 0.6rem; font-size:0.75rem;">
              <span v-if="isSummarizing">Summarizing...</span>
              <span v-else>✨ AI Summarize</span>
            </button>
          </label>
          <textarea v-model="form.notes" class="form-input" rows="4" placeholder="Paste your study notes here to get an AI summary..."></textarea>
        </div>
        <div class="flex gap-3 justify-end" style="grid-column:span 2">
          <button type="button" class="btn btn-outline" @click="showForm=false">Cancel</button>
          <button type="submit" class="btn btn-primary">Save Exam</button>
        </div>
      </form>
    </div>

    <!-- Empty state -->
    <div v-if="!sorted.length" class="card" style="text-align:center;padding:4rem 2rem;color:var(--muted)">
      <GraduationCap :size="48" style="margin:0 auto 1rem;opacity:.25" />
      <p>No exams tracked. Enjoy the peace for now 🌿</p>
    </div>

    <!-- Exam Cards -->
    <div v-else style="display:grid;grid-template-columns:repeat(auto-fill,minmax(360px,1fr));gap:1.25rem">
      <div v-for="ex in sorted" :key="ex.id" class="card exam-card"
        :style="`border-top:4px solid ${ex.daysLeft<=7?'var(--error)':iColor(ex.importance)}`">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 style="margin:0;font-size:1.2rem;display:flex;align-items:center;gap:.4rem">
              {{ ex.name }}
              <AlertCircle v-if="ex.daysLeft<=7" :size="16" color="var(--error)" />
            </h3>
            <p class="text-sm text-muted mt-1">{{ ex.subject }}</p>
          </div>
          <div class="countdown-box" :style="`background:${ex.daysLeft<=7?'rgba(204,108,108,.1)':'var(--bg)'}`">
            <span :style="`color:${ex.daysLeft<=7?'var(--error)':iColor(ex.importance)}`">{{ ex.daysLeft }}</span>
            <small>days left</small>
          </div>
        </div>
        <div class="flex justify-between items-center" style="padding-top:1rem;border-top:1px solid var(--border)">
          <div class="flex gap-2 items-center">
            <span class="text-sm text-muted">{{ fmtDate(ex.date) }}</span>
            <span class="badge" :style="`background:${iColor(ex.importance)}18;color:${iColor(ex.importance)}`">{{ ex.importance }}</span>
          </div>
          <div class="flex gap-2">
            <button class="btn btn-outline btn-icon" @click="openForm(ex)"><Pencil :size="15"/></button>
            <button class="btn btn-outline btn-icon" style="color:var(--error)" @click="deleteExam(ex._id || ex.id)"><Trash2 :size="15"/></button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Plus, GraduationCap, AlertCircle, Pencil, Trash2 } from '@lucide/vue'
import { useToast } from '../composables/useToast'
import api from '../api'

const toast = useToast()
const exams = ref([])

onMounted(async () => {
  try {
    const res = await api.get('/exams')
    exams.value = res.data
  } catch (err) {
    toast.info('Failed to load exams', 3000)
  }
})

const showForm  = ref(false)
const editingId = ref(null)
const isSummarizing = ref(false)
const form = reactive({ name:'', subject:'', date:'', importance:'Medium', notes:'' })
const fe   = reactive({ name:'', subject:'', date:'' })

const today = new Date().toISOString().split('T')[0]

const sorted = computed(() =>
  exams.value
    .map(e => ({ ...e, daysLeft: Math.ceil((new Date(e.date) - new Date()) / 86400000) }))
    .sort((a,b) => a.daysLeft - b.daysLeft)
)

function iColor(imp) { 
  const lower = (imp || '').toLowerCase()
  return lower==='high'?'#cc6c6c':lower==='medium'?'#c89a6e':'#7b8a7c' 
}
function fmtDate(d)  { return new Date(d).toLocaleDateString('en-US',{ month:'short', day:'numeric', year:'numeric' }) }

function openForm(ex=null) {
  editingId.value = ex?._id || ex?.id || null
  Object.assign(form, ex ?? { name:'', subject:'', date:'', importance:'Medium', notes:'' })
  if (form.importance) form.importance = form.importance.charAt(0).toUpperCase() + form.importance.slice(1)
  Object.keys(fe).forEach(k => fe[k]='')
  showForm.value = true
}

async function summarizeNotes() {
  if (!form.notes) return
  isSummarizing.value = true
  try {
    const res = await api.post('/ai/summarize', { text: form.notes })
    form.notes = res.data.summary
    toast.success('Notes summarized by AI! ✨')
  } catch (err) {
    toast.info('Failed to summarize notes')
  } finally {
    isSummarizing.value = false
  }
}

async function submitForm() {
  Object.keys(fe).forEach(k => fe[k]='')
  let ok = true
  if (!form.name.trim())    { fe.name='Exam name is required'; ok=false }
  if (!form.subject.trim()) { fe.subject='Subject is required'; ok=false }
  if (!form.date)           { fe.date='Exam date is required'; ok=false }
  if (!ok) return

  try {
    const payload = { ...form, importance: form.importance.toLowerCase() }
    if (editingId.value) {
      const res = await api.put(`/exams/${editingId.value}`, payload)
      const idx = exams.value.findIndex(e => e._id === editingId.value || e.id === editingId.value)
      if (idx !== -1) exams.value[idx] = res.data
      toast.info('Exam updated 🎓')
    } else {
      const res = await api.post('/exams', payload)
      exams.value.push(res.data)
      toast.success('Exam added 🎓')
    }
    showForm.value = false
  } catch (err) {
    toast.info('Failed to save exam', 3000)
  }
}

async function deleteExam(id) {
  try {
    await api.delete(`/exams/${id}`)
    exams.value = exams.value.filter(e => e._id !== id && e.id !== id)
    toast.info('Exam removed 🗑️')
  } catch (err) {
    toast.info('Failed to delete exam')
  }
}
</script>

<style scoped>
.exam-card { padding:1.5rem; }
.countdown-box {
  text-align:center;padding:.6rem 1rem;border-radius:var(--r-md);
  display:flex;flex-direction:column;align-items:center;
}
.countdown-box span { font-family:'Playfair Display',serif;font-size:1.5rem;font-weight:700;line-height:1; }
.countdown-box small { font-size:.7rem;color:var(--muted); }
</style>
