<template>
  <div>
    <label
      v-if="showLabel && label"
      :for="id"
      class="text-gray-800 text-sm font-medium inline-block mb-2"
    >
      {{ label }}
    </label>

    <div class="chart-wrapper" ref="wrapperRef">
      <canvas :id="id" ref="canvasRef"></canvas>
    </div>

    <span v-if="error" class="text-danger">{{ error }}</span>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import {
  Chart,
  type ChartType,
  type ChartData,
  type ChartOptions,
  type Plugin,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Filler,
  Tooltip,
  Legend,
  Title,
  BarController,
  LineController,
  PieController,
  DoughnutController,
  RadarController,
  PolarAreaController,
  BubbleController,
  ScatterController,
} from 'chart.js';

Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Filler,
  Tooltip,
  Legend,
  Title,
  BarController,
  LineController,
  PieController,
  DoughnutController,
  RadarController,
  PolarAreaController,
  BubbleController,
  ScatterController,
);

type SupportedChartType =
  | 'bar'
  | 'line'
  | 'pie'
  | 'doughnut'
  | 'radar'
  | 'polarArea'
  | 'bubble'
  | 'scatter';

interface Props {
  id: string;
  type: SupportedChartType;
  data: ChartData;
  label?: string;
  showLabel?: boolean;
  options?: ChartOptions;
  plugins?: Plugin[];
  error?: string;
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  showLabel: true,
  options: () => ({}),
  plugins: () => [],
});

const emit = defineEmits<{
  (e: 'chart-click', payload: { index: number; datasetIndex: number; value: unknown }): void;
  (e: 'chart-hover', payload: { index: number; datasetIndex: number; value: unknown }): void;
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const wrapperRef = ref<HTMLDivElement | null>(null);

let chartInstance: Chart | null = null;
let resizeObserver: ResizeObserver | null = null;

// Tipos circulares necesitan distinto aspectRatio y leyenda abajo
const circularTypes: SupportedChartType[] = ['pie', 'doughnut', 'polarArea', 'radar'];

const buildDefaultOptions = (type: SupportedChartType): ChartOptions => {
  const isCircular = circularTypes.includes(type);

  return {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: isCircular ? 1.5 : 2,
    plugins: {
      legend: {
        position: isCircular ? 'bottom' : 'top',
        labels: {
          boxWidth: 12,
          padding: 12,
        },
      },
    },
    onClick: (_event, elements) => {
      if (elements.length > 0) {
        const { index, datasetIndex } = elements[0];
        const value = (props.data.datasets[datasetIndex]?.data as unknown[])[index];
        emit('chart-click', { index, datasetIndex, value });
      }
    },
    onHover: (_event, elements) => {
      if (elements.length > 0) {
        const { index, datasetIndex } = elements[0];
        const value = (props.data.datasets[datasetIndex]?.data as unknown[])[index];
        emit('chart-hover', { index, datasetIndex, value });
      }
    },
  };
};

const mergeOptions = (base: ChartOptions, overrides: ChartOptions): ChartOptions => {
  return {
    ...base,
    ...overrides,
    plugins: {
      ...(base.plugins ?? {}),
      ...(overrides.plugins ?? {}),
    },
  };
};

const buildChart = () => {
  if (!canvasRef.value) return;

  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  const ctx = canvasRef.value.getContext('2d');
  if (!ctx) return;

  chartInstance = new Chart(ctx, {
    type: props.type as ChartType,
    data: props.data,
    options: mergeOptions(buildDefaultOptions(props.type), props.options),
    plugins: props.plugins,
  });
};

const setupResizeObserver = () => {
  if (!wrapperRef.value) return;

  resizeObserver = new ResizeObserver(() => {
    chartInstance?.resize();
  });

  resizeObserver.observe(wrapperRef.value);
};

// onMounted y onBeforeUnmount al nivel raíz — nunca anidados
onMounted(() => {
  buildChart();
  setupResizeObserver();
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  resizeObserver = null;

  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
});

watch(
  () => props.type,
  () => buildChart(),
);

watch(
  () => props.data,
  (newData) => {
    if (!chartInstance) return;
    chartInstance.data = newData;
    chartInstance.update();
  },
  { deep: true },
);

watch(
  () => props.options,
  (newOptions) => {
    if (!chartInstance) return;
    chartInstance.options = mergeOptions(
      buildDefaultOptions(props.type),
      newOptions,
    ) as typeof chartInstance.options;
    chartInstance.update();
  },
  { deep: true },
);
</script>

<style scoped>
.chart-wrapper {
  position: relative;
  width: 100%;
}

.chart-wrapper canvas {
  border-radius: 6px;
}

.text-danger {
  color: #dc2626;
  font-size: 12px;
}
</style>
