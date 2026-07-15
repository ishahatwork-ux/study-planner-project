import { reactive } from 'vue'

const saved = localStorage.getItem('study_planner_gamification')
const init = saved ? JSON.parse(saved) : { xp: 0, level: 1, tasksCompleted: 0 }

export const userStore = reactive({
  ...init,

  addXP(amount) {
    this.xp += amount
    this.tasksCompleted++
    while (this.xp >= 100) {
      this.xp -= 100
      this.level++
    }
    localStorage.setItem('study_planner_gamification', JSON.stringify({
      xp: this.xp, level: this.level, tasksCompleted: this.tasksCompleted
    }))
  },
})
