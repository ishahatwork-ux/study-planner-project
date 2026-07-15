<template>
  <aside class="sidebar">
    <!-- Brand -->
    <div class="sidebar-brand">
      <div class="flex items-center gap-2">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
        </svg>
        <h2>StudySyncAI</h2>
      </div>
      <p style="padding-left:1.85rem">your learning companion</p>
    </div>

    <!-- Nav -->
    <nav class="sidebar-nav">
      <RouterLink v-for="item in navItems" :key="item.path" :to="item.path"
        class="nav-item"
        :end="item.exact">
        <component :is="item.icon" :size="18" />
        {{ item.label }}
      </RouterLink>
    </nav>

    <!-- Live timer chip -->
    <div v-if="timer.isActive" class="sidebar-timer-chip">
      <p>{{ timer.mode === 'study' ? '📚 Studying' : '☕ Break' }}</p>
      <span>{{ timer.formatted }}</span>
    </div>

    <!-- Logout -->
    <button class="sidebar-logout" @click="logout">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
        <polyline points="16 17 21 12 16 7"/>
        <line x1="21" y1="12" x2="9" y2="12"/>
      </svg>
      Logout
    </button>
  </aside>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { timerStore as timer } from '../stores/timerStore'
import {
  LayoutDashboard, CheckSquare, Calendar, Clock, GraduationCap, Users, Sparkles
} from '@lucide/vue'

const router = useRouter()

const navItems = [
  { path: '/',            label: 'My Desk',      icon: LayoutDashboard, exact: true },
  { path: '/tasks',       label: 'Tasks',         icon: CheckSquare },
  { path: '/timetable',   label: 'Timetable',     icon: Calendar },
  { path: '/timer',       label: 'Study Timer',   icon: Clock },
  { path: '/exams',       label: 'Exams',         icon: GraduationCap },
  { path: '/group-study', label: 'Group Study',   icon: Users },
  { path: '/ai-notes',    label: 'AI Notes',      icon: Sparkles },
]

function logout() {
  localStorage.removeItem('study_planner_user')
  window.__setAuth?.(false)
  router.push('/login')
}
</script>
