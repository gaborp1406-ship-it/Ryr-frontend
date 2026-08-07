<template>
  <div class="profile-menu">
    <a href="#" type="button" class="profile-menu__link">
      <span class="profile-menu__avatar-ring">
        <img src="/assets/images/users/TIGRE-CUADRADO-02.jpg" alt="user-image" class="profile-menu__avatar" />
      </span>
      <span class="profile-menu__name">{{ authStore.username }}</span>
    </a>
  </div>

</template>

<script lang="ts" setup>
import { useAuthStore } from '@/modules/auth/stores/auth.store';

const authStore = useAuthStore();


</script>

<style scoped>
.profile-menu {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  background: #000000;
   border: 2px solid #000000;
  gap: 12px;
  padding: 40px 20px;
}

.profile-menu__link {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}

.profile-menu__avatar-ring {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  padding: 3px;
  background: linear-gradient(135deg, #000000, #000000);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease;
}

.profile-menu__link:hover .profile-menu__avatar-ring {
  transform: scale(1.04);
}

.profile-menu__avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid #fff;
  object-fit: cover;
  display: block;
}

.profile-menu__name {
  font-size: 0.70rem;
  font-weight: 700;
  color: #ffffff;
  text-align: center;
  line-height: 1.25;
  max-width: 76px;
  overflow-wrap: break-word;
}

.search-modal__card {
  display: flex;
  flex-direction: column;
  background: #fff;
  box-shadow: 0 20px 50px rgba(63, 31, 158, 0.2);
  border-radius: 16px;
  pointer-events: auto;
  overflow: hidden;
}

.search-modal__input {
  width: 100%;
  height: 52px;
  padding: 0 44px;
  border: none;
  outline: none;
  font-size: 0.95rem;
  color: #2b2b3d;
}

.search-modal__icon-left {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #a79fc4;
  display: flex;
}

.search-modal__icon-right {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
}

.search-modal__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #8a84a3;
  cursor: pointer;
}

.search-modal__close:hover {
  background: #ece7f8;
  color: #3f1f9e;
}
</style>