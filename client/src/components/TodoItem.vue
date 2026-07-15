<template>
  <li class="todo-item" :class="{ 'is-done': todo.done }">
    <label class="checkbox-container">
      <!-- Emit the 'toggle' event to the parent when clicked -->
      <input 
        type="checkbox" 
        :checked="todo.done" 
        @change="$emit('toggle', todo.id)" 
      />
      <span class="checkmark"></span>
    </label>
    
    <!-- Use the prop data to display text -->
    <span class="todo-text">{{ todo.text }}</span>
    
    <!-- Emit the 'delete' event to the parent when clicked -->
    <button @click="$emit('delete', todo.id)" class="btn-delete">
      <X :size="16" />
    </button>
  </li>
</template>

<script setup>
import { X } from '@lucide/vue'

// University Requirement: Define Props (Receiving data from parent)
defineProps({
  todo: {
    type: Object,
    required: true
  }
})

// University Requirement: Define Emits (Sending events to parent)
defineEmits(['toggle', 'delete'])
</script>

<style scoped>
/* Scoped styles extracted from Dashboard.vue for modularity */
.todo-item {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0.75rem 1rem; background: #fcfcfc; border: 1px solid #f0f0f0; border-radius: 0.75rem;
  transition: all 0.2s ease;
}
.todo-item:hover { background: #fff; border-color: var(--border); box-shadow: 0 2px 8px rgba(0,0,0,0.02); }
.todo-item.is-done { opacity: 0.6; background: transparent; border-color: transparent; }
.todo-text { flex: 1; font-size: 0.9rem; transition: color 0.2s; }
.todo-item.is-done .todo-text { text-decoration: line-through; color: var(--muted); }

.btn-delete {
  color: #ccc; padding: 0.2rem; border-radius: 0.25rem;
  display: flex; align-items: center; justify-content: center; opacity: 0; transition: all 0.2s;
}
.todo-item:hover .btn-delete { opacity: 1; color: var(--error); }
.btn-delete:hover { background: rgba(204,108,108,0.1); }

/* Custom Checkbox */
.checkbox-container { display: block; position: relative; width: 20px; height: 20px; cursor: pointer; flex-shrink: 0; }
.checkbox-container input { position: absolute; opacity: 0; cursor: pointer; height: 0; width: 0; }
.checkmark { position: absolute; top: 0; left: 0; height: 20px; width: 20px; background-color: #fff; border: 2px solid var(--border); border-radius: 6px; transition: all 0.2s; }
.checkbox-container:hover input ~ .checkmark { border-color: var(--primary); }
.checkbox-container input:checked ~ .checkmark { background-color: var(--primary); border-color: var(--primary); }
.checkmark:after { content: ""; position: absolute; display: none; }
.checkbox-container input:checked ~ .checkmark:after { display: block; }
.checkbox-container .checkmark:after {
  left: 6px; top: 2px; width: 5px; height: 10px; border: solid white; border-width: 0 2px 2px 0; transform: rotate(45deg);
}
</style>
