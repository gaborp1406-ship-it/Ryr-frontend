<template>
  <RouterView />
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue';
import { RouterView, useRouter } from 'vue-router';
import { useAuthStore } from '@/modules/auth/stores/auth.store';

interface Link {
  name: string;
  route: string;
  label: string;
  isHovered: boolean;
  isActive: boolean;
}

const router = useRouter();
const authStore = useAuthStore();

const allLinks = reactive<Link[]>([
  {
    name: 'history-connections',
    route: 'history-connections',
    label: 'Historial de conexiones',
    isHovered: false,
    isActive: false,
  },
  

]);


onMounted(() => {

  allLinks.forEach((link) => {
    link.isActive = false;
    link.isHovered = false;
  });


});
</script>

<style scoped>
.card-container {
  display: grid;
  justify-content: start;
  font-size: 12px;
}

.card2 {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 0 auto;
}

.worker-image {
  width: 75px;
  height: 75px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 20px;
}

.worker-info {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.dni-status {
  display: flex;
  justify-content: space-between;
  margin-top: 5px;
}

.dni {
  margin-right: 10px;
}
</style>
