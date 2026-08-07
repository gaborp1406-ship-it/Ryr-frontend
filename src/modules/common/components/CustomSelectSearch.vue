<template>
  <div class="relative">
    <label v-if="showLabel && label" :for="id" class="text-gray-800 text-sm font-medium inline-block mb-2">
      {{ label }}
    </label>

    <!-- Contenedor del select -->
    <div class="custom-select" ref="selectBox">
      <input type="text" v-model="searchTerm" placeholder="Selecciona una opción..." class="form-input w-full"
        :readonly="isReadonly" @focus="clearSearch" @blur="restoreSelection" @keydown.down.prevent="navigate(1)"
        @keydown.up.prevent="navigate(-1)" @keydown.enter.prevent="selectHighlighted" />
      <span class="arrow-down"></span>
    </div>

    <!-- Lista desplegable de opciones -->
    <ul v-if="isOpen" class="dropdown">
      <li v-for="(option, index) in filteredOptions" :key="option.value ?? option.text"
        :class="{ highlighted: index === highlightedIndex }" @mousedown="selectOption(option)"
        @mouseenter="highlightedIndex = index">
        {{ option.text }}
      </li>
    </ul>

    <span v-if="error" class="text-danger">{{ error }}</span>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';

// Definir la estructura de las opciones
interface Option {
  value: string | number | null;
  text: string;
}

// Definir las propiedades del componente
interface Props {
  id: string;
  label: string;
  modelValue: string | number | null;
  options: Option[];
  error?: string;
  showLabel?: boolean;
  isReadonly?: boolean;
}

// Asignar valores por defecto
const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  showLabel: true,
  isReadonly: false,
});

// Definir eventos emitidos
const emit = defineEmits(['update:modelValue', 'blur']);

// Estado para el dropdown y búsqueda
const searchTerm = ref('');
const isOpen = ref(false);
const highlightedIndex = ref(-1);
const selectBox = ref<HTMLElement | null>(null);

// Computada para filtrar opciones
const filteredOptions = computed(() =>
  searchTerm.value
    ? props.options.filter((option) =>
      option.text.toLowerCase().includes(searchTerm.value.toLowerCase()),
    )
    : props.options,
);

// Función para establecer el valor inicial basado en modelValue
const updateSelectedOption = (value: string | number | null) => {
  if (value === null) {
    searchTerm.value = '';
    isOpen.value = false;
    return;
  }
  // Si hay un valor y hay opciones disponibles
  if (props.options.length === 0) {
    searchTerm.value = '';
    isOpen.value = false;
    return;
  }

  const selectedOption = props.options.find((option) => option.value == value);

  if (selectedOption) {
    searchTerm.value = selectedOption.text;
    isOpen.value = false;
  } else {
    searchTerm.value = '';

    highlightedIndex.value = -1;
  }
};

// Inicializar el valor cuando se carga el componente
onMounted(() => {
  // Verificar si hay un modelValue inicial y hay opciones disponibles
  if (props.modelValue !== null && props.options.length > 0) {
    updateSelectedOption(props.modelValue);
  }
});

// Sincronizar el input con el valor seleccionado cuando cambie modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    updateSelectedOption(newValue);
  },
  { immediate: true },
);

// Actualizar cuando cambien las opciones (útil cuando las opciones se cargan de manera asíncrona)
watch(
  () => props.options,
  () => {
    //console.log(props.options);
    updateSelectedOption(props.modelValue);
    // }
  },
  { deep: true },
);

// Función para limpiar `searchTerm` cuando el usuario hace focus en el input
const clearSearch = () => {
  if (props.isReadonly) return; // Salir si es solo lectura

  searchTerm.value = '';
  isOpen.value = true;
};

// Función para restaurar la opción seleccionada cuando el usuario sale del input
const restoreSelection = () => {
  setTimeout(() => {
    isOpen.value = false;
    updateSelectedOption(props.modelValue);
    emit('blur');
  }, 100);
};

// Función para seleccionar opción
const selectOption = (option: Option) => {
  searchTerm.value = option.text;
  isOpen.value = false;
  emit('update:modelValue', option.value);
};

// Navegar con teclas ↑ ↓ y seleccionar con Enter
const navigate = (direction: number) => {
  if (filteredOptions.value.length === 0) return;

  highlightedIndex.value += direction;

  if (highlightedIndex.value < 0) {
    highlightedIndex.value = filteredOptions.value.length - 1;
  } else if (highlightedIndex.value >= filteredOptions.value.length) {
    highlightedIndex.value = 0;
  }
};

// Seleccionar con Enter la opción resaltada
const selectHighlighted = () => {
  if (highlightedIndex.value >= 0 && highlightedIndex.value < filteredOptions.value.length) {
    selectOption(filteredOptions.value[highlightedIndex.value]);
  }
};

// Cerrar dropdown al hacer click fuera
const handleClickOutside = (event: MouseEvent) => {
  if (selectBox.value && !selectBox.value.contains(event.target as Node)) {
    restoreSelection(); // Restaurar selección cuando el usuario haga click fuera
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
/* Estilo del contenedor */
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

/* Input dentro del select */
.custom-select input {
  border: none;
  width: 100%;
  outline: none;
  cursor: pointer;
}

/* Flecha del select */
.arrow-down {
  position: absolute;
  right: 10px;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 6px solid #333;
}

/* Dropdown con las opciones */
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

/* Opciones del dropdown */
.dropdown li {
  padding: 10px;
  cursor: pointer;
}

/* Resaltar opción al pasar el mouse */
.dropdown li:hover,
.dropdown .highlighted {
  background: #f0f0f0;
}

/* Estilo de error */
.text-danger {
  color: red;
  font-size: 12px;
}

.form-input[readonly] {
  background-color: #f3f4f6;
  cursor: not-allowed;
}

/* Añade esto a tu <style scoped> */
.custom-select.readonly {
  background-color: #f3f4f6;
  /* Gris claro */
  cursor: not-allowed;
  pointer-events: none;
  /* Esto evita cualquier click o apertura */
}
</style>
