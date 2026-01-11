<template>
  <div class="night-sleep-container relative h-screen w-screen overflow-hidden bg-midnight-blue flex items-center justify-center animate-fade-in">
    <!-- Background Image -->
    <img 
      v-if="backgroundExists" 
      src="/images/backgrounds/village-night.webp" 
      alt="Village at night" 
      class="absolute inset-0 w-full h-full object-cover opacity-30 animate-fade-in"
    />
    <div class="absolute inset-0 bg-gradient-to-t from-midnight-blue via-transparent to-black/50"></div>

    <!-- Fog Layer -->
    <div class="fog-layer absolute bottom-0 left-0 w-full h-[40%] pointer-events-none animate-fog-drift"></div>

    <!-- Fireflies -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <div 
        v-for="i in 30" 
        :key="`firefly-${i}`" 
        class="firefly"
        :style="getFireflyStyle(i)"
      ></div>
    </div>

    <!-- Content -->
    <div class="relative z-10 text-center p-4 animate-fade-in-up">
      <h2 class="font-serif text-3xl font-bold text-cream text-shadow-lg mb-6">
        La nuit est tombée sur le village...
      </h2>
      
      <Transition
        name="message-fade"
        mode="out-in"
      >
        <p 
          :key="currentMessageIndex" 
          class="text-neon-cyan/80 text-lg italic font-sans text-shadow-sm"
        >
          {{ messages[currentMessageIndex] }}
        </p>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const messages = [
  "Un silence pesant s'est installé.",
  "Les ombres dansent à la lueur de la lune.",
  "Un bruit suspect dans les buissons...",
  "Le vent souffle un air glacial.",
  "Qui ne verra pas le lever du soleil ?",
];

const currentMessageIndex = ref(0);
const backgroundExists = ref(true);
let messageInterval = null;

function getFireflyStyle(index) {
  const startX = Math.random() * 100;
  const startY = Math.random() * 100;
  const endX = startX + (Math.random() * 40 - 20);
  const endY = startY + (Math.random() * 40 - 20);
  const duration = 20 + Math.random() * 5;
  const delay = Math.random() * 5;
  
  return {
    left: `${startX}%`,
    top: `${startY}%`,
    '--firefly-x': `${endX - startX}vw`,
    '--firefly-y': `${endY - startY}vh`,
    animationDuration: `${duration}s`,
    animationDelay: `${delay}s`,
  };
}

onMounted(() => {
  messageInterval = setInterval(() => {
    currentMessageIndex.value = (currentMessageIndex.value + 1) % messages.length;
  }, 5000);
});

onUnmounted(() => {
  if (messageInterval) {
    clearInterval(messageInterval);
  }
});
</script>

<style scoped>
.night-sleep-container {
  background: linear-gradient(180deg, var(--color-midnight-blue) 0%, #000 100%);
}

.fog-layer {
  background: linear-gradient(
    to top,
    var(--color-midnight-blue) 0%,
    rgba(2, 6, 23, 0.5) 50%,
    transparent 100%
  );
  opacity: 0.4;
}

.firefly {
  position: absolute;
  width: 6px;
  height: 6px;
  background: var(--color-neon-cyan);
  border-radius: 50%;
  box-shadow: 
    0 0 8px var(--color-neon-cyan),
    0 0 12px var(--color-neon-cyan);
  animation: fireflyFloat 20s ease-in-out infinite;
  opacity: 0;
}

@keyframes fireflyFloat {
  0%, 100% {
    opacity: 0;
    transform: translate3d(0, 0, 0) scale(1);
  }
  10% {
    opacity: 0.8;
  }
  50% {
    opacity: 1;
    transform: translate3d(var(--firefly-x), var(--firefly-y), 0) scale(1.2);
  }
  90% {
    opacity: 0.8;
  }
}

.message-fade-enter-active,
.message-fade-leave-active {
  transition: opacity 1s ease-in-out, transform 1s ease-in-out;
}

.message-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.message-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Responsive */
@media (max-width: 768px) {
  .night-sleep-container :deep(h2) {
    font-size: 1.75rem;
  }
  
  .firefly {
    width: 4px;
    height: 4px;
  }
}

@media (max-width: 360px) {
  .night-sleep-container {
    padding: 0.75rem;
  }
  
  .night-sleep-container :deep(h2) {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
  
  .night-sleep-container :deep(p) {
    font-size: 0.875rem;
  }
  
  .firefly {
    width: 3px;
    height: 3px;
  }
}

/* Prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .firefly {
    animation: none;
  }
  
  .message-fade-enter-active,
  .message-fade-leave-active {
    transition: opacity 0.01ms;
  }
}
</style>
