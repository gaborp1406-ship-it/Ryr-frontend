import axios from 'axios';
import { defineStore } from 'pinia';
import { computed, onMounted, ref } from 'vue';
import type { getReverseGeocode } from '../interfaces/getReverseGeocode.interface';
import { useToast } from 'vue-toastification';

export const usePlacesStore = defineStore('places', () => {
  const isLoading = ref<boolean>(true);
  const userLocation = ref<[number, number, string] | undefined>(undefined);
  const isLoadingPlaces = ref<boolean>(false);
  const toast = useToast();
  const messageLocation = ref<String | null>(null);

  const getInitialLocation = () => {
    if (!navigator.geolocation) {
      console.error('Geolocalización no soportada por el navegador.');
      toast.error('Geolocalización no soportada por el navegador.');
      messageLocation.value = 'Geolocalización no soportada por el navegador.';
      return;
    }

    isLoading.value = true;
    userLocation.value = undefined;

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        let geocode = null;
        try {
          geocode = await getReverseGeocode(coords.latitude, coords.longitude);
        } catch (error) {
          console.error('Error obteniendo geocodificación inversa:', error);
          messageLocation.value = `Error obteniendo geocodificación inversa: ${error}`;
        } finally {
          userLocation.value = [
            coords.longitude,
            coords.latitude,
            geocode ? geocode.display_name : 'Geocode desconocida',
          ];
          isLoading.value = false;
        }
      },
      (err) => {
        let errorMessage = err.message;
        isLoading.value = false;

        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = 'Permiso denegado para acceder a la ubicación.';
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = 'Ubicación no disponible.';
            break;
          case err.TIMEOUT:
            errorMessage = 'No se pudo obtener la ubicación a tiempo. Inténtalo de nuevo.';
            break;
        }

        console.error(`Ubicación: ${errorMessage}`);

        // Opción alternativa: Obtener ubicación aproximada basada en IP
        //getApproximateLocation();

        //toast.error(`Ubicación: ${errorMessage}`);
        messageLocation.value = `Ubicación: ${errorMessage}`;
      },
      {
        enableHighAccuracy: true, // Mayor precisión
        timeout: 25000, // Tiempo máximo de espera
        maximumAge: 0, // No usar caché
      },
    );
  };

  // Función alternativa para obtener ubicación aproximada por IP
  const getApproximateLocation = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      userLocation.value = [data.longitude, data.latitude, data.city || ' (Ubicación aproximada)'];
    } catch (error) {
      console.error('Error obteniendo ubicación aproximada:', error);
      messageLocation.value = `Error obteniendo ubicación aproximada: ${error}`;
    }
  };

  const getReverseGeocode = async (lat: number, lon: number): Promise<getReverseGeocode> => {
    try {
      const response = await axios.get<getReverseGeocode>('https://geocode.maps.co/reverse', {
        params: {
          lat: lat,
          lon: lon,
          api_key: '66f1f181bee17923141134htv7d4107', // Agrega tu API key aquí
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener los datos de geocodificación inversa:', error);
      return {
        place_id: 0,
        licence: '',
        osm_type: '',
        osm_id: 0,
        lat: '',
        lon: '',
        display_name: '',
        boundingbox: [],
      };
    }
  };

  // onMounted(() => {
  //   if (userLocation.value && userLocation.value?.length > 0) return;

  //   getInitialLocation();
  // });

  return {
    isLoading,
    userLocation,
    isLoadingPlaces,

    //Getters
    isUserlocationReady: computed(() => !!userLocation.value),
    activeGeolocation: computed(() => !!navigator.geolocation),
    messageLocation,
    getReverseGeocode,

    //Actions
    getInitialLocation,
  };
});
