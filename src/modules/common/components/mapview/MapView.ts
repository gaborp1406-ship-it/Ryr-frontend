import { computed, defineComponent, onMounted, ref, watch } from 'vue';
import Mapboxgl from 'mapbox-gl';
import { usePlacesStore } from '../../stores/places.store';

//import { usePlacesStore, useMapStore } from '@/composables';

export default defineComponent({
  name: 'MapView',
  setup() {
    const mapElement = ref<HTMLDivElement>();
    const places = usePlacesStore();
    //const { setMap } = useMapStore();

    const initMap = async () => {
      if (!mapElement.value) throw new Error('Div Element no exits');
      if (!places.userLocation) throw new Error('user location no existe');

      await Promise.resolve();

      const map = new Mapboxgl.Map({
        container: mapElement.value, // container ID
        style: 'mapbox://styles/mapbox/light-v10', // style URL
        center: [places.userLocation[0], places.userLocation[1]],
        zoom: 15, // starting zoom
      });

      const myLocationPopup = new Mapboxgl.Popup().setLngLat([
        places.userLocation[0],
        places.userLocation[1],
      ]).setHTML(`
          <h4>Aquí estoy</h4>
          <p>Actualmente en Alajuela</p>
        `);

      const myLocationMarker = new Mapboxgl.Marker()
        .setLngLat([places.userLocation[0], places.userLocation[1]])
        .setPopup(myLocationPopup)
        .addTo(map);

      // Todo: establecer el mapa en Vuex
      //setMap(map);
    };

    onMounted(() => {
      if (places.isUserlocationReady) return initMap();
    });

    watch(
      () => places.isUserlocationReady,
      (newVal) => {
        if (newVal) initMap(); // Solo si isUserlocationReady cambia a true
      },
    );

    return {
      isUserlocationReady: computed(() => !!places.isUserlocationReady),
      userLocation: computed(() => !!places.userLocation),
      mapElement,
    };
  },
});
