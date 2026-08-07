<template>
  <svg width="20" xmlns="http://www.w3.org/2000/svg" height="20" fill="none">
    <g data-testid="Icons / whatsapp.svg">
      <defs>
        <clipPath id="a" class="frame-clip frame-clip-def">
          <rect rx="0" ry="0" width="20" height="20" />
        </clipPath>
      </defs>
      <g clip-path="url(#a)">
        <g class="fills">
          <rect rx="0" ry="0" width="20" height="20" class="frame-background" />
        </g>
        <g data-testid="whatsapp" :style="{ fill: color }" class="frame-children">
          <path
            d="M15.95 14.418c-.241.682-1.199 1.246-1.963 1.411-.523.111-1.205.199-3.503-.753-2.581-1.069-6.165-4.878-6.165-7.413 0-1.291.744-2.793 2.045-2.793.626 0 .764.012.97.506.241.582.829 2.017.899 2.164.289.603-.294.956-.717 1.481-.135.158-.288.329-.117.623.17.289.758 1.247 1.622 2.016 1.116.994 2.021 1.311 2.345 1.446.241.101.529.078.705-.111.223-.241.5-.641.782-1.035.199-.282.452-.317.717-.217.179.062 2.454 1.118 2.55 1.287.071.124.071.706-.17 1.388ZM10.131.297ZC4.613.297.129 4.782.129 10.297c0 2.186.705 4.215 1.904 5.86L.787 19.874l3.843-1.229a9.926 9.926 0 0 0 5.501 1.652c5.513 0 9.998-4.486 9.998-10 0-5.515-4.485-10-9.998-10Z"
            fill-rule="evenodd"
            class="fills"
            data-testid="svg-path"
          />
        </g>
      </g>
    </g>
  </svg>
</template>

<script lang="ts" setup>
const props = defineProps({
  color: {
    type: String,
    default: '#9ca3af', // Valor por defecto en formato hexadecimal (gris)
  },
});
</script>
