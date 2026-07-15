<template>
  <div class="dashboard-wrapper">
    <!-- Header Area with dynamic animation -->
    <div class="page-header animate-fade-in">
      <p class="page-eyebrow">{{ dayLabel }}</p>
      <h1 class="page-title">
        {{ greeting }}, <span class="text-gradient">{{ firstName }}</span> 👋
      </h1>
      <p class="page-sub">Let's make today productive and achieve your goals.</p>
    </div>

    <!-- Stunning Quote Banner -->
    <div class="quote-banner animate-slide-up" style="animation-delay: 0.1s;">
      <div class="quote-content">
        <span class="quote-mark">"</span>
        <p class="quote-text">{{ quote.text }}</p>
        <p class="quote-author">— {{ quote.author }}</p>
      </div>
      <div class="quote-glow"></div>
    </div>

    <!-- Glassmorphic Stats Grid -->
    <div class="stats-grid mb-6 animate-slide-up" style="animation-delay: 0.2s;">
      <div v-for="s in stats" :key="s.label" class="stat-card">
        <div class="stat-icon-wrapper" :style="`background:${s.bg}; color:${s.color}`">
          <component :is="s.icon" :size="24" />
        </div>
        <div class="stat-info">
          <p class="stat-label">{{ s.label }}</p>
          <h3 class="stat-value" :style="`color:${s.color}`">{{ s.value }}</h3>
        </div>
      </div>
    </div>

    <!-- Bottom Three-Column Grid -->
    <div class="grid-3 animate-slide-up" style="animation-delay: 0.3s;">
      
      <!-- Gamification Card -->
      <div class="dashboard-card premium-card gamification-card">
        <div class="card-header">
          <h3><Trophy :size="22" class="icon-secondary" /> Study Level</h3>
        </div>
        <div class="level-display">
          <div class="level-ring" :style="`--xp: ${user.xp}`">
            <div class="level-circle">
              <span class="level-text">Level</span>
              <span class="level-number">{{ user.level }}</span>
            </div>
          </div>
          <p class="tasks-completed">{{ user.tasksCompleted }} tasks conquered</p>
        </div>
        <div class="xp-section">
          <div class="xp-header">
            <span>XP {{ user.xp }}</span>
            <span>100 to level {{ user.level + 1 }}</span>
          </div>
          <div class="progress-bar-premium">
            <div class="progress-fill-premium" :style="`width:${user.xp}%`"></div>
          </div>
        </div>
        <div class="stars-container">
          <Star v-for="i in Math.min(user.tasksCompleted, 5)" :key="i" :size="18" class="star-icon filled" />
          <Star v-for="i in Math.max(0, 5 - user.tasksCompleted)" :key="'e'+i" :size="18" class="star-icon empty" />
        </div>
      </div>

      <!-- Quick To-Do Card -->
      <div class="dashboard-card todo-card">
        <div class="card-header">
          <h3><Zap :size="22" class="icon-secondary" /> Quick To-Do</h3>
        </div>
        <form class="todo-form" @submit.prevent="addTodo">
          <input v-model="todoInput" type="text" class="form-input premium-input" placeholder="Add a quick task…" />
          <button type="submit" class="btn btn-primary btn-add"><Plus :size="18" /></button>
        </form>
        <ul class="todo-list">
          <li v-if="!todos.length" class="empty-state">All caught up! 🎉</li>
          <TodoItem 
            v-for="t in todos" 
            :key="t.id" 
            :todo="t" 
            @toggle="toggleTodo" 
            @delete="deleteTodo" 
          />
        </ul>
      </div>

      <!-- Approaching Exams Card -->
      <div class="dashboard-card exams-card">
        <div class="card-header">
          <h3><CalendarDays :size="22" class="icon-secondary" /> Upcoming Exams</h3>
        </div>
        <div v-if="!upcomingExams.length" class="empty-state">
          <div class="empty-icon-wrap">🌿</div>
          <p>No exams coming up.</p>
        </div>
        <ul v-else class="exam-list">
          <li v-for="ex in upcomingExams" :key="ex.id" class="exam-chip" :class="{ 'urgent': ex.daysLeft <= 7 }">
            <div class="exam-info">
              <p class="exam-name">{{ ex.name }}</p>
              <p class="exam-subject">{{ ex.subject }}</p>
            </div>
            <div class="exam-countdown">
              <span class="days-number">{{ ex.daysLeft }}</span>
              <span class="days-label">days</span>
            </div>
          </li>
        </ul>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { CheckCircle2, BookOpen, Target, CalendarDays, Trophy, Zap, Star, Plus, X } from '@lucide/vue'
import TodoItem from '../components/TodoItem.vue'
import { userStore as user } from '../stores/userStore'
import { useToast } from '../composables/useToast'
import api from '../api'

const toast = useToast()

const QUOTES = [
  { text:"The secret of getting ahead is getting started.", author:"Mark Twain" },
  { text:"A reader lives a thousand lives before he dies.", author:"George R.R. Martin" },
  { text:"Live as if you were to die tomorrow. Learn as if you were to live forever.", author:"Mahatma Gandhi" },
  { text:"The beautiful thing about learning is no one can take it from you.", author:"B.B. King" },
  { text:"An investment in knowledge pays the best interest.", author:"Benjamin Franklin" },
  { text:"Success is not final, failure is not fatal: it is the courage to continue that counts.", author:"Winston Churchill" }
]
const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)]

const currentTime = ref(new Date())
let ticker

const tasks = ref([])
const exams = ref([])
const todos = ref([])

onMounted(async () => {
  ticker = setInterval(() => { currentTime.value = new Date() }, 1000)
  
  try {
    const tasksRes = await api.get('/tasks')
    tasks.value = tasksRes.data
    
    const examsRes = await api.get('/exams')
    exams.value = examsRes.data
    
    // Quick todos might still use localStorage or be a separate model
    todos.value = JSON.parse(localStorage.getItem('study_planner_todos') || '[]')
  } catch (err) {
    console.error('Failed to load dashboard data')
  }

  // Periodic reminder every 10 min
  setInterval(() => {
    const pending = tasks.value.filter(t => t.status === 'pending')
    if (pending.length) toast.info(`📋 You have ${pending.length} pending tasks!`, 4000)
  }, 600000)
})
onUnmounted(() => clearInterval(ticker))

const authUser = JSON.parse(localStorage.getItem('study_planner_user') || '{}')
const firstName = computed(() => authUser.name?.split(' ')[0] || 'Scholar')
const greeting = computed(() => {
  const h = currentTime.value.getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
})
const dayLabel = computed(() => currentTime.value.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' }))

const today = new Date().toISOString().split('T')[0]
const todayCount = computed(() => tasks.value.filter(t => t.deadline === today).length)
const doneCount  = computed(() => tasks.value.filter(t => t.status === 'completed').length)
const progress   = computed(() => tasks.value.length ? Math.round(doneCount.value / tasks.value.length * 100) : 0)

const upcomingExams = computed(() =>
  exams.value
    .filter(e => e.date >= today)
    .map(e => ({ ...e, daysLeft: Math.ceil((new Date(e.date) - new Date()) / 86400000) }))
    .sort((a,b) => a.daysLeft - b.daysLeft).slice(0, 3)
)

const stats = computed(() => [
  { label:'Overall Progress', value: `${progress.value}%`, icon: CheckCircle2, color:'var(--primary)', bg:'rgba(123,138,124,.15)' },
  { label:"Today's Tasks",    value: todayCount.value,      icon: Target,       color:'#d4a373', bg:'rgba(212,163,115,.15)' },
  { label:'Upcoming Exams',   value: upcomingExams.value.length, icon: CalendarDays, color:'#b5838d', bg:'rgba(181,131,141,.15)' },
  { label:'Total Done',       value: doneCount.value,       icon: BookOpen,     color:'#6d6875', bg:'rgba(109,104,117,.15)' },
])

// Todos
const todoInput = ref('')
const saveTodos = () => localStorage.setItem('study_planner_todos', JSON.stringify(todos.value))

function addTodo() {
  if (!todoInput.value.trim()) return
  todos.value.unshift({ id: Date.now(), text: todoInput.value.trim(), done: false })
  todoInput.value = ''
  saveTodos()
}
function toggleTodo(id) {
  const t = todos.value.find(x => x.id === id)
  if (t) { t.done = !t.done; saveTodos() }
}
function deleteTodo(id) {
  todos.value = todos.value.filter(x => x.id !== id)
  saveTodos()
}

</script>

<style scoped>
/* Animations */
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes pulseGlow { 0% { opacity: 0.4; transform: scale(1); } 50% { opacity: 0.7; transform: scale(1.05); } 100% { opacity: 0.4; transform: scale(1); } }
@keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-5px); } 100% { transform: translateY(0px); } }

.animate-fade-in { animation: fadeIn 0.6s ease forwards; }
.animate-slide-up { opacity: 0; animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

.dashboard-wrapper {
  max-width: 1100px;
  padding-bottom: 3rem;
  margin: 0 auto;
}

/* Header */
.page-header { margin-bottom: 2.5rem; }
.page-eyebrow {
  font-size: 0.85rem; color: var(--muted); text-transform: uppercase;
  letter-spacing: 0.1em; margin-bottom: 0.5rem; font-weight: 600;
}
.page-title { font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--text); }
.text-gradient {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}
.page-sub { font-size: 1.05rem; color: var(--muted); }

/* Quote Banner */
.quote-banner {
  position: relative; overflow: hidden;
  background: linear-gradient(135deg, #2b302c, #4a544d);
  border-radius: 1.5rem; padding: 2.5rem 3rem; margin-bottom: 2.5rem;
  box-shadow: 0 15px 35px rgba(43,48,44,0.15);
  color: #fff; display: flex; align-items: center; justify-content: space-between;
}
.quote-content { position: relative; z-index: 2; max-width: 80%; }
.quote-mark {
  position: absolute; top: -1.5rem; left: -1.5rem;
  font-size: 8rem; opacity: 0.1; font-family: 'Playfair Display', serif;
  line-height: 1; color: var(--secondary);
}
.quote-text {
  font-family: 'Playfair Display', serif; font-size: 1.5rem; font-style: italic;
  margin-bottom: 0.75rem; line-height: 1.4; text-shadow: 0 2px 4px rgba(0,0,0,0.2);
}
.quote-author { font-size: 0.9rem; letter-spacing: 0.05em; text-transform: uppercase; color: rgba(255,255,255,0.8); }
.quote-glow {
  position: absolute; right: -10%; top: -50%;
  width: 300px; height: 300px; border-radius: 50%;
  background: radial-gradient(circle, rgba(191,165,136,0.3) 0%, transparent 70%);
  animation: pulseGlow 6s infinite ease-in-out; z-index: 1;
}

/* Stats Grid */
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; }
.stat-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 1.25rem; padding: 1.5rem;
  display: flex; align-items: center; gap: 1rem;
  box-shadow: 0 4px 15px rgba(0,0,0,0.02);
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease;
}
.stat-card:hover { transform: translateY(-5px); box-shadow: 0 12px 25px rgba(0,0,0,0.05); }
.stat-icon-wrapper {
  width: 56px; height: 56px; border-radius: 1rem;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; transition: transform 0.3s ease;
}
.stat-card:hover .stat-icon-wrapper { transform: scale(1.1) rotate(5deg); }
.stat-info { display: flex; flex-direction: column; }
.stat-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted); margin-bottom: 0.25rem; font-weight: 600; }
.stat-value { font-size: 1.8rem; font-weight: 700; margin: 0; line-height: 1; }

/* Dashboard Cards Common */
.dashboard-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 1.5rem; padding: 1.75rem;
  box-shadow: 0 8px 24px rgba(0,0,0,0.03);
  display: flex; flex-direction: column;
  transition: box-shadow 0.3s ease;
}
.dashboard-card:hover { box-shadow: 0 12px 32px rgba(0,0,0,0.06); }
.card-header { margin-bottom: 1.5rem; }
.card-header h3 { display: flex; align-items: center; gap: 0.6rem; font-size: 1.25rem; font-weight: 600; margin: 0; }
.icon-secondary { color: var(--secondary); }
.empty-state {
  flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
  color: var(--muted); font-size: 0.95rem; text-align: center; padding: 2rem 0;
}

/* Gamification Card */
.gamification-card { background: linear-gradient(160deg, #ffffff, #fdfaf6); position: relative; overflow: hidden; }
.gamification-card::before {
  content: ''; position: absolute; top: 0; right: 0; width: 150px; height: 150px;
  background: radial-gradient(circle, rgba(123,138,124,0.08) 0%, transparent 70%);
  border-radius: 50%; transform: translate(30%, -30%);
}
.level-display { text-align: center; margin-bottom: 1.5rem; position: relative; z-index: 2; }
.level-ring {
  display: inline-block; padding: 6px; border-radius: 50%;
  background: conic-gradient(var(--secondary) calc(var(--xp, 0) * 1%), var(--border) 0);
  margin-bottom: 0.75rem; animation: float 4s infinite ease-in-out;
}
.level-circle {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  width: 90px; height: 90px; border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), #5a665b);
  color: #fff; box-shadow: 0 8px 16px rgba(123,138,124,0.3);
}
.level-text { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.9; margin-bottom: -2px; }
.level-number { font-size: 2.5rem; font-weight: 700; line-height: 1; font-family: 'Playfair Display', serif; }
.tasks-completed { font-size: 0.9rem; color: var(--muted); font-weight: 500; }
.xp-section { margin-bottom: 1.25rem; }
.xp-header { display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--muted); font-weight: 600; margin-bottom: 0.5rem; }
.progress-bar-premium { height: 10px; background: var(--border); border-radius: 999px; overflow: hidden; box-shadow: inset 0 1px 3px rgba(0,0,0,0.1); }
.progress-fill-premium { height: 100%; border-radius: 999px; background: linear-gradient(90deg, var(--secondary), var(--primary)); transition: width 1s cubic-bezier(0.4, 0, 0.2, 1); }
.stars-container { display: flex; justify-content: center; gap: 0.4rem; }
.star-icon { transition: transform 0.3s; }
.star-icon.filled { color: var(--secondary); fill: var(--secondary); filter: drop-shadow(0 2px 4px rgba(191,165,136,0.4)); }
.star-icon.empty { color: var(--border); fill: var(--border); }
.gamification-card:hover .star-icon.filled { transform: scale(1.1) rotate(15deg); }

/* To-Do Card */
.todo-form { display: flex; gap: 0.5rem; margin-bottom: 1.25rem; }
.premium-input { border-radius: 1rem; padding: 0.75rem 1rem; font-size: 0.9rem; background: #fdfdfd; border: 1px solid #eaeaea; width: 100%; color: var(--text); outline: none; transition: all 0.2s; }
.premium-input:focus { background: #fff; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(123,138,124,0.1); }
.btn-add { border-radius: 1rem; width: 42px; height: 42px; padding: 0; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.todo-list { list-style: none; display: flex; flex-direction: column; gap: 0.5rem; max-height: 240px; overflow-y: auto; padding-right: 0.5rem; }
/* Scrollbar */
.todo-list::-webkit-scrollbar { width: 4px; }
.todo-list::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

/* Exams Card */
.exams-card { background: linear-gradient(to bottom, #ffffff, #fafbfb); }
.empty-icon-wrap { font-size: 2.5rem; margin-bottom: 0.5rem; filter: grayscale(0.5); opacity: 0.5; }
.exam-list { list-style: none; display: flex; flex-direction: column; gap: 0.75rem; }
.exam-chip {
  display: flex; justify-content: space-between; align-items: center;
  padding: 1rem 1.25rem; background: #fff; border-radius: 1rem;
  border-left: 4px solid var(--secondary); box-shadow: 0 2px 10px rgba(0,0,0,0.02);
  transition: transform 0.2s, box-shadow 0.2s;
}
.exam-chip:hover { transform: translateX(5px); box-shadow: 0 4px 15px rgba(0,0,0,0.04); }
.exam-chip.urgent { border-left-color: var(--error); background: rgba(204,108,108,0.02); }
.exam-info { display: flex; flex-direction: column; gap: 0.2rem; }
.exam-name { font-weight: 600; font-size: 0.95rem; margin: 0; color: var(--text); }
.exam-subject { font-size: 0.8rem; color: var(--muted); margin: 0; }
.exam-countdown { display: flex; flex-direction: column; align-items: flex-end; justify-content: center; }
.days-number { font-size: 1.5rem; font-weight: 700; line-height: 1; color: var(--primary); font-family: 'Playfair Display', serif; }
.urgent .days-number { color: var(--error); }
.days-label { font-size: 0.65rem; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em; color: var(--muted); }
.urgent .days-label { color: rgba(204,108,108,0.8); }

@media (max-width: 900px) {
  .grid-3 { grid-template-columns: 1fr; }
  .quote-banner { flex-direction: column; text-align: center; gap: 1rem; padding: 2rem; }
  .quote-mark { left: 50%; transform: translateX(-50%); top: -1rem; }
  .quote-content { max-width: 100%; }
}
</style>
