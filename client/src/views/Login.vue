<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-brand">
        <div class="flex justify-center items-center gap-2" style="margin-bottom:0.5rem">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
        </div>
        <h1>Welcome back</h1>
        <p>Settle in and continue your studies ☕</p>
      </div>

      <div v-if="errors.general" class="error-banner">{{ errors.general }}</div>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label class="form-label">Email</label>
          <input
            v-model="email"
            type="email"
            class="form-input"
            :class="{ error: errors.email }"
            placeholder="your@email.com"
            @input="errors.email = ''"
          />
          <p v-if="errors.email" class="form-error">⚠ {{ errors.email }}</p>
        </div>

        <div class="form-group">
          <label class="form-label">Password</label>
          <div class="pw-wrap">
            <input
              v-model="password"
              :type="showPw ? 'text' : 'password'"
              class="form-input"
              :class="{ error: errors.password }"
              placeholder="Enter your password"
              @input="errors.password = ''"
            />
            <!-- Eye = currently hidden → click to show | EyeOff = currently visible → click to hide -->
            <button type="button" class="pw-toggle" @click="showPw = !showPw">
              <EyeOff v-if="!showPw" :size="18" />
              <Eye v-else :size="18" />
            </button>
          </div>
          <p v-if="errors.password" class="form-error">⚠ {{ errors.password }}</p>
        </div>

        <button
          type="submit"
          class="btn w-full"
          style="padding:0.85rem;font-size:1rem;margin-top:1.25rem;transition:background 0.3s,box-shadow 0.3s;"
          :style="isReady
            ? 'background:#4a7c59;color:#fff;box-shadow:0 4px 14px rgba(74,124,89,0.4);'
            : 'background:var(--primary);color:#fff;box-shadow:0 4px 12px rgba(123,138,124,0.3);'"
        >
          {{ isReady ? '✓ Login' : 'Login' }}
        </button>
      </form>

      <p class="auth-footer">
        New here? <RouterLink to="/signup">Create an account →</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Eye, EyeOff } from '@lucide/vue'
import api from '../api'

const router = useRouter()
const email    = ref('')
const password = ref('')
const showPw   = ref(false)
const errors   = reactive({ email: '', password: '', general: '' })

// Button turns green when both fields have value
const isReady = computed(() => email.value.trim() !== '' && password.value !== '')

async function handleLogin() {
  errors.email = errors.password = errors.general = ''
  let valid = true
  if (!email.value) { errors.email = 'Email is required'; valid = false }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { errors.email = 'Enter a valid email'; valid = false }
  if (!password.value) { errors.password = 'Password is required'; valid = false }
  if (!valid) return

  try {
    const response = await api.post('/auth/login', {
      email: email.value,
      password: password.value
    })
    localStorage.setItem('token', response.data.token)
    localStorage.setItem('study_planner_user', JSON.stringify(response.data.user))
    window.__setAuth?.(true)
    router.push('/')
  } catch (err) {
    errors.general = err.response?.data?.message || 'Login failed. Please try again.'
  }
}
</script>

<style scoped>
.error-banner {
  background: rgba(204,108,108,0.08); border: 1px solid rgba(204,108,108,0.3);
  border-radius: var(--r-sm); padding: 0.75rem 1rem;
  color: var(--error); font-size: 0.875rem; text-align: center;
  margin-bottom: 1.25rem;
}
.flex { display:flex; } .justify-center { justify-content:center; } .items-center { align-items:center; } .gap-2 { gap:0.5rem; }
</style>
