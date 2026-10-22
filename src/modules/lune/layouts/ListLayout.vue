<template>
  <RouterView />
</template>

<script setup lang="ts">
</script>
<style>
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
</style>
