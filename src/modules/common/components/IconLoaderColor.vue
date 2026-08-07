<template>
  <div class="spinner-wrapper" :style="{ width: wrapperSize, height: wrapperSize }">
    <svg
      :width="size"
      :height="size"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      class="spinner-svg"
    >
      <circle
        v-for="(dot, index) in dots"
        :key="index"
        :cx="dot.cx"
        :cy="dot.cy"
        r="0"
        :fill="color"
      >
        <animate
          :id="dot.id"
          :begin="dot.begin"
          attributeName="r"
          calcMode="spline"
          :dur="`${speed}s`"
          values="0;2;0"
          keySplines=".27,.42,.37,.99;.53,0,.61,.73"
        />
      </circle>
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: {
    type: [Number, String],
    default: 24
  },
  color: {
    type: String,
    default: '#000000'
  },
  speed: {
    type: Number,
    default: 0.6
  },
  fullscreen: {
    type: Boolean,
    default: false
  }
})

const wrapperSize = computed(() =>
  props.fullscreen ? '100%' : `${Number(props.size) + 16}px`
)

const dots = [
  { cx: 12,    cy: 3,     id: 'spinner_6RAU', begin: '0;spinner_GErc.end-0.5s' },
  { cx: 16.50, cy: 4.21,  id: 'spinner_khXL', begin: 'spinner_6RAU.begin+0.1s' },
  { cx: 7.50,  cy: 4.21,  id: 'spinner_GErc', begin: 'spinner_JEaM.begin+0.1s' },
  { cx: 19.79, cy: 7.50,  id: 'spinner_9orP', begin: 'spinner_khXL.begin+0.1s' },
  { cx: 4.21,  cy: 7.50,  id: 'spinner_JEaM', begin: 'spinner_RwRf.begin+0.1s' },
  { cx: 21.00, cy: 12.00, id: 'spinner_W8J5', begin: 'spinner_9orP.begin+0.1s' },
  { cx: 3.00,  cy: 12.00, id: 'spinner_RwRf', begin: 'spinner_tByH.begin+0.1s' },
  { cx: 19.79, cy: 16.50, id: 'spinner_tedm', begin: 'spinner_W8J5.begin+0.1s' },
  { cx: 4.21,  cy: 16.50, id: 'spinner_tByH', begin: 'spinner_c3Lr.begin+0.1s' },
  { cx: 16.50, cy: 19.79, id: 'spinner_QxRo', begin: 'spinner_tedm.begin+0.1s' },
  { cx: 7.50,  cy: 19.79, id: 'spinner_c3Lr', begin: 'spinner_PW3C.begin+0.1s' },
  { cx: 12,    cy: 21,    id: 'spinner_PW3C', begin: 'spinner_QxRo.begin+0.1s' }
]
</script>

<style scoped>
.spinner-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.spinner-svg {
  display: block;
}
</style>