<template>
  <div ref="containerRef">
    <label v-if="label.length > 0" class="text-gray-800 text-sm font-medium inline-block mb-2">{{
      label
    }}</label>
    <div
      v-if="options.length > 0"
      class="relative border border-gray-300 rounded-md p-2 cursor-pointer"
    >
      <div class="flex flex-wrap gap-2" @click="toggleDropdown">
        <span v-if="selectedOptions.length === 0" class="text-gray-500">Seleccione Opciones</span>
        <span
          v-for="(option, index) in selectedOptions"
          :key="index"
          class="bg-primary/25 text-primary px-2 py-1 rounded-full flex items-center gap-1"
        >
          {{ option.text }}
          <a
            @click.stop="removeOption(option)"
            class="text-xs bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center"
            style="cursor: pointer"
          >
            x
          </a>
        </span>
      </div>
      <ul
        v-if="isOpen"
        class="absolute top-full left-0 right-0 border border-gray-300 bg-white z-10 list-none mt-1 rounded-md max-h-40 overflow-y-auto"
      >
        <li
          v-for="option in options"
          :key="option.value ?? option.text"
          @click="selectOption(option)"
          :class="{ 'bg-blue-500 text-white': isSelected(option) }"
          class="cursor-pointer px-4 py-2 hover:bg-gray-200"
        >
          {{ option.text }}
        </li>
      </ul>
    </div>
    <div v-else class="skeleton-input"></div>
    <span v-if="error" class="text-danger">{{ error }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits, onMounted, onUnmounted } from 'vue';

// Define the Option interface
interface Option {
  value: string | number | null;
  text: string;
}

// Props
const props = defineProps<{
  options: Option[];
  modelValue: Option[];
  label: string;
  error?: string;
}>();

// Emits
const emit = defineEmits<{
  (e: 'update:modelValue', value: Option[]): void;
}>();

// Reactive data
const isOpen = ref(false);
const selectedOptions = ref<Option[]>(props.modelValue || []);
const containerRef = ref<HTMLElement | null>(null);

// Methods
function toggleDropdown() {
  isOpen.value = !isOpen.value;
}

function selectOption(option: Option) {
  if (isSelected(option)) {
    removeOption(option);
  } else {
    selectedOptions.value.push(option);
    emit('update:modelValue', selectedOptions.value);
  }
}

function removeOption(option: Option) {
  selectedOptions.value = selectedOptions.value.filter((o) => o.value !== option.value);
  emit('update:modelValue', selectedOptions.value);
}

function isSelected(option: Option) {
  return selectedOptions.value.some((o) => o.value === option.value);
}

function handleClickOutside(event: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    isOpen.value = false;
  }
}

// Watch for prop changes
watch(
  () => props.modelValue,
  (newVal) => {
    selectedOptions.value = newVal;
  },
);

// Setup click outside listener
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
/* Contenedor principal */
.relative {
  position: relative;
}

.w-72 {
  width: 18rem; /* 288px */
}

.border {
  border-style: solid;
}

.border-gray-300 {
  border-color: #d1d5db; /* Color gris claro */
}

.rounded-md {
  border-radius: 0.375rem; /* 6px */
}

.p-2 {
  padding: 0.5rem; /* 8px */
}

.cursor-pointer {
  cursor: pointer;
}

/* Entrada de selección */
.flex {
  display: flex;
}

.flex-wrap {
  flex-wrap: wrap;
}

.gap-2 {
  gap: 0.5rem; /* 8px */
}

.p-1 {
  padding: 0.25rem; /* 4px */
}

.text-gray-500 {
  color: #6b7280; /* Color gris */
}

.bg-blue-500 {
  background-color: #3b82f6; /* Color azul */
}

.text-white {
  color: #ffffff; /* Color blanco */
}

.px-2 {
  padding-left: 0.5rem; /* 8px */
  padding-right: 0.5rem; /* 8px */
}

.py-1 {
  padding-top: 0.25rem; /* 4px */
  padding-bottom: 0.25rem; /* 4px */
}

.rounded-full {
  border-radius: 9999px; /* Totalmente redondeado */
}

.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.gap-1 {
  gap: 0.25rem; /* 4px */
}

.text-xs {
  font-size: 0.75rem; /* 12px */
}

.bg-red-500 {
  background-color: #ef4444; /* Color rojo */
}

.w-4 {
  width: 1rem; /* 16px */
}

.h-4 {
  height: 1rem; /* 16px */
}

.rounded-full {
  border-radius: 9999px; /* Totalmente redondeado */
}

.w-4 {
  width: 1rem; /* 16px */
}

.h-4 {
  height: 1rem; /* 16px */
}

.flex {
  display: flex;
}

.justify-center {
  justify-content: center;
}

/* Menú desplegable */
.absolute {
  position: absolute;
}

.top-full {
  top: 100%;
}

.left-0 {
  left: 0;
}

.right-0 {
  right: 0;
}

.mt-1 {
  margin-top: 0.25rem; /* 4px */
}

.max-h-40 {
  max-height: 10rem; /* 160px */
}

.overflow-y-auto {
  overflow-y: auto;
}

/* Opciones del menú */
.cursor-pointer {
  cursor: pointer;
}

.px-4 {
  padding-left: 1rem; /* 16px */
  padding-right: 1rem; /* 16px */
}

.py-2 {
  padding-top: 0.5rem; /* 8px */
  padding-bottom: 0.5rem; /* 8px */
}

.hover\:bg-gray-200:hover {
  background-color: #e5e7eb; /* Color gris claro */
}
</style>
