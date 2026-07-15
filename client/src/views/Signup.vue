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
        <h1>Start your journey</h1>
        <p>Create your StudySyncAI account 📚</p>
      </div>

      <form @submit.prevent="handleSignup">
        <div class="form-group">
          <label class="form-label">Full Name</label>
          <input v-model="form.name" type="text" class="form-input" :class="{error:errors.name}" placeholder="Jane Doe" @input="errors.name=''" />
          <p v-if="errors.name" class="form-error">⚠ {{ errors.name }}</p>
        </div>
        <div class="form-group">
          <label class="form-label">Email</label>
          <input v-model="form.email" type="email" class="form-input" :class="{error:errors.email}" placeholder="your@email.com" @input="errors.email=''" />
          <p v-if="errors.email" class="form-error">⚠ {{ errors.email }}</p>
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <div class="pw-wrap">
            <input v-model="form.password" :type="show1 ? 'text' : 'password'" class="form-input" :class="{error:errors.password}" placeholder="Create a strong password" @input="errors.password=''" />
            <button type="button" class="pw-toggle" @click="show1 = !show1">
              <EyeOff v-if="!show1" :size="18" />
              <Eye v-else :size="18" />
            </button>
          </div>
          <p v-if="errors.password" class="form-error">⚠ {{ errors.password }}</p>
        </div>
        <div class="form-group">
          <label class="form-label">Confirm Password</label>
          <div class="pw-wrap">
            <input v-model="form.confirm" :type="show2 ? 'text' : 'password'" class="form-input" :class="{error:errors.confirm}" placeholder="Repeat your password" @input="errors.confirm=''" />
            <button type="button" class="pw-toggle" @click="show2 = !show2">
              <EyeOff v-if="!show2" :size="18" />
              <Eye v-else :size="18" />
            </button>
          </div>
          <p v-if="errors.confirm" class="form-error">⚠ {{ errors.confirm }}</p>
        </div>

        <button
          type="submit"
          class="btn w-full"
          style="padding:0.85rem;font-size:1rem;margin-top:1.25rem;transition:background 0.3s,box-shadow 0.3s;"
          :style="isReady
            ? 'background:#4a7c59;color:#fff;box-shadow:0 4px 14px rgba(74,124,89,0.4);'
            : 'background:var(--primary);color:#fff;box-shadow:0 4px 12px rgba(123,138,124,0.3);'"
        >
          {{ isReady ? '✓ Create Account' : 'Create Account' }}
        </button>
      </form>

      <p class="auth-footer">
        Already have an account? <RouterLink to="/login">Login →</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Eye, EyeOff } from '@lucide/vue'
import api from '../api'

const router = useRouter()
const form   = reactive({ name:'', email:'', password:'', confirm:'' })
const errors = reactive({ name:'', email:'', password:'', confirm:'' })
const show1  = ref(false)
const show2  = ref(false)

// Button turns green when all 4 fields have values
const isReady = computed(() =>
  form.name.trim() !== '' &&
  form.email.trim() !== '' &&
  form.password !== '' &&
  form.confirm !== ''
)

async function handleSignup() {
  Object.keys(errors).forEach(k => errors[k] = '')
  let valid = true
  if (!form.name.trim()) { errors.name = 'Full name is required'; valid = false }
  if (!form.email) { errors.email = 'Email is required'; valid = false }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { errors.email = 'Enter a valid email'; valid = false }
  if (!form.password) { errors.password = 'Password is required'; valid = false }
  else if (form.password.length < 6) { errors.password = 'At least 6 characters required'; valid = false }
  if (!form.confirm) { errors.confirm = 'Please confirm your password'; valid = false }
  else if (form.password !== form.confirm) { errors.confirm = 'Passwords do not match'; valid = false }
  if (!valid) return

  try {
    const response = await api.post('/auth/register', {
      name: form.name,
      email: form.email,
      password: form.password
    })
    
    localStorage.setItem('token', response.data.token)
    localStorage.setItem('study_planner_user', JSON.stringify(response.data.user))
    window.__setAuth?.(true)
    router.push('/')
  } catch (err) {
    errors.email = err.response?.data?.message || 'Failed to create account. Please try again.'
  }
}
</script>

<style scoped>
.flex { display:flex; } .justify-center { justify-content:center; } .items-center { align-items:center; } .gap-2 { gap:0.5rem; }
</style>
