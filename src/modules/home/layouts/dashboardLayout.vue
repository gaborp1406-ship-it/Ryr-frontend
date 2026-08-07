<template>
  <div class="dashboard-view">
    <nav class="breadcrumb">
      <ul class="breadcrumb__list">
        <li class="breadcrumb__item">Inicio</li>
        <li class="breadcrumb__sep">/</li>
        <li class="breadcrumb__item">
          Dashboard
        </li>
      </ul>
    </nav>

    <div class="dashboard-view__body">
      <RouterView />
    </div>
  </div>
</template>

<script setup lang="ts">

</script>

<style scoped>
.breadcrumb {
  margin-bottom: 20px;
}

.breadcrumb__list {
  display: flex;
  align-items: center;
  gap: 8px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.breadcrumb__item {
  font-size: 0.85rem;
  font-weight: 600;
  color: #8a84a3;
}

.breadcrumb__sep {
  font-size: 0.8rem;
  color: #cfc6ea;
}

.breadcrumb__link {
  color: #fefefe;
  text-decoration: none;
  font-weight: 700;
}

.breadcrumb__link:hover {
  text-decoration: underline;
}

.dashboard-view__body {
  background: #fff;
  border-radius: 18px;
  border: 1px solid #ece7f8;
  padding: 24px;
  box-shadow: 0 8px 30px rgba(63, 31, 158, 0.05);
}
</style>