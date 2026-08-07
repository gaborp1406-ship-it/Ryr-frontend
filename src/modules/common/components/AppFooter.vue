<template>
  <footer class="app-footer">
    <div class="app-footer__inner">
      <p class="app-footer__text">2026 © Automatízate</p>
      <p class="app-footer__text app-footer__text--muted">
        Design &amp; Develop by <a href="/#" class="app-footer__link">Automatízate</a>
      </p>
    </div>
  </footer>
</template>

<script lang="ts" setup></script>

<style scoped>
.app-footer {
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 28px;
  border-top: 1px solid #ece7f8;
  background: #fff;
  margin-top: auto;
}

.app-footer__inner {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.app-footer__text {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 600;
  color: #4a4560;
}

.app-footer__text--muted {
  font-weight: 500;
  color: #8a84a3;
}

.app-footer__link {
  color: #6d3fd6;
  font-weight: 700;
  text-decoration: none;
}

.app-footer__link:hover {
  text-decoration: underline;
}

@media (max-width: 640px) {
  .app-footer__inner {
    justify-content: center;
    text-align: center;
  }
}
</style>