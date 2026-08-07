<template>
  <div>
    <!-- <label
      v-if="showLabel || label"
      :for="id"
      class="text-gray-800 text-sm font-medium inline-block mb-2"
    > -->
    <label v-if="showLabel && label" :for="id" class="text-gray-800 text-sm font-medium inline-block mb-2">
      {{ label }}
    </label>

    <input :id="id" :type="type" :value="modelValue" :readonly="isReadonly" :placeholder="placeholder"
      @input="handleInput" @blur="$emit('blur')" @keyup.enter="$emit('enter')" :min="minValue" :max="maxValue"
      :step="step" :class="['form-input', { 'border-danger': error }]" />

    <span v-if="error" class="text-danger">{{ error }}</span>
  </div>
</template>

<script lang="ts" setup>
import { } from 'vue';

interface Props {
  id: string;
  label: string;
  modelValue: string | number | null;
  showLabel?: boolean;
  error?: string;
  type: 'text' | 'number' | 'email' | 'date' | 'password' | 'datetime-local' | 'month' | 'time';
  readonly?: boolean;
  placeholder?: string;
  isReadonly?: boolean;
  minValue?: string;
  maxValue?: string;
  step?: string;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  modelValue: '',
  label: '',
  showLabel: true,
  isReadonly: false,
  placeholder: '',
  minValue: '',
  maxValue: '',
  step: '',
});

const emit = defineEmits(['update:modelValue', 'blur', 'enter']);

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.value);
};
</script>

<style scoped>
.form-input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.form-input:focus {
  border-color: #3b82f6;
}

.form-input[readonly] {
  background-color: #f3f4f6;
  cursor: not-allowed;
}

.border-danger {
  border-color: #dc2626;
}

.text-danger {
  color: #dc2626;
  font-size: 12px;
}
</style>
