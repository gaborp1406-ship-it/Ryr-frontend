<template>
  <div class="relative">
    <label v-if="showLabel && label" :for="id" class="text-gray-800 text-sm font-medium inline-block mb-2">
      {{ label }}
    </label>

    <!-- Si está cargando, muestra skeleton -->
    <div v-if="isLoading" class="skeleton-input"></div>

    <!-- Input principal -->
    <div v-else class="custom-select" ref="selectBox">
      <input type="text" v-model="searchTerm" :readonly="isReadonly" :placeholder="placeholder"
        class="form-input w-full" @focus="openDropdown" @blur="handleBlur" @input="onInputChange"
        @keydown.down.prevent="navigate(1)" @keydown.up.prevent="navigate(-1)"
        @keydown.enter.prevent="selectHighlighted" />
      <span class="arrow-down"></span>
    </div>

    <!-- Dropdown -->
    <ul v-if="isOpen && !isLoading" class="dropdown">
      <li v-for="(option, index) in filteredOptions" :key="option.value ?? option.text"
        :class="{ highlighted: index === highlightedIndex }" @mousedown="selectOption(option)"
        @mouseenter="highlightedIndex = index">
        {{ option.text }}
      </li>

      <!-- Crear nueva opción -->
      <li v-if="canCreate && searchTerm" class="create-option" @mousedown="createOption">
        ➕ Crear "{{ searchTerm }}"
      </li>
    </ul>

    <span v-if="error" class="text-danger">{{ error }}</span>
  </div>
</template>

<script lang="ts" setup>
import {
  defineProps,
  defineEmits,
  withDefaults,
  ref,
  computed,
  watch,
  onMounted,
  onBeforeUnmount,
} from 'vue'

interface Option {
  value: number | null
  text: string
}

interface Props {
  id?: string
  label?: string
  modelValue: string | number | null
  options: Option[]
  error?: string
  showLabel?: boolean
  isReadonly?: boolean
  placeholder?: string
  allowCreate?: boolean
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  label: '',
  showLabel: true,
  isReadonly: false,
  placeholder: 'Selecciona o escribe...',
  allowCreate: true,
  isLoading: false,
})

const emit = defineEmits(['update:modelValue', 'blur', 'created'])

const searchTerm = ref('')
const isOpen = ref(false)
const highlightedIndex = ref(-1)
const selectBox = ref<HTMLElement | null>(null)

const localOptions = ref<Option[]>([])

onMounted(() => {
  localOptions.value = [...props.options]
  updateSelectedOption(props.modelValue)
})

watch(
  () => props.options,
  (newOptions) => {
    localOptions.value = [...newOptions]
  }
)

const filteredOptions = computed(() => {
  if (!searchTerm.value) return localOptions.value
  return localOptions.value.filter((option) =>
    option.text.toLowerCase().includes(searchTerm.value.toLowerCase()),
  )
})

const canCreate = computed(() => {
  if (!props.allowCreate || !searchTerm.value) return false
  const exists = props.options.some(
    (option) => option.text.toLowerCase() === searchTerm.value.toLowerCase(),
  )
  return !exists
})

const updateSelectedOption = (value: string | number | null) => {
  const selected = localOptions.value.find((opt) => opt.value == value)
  searchTerm.value = selected ? selected.text : ''
  isOpen.value = false
}

onMounted(() => {
  updateSelectedOption(props.modelValue)
})

watch(
  () => props.modelValue,
  (val) => updateSelectedOption(val),
)

const openDropdown = () => {
  if (!props.isReadonly) isOpen.value = true
}

const handleBlur = () => {
  setTimeout(() => {
    isOpen.value = false
    emit('blur')
  }, 100)
}

const onInputChange = () => {
  isOpen.value = true
}

const selectOption = (option: Option) => {
  searchTerm.value = option.text
  emit('update:modelValue', option.value)
  isOpen.value = false
}

const createOption = () => {
  const tempId = -Date.now()
  const newOption: Option = {
    value: tempId,
    text: searchTerm.value,
  }
  localOptions.value.push(newOption)
  //console.log(localOptions.value)
  emit('created', newOption)
  emit('update:modelValue', newOption.value)
  isOpen.value = false
}

const navigate = (direction: number) => {
  if (filteredOptions.value.length === 0) return
  highlightedIndex.value += direction
  if (highlightedIndex.value < 0) highlightedIndex.value = filteredOptions.value.length - 1
  if (highlightedIndex.value >= filteredOptions.value.length) highlightedIndex.value = 0
}

const selectHighlighted = () => {
  if (highlightedIndex.value >= 0 && highlightedIndex.value < filteredOptions.value.length) {
    selectOption(filteredOptions.value[highlightedIndex.value])
  } else if (canCreate.value) {
    createOption()
  }
}

const handleClickOutside = (event: MouseEvent) => {
  if (selectBox.value && !selectBox.value.contains(event.target as Node)) {
    handleBlur()
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))
</script>

<style scoped>
/* === Skeleton === */
.skeleton-input {
  width: 100%;
  height: 40px;
  background: #f0f0f0;
  border-radius: 4px;
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

/* === Estilos generales === */
.custom-select {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  border: 1px solid #ccc;
  padding: 1px;
  border-radius: 4px;
  cursor: pointer;
  background-color: white;
}

.custom-select input {
  border: none;
  width: 100%;
  outline: none;
  cursor: text;
}

.arrow-down {
  position: absolute;
  right: 10px;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 6px solid #333;
}

.dropdown {
  position: absolute;
  width: 100%;
  background: white;
  border: 1px solid #ccc;
  max-height: 200px;
  overflow-y: auto;
  list-style: none;
  padding: 0;
  margin: 5px 0;
  border-radius: 4px;
  z-index: 100;
}

.dropdown li {
  padding: 10px;
  cursor: pointer;
}

.dropdown li:hover,
.dropdown .highlighted {
  background: #f0f0f0;
}

.create-option {
  padding: 10px;
  color: #007bff;
  font-weight: 500;
  cursor: pointer;
}

.create-option:hover {
  background: #e6f0ff;
}

.text-danger {
  color: red;
  font-size: 12px;
}
</style>
