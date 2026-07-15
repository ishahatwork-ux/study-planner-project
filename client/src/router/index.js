import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Signup from '../views/Signup.vue'
import Dashboard from '../views/Dashboard.vue'
import TaskManager from '../views/TaskManager.vue'
import Timetable from '../views/Timetable.vue'
import TimerView from '../views/TimerView.vue'
import ExamTracker from '../views/ExamTracker.vue'
import GroupStudy from '../views/GroupStudy.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login',      component: Login,       meta: { public: true } },
    { path: '/signup',     component: Signup,      meta: { public: true } },
    { path: '/',           component: Dashboard },
    { path: '/tasks',      component: TaskManager },
    { path: '/timetable',  component: Timetable },
    { path: '/timer',      component: TimerView },
    { path: '/exams',      component: ExamTracker },
    { path: '/group-study', component: GroupStudy },
    { path: '/ai-notes',   component: () => import('../views/AINotes.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach((to) => {
  const user = localStorage.getItem('study_planner_user')
  if (!to.meta.public && !user) return '/login'
  if (to.meta.public && user) return '/'
})

export default router
