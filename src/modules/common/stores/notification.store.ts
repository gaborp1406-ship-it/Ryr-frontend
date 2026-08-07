import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export const useNotificationStore = defineStore('notification', () => {
  const savedCount = Number(localStorage.getItem('notification_count')) || 0;
  const savedCountSaleOp = Number(localStorage.getItem('notification_sale_op')) || 0;
  const count = ref(savedCount);
  const count_sale_op = ref(savedCountSaleOp);

  const increment = () => {
    count.value++;
  };

  const incrementSaleOp = () => {
    count_sale_op.value ++;
  }

  const resetGestionSaleOp = () => {
    count_sale_op.value = 0;
  }

  const resetGestionBack = () => {
    count.value = 0;
  };

  watch(count, (newVal) => {
    localStorage.setItem('notification_count', newVal.toString());
  });

  watch(count_sale_op, (newVal) => {
    localStorage.setItem('notification_sale_op', newVal.toString());
  });

  return {
    count,
    count_sale_op,
    increment,
    incrementSaleOp,
    resetGestionSaleOp,
    resetGestionBack,
  };
});
