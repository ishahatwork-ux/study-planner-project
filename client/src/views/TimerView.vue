<template>
  <div style="max-width:900px;padding-bottom:3rem">
    <!-- Header -->
    <div class="flex justify-between items-center page-header">
      <div>
        <p class="page-eyebrow">Focus</p>
        <h1 class="page-title">Pomodoro Timer</h1>
        <p class="page-sub">Stay focused — short bursts beat long marathons.</p>
      </div>
    </div>

    <div class="card" style="padding:3rem 2rem;display:flex;flex-direction:column;align-items:center;background:linear-gradient(145deg,#fdfaf6,#f5ede0)">

      <!-- Mode Tabs -->
      <div class="flex gap-2 mb-8 mode-tabs">
        <button v-for="m in modes" :key="m.key"
          @click="timer.changeMode(m.key)"
          :class="['mode-btn', timer.mode===m.key && 'active']"
          :style="timer.mode===m.key ? `color:${m.color}` : ''">
          {{ m.emoji }} {{ m.label }}
        </button>
      </div>

      <!-- Circular Ring -->
      <div style="position:relative;margin-bottom:2.5rem">
        <svg width="260" height="260" viewBox="0 0 260 260">
          <circle cx="130" cy="130" r="110" fill="none" stroke="var(--border)" stroke-width="9"/>
          <circle cx="130" cy="130" r="110" fill="none"
            :stroke="activeMode.color" stroke-width="9"
            stroke-linecap="round"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="offset"
            transform="rotate(-90 130 130)"
            style="transition:stroke-dashoffset 1s linear"
          />
        </svg>
        <div class="ring-center">
          <span class="ring-time">{{ timer.formatted }}</span>
          <span class="ring-label">{{ activeMode.label }}</span>
        </div>
      </div>

      <!-- Controls -->
      <div class="flex gap-3">
        <button class="btn btn-primary" style="padding:1rem 2.5rem;font-size:1rem;border-radius:var(--r-full);min-width:140px"
          @click="handleToggle">
          <component :is="timer.isActive ? PauseIcon : PlayIcon" :size="20" />
          {{ timer.isActive ? 'Pause' : 'Start' }}
        </button>
        <button class="btn btn-outline" style="padding:1rem;border-radius:var(--r-full)" title="Reset" @click="handleReset">
          <RotateCcw :size="20" />
        </button>
        <button class="btn btn-outline" style="padding:1rem;border-radius:var(--r-full)" title="Settings" @click="showSettings=!showSettings">
          <Settings :size="20" />
        </button>
      </div>

      <!-- Settings Panel -->
      <Transition name="panel">
        <div v-if="showSettings" class="settings-panel">
          <div class="flex justify-between items-center mb-4">
            <h3 style="margin:0">Timer Settings</h3>
            <button @click="showSettings=false" style="color:var(--muted)"><X :size="20"/></button>
          </div>
          <form @submit.prevent="saveSettings" class="grid-3">
            <div v-for="[key, label] in settingFields" :key="key" class="form-group">
              <label class="form-label">{{ label }}</label>
              <input v-model.number="localSettings[key]" type="number" min="1" max="120" class="form-input" />
            </div>
            <div style="grid-column:span 3;display:flex;justify-content:flex-end">
              <button type="submit" class="btn btn-primary">Save</button>
            </div>
          </form>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { Play as PlayIcon, Pause as PauseIcon, RotateCcw, Settings, X } from '@lucide/vue'
import { timerStore as timer } from '../stores/timerStore'
import { useToast } from '../composables/useToast'

const toast = useToast()
const showSettings = ref(false)
const localSettings = reactive({ ...timer.settings })
const settingFields = [
  ['study',      'Study (min)'],
  ['shortBreak', 'Short Break (min)'],
  ['longBreak',  'Long Break (min)'],
]

const modes = [
  { key:'study',      label:'Study Time',   emoji:'📚', color:'var(--primary)' },
  { key:'shortBreak', label:'Short Break',  emoji:'☕', color:'var(--secondary)' },
  { key:'longBreak',  label:'Long Break',   emoji:'🌿', color:'#9b7ea6' },
]

const activeMode = computed(() => modes.find(m => m.key === timer.mode))
const circumference = 2 * Math.PI * 110
const total  = computed(() => timer.settings[timer.mode] * 60)
const offset = computed(() => circumference - (((total.value - timer.timeLeft) / total.value) * circumference))

function handleToggle() {
  timer.toggle()
  if (timer.isActive) toast.info(`${activeMode.value.emoji} ${activeMode.value.label} started!`)
}
function handleReset() { timer.reset(); toast.info('Timer reset 🔄') }
function saveSettings() {
  timer.applySettings({ ...localSettings })
  showSettings.value = false
  toast.success('Timer settings saved ⏱️')
}
</script>

<style scoped>
.mode-tabs {
  background:rgba(255,255,255,.7);backdrop-filter:blur(8px);
  border:1px solid var(--border);border-radius:var(--r-full);padding:.5rem;
}
.mode-btn {
  padding:.6rem 1.25rem;border-radius:var(--r-full);font-weight:600;font-size:.85rem;
  color:var(--muted);transition:all var(--ease);
}
.mode-btn.active { background:var(--surface);box-shadow:var(--shadow-sm); }

.ring-center {
  position:absolute;inset:0;display:flex;flex-direction:column;
  align-items:center;justify-content:center;
}
.ring-time {
  font-family:'Playfair Display',serif;font-size:3.5rem;font-weight:700;
  color:var(--text);line-height:1;
}
.ring-label { font-size:.85rem;color:var(--muted);margin-top:.4rem; }

.settings-panel {
  width:100%;border-top:1px solid var(--border);margin-top:2rem;padding-top:2rem;
}
.panel-enter-active, .panel-leave-active { transition:all .25s ease; }
.panel-enter-from, .panel-leave-to { opacity:0;transform:translateY(-8px); }
</style>
