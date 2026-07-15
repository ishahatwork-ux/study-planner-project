<template>
  <div class="toast-container">
    <TransitionGroup name="toast-anim">
      <div
        v-for="t in toasts"
        :key="t.id"
        class="toast"
        :class="t.type"
      >
        <span>
          {{ t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : 'ℹ️' }}
        </span>
        <span style="flex:1">{{ t.message }}</span>
        <button @click="remove(t.id)" style="color:var(--muted);font-size:1.1rem;line-height:1">×</button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { useToast } from '../composables/useToast'
const { toasts, remove } = useToast()
</script>

<style scoped>
.toast-anim-enter-active, .toast-anim-leave-active { transition: all 0.25s ease; }
.toast-anim-enter-from { opacity:0; transform:translateX(24px); }
.toast-anim-leave-to  { opacity:0; transform:translateX(24px); }
</style>
