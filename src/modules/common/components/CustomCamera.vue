<script lang="ts" setup>
import { ref, onMounted, defineExpose, watch } from 'vue';

const { resolution } = defineProps<{
  resolution: { width: number; height: number };
}>();

const canvas = ref<HTMLCanvasElement | null>(null);
const video = ref<HTMLVideoElement | null>(null);
const ctx = ref<CanvasRenderingContext2D | null>(null);

const constraints = ref<MediaStreamConstraints>({
  video: { facingMode: 'user' },
});

const stream = ref<MediaStream | null>(null);
const devices = ref<MediaDeviceInfo[]>([]);
let currentDeviceIndex = 0;

// Obtener dispositivos de video disponibles
const getDevices = async () => {
  const allDevices = await navigator.mediaDevices.enumerateDevices();
  devices.value = allDevices.filter((device) => device.kind === 'videoinput');
};

// Cambiar entre dispositivos de cámara
const switchCamera = async () => {
  if (devices.value.length <= 1) {
    console.warn('No hay cámaras adicionales disponibles para cambiar.');
    return; // No cambiar si solo hay una cámara
  }

  // Incrementar el índice circularmente
  currentDeviceIndex = (currentDeviceIndex + 1) % devices.value.length;
  const deviceId = devices.value[currentDeviceIndex].deviceId;

  constraints.value.video = { deviceId: { exact: deviceId } };

  if (stream.value) {
    stream.value.getTracks().forEach((track) => track.stop());
  }

  stream.value = await navigator.mediaDevices.getUserMedia(constraints.value);

  if (video.value) {
    video.value.srcObject = stream.value;
    video.value.play();
  }
};

// Dibujar en el canvas
const Draw = () => {
  if (ctx.value && video.value && canvas.value) {
    ctx.value.drawImage(video.value, 0, 0, canvas.value.width, canvas.value.height);
    requestAnimationFrame(Draw);
  }
};

const capture = (): string | null => {
  return canvas.value ? canvas.value.toDataURL() : null;
};

defineExpose({ capture, switchCamera });

onMounted(async () => {
  await getDevices();

  if (video.value && canvas.value) {
    ctx.value = canvas.value.getContext('2d');

    // Establecer el tamaño inicial basado en la resolución
    if (canvas.value) {
      canvas.value.width = resolution.width;
      canvas.value.height = resolution.height;
    }

    stream.value = await navigator.mediaDevices.getUserMedia(constraints.value);
    video.value.srcObject = stream.value;
    video.value.play();

    requestAnimationFrame(Draw);
  }
});

// Usar watch para observar cambios en resolution y actualizar canvas
watch(
  () => resolution,
  (newResolution) => {
    if (canvas.value) {
      canvas.value.width = newResolution.width;
      canvas.value.height = newResolution.height;
    }
  },
  { immediate: true }, // Asegura que la resolución se ajuste inmediatamente al inicio
);
</script>

<template>
  <div>
    <video ref="video" autoplay playsinline webkit-playsinline muted hidden></video>
    <canvas ref="canvas" class="w-full rounded-lg"></canvas>
  </div>
</template>
