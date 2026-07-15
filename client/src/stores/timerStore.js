import { reactive } from 'vue'

export const timerStore = reactive({
  mode: 'study',
  settings: { study: 25, shortBreak: 5, longBreak: 15 },
  timeLeft: 25 * 60,
  isActive: false,
  _interval: null,

  start() {
    if (this.isActive) return
    this.isActive = true
    this._interval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--
      } else {
        this.pause()
      }
    }, 1000)
  },

  pause() {
    this.isActive = false
    clearInterval(this._interval)
    this._interval = null
  },

  toggle() {
    this.isActive ? this.pause() : this.start()
  },

  reset() {
    this.pause()
    this.timeLeft = this.settings[this.mode] * 60
  },

  changeMode(newMode) {
    this.pause()
    this.mode = newMode
    this.timeLeft = this.settings[newMode] * 60
  },

  applySettings(newSettings) {
    this.settings = { ...newSettings }
    this.reset()
  },

  get formatted() {
    const m = Math.floor(this.timeLeft / 60).toString().padStart(2, '0')
    const s = (this.timeLeft % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  },
})
