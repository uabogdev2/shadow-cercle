<!-- NightSleep.vue -->
<template>
  <div class="night-sleep h-screen w-screen flex items-center justify-center flex-col relative overflow-hidden">
    <!-- Dark Night Background -->
    <div class="absolute inset-0 bg-gradient-to-b from-slate-950 via-indigo-950/80 to-slate-950">
      <!-- Stars -->
      <div class="absolute inset-0" style="background-image: radial-gradient(1px 1px at 20px 30px, rgba(255,255,255,0.3), transparent), radial-gradient(1px 1px at 40px 70px, rgba(255,255,255,0.2), transparent), radial-gradient(1px 1px at 90px 40px, rgba(255,255,255,0.3), transparent), radial-gradient(1px 1px at 130px 80px, rgba(255,255,255,0.2), transparent), radial-gradient(1px 1px at 160px 30px, rgba(255,255,255,0.4), transparent); background-size: 200px 100px;"></div>
      <!-- Fireflies -->
      <div class="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400/50 rounded-full animate-firefly"></div>
      <div class="absolute top-1/2 right-1/3 w-1 h-1 bg-cyan-300/40 rounded-full animate-firefly" style="animation-delay: 1s;"></div>
      <div class="absolute bottom-1/3 left-1/2 w-2 h-2 bg-violet-400/40 rounded-full animate-firefly" style="animation-delay: 2s;"></div>
    </div>

    <!-- Moon -->
    <div class="absolute top-8 right-8 w-16 h-16 rounded-full bg-gradient-to-br from-slate-200 to-slate-400 shadow-[0_0_50px_rgba(248,250,252,0.3)] opacity-70"></div>

    <!-- Content -->
    <div class="relative z-10 text-center max-w-md p-8">
      <div class="mb-8">
        <MoonIcon class="w-16 h-16 text-violet-400/50 mx-auto mb-4" />
        <h2 class="text-cinzel text-2xl text-violet-300 mb-2">La Nuit Règne</h2>
        <div class="h-px w-24 mx-auto bg-gradient-to-r from-transparent via-violet-500/50 to-transparent"></div>
      </div>
      
      <p class="text-slate-400 text-lg animate-fade-text">{{ messages[currentMessageIndex] }}</p>
      
      <div class="mt-8 flex justify-center gap-2">
        <div v-for="i in messages.length" :key="i" 
          class="w-2 h-2 rounded-full transition-all duration-300"
          :class="i - 1 === currentMessageIndex ? 'bg-violet-500' : 'bg-slate-700'"
        ></div>
      </div>
    </div>

    <!-- Ambient mist effect -->
    <div class="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-indigo-950/50 to-transparent"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Moon as MoonIcon } from 'lucide-vue-next';

const messages = [
  "Le village s'endort...",
  "Des ombres se déplacent dans la nuit...",
  "Un hurlement au loin...",
  "Le vent murmure des secrets...",
  "Quelque chose rôde...",
];

const currentMessageIndex = ref(0);
let messageInterval = null;

onMounted(() => {
  messageInterval = setInterval(() => {
    currentMessageIndex.value = (currentMessageIndex.value + 1) % messages.length;
  }, 4000);
});

onUnmounted(() => { if (messageInterval) clearInterval(messageInterval); });
</script>

<style scoped>
.night-sleep {
  min-height: 100vh;
  min-height: 100dvh;
}

.text-cinzel {
  font-family: 'Cinzel', 'Playfair Display', serif;
}

@keyframes firefly {
  0%, 100% {
    transform: translate(0, 0);
    opacity: 0.2;
  }
  25% {
    transform: translate(10px, -20px);
    opacity: 0.8;
  }
  50% {
    transform: translate(-5px, -30px);
    opacity: 0.4;
  }
  75% {
    transform: translate(15px, -15px);
    opacity: 0.6;
  }
}

.animate-firefly {
  animation: firefly 6s ease-in-out infinite;
}

.animate-fade-text {
  animation: fade-text 4s ease-in-out infinite;
}

@keyframes fade-text {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}
</style>
