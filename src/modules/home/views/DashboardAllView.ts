import { computed, defineComponent, onMounted, reactive, ref, watch, watchEffect } from 'vue';
import {  useQueryClient } from '@tanstack/vue-query';
import { useToast } from 'vue-toastification';
import CustomInput from '@/modules/common/components/CustomInput.vue';
import CustomSelect from '@/modules/common/components/CustomSelect.vue';
import { useAuthStore } from '@/modules/auth/stores/auth.store';

import IconExcel2 from '@/modules/common/icons/IconExcel2.vue';
import CustomSelectSearch from '@/modules/common/components/CustomSelectSearch.vue';

type Provider = 'culqi' | 'entel' | 'openpay';

export default defineComponent({
  components: {
    CustomInput,
    CustomSelect,

    IconExcel2,
    CustomSelectSearch,
 

  },
  setup(props) {
    const toast = useToast();
    const authStore = useAuthStore();
    const queryClient = useQueryClient();
    const loader_export = ref(false);
    const state = ref(true);
    const isModalOpen = ref(false);
    const showModalOnce = ref(false);
    const mySearch = reactive({
      fecharegistro_inicio: new Date().toISOString().split('T')[0],
      fecharegistro_fin: '',
      idtrabajador: '',
      p_id_trabajador_co: '',
      idsucursal: '',
    });
    const searchParams = reactive({
      fecharegistro_inicio: new Date().toISOString().split('T')[0],
      fecharegistro_fin: '',
      idtrabajador: '',
      p_id_trabajador_co: '',
      idsucursal: '',
    });

    const handleModalClose = () => {
      if (mustChangePassword.value) {
        toast.warning('Debes cambiar tu contraseña para continuar');
        return;
      }
      isModalOpen.value = false;
    };

   

    const mustChangePassword = ref(false);

    const handlePasswordUpdated = () => {
      isModalOpen.value = false;
      mustChangePassword.value = false;
      toast.success('Contraseña actualizada exitosamente');
    };



    const search = () => {
      searchParams.fecharegistro_inicio = mySearch.fecharegistro_inicio;
      searchParams.fecharegistro_fin = mySearch.fecharegistro_fin;
      searchParams.idtrabajador = mySearch.idtrabajador;
      searchParams.p_id_trabajador_co = mySearch.p_id_trabajador_co;
      searchParams.idsucursal = mySearch.idsucursal;

      queryClient.invalidateQueries({
        queryKey: ['dashboard-all'],
      });
    };


    const cleanFilter = () => {
      (searchParams.fecharegistro_inicio = mySearch.fecharegistro_inicio =
        new Date().toISOString().split('T')[0]),
        (searchParams.fecharegistro_fin = mySearch.fecharegistro_fin = '');
      searchParams.idtrabajador = mySearch.idtrabajador = '';
      searchParams.p_id_trabajador_co = mySearch.p_id_trabajador_co = '';
      searchParams.idsucursal = mySearch.idsucursal = '';

      queryClient.invalidateQueries({
        queryKey: ['dashboard-all'],
      });
    };

    watch(
      () => mySearch.idtrabajador,
      (newVal) => {
        if (newVal) {
          mySearch.p_id_trabajador_co = '';
        }
      },
    );

    watch(
      () => mySearch.p_id_trabajador_co,
      (newVal) => {
        if (newVal) {
          mySearch.idtrabajador = '';
        }
      },
    );

    return {
   
      mySearch,
      state,
      loader_export,
      search,
      cleanFilter,

      idUsuario: computed(() => authStore.authCheckStatus?.idusuario),
      isModalOpen,
      handleModalClose,
      mustChangePassword,
      handlePasswordUpdated,
    };
  },
});
