<template>
  <AppLayout v-if="isAuth" />
  <RouterView v-else />
  <ToastContainer />
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AppLayout from './components/AppLayout.vue'
import ToastContainer from './components/ToastContainer.vue'

const isAuth = ref(!!localStorage.getItem('study_planner_user'))
const route  = useRoute()

// Keep in sync when user logs in/out by reacting to route changes
watch(route, () => {
  isAuth.value = !!localStorage.getItem('study_planner_user')
})

// Expose for child components via provide/inject or events
window.__setAuth = (v) => { isAuth.value = v }
</script>
