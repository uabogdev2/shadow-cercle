<template>
  <div class="timer-container" :class="containerClass">
    <!-- Circular Timer -->
    <div v-if="variant === 'circular'" class="timer-circular">
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
        class="timer-display"
        :class="[textSizeClass, textColorClass, urgentClass]"
      >
        <span class="timer-text">{{ formatTime(displayTime) }}</span>
      </div>
    </div>

    <!-- Digital Timer -->
    <div v-else-if="variant === 'digital'" class="timer-digital" :class="[textSizeClass, textColorClass, urgentClass]">
      <div class="timer-digital-display">
        <span class="timer-text">{{ formatTime(displayTime) }}</span>
      </div>
    </div>

    <!-- Minimal Timer -->
    <div v-else class="timer-minimal" :class="[textSizeClass, textColorClass, urgentClass]">
      <span class="timer-text">{{ formatTime(displayTime) }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useGameStore } from '@/stores/gameStore';

const props = defineProps({
  seconds: { type: Number, default: 60 },
  phaseEndsAt: { type: String, default: null }, // ISO timestamp from backend
  autoSync: { type: Boolean, default: true }, // Sync with gameStore
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

const emit = defineEmits(['complete', 'tick']);

const gameStore = useGameStore();
const timeLeft = ref(props.seconds);
const initialSeconds = ref(props.seconds);

// Circle calculations
const radius = 42;
const strokeWidth = 6;
const circumference = 2 * Math.PI * radius;

// Use backend time if available
const displayTime = computed(() => {
  // Priority: phaseEndsAt prop > gameStore.timer > local timeLeft
  if (props.phaseEndsAt) {
    const endTime = new Date(props.phaseEndsAt).getTime();
    const now = Date.now();
    const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
    return remaining;
  }
  
  if (props.autoSync && gameStore.timer !== undefined && gameStore.timer !== null) {
    return gameStore.timer;
  }
  
  return timeLeft.value;
});

const circleSize = computed(() => {
  const sizes = { sm: 64, md: 88, lg: 120 };
  return sizes[props.size] || 88;
});

const textSizeClass = computed(() => {
  const sizes = {
    sm: 'timer-text-sm',
    md: 'timer-text-md',
    lg: 'timer-text-lg'
  };
  return sizes[props.size] || 'timer-text-md';
});

const containerClass = computed(() => {
  const sizes = {
    sm: 'timer-size-sm',
    md: 'timer-size-md',
    lg: 'timer-size-lg'
  };
  return sizes[props.size] || 'timer-size-md';
});

// Progress and color calculations
const progress = computed(() => {
  const init = initialSeconds.value || 60;
  return displayTime.value / init;
});

const dashOffset = computed(() => {
  return circumference * (1 - Math.max(0, Math.min(1, progress.value)));
});

const isUrgent = computed(() => displayTime.value <= 10 && displayTime.value > 5);
const isCritical = computed(() => displayTime.value <= 5 && displayTime.value > 0);

const progressColor = computed(() => {
  if (isCritical.value) return '#EF4444'; // Blood red
  if (isUrgent.value) return '#F59E0B'; // Gold/amber
  return '#7C3AED'; // Violet
});

const textColorClass = computed(() => {
  if (isCritical.value) return 'timer-critical';
  if (isUrgent.value) return 'timer-urgent';
  return 'timer-normal';
});

const urgentClass = computed(() => {
  if (isCritical.value) return 'animate-timer-critical';
  if (isUrgent.value) return 'animate-timer-urgent';
  return '';
});

const formatTime = (secs) => {
  if (secs === undefined || secs === null || secs < 0) secs = 0;
  const minutes = Math.floor(secs / 60);
  const seconds = Math.floor(secs % 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

let timerInterval = null;

const calculateTimeFromBackend = () => {
  if (props.phaseEndsAt) {
    const endTime = new Date(props.phaseEndsAt).getTime();
    const now = Date.now();
    const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
    timeLeft.value = remaining;
    initialSeconds.value = Math.max(initialSeconds.value, remaining);
    return remaining;
  }
  return null;
};

const startTimer = () => {
  clearInterval(timerInterval);
  
  // Try to get time from backend first
  const backendTime = calculateTimeFromBackend();
  if (backendTime === null) {
    initialSeconds.value = props.seconds;
    timeLeft.value = props.seconds;
  }
  
  timerInterval = setInterval(() => {
    // Re-sync with backend if available
    if (props.phaseEndsAt) {
      calculateTimeFromBackend();
    } else if (!props.autoSync || gameStore.timer === undefined) {
      // Only decrement locally if not syncing
      if (timeLeft.value > 0) {
        timeLeft.value--;
        emit('tick', timeLeft.value);
      }
    }
    
    if (displayTime.value <= 0) {
      emit('complete');
      clearInterval(timerInterval);
    }
  }, 1000);
};

// Watch for prop changes
watch(() => props.seconds, (newVal) => {
  if (!props.phaseEndsAt && !props.autoSync) {
    initialSeconds.value = newVal;
    timeLeft.value = newVal;
    startTimer();
  }
});

watch(() => props.phaseEndsAt, () => {
  startTimer();
});

// Watch gameStore timer for syncing
watch(() => gameStore.timer, (newVal) => {
  if (props.autoSync && newVal !== undefined) {
    if (initialSeconds.value < newVal) {
      initialSeconds.value = newVal;
    }
  }
});

onMounted(startTimer);
onUnmounted(() => clearInterval(timerInterval));
</script>

<style scoped>
/* ============================================
   TIMER COMPONENT - MOBILE FIRST
   ============================================ */

.timer-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Size variants */
.timer-size-sm { width: 64px; height: 64px; }
.timer-size-md { width: 88px; height: 88px; }
.timer-size-lg { width: 120px; height: 120px; }

/* Circular Timer */
.timer-circular {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.timer-circle {
  filter: drop-shadow(0 0 10px rgba(124, 58, 237, 0.25)) drop-shadow(0 0 18px rgba(245, 158, 11, 0.18));
}

.timer-progress-circle {
  transition: stroke-dashoffset 0.5s ease-out, stroke 0.3s ease;
}

.timer-bg-circle {
  opacity: 0.3;
}

.timer-display {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Digital Timer */
.timer-digital {
  display: flex;
  align-items: center;
  justify-content: center;
}

.timer-digital-display {
  background: linear-gradient(145deg, #f3e0b8 0%, #e2c892 100%);
  border: 1px solid rgba(181, 138, 76, 0.5);
  border-radius: 0.85rem;
  padding: 0.5rem 1.15rem;
  box-shadow: 0 12px 28px rgba(88, 63, 26, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.4);
}

/* Text styles */
.timer-text {
  font-family: 'Inter', monospace;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.05em;
}

.timer-text-sm { font-size: 0.875rem; }
.timer-text-md { font-size: 1.25rem; }
.timer-text-lg { font-size: 2rem; }

/* Color states */
.timer-normal { color: #c4b0ff; }
.timer-urgent { color: #f8b74c; }
.timer-critical { color: #f87171; }

/* Animations */
.animate-timer-urgent {
  animation: timer-pulse 1s ease-in-out infinite;
}

.animate-timer-critical {
  animation: timer-blink 0.5s ease-in-out infinite;
}

@keyframes timer-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes timer-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
</style>
