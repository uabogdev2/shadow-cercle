<!-- NightProcessing.vue -->
<template>
  <div class="night-processing h-screen w-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
    <!-- Background -->
    <div class="absolute inset-0 bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950">
      <div class="absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 bg-violet-500/15 rounded-full filter blur-3xl"></div>
    </div>

    <!-- Content -->
    <div class="relative z-10 text-center max-w-md">
      <div class="mb-8">
        <!-- Loading spinner -->
        <div class="w-20 h-20 mx-auto mb-6 relative">
          <div class="absolute inset-0 rounded-full border-2 border-violet-500/20"></div>
          <div class="absolute inset-0 rounded-full border-2 border-transparent border-t-violet-500 animate-spin"></div>
          <div class="absolute inset-2 rounded-full border-2 border-transparent border-t-violet-400/50 animate-spin" style="animation-direction: reverse; animation-duration: 1.5s;"></div>
          <MoonIcon class="absolute inset-0 m-auto w-8 h-8 text-violet-400/50" />
        </div>
        
        <h2 class="text-cinzel text-2xl text-violet-300 mb-2">Traitement en cours</h2>
        <div class="h-px w-24 mx-auto bg-gradient-to-r from-transparent via-violet-500/50 to-transparent"></div>
      </div>

      <p class="text-slate-500 text-sm mb-6">Analyse des actions de la nuit...</p>

      <!-- Progress dots -->
      <div class="flex justify-center gap-2">
        <div class="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style="animation-delay: 0ms;"></div>
        <div class="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style="animation-delay: 150ms;"></div>
        <div class="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style="animation-delay: 300ms;"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Moon as MoonIcon } from 'lucide-vue-next';
</script>

<style scoped>
.night-processing {
  height: 100vh;
  height: 100dvh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.text-cinzel {
  font-family: 'Cinzel', 'Playfair Display', serif;
}
</style>
