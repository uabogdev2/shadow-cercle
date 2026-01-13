<template>
  <div class="timer-container flex items-center justify-center" :class="containerClass">
    <!-- Circular Timer (Default) -->
    <div v-if="variant === 'circular' || variant === 'digital'" class="relative">
      <!-- SVG Circle Progress -->
      <svg 
        class="timer-circle" 
        :width="circleSize" 
        :height="circleSize" 
        viewBox="0 0 100 100"
      >
        <!-- Background circle -->
        <circle
          class="timer-bg-circle"
          cx="50"
          cy="50"
          :r="radius"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          :stroke-width="strokeWidth"
        />
        <!-- Progress circle -->
        <circle
          class="timer-progress-circle"
          cx="50"
          cy="50"
          :r="radius"
          fill="none"
          :stroke="progressColor"
          :stroke-width="strokeWidth"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="dashOffset"
          stroke-linecap="round"
          transform="rotate(-90 50 50)"
        />
      </svg>
      
      <!-- Time Display -->
      <div 
        class="absolute inset-0 flex items-center justify-center"
        :class="[textSizeClass, textColorClass, urgentClass]"
      >
        <span class="font-mono font-bold tabular-nums tracking-wider">
          {{ formatTime(timeLeft) }}
        </span>
      </div>
    </div>

    <!-- Minimal Timer (just text) -->
    <div v-else-if="variant === 'minimal'" :class="[textSizeClass, textColorClass, urgentClass]">
      <span class="font-mono font-bold tabular-nums tracking-wider">
        {{ formatTime(timeLeft) }}
      </span>
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
    validator: (value) => ['circular', 'digital', 'minimal'].includes(value)
  },
  size: { 
    type: String, 
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  }
});

const emit = defineEmits(['complete']);

const timeLeft = ref(props.seconds);
const initialSeconds = ref(props.seconds);

// Circle calculations
const radius = 42;
const strokeWidth = 6;
const circumference = 2 * Math.PI * radius;

const circleSize = computed(() => {
  const sizes = { sm: 80, md: 100, lg: 140 };
  return sizes[props.size] || 100;
});

const textSizeClass = computed(() => {
  const sizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl'
  };
  return sizes[props.size] || 'text-2xl';
});

const containerClass = computed(() => {
  const sizes = {
    sm: 'w-20 h-20',
    md: 'w-24 h-24',
    lg: 'w-36 h-36'
  };
  return sizes[props.size] || 'w-24 h-24';
});

// Progress and color calculations
const progress = computed(() => {
  if (initialSeconds.value === 0) return 0;
  return timeLeft.value / initialSeconds.value;
});

const dashOffset = computed(() => {
  return circumference * (1 - progress.value);
});

const isUrgent = computed(() => timeLeft.value <= 10 && timeLeft.value > 5);
const isCritical = computed(() => timeLeft.value <= 5 && timeLeft.value > 0);

const progressColor = computed(() => {
  if (isCritical.value) return '#EF4444'; // Blood red
  if (isUrgent.value) return '#F59E0B'; // Gold/amber
  return '#7C3AED'; // Violet
});

const textColorClass = computed(() => {
  if (isCritical.value) return 'text-red-500';
  if (isUrgent.value) return 'text-amber-500';
  return 'text-violet-400';
});

const urgentClass = computed(() => {
  if (isCritical.value) return 'animate-timer-critical';
  if (isUrgent.value) return 'animate-timer-urgent';
  return '';
});

const formatTime = (secs) => {
  const minutes = Math.floor(secs / 60);
  const seconds = secs % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

let timerInterval = null;

const startTimer = () => {
  clearInterval(timerInterval);
  initialSeconds.value = props.seconds;
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
.timer-container {
  position: relative;
}

.timer-circle {
  filter: drop-shadow(0 0 8px rgba(124, 58, 237, 0.3));
}

.timer-progress-circle {
  transition: stroke-dashoffset 0.5s ease-out, stroke 0.3s ease;
}

.timer-bg-circle {
  opacity: 0.3;
}

/* Urgent animation */
.animate-timer-urgent {
  animation: timer-pulse 1s ease-in-out infinite;
}

/* Critical animation */
.animate-timer-critical {
  animation: timer-blink 0.5s ease-in-out infinite;
}

@keyframes timer-pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes timer-blink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}
</style>
