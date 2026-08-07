<template>
  <div class="flex justify-center py-10 space-x-3">
    <button
      :disabled="page == 1"
      @click="changePage(page - 1)"
      class="flex items-center space-x-1.5 rounded-lg px-4 py-1.5 text-white bg-blue-500 disabled:bg-gray-300 hover:bg-blue-600"
    >
      <i class="uil uil-angle-left-b"></i>
      <span>Anteriores</span>
    </button>

    <button
      :disabled="hasMoreData"
      @click="changePage(page + 1)"
      class="flex items-center space-x-1.5 rounded-lg px-4 py-1.5 text-white bg-blue-500 disabled:bg-gray-300"
    >
      <span>Siguientes</span>
      <i class="uil uil-angle-right-b"></i>
    </button>
  </div>
</template>

<style scoped>
button:disabled {
  background-color: #d1d5db; /* Tailwind's gray-300 */
  cursor: not-allowed;
}
button:hover:not(:disabled) {
  background-color: #2563eb; /* Tailwind's blue-600 */
}
</style>

<script lang="ts" setup>
import { useRouter } from 'vue-router';

interface Props {
  page: number;
  hasMoreData: boolean;
}

const props = defineProps<Props>();
const router = useRouter();

// Función para cambiar de página manteniendo los filtros actuales
const changePage = (newPage: number) => {
  // Obtener todos los parámetros de consulta actuales
  const currentQuery = { ...router.currentRoute.value.query };
  
  // Actualizar solo el parámetro de página
  currentQuery.page = newPage.toString();
  
  // Navegar a la misma ruta pero con el parámetro de página actualizado
  router.push({ query: currentQuery });
};
</script>