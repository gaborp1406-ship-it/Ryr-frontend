<template>
  <div>
    <label
      v-if="label != ''"
      :for="id"
      class="text-gray-800 text-sm font-medium inline-block mb-2"
      >{{ label }}</label
    >
    <textarea
      :id="id"
      :value="modelValue"
      :readonly="readonly"
      :placeholder="placeholder"
      @input="handleInput"
      @blur="$emit('blur')"
      :class="['form-input', { 'border-danger': error }]"
      style="field-sizing: content; resize: none; height: max-content"
    ></textarea>
    <span v-if="error" class="text-danger">{{ error }}</span>
  </div>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits, withDefaults } from 'vue';

interface Props {
  id: string;
  label?: string;
  modelValue: string | null;
  error?: string;
  readonly?: boolean;
  placeholder?: string;
}

withDefaults(defineProps<Props>(), {
  label: '',
  modelValue: '',
  readonly: false,
  placeholder: '',
});

const emit = defineEmits(['update:modelValue', 'blur']);

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement;
  emit('update:modelValue', target.value);
};
</script>

<style scoped></style>
