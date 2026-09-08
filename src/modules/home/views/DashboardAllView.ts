import { computed, defineComponent, onMounted, reactive, ref, watch, watchEffect } from 'vue';

import { useToast } from 'vue-toastification';

import { useAuthStore } from '@/modules/auth/stores/auth.store';


export default defineComponent({
  components: {


  },
  setup(props) {
    const toast = useToast();
    const authStore = useAuthStore();
   
    return {
   
    };
  },
});
