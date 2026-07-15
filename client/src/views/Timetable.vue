<template>
  <div style="max-width:1100px;padding-bottom:3rem">
    <div class="flex justify-between items-center page-header">
      <div>
        <p class="page-eyebrow">Planning</p>
        <h1 class="page-title">Weekly Timetable</h1>
        <p class="page-sub">Map out your study sessions for the week.</p>
      </div>
      <button class="btn btn-primary" @click="openForm()"><Plus :size="18"/> Add Session</button>
    </div>

    <!-- Form -->
    <div v-if="showForm" class="dashed-card">
      <h3 class="mb-4">{{ editingId ? 'Edit Session' : 'New Study Session' }}</h3>
      <form @submit.prevent="submitForm" class="grid-2">
        <div class="form-group">
          <label class="form-label">Subject</label>
          <input v-model="form.subject" type="text" class="form-input" :class="{error:fe.subject}" placeholder="Mathematics" @input="fe.subject=''" />
          <p v-if="fe.subject" class="form-error">⚠ {{ fe.subject }}</p>
        </div>
        <div class="form-group">
          <label class="form-label">Day</label>
          <select v-model="form.day" class="form-input">
            <option v-for="d in DAYS" :key="d">{{ d }}</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Start Time</label>
          <input v-model="form.startTime" type="time" class="form-input" :class="{error:fe.startTime}" @input="fe.startTime=''" />
          <p v-if="fe.startTime" class="form-error">⚠ {{ fe.startTime }}</p>
        </div>
        <div class="form-group">
          <label class="form-label">End Time</label>
          <input v-model="form.endTime" type="time" class="form-input" :class="{error:fe.endTime}" @input="fe.endTime=''" />
          <p v-if="fe.endTime" class="form-error">⚠ {{ fe.endTime }}</p>
        </div>
        <div class="form-group" style="grid-column:span 2">
          <label class="form-label">Color Tag</label>
          <div class="flex gap-2 mt-1">
            <button v-for="c in COLORS" :key="c" type="button" class="color-swatch"
              :style="`background:${c};border:${form.color===c?'3px solid var(--text)':'2px solid transparent'}`"
              @click="form.color=c" />
          </div>
        </div>
        <div class="flex gap-3 justify-end" style="grid-column:span 2">
          <button type="button" class="btn btn-outline" @click="showForm=false">Cancel</button>
          <button type="submit" class="btn btn-primary">Save Session</button>
        </div>
      </form>
    </div>

    <!-- 7-column grid -->
    <div class="week-grid">
      <div v-for="day in DAYS" :key="day" class="day-col">
        <div class="day-header">{{ day.slice(0,3) }}</div>
        <div class="day-body">
          <p v-if="!sessionsByDay(day).length" class="no-session">
            <Calendar :size="18" />
          </p>
          <div v-for="s in sessionsByDay(day)" :key="s.id" class="session-chip"
            :style="`border-left:3px solid ${s.color};background:${s.color}18`">
            <p class="session-subject">{{ s.subject }}</p>
            <p class="session-time">{{ s.startTime }}–{{ s.endTime }}</p>
            <div class="session-actions">
              <button @click="openForm(s)" style="color:var(--muted)"><Pencil :size="11"/></button>
              <button @click="deleteSession(s.id)" style="color:var(--error)"><Trash2 :size="11"/></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Plus, Calendar, Pencil, Trash2 } from '@lucide/vue'
import { useToast } from '../composables/useToast'
import api from '../api'

const toast = useToast()
const DAYS   = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
const COLORS = ['#7b8a7c','#bfa588','#c89a6e','#cc6c6c','#9b7ea6','#6a8faf','#b5a36e']

const sessions = ref([])

onMounted(async () => {
  try {
    const res = await api.get('/timetable')
    sessions.value = res.data
  } catch (err) {
    toast.info('Failed to load timetable', 3000)
  }
})

const showForm  = ref(false)
const editingId = ref(null)
const form = reactive({ subject:'', day:'Monday', startTime:'09:00', endTime:'10:00', color:'#7b8a7c' })
const fe   = reactive({ subject:'', startTime:'', endTime:'' })

function sessionsByDay(day) {
  return sessions.value.filter(s => s.day === day).sort((a,b) => a.startTime.localeCompare(b.startTime))
}
function openForm(s=null) {
  editingId.value = s?._id || s?.id || null
  Object.assign(form, s ?? { subject:'', day:'Monday', startTime:'09:00', endTime:'10:00', color:'#7b8a7c' })
  Object.keys(fe).forEach(k => fe[k]='')
  showForm.value = true
}

async function submitForm() {
  Object.keys(fe).forEach(k => fe[k]='')
  let ok = true
  if (!form.subject.trim()) { fe.subject='Subject is required'; ok=false }
  if (!form.startTime) { fe.startTime='Start time required'; ok=false }
  if (!form.endTime)   { fe.endTime='End time required'; ok=false }
  else if (form.startTime && form.endTime && form.startTime >= form.endTime) { fe.endTime='End time must be after start time'; ok=false }
  if (!ok) return

  try {
    if (editingId.value) {
      const res = await api.put(`/timetable/${editingId.value}`, form)
      const idx = sessions.value.findIndex(s => s._id === editingId.value || s.id === editingId.value)
      if (idx !== -1) sessions.value[idx] = res.data
      toast.info('Session updated 📅')
    } else {
      const res = await api.post('/timetable', form)
      sessions.value.push(res.data)
      toast.success('Session added 📅')
    }
    showForm.value = false
  } catch (err) {
    toast.info('Failed to save session', 3000)
  }
}

async function deleteSession(id) {
  try {
    await api.delete(`/timetable/${id}`)
    sessions.value = sessions.value.filter(s => s._id !== id && s.id !== id)
    toast.info('Session removed 🗑️')
  } catch (err) {
    toast.info('Failed to delete session')
  }
}
</script>

<style scoped>
.week-grid { display:grid; grid-template-columns:repeat(7,1fr); gap:1rem; overflow-x:auto; }
.day-col { min-width:120px; }
.day-header {
  padding:.65rem; text-align:center; font-weight:600; font-size:.75rem;
  text-transform:uppercase; letter-spacing:.06em; color:var(--muted);
  margin-bottom:.65rem; border-bottom:2px solid var(--border);
}
.day-body { display:flex; flex-direction:column; gap:.45rem; min-height:180px; }
.no-session { text-align:center; padding:1.5rem 0; color:var(--border); }
.session-chip { padding:.7rem; border-radius:var(--r-sm); position:relative; }
.session-subject { font-weight:600; font-size:.78rem; margin:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.session-time    { font-size:.68rem; color:var(--muted); margin:.2rem 0 0; }
.session-actions { display:flex; gap:.25rem; margin-top:.4rem; }
.color-swatch    { width:28px; height:28px; border-radius:50%; cursor:pointer; transition:border var(--ease); }
</style>
