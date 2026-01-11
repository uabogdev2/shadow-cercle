<template>
  <div class="night-start-container relative h-screen w-screen overflow-hidden bg-midnight-blue flex items-center justify-center animate-fade-in">
    <!-- Filtre bleu nuit -->
    <div class="absolute inset-0 bg-deep-indigo/30 z-0"></div>

    <!-- Background stars -->
    <div class="stars absolute inset-0 z-0">
      <div v-for="i in 50" :key="i" class="star" :style="getStarStyle(i)"></div>
    </div>

    <!-- Moon Animation -->
    <div class="moon absolute z-10 animate-moon-rise"></div>

    <!-- Content -->
    <div class="relative z-20 text-center animate-fade-in-up">
      <h1 class="font-serif text-5xl font-bold text-cream text-shadow-lg mb-4">
        La Nuit Tombe
      </h1>
      <p class="text-neon-cyan/80 text-lg font-sans text-shadow-sm">
        Le village s'endort...
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

function getStarStyle(index) {
  const size = Math.random() * 2 + 1;
  const left = Math.random() * 100;
  const top = Math.random() * 100;
  const delay = Math.random() * 3;
  const duration = Math.random() * 3 + 2;
  
  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${left}%`,
    top: `${top}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
  };
}
</script>

<style scoped>
.night-start-container {
  background: linear-gradient(180deg, var(--color-midnight-blue) 0%, var(--color-deep-indigo) 100%);
}

.moon {
  top: 10%;
  left: 50%;
  width: 150px;
  height: 150px;
  background: radial-gradient(circle at 30% 30%, #E2E8F0, #CBD5E0);
  border-radius: 50%;
  box-shadow: 
    0 0 50px rgba(139, 92, 246, 0.6),
    0 0 100px rgba(99, 102, 241, 0.4),
    inset -20px -20px 0 rgba(0, 0, 0, 0.2);
  transform: translateX(-50%);
}

.stars {
  overflow: hidden;
}

.star {
  position: absolute;
  background: white;
  border-radius: 50%;
  box-shadow: 0 0 4px white;
  animation: twinkle 3s ease-in-out infinite;
}

@keyframes twinkle {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

/* Responsive */
@media (max-width: 640px) {
  .moon {
    width: 100px;
    height: 100px;
    top: 8%;
  }
  
  .night-start-container :deep(h1) {
    font-size: 2rem;
  }
  
  .night-start-container :deep(p) {
    font-size: 0.875rem;
  }
}

@media (min-width: 641px) and (max-width: 768px) {
  .moon {
    width: 120px;
    height: 120px;
  }
  
  .night-start-container :deep(h1) {
    font-size: 2.5rem;
  }
}

@media (min-width: 1024px) {
  .moon {
    width: 180px;
    height: 180px;
  }
  
  .night-start-container :deep(h1) {
    font-size: 3.5rem;
  }
}

@media (max-width: 360px) {
  .night-start-container {
    padding: 0.75rem;
  }
  
  .moon {
    width: 80px;
    height: 80px;
    top: 5%;
  }
  
  .night-start-container :deep(h1) {
    font-size: 1.75rem;
    margin-bottom: 0.75rem;
  }
  
  .night-start-container :deep(p) {
    font-size: 0.75rem;
  }
}

/* Prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .moon {
    animation: none;
  }
  
  .star {
    animation: none;
  }
  
  .animate-moon-rise,
  .animate-fade-in-up {
    animation: none;
  }
}
</style>
