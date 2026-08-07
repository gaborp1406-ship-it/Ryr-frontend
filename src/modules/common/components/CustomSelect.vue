<template>
  <div>
    <label v-if="showLabel && label" :for="id" class="text-gray-800 text-sm font-medium inline-block mb-2">
      {{ label }}
    </label>

    <select v-if="options.length > 0" :id="id" :value="modelValue" @change="handleChange" @blur="$emit('blur')"
      :disabled="isReadonly" :class="['form-select', { 'border-danger': error }]">
      <option v-for="option in options" :key="option.value ?? option.text" :value="option.value">
        {{ option.text }}
      </option>
    </select>

    <div v-else class="skeleton-input"></div>

    <span v-if="error" class="text-danger">{{ error }}</span>
  </div>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits, withDefaults } from 'vue'

interface Option {
  value: string | number | null
  text: string
}

interface Props {
  id: string
  label?: string
  modelValue: string | number | null
  options: Option[]
  error?: string
  showLabel?: boolean
  isReadonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  showLabel: true,
  isReadonly: false,
})

const emit = defineEmits(['update:modelValue', 'blur'])

const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('update:modelValue', target.value)
}
</script>

<style scoped>
.form-select {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.form-select:focus {
  border-color: #3b82f6;
}

.form-select:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
}

.skeleton-input {
  width: 100%;
  height: 40px;
  background: #f0f0f0;
  border-radius: 6px;
  position: relative;
  overflow: hidden;
}

.skeleton-input::before {
  content: '';
  display: block;
  position: absolute;
  top: 0;
  left: -100%;
  height: 100%;
  width: 100%;
  background: linear-gradient(to right, transparent 0%, #e0e0e0 50%, transparent 100%);
  animation: skeleton-loading 1.5s infinite;
}

@keyframes skeleton-loading {
  0% {
    left: -100%;
  }

  100% {
    left: 100%;
  }
}

.text-danger {
  color: #dc2626;
  font-size: 12px;
}
</style>
