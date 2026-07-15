<template>
  <div style="max-width:900px;padding-bottom:3rem">
    <div class="flex justify-between items-center page-header">
      <div>
        <p class="page-eyebrow">Study Planner</p>
        <h1 class="page-title">Task Manager</h1>
        <p class="page-sub">Complete tasks to earn XP and level up 🏆</p>
      </div>
      <button class="btn btn-primary" @click="openForm()">
        <Plus :size="18" /> Add Task
      </button>
    </div>

    <!-- Toolbar -->
    <div class="flex gap-3 items-center mb-6" style="flex-wrap:wrap">
      <div style="position:relative;flex:1;min-width:200px">
        <Search :size="16" style="position:absolute;left:1rem;top:50%;transform:translateY(-50%);color:var(--muted)" />
        <input v-model="search" type="text" class="form-input" placeholder="Search tasks…" style="padding-left:2.75rem" />
      </div>
      <div class="flex gap-2">
        <button v-for="f in filters" :key="f.val" class="btn" :class="activeFilter===f.val?'btn-primary':'btn-outline'" @click="activeFilter=f.val">{{ f.label }}</button>
      </div>
    </div>

    <!-- Form -->
    <div v-if="showForm" class="dashed-card">
      <h3 class="mb-4">{{ editingId ? 'Edit Task' : 'New Task' }}</h3>
      <form @submit.prevent="submitForm" class="grid-2">
        <div class="form-group">
          <label class="form-label">Task Title</label>
          <input v-model="form.title" type="text" class="form-input" :class="{error:fe.title}" placeholder="Chapter 5 Review" @input="fe.title=''" />
          <p v-if="fe.title" class="form-error">⚠ {{ fe.title }}</p>
        </div>
        <div class="form-group">
          <label class="form-label">Subject</label>
          <input v-model="form.subject" type="text" class="form-input" :class="{error:fe.subject}" placeholder="Mathematics" @input="fe.subject=''" />
          <p v-if="fe.subject" class="form-error">⚠ {{ fe.subject }}</p>
        </div>
        <div class="form-group" style="grid-column:span 2">
          <label class="form-label">Description</label>
          <textarea v-model="form.description" class="form-input" rows="2" placeholder="Any notes…"></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Deadline</label>
          <input v-model="form.deadline" type="date" class="form-input" :class="{error:fe.deadline}" @input="fe.deadline=''" />
          <p v-if="fe.deadline" class="form-error">⚠ {{ fe.deadline }}</p>
        </div>
        <div class="form-group">
          <label class="form-label">Priority</label>
          <select v-model="form.priority" class="form-input">
            <option>Low</option><option>Medium</option><option>High</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Est. Time (mins)</label>
          <input v-model="form.estimatedTime" type="number" class="form-input" placeholder="60" />
        </div>
        <div class="flex gap-3 justify-end items-end">
          <button type="button" class="btn btn-outline" @click="showForm=false">Cancel</button>
          <button type="submit" class="btn btn-primary">Save Task</button>
        </div>
      </form>
    </div>

    <!-- Task List -->
    <div style="display:flex;flex-direction:column;gap:.75rem">
      <div v-if="!filtered.length" class="card" style="text-align:center;padding:4rem 2rem;color:var(--muted)">
        <BookOpen :size="48" style="margin:0 auto 1rem;opacity:.25" />
        <p>No tasks found. Add your first goal! 📚</p>
      </div>

      <TransitionGroup name="list">
        <div v-for="task in filtered" :key="task.id" class="card task-row"
          :style="`border-left:4px solid ${pColor(task.priority)};opacity:${task.status==='completed' ? 0.65 : 1}`">
          <button class="check-btn" @click="toggleTask(task.id)" :style="`color:${task.status==='completed'?'var(--primary)':'var(--border)'}`">
            <CheckCircle v-if="task.status==='completed'" :size="26" />
            <Circle v-else :size="26" />
          </button>
          <div style="flex:1">
            <h4 :style="task.status==='completed'?'text-decoration:line-through;':''">{{ task.title }}</h4>
            <div class="flex gap-3 text-sm text-muted mt-1" style="flex-wrap:wrap">
              <span style="font-weight:600">{{ task.subject }}</span>
              <span v-if="task.deadline">📅 {{ task.deadline }}</span>
              <span v-if="task.estimatedTime">⏱ {{ task.estimatedTime }} min</span>
            </div>
          </div>
          <span class="badge" :style="`background:${pBg(task.priority)};color:${pColor(task.priority)}`">{{ task.priority }}</span>
          <div class="flex gap-2">
            <button class="btn btn-outline btn-icon" @click="openForm(task)"><Pencil :size="15" /></button>
            <button class="btn btn-outline btn-icon" style="color:var(--error)" @click="deleteTask(task.id)"><Trash2 :size="15" /></button>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Plus, Search, BookOpen, CheckCircle, Circle, Pencil, Trash2 } from '@lucide/vue'
import { userStore as user } from '../stores/userStore'
import { useToast } from '../composables/useToast'
import confetti from 'canvas-confetti'
import api from '../api'

const toast = useToast()
const tasks = ref([])

onMounted(async () => {
  try {
    const res = await api.get('/tasks')
    tasks.value = res.data
  } catch (err) {
    toast.info('Failed to fetch tasks', 3000)
  }
})

const search      = ref('')
const activeFilter = ref('all')
const showForm    = ref(false)
const editingId   = ref(null)
const form = reactive({ title:'', subject:'', description:'', priority:'Medium', deadline:'', estimatedTime:'', status:'pending' })
const fe   = reactive({ title:'', subject:'', deadline:'' })

const filters = [
  { val:'all', label:'All' },
  { val:'pending', label:'Pending' },
  { val:'completed', label:'Done' },
  { val:'high', label:'Urgent' },
]

const filtered = computed(() =>
  tasks.value.filter(t => {
    const s = t.title.toLowerCase().includes(search.value.toLowerCase()) || t.subject.toLowerCase().includes(search.value.toLowerCase())
    if (!s) return false
    // Handle priority capitalization differences
    const tp = (t.priority || '').toLowerCase()
    
    if (activeFilter.value === 'pending')   return t.status === 'pending'
    if (activeFilter.value === 'completed') return t.status === 'completed'
    if (activeFilter.value === 'high')      return tp === 'high'
    return true
  })
)

function pColor(p) { 
  const lower = (p || '').toLowerCase()
  return lower==='high'?'#cc6c6c':lower==='medium'?'#c89a6e':'#7b8a7c' 
}
function pBg(p) { 
  const lower = (p || '').toLowerCase()
  return lower==='high'?'rgba(204,108,108,.12)':lower==='medium'?'rgba(200,154,110,.12)':'rgba(123,138,124,.12)' 
}

function openForm(task=null) {
  editingId.value = task?._id || task?.id || null
  Object.assign(form, task ?? { title:'', subject:'', description:'', priority:'medium', deadline:'', estimatedTime:'', status:'pending' })
  // Fix capitalization of priority
  if (form.priority) form.priority = form.priority.charAt(0).toUpperCase() + form.priority.slice(1)
  
  Object.keys(fe).forEach(k => fe[k] = '')
  showForm.value = true
}

async function submitForm() {
  fe.title = fe.subject = fe.deadline = ''
  let ok = true
  if (!form.title.trim())   { fe.title='Task title is required'; ok=false }
  if (!form.subject.trim()) { fe.subject='Subject is required'; ok=false }
  if (!form.deadline)       { fe.deadline='Deadline is required'; ok=false }
  if (!ok) return

  try {
    // lowercase priority for backend
    const payload = { ...form, priority: form.priority.toLowerCase() }
    
    if (editingId.value) {
      const res = await api.put(`/tasks/${editingId.value}`, payload)
      const idx = tasks.value.findIndex(t => t._id === editingId.value || t.id === editingId.value)
      if (idx !== -1) tasks.value[idx] = res.data
      toast.info('Task updated ✏️')
    } else {
      const res = await api.post('/tasks', payload)
      tasks.value.unshift(res.data)
      toast.success('Task added 📋')
    }
    showForm.value = false
  } catch (err) {
    toast.info('Failed to save task', 3000)
  }
}

async function toggleTask(id) {
  const t = tasks.value.find(x => x._id === id || x.id === id)
  if (!t) return
  
  const newStatus = t.status === 'pending' ? 'completed' : 'pending'
  try {
    const res = await api.put(`/tasks/${id}`, { ...t, status: newStatus })
    t.status = newStatus
    
    if (t.status === 'completed') {
      user.addXP(20)
      confetti({ particleCount:80, spread:55, origin:{ y:.7 }, colors:['#7b8a7c','#bfa588','#c89a6e'] })
      toast.success('🎉 +20 XP — Task completed!')
    }
  } catch (err) {
    toast.info('Failed to update task status')
  }
}

async function deleteTask(id) {
  try {
    await api.delete(`/tasks/${id}`)
    tasks.value = tasks.value.filter(t => t._id !== id && t.id !== id)
    toast.info('Task removed 🗑️')
  } catch (err) {
    toast.info('Failed to delete task')
  }
}
</script>

<style scoped>
.task-row { display:flex; align-items:center; gap:1.25rem; padding:1.25rem 1.5rem; }
.check-btn { flex-shrink:0; transition: color .2s; }
.list-enter-active, .list-leave-active { transition: all .25s ease; }
.list-enter-from { opacity:0; transform:translateY(-6px); }
.list-leave-to   { opacity:0; transform:translateX(12px); }
</style>
