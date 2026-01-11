<template>
  <div class="flex items-center justify-center">
    <div
        class="font-mono text-5xl font-bold tracking-widest tabular-nums"
        :class="textColor"
    >
      {{ formatTime(timeLeft) }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  seconds: { type: Number, required: true },
  variant: { type: String, default: 'digital' }, // Ignoré, tout est digital
  size: { type: String, default: 'md' }
});

const emit = defineEmits(['complete']);

const timeLeft = ref(props.seconds);

const isUrgent = computed(() => timeLeft.value <= 10 && timeLeft.value > 0);
const isCritical = computed(() => timeLeft.value <= 5 && timeLeft.value > 0);

const textColor = computed(() => {
  if (isCritical.value) return 'text-red-600 animate-blink';
  if (isUrgent.value) return 'text-yellow-500';
  return 'text-white';
});

const formatTime = (secs) => {
  const minutes = Math.floor(secs / 60);
  const seconds = secs % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

let timerInterval = null;

const startTimer = () => {
  clearInterval(timerInterval);
  timeLeft.value = props.seconds;
  timerInterval = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--;
    } else {
      emit('complete');
      clearInterval(timerInterval);
    }
  }, 1000);
};

watch(() => props.seconds, startTimer);
onMounted(startTimer);
onUnmounted(() => clearInterval(timerInterval));
</script>
