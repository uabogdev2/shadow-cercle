<template>
  <div :class="['timer-container', `timer--${variant}`]">
    <!-- Circular Variant -->
    <div v-if="variant === 'circular'" :class="['relative', sizeClasses]">
      <svg class="w-full h-full -rotate-90">
        <circle
          class="track"
          cx="50%"
          cy="50%"
          :r="radius"
          stroke-width="4"
        />
        <circle
          class="progress"
          cx="50%"
          cy="50%"
          :r="radius"
          stroke-width="4"
          stroke-linecap="round"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="offset"
          :class="progressColor"
        />
      </svg>
      <div class="absolute inset-0 flex items-center justify-center">
        <span
          class="font-serif font-bold tabular-nums leading-none"
          :class="[textColor, textSizeClass]"
        >
          {{ formatTime(timeLeft) }}
        </span>
      </div>
    </div>

    <!-- Digital Variant -->
    <div
      v-else
      :class="[
        'font-serif text-4xl font-bold tabular-nums tracking-wider',
        'px-4 py-2 rounded-lg bg-glass-surface border border-glass-border',
        textColor,
        isUrgent ? 'animate-pulse-strong' : ''
      ]"
    >
      {{ formatTime(timeLeft) }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  seconds: { type: Number, required: true },
  variant: {
    type: String,
    default: 'circular',
    validator: (value) => ['circular', 'digital'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  }
});

const emit = defineEmits(['complete']);

const timeLeft = ref(props.seconds);
const radius = computed(() => {
  const sizes = { sm: 18, md: 28, lg: 38 };
  return sizes[props.size] || sizes.md;
});
const circumference = computed(() => 2 * Math.PI * radius.value);
const offset = computed(() => circumference.value * (1 - (timeLeft.value / props.seconds)));

const isUrgent = computed(() => timeLeft.value <= 10 && timeLeft.value > 0);
const isCritical = computed(() => timeLeft.value <= 5 && timeLeft.value > 0);

const progressColor = computed(() => {
  if (isCritical.value) return 'stroke-blood-red';
  if (isUrgent.value) return 'stroke-soft-gold';
  return 'stroke-cream';
});

const textColor = computed(() => {
  if (isCritical.value) return 'text-blood-red';
  if (isUrgent.value) return 'text-soft-gold';
  return 'text-cream';
});

const sizeClasses = computed(() => {
  const sizes = { sm: 'w-12 h-12', md: 'w-20 h-20', lg: 'w-28 h-28' };
  return sizes[props.size] || sizes.md;
});

const textSizeClass = computed(() => {
  const sizes = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' };
  return sizes[props.size] || sizes.md;
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

<style scoped>
.track {
  fill: none;
  stroke: var(--color-glass-surface);
}
.progress {
  fill: none;
  transition: stroke-dashoffset 0.5s linear, stroke 0.5s ease;
}
.animate-pulse-strong {
  animation: pulse-strong 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes pulse-strong {
  50% {
    opacity: 0.7;
    transform: scale(1.02);
  }
}

/* Responsive */
@media (max-width: 360px) {
  .timer-container {
    font-size: 0.875rem;
  }
  
  .timer-container :deep(span) {
    font-size: 0.625rem !important;
  }
}

/* S'assurer que le texte ne dépasse pas */
.timer-container :deep(span) {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  width: 100%;
  text-align: center;
}

/* Prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .animate-pulse-strong {
    animation: none;
  }
  
  .progress {
    transition: stroke-dashoffset 0.01ms linear;
  }
}
</style>